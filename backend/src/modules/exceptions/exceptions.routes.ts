import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { incidentService } from '../../services/incidentService';

export const exceptionsRouter = Router();

// GET /api/v1/exceptions - List all exceptions with optional filtering
exceptionsRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { status, severity, type } = req.query;
    const where: any = { tenantId: req.tenantId };
    if (status) where.status = String(status);
    if (severity) where.severity = String(severity);
    if (type) where.exceptionType = String(type);

    const exceptions = await prisma.systemException.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const deptIds = exceptions.map((e: any) => e.departmentId).filter(Boolean) as string[];
    const taskIds = exceptions.map((e: any) => e.taskId).filter(Boolean) as string[];
    const userIds = exceptions.map((e: any) => e.assignedUserId).filter(Boolean) as string[];

    const [departments, tasks, users] = await Promise.all([
      prisma.department.findMany({
        where: { id: { in: deptIds } },
        select: { id: true, name: true },
      }),
      prisma.task.findMany({
        where: { id: { in: taskIds } },
        select: { id: true, title: true, priority: true, status: true, dueDate: true },
      }),
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true, role: true, email: true },
      }),
    ]);

    const deptMap = new Map<string, string>(departments.map((d: any) => [d.id, d.name]));
    const taskMap = new Map<string, any>(tasks.map((t: any) => [t.id, t]));
    const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]));

    const enriched = exceptions.map((ex: any) => ({
      ...ex,
      departmentName: ex.departmentId ? deptMap.get(ex.departmentId) || 'Cross-Functional' : 'Cross-Functional',
      task: ex.taskId ? taskMap.get(ex.taskId) : undefined,
      taskTitle: ex.taskId ? taskMap.get(ex.taskId)?.title : undefined,
      assignedUser: ex.assignedUserId ? userMap.get(ex.assignedUserId) : undefined,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Fetch exceptions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch exceptions' });
  }
});

// POST /api/v1/exceptions/scan - Trigger automated exception detection scan (PRD §23 FR-080)
exceptionsRouter.post('/scan', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const scanResult = await incidentService.scanAndDetectExceptions(req.tenantId!);
    res.json({ success: true, data: scanResult });
  } catch (error) {
    console.error('Exception scan error:', error);
    res.status(500).json({ success: false, error: 'Failed to execute exception scan' });
  }
});

// GET /api/v1/exceptions/:id/analysis - Synthesize AI Root Cause & 5-Why Analysis (PRD §23 FR-081)
exceptionsRouter.get('/:id/analysis', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const analysis = await incidentService.synthesizeRootCause(req.tenantId!, req.params.id as string);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Root cause analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to synthesize root cause analysis' });
  }
});

// POST /api/v1/exceptions/:id/triage - Triage exception & assign incident lead
exceptionsRouter.post('/:id/triage', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await incidentService.triageException(
      req.tenantId!,
      req.params.id as string,
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Triage exception error:', error);
    res.status(500).json({ success: false, error: 'Failed to triage exception' });
  }
});

// POST /api/v1/exceptions/:id/action-items - Convert CAPA recommendations to live Orbit tasks (PRD §23 FR-082)
exceptionsRouter.post('/:id/action-items', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { actions } = req.body;
    if (!Array.isArray(actions) || actions.length === 0) {
      res.status(400).json({ success: false, error: 'Action items array is required' });
      return;
    }

    const createdTasks = await incidentService.createPreventiveTasks(
      req.tenantId!,
      req.params.id as string,
      req.user!.id,
      actions
    );

    res.json({ success: true, data: createdTasks });
  } catch (error) {
    console.error('Create preventive tasks error:', error);
    res.status(500).json({ success: false, error: 'Failed to dispatch CAPA tasks' });
  }
});

// GET /api/v1/exceptions/:id/post-mortem - Generate Blameless Post-Mortem Report (PRD §23 FR-083)
exceptionsRouter.get('/:id/post-mortem', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const postMortem = await incidentService.generatePostMortem(
      req.tenantId!,
      req.params.id as string,
      req.user!.id
    );
    res.json({ success: true, data: postMortem });
  } catch (error) {
    console.error('Post-mortem generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate post-mortem report' });
  }
});

// POST /api/v1/exceptions/:id/resolve - Resolve exception with audit trail
exceptionsRouter.post('/:id/resolve', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const ex = await prisma.systemException.findFirst({
      where: { id: req.params.id as string, tenantId: req.tenantId },
    });

    if (!ex) {
      res.status(404).json({ success: false, error: 'Exception not found' });
      return;
    }

    const updatedEx = await prisma.systemException.update({
      where: { id: ex.id },
      data: {
        status: 'resolved',
        resolvedBy: req.user?.id || null,
        resolvedAt: new Date(),
        details: req.body?.notes ? `${ex.details || ''}\n[Resolution]: ${req.body.notes}` : ex.details,
      },
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'EXCEPTION_RESOLVED',
      resourceType: 'system_exception',
      resourceId: ex.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { exceptionId: ex.id, resolutionNotes: req.body?.notes },
    });

    res.json({ success: true, data: updatedEx });
  } catch (error) {
    console.error('Resolve exception error:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve exception' });
  }
});
