import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from './auth.middleware';
import { UserRole } from '../types';
import { config } from '../config';

// PRD §28 Role Hierarchy Matrix
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  owner: 100,
  sys_admin: 90,
  executive: 80,
  ai_admin: 70,
  dept_head: 60,
  hr: 50,
  delegate: 40,
  manager: 40,
  auditor: 35,
  employee: 20,
};

// PRD §28 Role Permissions Map
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  owner: ['*'],
  sys_admin: ['system:manage', 'tenants:manage', 'audit:read', 'users:read', 'security:configure'],
  executive: [
    'strategy:manage', 'goals:manage', 'tasks:all', 'scores:read', 'audit:read',
    'analytics:view', 'team:manage', 'reviews:all', 'luminary:unrestricted'
  ],
  ai_admin: ['sanctum:configure', 'ai:audit', 'ai:governance', 'models:configure'],
  dept_head: [
    'tasks:department', 'proofs:review', 'team:department', 'continuity:manage',
    'goals:department', 'scores:department', 'reviews:department'
  ],
  hr: ['people:manage', 'profiles:manage', 'reviews:360:manage', 'attendance:read', 'onboarding:manage'],
  delegate: ['tasks:department', 'proofs:review', 'continuity:sign', 'team:view'],
  manager: ['tasks:manage', 'proofs:review', 'team:view', '1on1:manage'],
  auditor: ['audit:read', 'audit:export', 'compliance:read', 'proofs:read', 'logs:read'],
  employee: ['tasks:own', 'proofs:submit', 'profile:own', 'scores:own', 'reviews:give'],
};

// Middleware: Verify Role Requirement
export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const userRole = req.user.role as UserRole;

    // Super Admin / Owner always has full access
    if (userRole === 'owner' || userRole === 'super_admin') {
      next();
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Role '${userRole}' is not authorized for this operation. Required roles: [${allowedRoles.join(', ')}]`,
      });
      return;
    }

    next();
  };
};

// Middleware: Scope check for department isolation (PRD §28)
export const requireDepartmentScope = (getDepartmentId: (req: AuthenticatedRequest) => string | undefined) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const userRole = req.user.role as UserRole;
    // Executives, Owners, Auditors, and Super Admins have cross-department visibility
    if (['owner', 'super_admin', 'executive', 'auditor', 'sys_admin'].includes(userRole)) {
      next();
      return;
    }

    const targetDeptId = getDepartmentId(req);
    if (targetDeptId && req.user.departmentId && targetDeptId !== req.user.departmentId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have authorization to access resources outside your department.',
      });
      return;
    }

    next();
  };
};

// Middleware: Step-Up Authentication Requirement for High-Risk Privileged Ops (PRD §28, TRD §2.4)
export const requireStepUpAuth = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const stepUpToken = req.headers['x-step-up-token'] as string;

    if (!stepUpToken) {
      res.status(403).json({
        success: false,
        error: 'Step-up authentication required for privileged operations. Provide valid X-Step-Up-Token.',
        stepUpRequired: true,
      });
      return;
    }

    try {
      const decoded = jwt.verify(stepUpToken, config.jwtSecret) as any;
      if (!decoded.isStepUp || decoded.userId !== req.user?.id) {
        res.status(403).json({ success: false, error: 'Invalid or unauthorized step-up authentication token' });
        return;
      }
      next();
    } catch {
      res.status(403).json({ success: false, error: 'Expired or invalid step-up authentication token' });
    }
  };
};
