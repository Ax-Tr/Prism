import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';

export const exceptionsRouter = Router();

// GET /api/v1/exceptions
exceptionsRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const exceptions = await prisma.systemException.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const deptIds = exceptions.map((e: any) => e.departmentId).filter(Boolean) as string[];
    const taskIds = exceptions.map((e: any) => e.taskId).filter(Boolean) as string[];

    const departments = await prisma.department.findMany({
      where: { id: { in: deptIds } },
      select: { id: true, name: true },
    });
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      select: { id: true, title: true },
    });

    const deptMap = new Map<string, string>(departments.map((d: any) => [d.id, d.name]));
    const taskMap = new Map<string, string>(tasks.map((t: any) => [t.id, t.title]));

    const enriched = exceptions.map((ex: any) => ({
      ...ex,
      departmentName: ex.departmentId ? deptMap.get(ex.departmentId) || 'Cross-Functional' : 'Cross-Functional',
      taskTitle: ex.taskId ? taskMap.get(ex.taskId) : undefined,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Fetch exceptions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch exceptions' });
  }
});

// POST /api/v1/exceptions/:id/resolve
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
