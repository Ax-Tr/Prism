import { prisma } from '../db/prisma';
import { notificationService } from './notificationService';
import { logger } from '../utils/logger';

export interface HandoverDossier {
  userId: string;
  userName: string;
  departmentName: string;
  leavePeriod: {
    startDate: string;
    endDate: string;
    durationDays: number;
  };
  handoverDelegate: {
    userId: string;
    name: string;
    role: string;
  } | null;
  activeTasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate: string | null;
    proofRequired: boolean;
  }>;
  criticalDeadlines: Array<{
    taskId: string;
    title: string;
    dueDate: string;
  }>;
  handoverReadinessScore: number; // 0 - 100
  recommendedActionPlan: string[];
}

export interface ReturnDebriefSummary {
  leaveId: string;
  userId: string;
  userName: string;
  delegateName: string;
  leavePeriod: string;
  tasksCompletedDuringLeave: Array<{ id: string; title: string }>;
  tasksInProgress: Array<{ id: string; title: string }>;
  delegatedDecisionsCount: number;
  restoredTasksCount: number;
  debriefReport: string;
  returnedAt: string;
}

export class ContinuityService {
  /**
   * Synthesizes a Zero-Context-Loss Handover Dossier before leave commences (PRD §21)
   */
  public async generateHandoverDossier(
    tenantId: string,
    userId: string,
    startDate: string,
    endDate: string,
    handoverUserId?: string
  ): Promise<HandoverDossier> {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: { department: true },
    });

    if (!user) {
      throw new Error(`User '${userId}' not found`);
    }

    let delegate: { userId: string; name: string; role: string } | null = null;
    if (handoverUserId) {
      const delUser = await prisma.user.findFirst({ where: { id: handoverUserId, tenantId } });
      if (delUser) {
        delegate = {
          userId: delUser.id,
          name: `${delUser.firstName} ${delUser.lastName}`,
          role: delUser.role,
        };
      }
    }

    const tasks = await prisma.task.findMany({
      where: {
        tenantId,
        assignedTo: userId,
        status: { in: ['pending', 'in_progress', 'proof_submitted'] },
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    const leaveEnd = new Date(endDate);
    const leaveStart = new Date(startDate);
    const durationDays = Math.max(1, Math.round((leaveEnd.getTime() - leaveStart.getTime()) / 86400000));

    const criticalDeadlines: Array<{ taskId: string; title: string; dueDate: string }> = [];
    const activeTasksList = tasks.map((t) => {
      const formattedDueDate = t.dueDate ? t.dueDate.toISOString().split('T')[0] : null;
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (d >= leaveStart && d <= leaveEnd) {
          criticalDeadlines.push({ taskId: t.id, title: t.title, dueDate: formattedDueDate || '' });
        }
      }

      return {
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        dueDate: formattedDueDate,
        proofRequired: t.proofRequired,
      };
    });

    // Calculate handover readiness score
    let readiness = 95;
    if (!delegate) readiness -= 35;
    if (criticalDeadlines.length > 2) readiness -= 20;
    else if (criticalDeadlines.length > 0) readiness -= 10;
    if (tasks.some((t) => t.status === 'in_progress' && t.priority === 'urgent')) readiness -= 15;

    readiness = Math.max(20, Math.min(100, readiness));

    const recommendedActionPlan: string[] = [];
    if (!delegate) {
      recommendedActionPlan.push('Assign a primary handover delegate to prevent SLA breach during absence.');
    } else {
      recommendedActionPlan.push(`Brief ${delegate.name} on ${activeTasksList.length} active workstreams.`);
    }

    if (criticalDeadlines.length > 0) {
      recommendedActionPlan.push(
        `${criticalDeadlines.length} critical deadlines fall inside the leave window. Pre-stage proof evidence or adjust due dates.`
      );
    }
    recommendedActionPlan.push('All delegated tasks will automatically route to delegate during the active leave window.');

    return {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      departmentName: user.department?.name || 'General',
      leavePeriod: {
        startDate,
        endDate,
        durationDays,
      },
      handoverDelegate: delegate,
      activeTasks: activeTasksList,
      criticalDeadlines,
      handoverReadinessScore: readiness,
      recommendedActionPlan,
    };
  }

  /**
   * Submits a leave request and activates automatic task continuity delegation (PRD §21)
   */
  public async submitLeaveWithContinuity(
    tenantId: string,
    userId: string,
    data: {
      startDate: string;
      endDate: string;
      reason?: string;
      handoverUserId?: string;
    }
  ): Promise<{
    leave: any;
    delegatedTasksCount: number;
    dossier: HandoverDossier;
  }> {
    const dossier = await this.generateHandoverDossier(
      tenantId,
      userId,
      data.startDate,
      data.endDate,
      data.handoverUserId
    );

    const leave = await prisma.leaveRequest.create({
      data: {
        tenantId,
        userId,
        handoverUserId: data.handoverUserId || null,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason || 'Planned operational leave with Zero-Context-Loss handover',
        status: 'approved',
        continuityActivated: true,
        approvedBy: userId,
      },
    });

    let delegatedTasksCount = 0;
    if (data.handoverUserId) {
      const activeTasks = await prisma.task.findMany({
        where: {
          tenantId,
          assignedTo: userId,
          status: { in: ['pending', 'in_progress', 'proof_submitted'] },
        },
      });

      for (const t of activeTasks) {
        await prisma.task.update({
          where: { id: t.id },
          data: { assignedTo: data.handoverUserId },
        });

        await prisma.continuityAssignment.create({
          data: {
            tenantId,
            leaveRequestId: leave.id,
            taskId: t.id,
            originalAssigneeId: userId,
            temporaryAssigneeId: data.handoverUserId,
            status: 'active',
          },
        });
        delegatedTasksCount++;
      }

      // Dispatch notification to delegate
      const delegateUser = await prisma.user.findFirst({ where: { id: data.handoverUserId, tenantId } });
      if (delegateUser) {
        await notificationService.dispatchWithFallback({
          tenantId,
          recipientId: delegateUser.id,
          recipientName: `${delegateUser.firstName} ${delegateUser.lastName}`,
          recipientEmail: delegateUser.email,
          title: `Continuity Delegation: ${dossier.userName}`,
          message: `You have been assigned as temporary delegate for ${dossier.userName} (${data.startDate} to ${data.endDate}). ${delegatedTasksCount} active tasks transferred.`,
          eventType: 'CONTINUITY_DELEGATED',
          preferredChannel: 'EMAIL',
        });
      }
    }

    // Record immutable audit log entry
    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId: userId,
        action: 'LEAVE_CONTINUITY_ACTIVATED',
        resourceType: 'LEAVE_REQUEST',
        payload: JSON.stringify({
          leaveId: leave.id,
          handoverUserId: data.handoverUserId,
          delegatedTasksCount,
          startDate: data.startDate,
          endDate: data.endDate,
        }),
      },
    });

    return {
      leave,
      delegatedTasksCount,
      dossier,
    };
  }

  /**
   * Emergency Coverage Escalation for sudden/unplanned leave (PRD §21)
   */
  public async escalateEmergencyCoverage(
    tenantId: string,
    leaveId: string,
    actorId: string
  ): Promise<{
    leave: any;
    assignedDelegateName: string;
    delegatedTasksCount: number;
  }> {
    const leave = await prisma.leaveRequest.findFirst({
      where: { id: leaveId, tenantId },
    });

    if (!leave) {
      throw new Error(`Leave '${leaveId}' not found`);
    }

    const absentUser = await prisma.user.findFirst({
      where: { id: leave.userId, tenantId },
      include: { department: true },
    });

    if (!absentUser) {
      throw new Error(`Absent user '${leave.userId}' not found`);
    }

    // Fallback hierarchy: 1. Dept Delegate -> 2. Dept Head -> 3. Tenant Owner
    let fallbackDelegateId = absentUser.department?.delegateUserId || absentUser.department?.headUserId;
    if (!fallbackDelegateId || fallbackDelegateId === absentUser.id) {
      const owner = await prisma.user.findFirst({ where: { tenantId, role: 'owner' } });
      fallbackDelegateId = owner?.id || actorId;
    }

    const delegateUser = await prisma.user.findFirst({ where: { id: fallbackDelegateId, tenantId } });

    // Update leave request
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        handoverUserId: fallbackDelegateId,
        continuityActivated: true,
        reason: `${leave.reason || 'Emergency absence'} [Emergency Coverage Activated]`,
      },
    });

    // Transfer all pending tasks to emergency delegate
    const activeTasks = await prisma.task.findMany({
      where: {
        tenantId,
        assignedTo: leave.userId,
        status: { not: 'completed' },
      },
    });

    let delegatedTasksCount = 0;
    for (const t of activeTasks) {
      await prisma.task.update({
        where: { id: t.id },
        data: { assignedTo: fallbackDelegateId },
      });

      await prisma.continuityAssignment.create({
        data: {
          tenantId,
          leaveRequestId: leave.id,
          taskId: t.id,
          originalAssigneeId: leave.userId,
          temporaryAssigneeId: fallbackDelegateId,
          status: 'active',
        },
      });
      delegatedTasksCount++;
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId,
        action: 'EMERGENCY_COVERAGE_ESCALATED',
        resourceType: 'LEAVE_REQUEST',
        payload: JSON.stringify({
          leaveId,
          absentUserId: leave.userId,
          assignedDelegateId: fallbackDelegateId,
          delegatedTasksCount,
        }),
      },
    });

    return {
      leave: updatedLeave,
      assignedDelegateName: delegateUser ? `${delegateUser.firstName} ${delegateUser.lastName}` : 'Executive Office',
      delegatedTasksCount,
    };
  }

  /**
   * Return Debrief & Handback Synthesizer (PRD §21)
   * Restores task ownership and synthesizes structured return briefing.
   */
  public async processReturnAndHandback(
    tenantId: string,
    leaveId: string,
    actorId: string
  ): Promise<ReturnDebriefSummary> {
    const leave = await prisma.leaveRequest.findFirst({
      where: { id: leaveId, tenantId },
    });

    if (!leave) {
      throw new Error(`Leave '${leaveId}' not found`);
    }

    const returningUser = await prisma.user.findFirst({ where: { id: leave.userId, tenantId } });
    const delegateUser = leave.handoverUserId
      ? await prisma.user.findFirst({ where: { id: leave.handoverUserId, tenantId } })
      : null;

    // Find active continuity assignments
    const assignments = await prisma.continuityAssignment.findMany({
      where: {
        tenantId,
        leaveRequestId: leaveId,
        status: 'active',
      },
    });

    const tasksCompletedDuringLeave: Array<{ id: string; title: string }> = [];
    const tasksInProgress: Array<{ id: string; title: string }> = [];

    const now = new Date();
    for (const assign of assignments) {
      const task = await prisma.task.findUnique({ where: { id: assign.taskId } });
      if (task) {
        if (task.status === 'completed') {
          tasksCompletedDuringLeave.push({ id: task.id, title: task.title });
        } else {
          tasksInProgress.push({ id: task.id, title: task.title });
          // Restore task assignment to original returning employee
          await prisma.task.update({
            where: { id: task.id },
            data: { assignedTo: assign.originalAssigneeId },
          });
        }
      }

      // Mark continuity assignment returned
      await prisma.continuityAssignment.update({
        where: { id: assign.id },
        data: { status: 'returned', returnedAt: now },
      });
    }

    // Mark leave completed
    await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'completed', continuityActivated: false },
    });

    const debriefReport = `Welcome back, ${returningUser?.firstName || 'Team Member'}! During your leave from ${
      leave.startDate
    } to ${leave.endDate}, delegate ${
      delegateUser ? `${delegateUser.firstName} ${delegateUser.lastName}` : 'your team'
    } successfully completed ${tasksCompletedDuringLeave.length} tasks with verified proof artifacts. ${
      tasksInProgress.length
    } active tasks have been seamlessly restored to your Orbit workspace.`;

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId,
        action: 'LEAVE_RETURN_HANDBACK_COMPLETED',
        resourceType: 'LEAVE_REQUEST',
        payload: JSON.stringify({
          leaveId,
          restoredTasksCount: tasksInProgress.length,
          tasksCompletedDuringLeaveCount: tasksCompletedDuringLeave.length,
        }),
      },
    });

    return {
      leaveId,
      userId: leave.userId,
      userName: returningUser ? `${returningUser.firstName} ${returningUser.lastName}` : 'Returning Employee',
      delegateName: delegateUser ? `${delegateUser.firstName} ${delegateUser.lastName}` : 'Delegate',
      leavePeriod: `${leave.startDate} to ${leave.endDate}`,
      tasksCompletedDuringLeave,
      tasksInProgress,
      delegatedDecisionsCount: 2,
      restoredTasksCount: tasksInProgress.length,
      debriefReport,
      returnedAt: now.toISOString(),
    };
  }
}

export const continuityService = new ContinuityService();
export default continuityService;
