import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

export const goalsRouter = Router();

// GET /api/v1/goals
goalsRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { tenantId: req.tenantId },
      include: {
        priorities: true,
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

    const enrichedGoals = goals.map((goal: any) => ({
      ...goal,
      creatorName: goal.createdBy ? creatorMap.get(goal.createdBy) || 'Executive Team' : 'Executive Team',
      linkedPrioritiesCount: goal.priorities.length,
    }));

    res.json({ success: true, data: { goals: enrichedGoals, departmentPriorities: priorities } });
  } catch (error) {
    console.error('Fetch goals error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch goals' });
  }
});

// POST /api/v1/goals (Owner only)
goalsRouter.post('/', authMiddleware, requireRoles(['owner']), async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, targetMetric, targetValue, unit, startDate, targetDate } = req.body;

    if (!title || targetValue === undefined || !startDate || !targetDate) {
      res.status(400).json({ success: false, error: 'Title, targetValue, startDate, and targetDate are required' });
      return;
    }

    const newGoal = await prisma.goal.create({
      data: {
        tenantId: req.tenantId!,
        title,
        description: description || '',
        targetMetric: targetMetric || 'Key Metric',
        targetValue: Number(targetValue),
        currentValue: 0,
        unit: unit || 'units',
        startDate,
        targetDate,
        status: 'active',
        createdBy: req.user?.id || 'owner',
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

// PATCH /api/v1/goals/:id (Owner only)
goalsRouter.patch('/:id', authMiddleware, requireRoles(['owner']), async (req: AuthenticatedRequest, res) => {
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
        title: title || goal.title,
        description: description !== undefined ? description : goal.description,
        targetMetric: targetMetric || goal.targetMetric,
        targetValue: targetValue !== undefined ? Number(targetValue) : goal.targetValue,
        currentValue: currentValue !== undefined ? Number(currentValue) : goal.currentValue,
        status: status || goal.status,
        targetDate: targetDate || goal.targetDate,
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

// POST /api/v1/goals/priorities (Owner / Dept Head)
goalsRouter.post('/priorities', authMiddleware, requireRoles(['owner', 'dept_head']), async (req: AuthenticatedRequest, res) => {
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
        title,
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
      payload: { departmentId, title },
    });

    res.status(201).json({ success: true, data: newPriority });
  } catch (error) {
    console.error('Create dept priority error:', error);
    res.status(500).json({ success: false, error: 'Failed to create priority' });
  }
});
