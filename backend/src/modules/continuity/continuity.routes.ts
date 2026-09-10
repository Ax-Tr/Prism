import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';

export const continuityRouter = Router();

// GET /api/v1/continuity/leaves
continuityRouter.get('/leaves', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const userIds = new Set<string>();
    leaves.forEach((l: any) => {
      userIds.add(l.userId);
      if (l.handoverUserId) userIds.add(l.handoverUserId);
    });

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      include: { department: { select: { id: true, name: true } } },
    });

    const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]));

    const enriched = leaves.map((leave: any) => {
      const user = userMap.get(leave.userId);
      const handover = leave.handoverUserId ? userMap.get(leave.handoverUserId) : null;

      return {
        ...leave,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        userRole: user?.role,
        departmentName: user?.department?.name || 'Operations',
        handoverUserName: handover ? `${handover.firstName} ${handover.lastName}` : 'Unassigned',
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Fetch leaves error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave records' });
  }
});

// POST /api/v1/continuity/leaves
continuityRouter.post('/leaves', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, handoverUserId, reason } = req.body;

    if (!startDate || !endDate) {
      res.status(400).json({ success: false, error: 'Start date and end date are required' });
      return;
    }

    const userId = req.user?.id || 'anonymous';

    const newLeave = await prisma.leaveRequest.create({
      data: {
        tenantId: req.tenantId!,
        userId,
        handoverUserId: handoverUserId || null,
        startDate,
        endDate,
        reason: reason || 'Planned leave with operational handover',
        status: 'approved',
        continuityActivated: true,
        approvedBy: req.user?.id || null,
      },
    });

    // Auto-reassign active tasks to handover delegate if specified
    if (handoverUserId) {
      const activeTasks = await prisma.task.findMany({
        where: {
          tenantId: req.tenantId,
          assignedTo: userId,
          status: { not: 'completed' },
        },
      });

      for (const t of activeTasks) {
        await prisma.task.update({
          where: { id: t.id },
          data: { assignedTo: handoverUserId },
        });

        await prisma.continuityAssignment.create({
          data: {
            tenantId: req.tenantId!,
            leaveRequestId: newLeave.id,
            taskId: t.id,
            originalAssigneeId: userId,
            temporaryAssigneeId: handoverUserId,
            status: 'active',
          },
        });
      }
    }

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'LEAVE_SUBMITTED_CONTINUITY_ACTIVATED',
      resourceType: 'leave_request',
      resourceId: newLeave.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { leaveId: newLeave.id, handoverUserId },
    });

    res.status(201).json({ success: true, data: newLeave });
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ success: false, error: 'Failed to create leave request' });
  }
});
