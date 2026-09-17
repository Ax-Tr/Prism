import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

export const auditRouter = Router();

// GET /api/v1/audit (Owner, Auditor, Executive, SysAdmin)
auditRouter.get(
  '/',
  authMiddleware,
  requireRoles(['owner', 'super_admin', 'auditor', 'executive', 'sys_admin']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { action, resourceType, actorId, startDate, endDate, page, limit } = req.query;

      const where: any = {
        tenantId: req.tenantId,
      };

      if (action) {
        where.action = { contains: String(action) };
      }
      if (resourceType) {
        where.resourceType = String(resourceType);
      }
      if (actorId) {
        where.actorId = String(actorId);
      }
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(String(startDate));
        if (endDate) where.createdAt.lte = new Date(String(endDate));
      }

      const take = limit ? Math.min(100, parseInt(String(limit), 10)) : 50;
      const skip = page ? (Math.max(1, parseInt(String(page), 10)) - 1) * take : 0;

      const [total, logs] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take,
          skip,
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
        payload: log.payload ? (typeof log.payload === 'string' ? JSON.parse(log.payload) : log.payload) : null,
        actorName: log.actorId ? actorMap.get(log.actorId) || 'System' : 'System',
      }));

      res.json({
        success: true,
        data: {
          total,
          page: page ? parseInt(String(page), 10) : 1,
          limit: take,
          totalPages: Math.ceil(total / take),
          immutableGuarantee: 'PG_RULE_APPEND_ONLY_ENFORCED',
          logs: result,
        },
      });
    } catch (error) {
      console.error('Fetch audit logs error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
    }
  }
);

// GET /api/v1/audit/export/csv (Compliance export)
auditRouter.get(
  '/export/csv',
  authMiddleware,
  requireRoles(['owner', 'super_admin', 'auditor']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { tenantId: req.tenantId },
        orderBy: { createdAt: 'desc' },
        take: 500,
      });

      const userIds = logs.map((l: any) => l.actorId).filter(Boolean) as string[];
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true },
      });
      const userMap = new Map<string, string>(users.map((u: any) => [u.id, `${u.firstName} ${u.lastName}`]));

      // Build CSV
      const headers = ['Timestamp', 'Actor ID', 'Actor Name', 'Role', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'User Agent'];
      const rows = logs.map((l: any) => [
        `"${new Date(l.createdAt).toISOString()}"`,
        `"${l.actorId || ''}"`,
        `"${l.actorId ? userMap.get(l.actorId) || 'System' : 'System'}"`,
        `"${l.actorRole || 'system'}"`,
        `"${l.action}"`,
        `"${l.resourceType}"`,
        `"${l.resourceId || ''}"`,
        `"${l.ipAddress || ''}"`,
        `"${(l.userAgent || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="prism_audit_trail_${Date.now()}.csv"`);
      res.status(200).send(csvContent);
    } catch (error) {
      console.error('Export audit logs error:', error);
      res.status(500).json({ success: false, error: 'Failed to export audit logs' });
    }
  }
);
