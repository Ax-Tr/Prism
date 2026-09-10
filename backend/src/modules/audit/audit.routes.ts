import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

export const auditRouter = Router();

// GET /api/v1/audit (Owner and Auditor access only)
auditRouter.get('/', authMiddleware, requireRoles(['owner', 'auditor']), async (req: AuthenticatedRequest, res) => {
  try {
    const { action, resourceType, limit } = req.query;

    const where: any = {
      tenantId: req.tenantId,
    };

    if (action) {
      where.action = { contains: action as string };
    }
    if (resourceType) {
      where.resourceType = resourceType as string;
    }

    const max = limit ? parseInt(limit as string, 10) : 50;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: max,
      }),
    ]);

    const actorIds = logs.map((l: any) => l.actorId).filter(Boolean) as string[];
    const actors = await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const actorMap = new Map<string, string>(actors.map((a: any) => [a.id, `${a.firstName} ${a.lastName}`]));

    const result = logs.map((log: any) => ({
      ...log,
      payload: log.payload ? JSON.parse(log.payload) : null,
      actorName: log.actorId ? actorMap.get(log.actorId) || 'System' : 'System',
    }));

    res.json({
      success: true,
      data: {
        total,
        returned: result.length,
        immutableGuarantee: 'PG_RULE_APPEND_ONLY_ENFORCED',
        logs: result,
      },
    });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});
