import { Router, Response } from 'express';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

export const goalsRouter = Router();

// ==========================================
// 1. GET /api/v1/goals/hierarchy — Full Strategy Cascade (PRD §11 FR-030)
// Vision -> Pillars -> Goals -> Objectives -> Tasks -> Evidence
// ==========================================
goalsRouter.get('/hierarchy', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { tenantId: req.tenantId! },
      include: {
        priorities: {
          include: {
            department: { select: { id: true, name: true, code: true } },
            tasks: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                proofRequired: true,
                assignedTo: true,
                proofs: {
                  select: { id: true, proofType: true, approvalStatus: true },
                },
              },
            },
          },
          orderBy: { rankOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedHierarchy = goals.map((goal: any) => {
      let totalTasks = 0;
      let completedTasks = 0;
      let verifiedProofs = 0;

      goal.priorities.forEach((priority: any) => {
        totalTasks += priority.tasks.length;
        completedTasks += priority.tasks.filter((t: any) => t.status === 'completed').length;
        priority.tasks.forEach((t: any) => {
          verifiedProofs += t.proofs.filter((p: any) => p.approvalStatus === 'accepted').length;
        });
      });

      const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const metricProgressPct = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
      const overallProgress = Math.round(taskProgressPct * 0.5 + metricProgressPct * 0.5);

      return {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        targetMetric: goal.targetMetric,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        unit: goal.unit,
        startDate: goal.startDate,
        targetDate: goal.targetDate,
        status: goal.status,
        overallProgress,
        taskProgressPct,
        metricProgressPct,
        totalTasks,
        completedTasks,
        verifiedProofs,
        priorities: goal.priorities.map((p: any) => ({
          id: p.id,
          title: p.title,
          departmentId: p.departmentId,
          departmentName: p.department?.name,
          departmentCode: p.department?.code,
          rankOrder: p.rankOrder,
          weight: p.weight,
          tasksCount: p.tasks.length,
          tasks: p.tasks,
        })),
      };
    });

    res.json({
      success: true,
      data: {
        vision: 'To build the world’s most transparent, autonomous, and evidence-driven enterprise operating system.',
        pillars: [
          { name: 'Zero-Disruption Reliability', description: 'Fault-tolerant operational continuity and 99.99% system availability' },
          { name: 'Autonomous Intelligence', description: 'Context-grounded Luminary AI reasoning over immutable data signals' },
          { name: 'Evidence-Gated Trust', description: 'Zero unverified claims across all metrics, tasks, and scoring telemetry' },
        ],
        goals: enrichedHierarchy,
      },
    });
  } catch (error) {
    console.error('Fetch strategic hierarchy error:', error);
    res.status(500).json({ success: false, error: 'Failed to construct strategic hierarchy' });
  }
});

// ==========================================
// 2. GET /api/v1/goals/dependencies/graph — Cross-Team Dependency Graph (PRD §11 FR-032)
// ==========================================
goalsRouter.get('/dependencies/graph', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [tasks, departments, goals] = await Promise.all([
      prisma.task.findMany({
        where: { tenantId: req.tenantId! },
        include: {
          department: { select: { id: true, name: true, code: true } },
          priorityRel: {
            include: {
              goal: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.department.findMany({
        where: { tenantId: req.tenantId! },
        select: { id: true, name: true, code: true, headUserId: true },
      }),
      prisma.goal.findMany({
        where: { tenantId: req.tenantId! },
        select: { id: true, title: true, status: true },
      }),
    ]);

    // Build dependency nodes & edges
    const nodes = [
      ...departments.map((d: any) => ({
        id: `dept-${d.id}`,
        type: 'DEPARTMENT',
        label: `${d.name} (${d.code})`,
        data: { departmentId: d.id, code: d.code },
      })),
      ...goals.map((g: any) => ({
        id: `goal-${g.id}`,
        type: 'STRATEGIC_GOAL',
        label: g.title,
        data: { goalId: g.id, status: g.status },
      })),
    ];

    const edges: any[] = [];
    const blockers: any[] = [];

    tasks.forEach((t: any) => {
      if (t.priorityRel?.goalId) {
        edges.push({
          id: `edge-${t.departmentId}-${t.priorityRel.goalId}`,
          source: `dept-${t.departmentId}`,
          target: `goal-${t.priorityRel.goalId}`,
          relationship: 'CONTRIBUTES_TO',
          weight: t.priorityRel.weight || 1.0,
        });
      }

      // Check for blocked/aging tasks creating cross-team risks
      if (t.status === 'blocked' || (new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'cancelled')) {
        const ageHours = Math.round((Date.now() - new Date(t.createdAt).getTime()) / (1000 * 3600));
        blockers.push({
          taskId: t.id,
          taskTitle: t.title,
          department: t.department?.name,
          departmentCode: t.department?.code,
          status: t.status,
          isOverdue: new Date(t.dueDate) < new Date(),
          blockerAgeHours: ageHours,
          linkedGoal: t.priorityRel?.goal?.title || 'Operational SLA',
          riskLevel: ageHours > 72 ? 'HIGH' : 'MEDIUM',
        });
      }
    });

    res.json({
      success: true,
      data: {
        nodes,
        edges,
        blockers,
        criticalPathRiskScore: blockers.length > 3 ? 'HIGH' : blockers.length > 0 ? 'ELEVATED' : 'NOMINAL',
      },
    });
  } catch (error) {
    console.error('Fetch dependency graph error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate dependency graph' });
  }
});

// ==========================================
// 3. GET /api/v1/goals/traceability/:taskId — Bidirectional Traceability (PRD §11 FR-031)
// ==========================================
goalsRouter.get('/traceability/:taskId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.taskId as string, tenantId: req.tenantId! },
      include: {
        department: true,
        proofs: {
          orderBy: { submittedAt: 'desc' },
        },
        priorityRel: {
          include: {
            goal: true,
          },
        },
      },
    });

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    const goal = task.priorityRel?.goal;

    res.json({
      success: true,
      data: {
        taskId: task.id,
        taskTitle: task.title,
        status: task.status,
        department: { id: task.department.id, name: task.department.name, code: task.department.code },
        strategicPriority: task.priorityRel
          ? { id: task.priorityRel.id, title: task.priorityRel.title, weight: task.priorityRel.weight }
          : null,
        goal: goal
          ? {
              id: goal.id,
              title: goal.title,
              targetMetric: goal.targetMetric,
              targetValue: goal.targetValue,
              currentValue: goal.currentValue,
              status: goal.status,
            }
          : null,
        pillar: goal ? 'Zero-Disruption Reliability & High-Throughput Delivery' : 'General Operational Baseline',
        evidenceChain: task.proofs.map((p: any) => ({
          proofId: p.id,
          proofType: p.proofType,
          proofUrl: p.proofUrl,
          approvalStatus: p.approvalStatus,
          submittedAt: p.submittedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Traceability lookup error:', error);
    res.status(500).json({ success: false, error: 'Failed to trace strategic chain' });
  }
});

// ==========================================
// 4. GET /api/v1/goals — Standard List Goals
// ==========================================
goalsRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { tenantId: req.tenantId },
      include: {
        priorities: {
          include: {
            department: { select: { id: true, name: true, code: true } },
            tasks: { select: { id: true, status: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const priorities = await prisma.departmentPriority.findMany({
      where: { tenantId: req.tenantId },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { rankOrder: 'asc' },
    });

    const userIds = goals.map((g: any) => g.createdBy).filter(Boolean) as string[];
    const creators = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const creatorMap = new Map<string, string>(creators.map((u: any) => [u.id, `${u.firstName} ${u.lastName}`]));

    const enrichedGoals = goals.map((goal: any) => {
      let totalTasks = 0;
      let completedTasks = 0;
      goal.priorities.forEach((p: any) => {
        totalTasks += p.tasks.length;
        completedTasks += p.tasks.filter((t: any) => t.status === 'completed').length;
      });

      const progressPct = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;

      return {
        ...goal,
        creatorName: goal.createdBy ? creatorMap.get(goal.createdBy) || 'Executive Team' : 'Executive Team',
        linkedPrioritiesCount: goal.priorities.length,
        totalTasks,
        completedTasks,
        progressPct,
      };
    });

    res.json({ success: true, data: { goals: enrichedGoals, departmentPriorities: priorities } });
  } catch (error) {
    console.error('Fetch goals error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch goals' });
  }
});

// ==========================================
// 5. POST /api/v1/goals — Create Strategic Goal (Owner / Exec / Dept Head)
// ==========================================
goalsRouter.post('/', authMiddleware, requireRoles(['owner', 'super_admin', 'executive', 'dept_head']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, targetMetric, targetValue, unit, startDate, targetDate } = req.body;

    if (!title || targetValue === undefined || !startDate || !targetDate) {
      res.status(400).json({ success: false, error: 'Title, targetValue, startDate, and targetDate are required' });
      return;
    }

    const newGoal = await prisma.goal.create({
      data: {
        tenantId: req.tenantId!,
        title: title.trim(),
        description: description ? description.trim() : '',
        targetMetric: targetMetric || 'Key Metric',
        targetValue: Number(targetValue),
        currentValue: 0,
        unit: unit || '%',
        startDate,
        targetDate,
        status: 'active',
        createdBy: req.user?.id || 'executive',
      },
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'BUSINESS_GOAL_CREATED',
      resourceType: 'goal',
      resourceId: newGoal.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { title: newGoal.title, targetValue: newGoal.targetValue },
    });

    res.status(201).json({ success: true, data: newGoal });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ success: false, error: 'Failed to create goal' });
  }
});

// ==========================================
// 6. PATCH /api/v1/goals/:id — Update Goal & Check-In (PRD §11 FR-031)
// ==========================================
goalsRouter.patch('/:id', authMiddleware, requireRoles(['owner', 'super_admin', 'executive', 'dept_head']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const goal = await prisma.goal.findFirst({
      where: { id: req.params.id as string, tenantId: req.tenantId },
    });

    if (!goal) {
      res.status(404).json({ success: false, error: 'Goal not found' });
      return;
    }

    const { title, description, targetMetric, targetValue, currentValue, status, targetDate } = req.body;

    const updatedGoal = await prisma.goal.update({
      where: { id: goal.id },
      data: {
        title: title !== undefined ? title.trim() : goal.title,
        description: description !== undefined ? description.trim() : goal.description,
        targetMetric: targetMetric !== undefined ? targetMetric : goal.targetMetric,
        targetValue: targetValue !== undefined ? Number(targetValue) : goal.targetValue,
        currentValue: currentValue !== undefined ? Number(currentValue) : goal.currentValue,
        status: status !== undefined ? status : goal.status,
        targetDate: targetDate !== undefined ? targetDate : goal.targetDate,
      },
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'BUSINESS_GOAL_UPDATED',
      resourceType: 'goal',
      resourceId: goal.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: req.body,
    });

    res.json({ success: true, data: updatedGoal });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ success: false, error: 'Failed to update goal' });
  }
});

// ==========================================
// 7. POST /api/v1/goals/priorities — Create Department Priority (PRD §11)
// ==========================================
goalsRouter.post('/priorities', authMiddleware, requireRoles(['owner', 'super_admin', 'dept_head', 'delegate']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { departmentId, goalId, title, rankOrder, weight } = req.body;

    if (!departmentId || !title) {
      res.status(400).json({ success: false, error: 'departmentId and title are required' });
      return;
    }

    const newPriority = await prisma.departmentPriority.create({
      data: {
        tenantId: req.tenantId!,
        departmentId,
        goalId: goalId || null,
        title: title.trim(),
        rankOrder: rankOrder ? Number(rankOrder) : 1,
        weight: weight ? Number(weight) : 1.0,
      },
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'DEPT_PRIORITY_CREATED',
      resourceType: 'department_priority',
      resourceId: newPriority.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { departmentId, title, goalId },
    });

    res.status(201).json({ success: true, data: newPriority });
  } catch (error) {
    console.error('Create dept priority error:', error);
    res.status(500).json({ success: false, error: 'Failed to create priority' });
  }
});
