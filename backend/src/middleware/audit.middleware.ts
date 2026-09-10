import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { logAudit } from '../db/audit';

export const auditLogMiddleware = (actionName: string, resourceType: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Record audit after response finishes successfully
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400 && req.tenantId) {
        logAudit({
          tenantId: req.tenantId,
          actorId: req.user?.id,
          actorRole: req.user?.role,
          action: actionName,
          resourceType,
          resourceId: (req.params.id || req.body?.id || 'collection') as string,
          ipAddress: req.ip || req.socket?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] as string,
          payload: {
            method: req.method,
            path: req.originalUrl,
            params: req.params,
            body: req.method !== 'GET' ? req.body : undefined,
          },
        });
      }
    });

    next();
  };
};
