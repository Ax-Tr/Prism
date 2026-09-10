import { prisma } from './prisma';

export interface CreateAuditLogParams {
  tenantId: string;
  actorId?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  payload?: any;
}

export async function logAudit(params: CreateAuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        actorId: params.actorId || null,
        actorRole: params.actorRole || null,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId || null,
        ipAddress: params.ipAddress || '127.0.0.1',
        userAgent: params.userAgent || 'Prism-Backend/1.0',
        payload: params.payload ? JSON.stringify(params.payload) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write immutable audit log:', error);
  }
}
