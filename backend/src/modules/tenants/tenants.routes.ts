import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../../middleware/rbac.middleware';

export const tenantsRouter = Router();

// GET /api/v1/tenants/roles/permissions (PRD §28 Role Matrix)
tenantsRouter.get('/roles/permissions', authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: {
      hierarchy: ROLE_HIERARCHY,
      permissions: ROLE_PERMISSIONS,
      userCurrentRole: req.user?.role,
      userPermissions: req.user ? ROLE_PERMISSIONS[req.user.role as keyof typeof ROLE_PERMISSIONS] || [] : [],
    },
  });
});

// GET /api/v1/tenants/current
tenantsRouter.get('/current', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId },
    });
    if (!tenant) {
      res.status(404).json({ success: false, error: 'Tenant not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        ...tenant,
        settings: typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings,
      },
    });
  } catch (error) {
    console.error('Fetch current tenant error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tenant' });
  }
});

// GET /api/v1/tenants/departments
tenantsRouter.get('/departments', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { tenantId: req.tenantId },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });

    const allUsers = await prisma.user.findMany({
      where: { tenantId: req.tenantId },
      select: { id: true, firstName: true, lastName: true },
    });

    const userMap = new Map<string, string>(allUsers.map((u: any) => [u.id, `${u.firstName} ${u.lastName}`]));

    const enriched = departments.map((dept: any) => ({
      id: dept.id,
      tenantId: dept.tenantId,
      name: dept.name,
      code: dept.code,
      parentId: dept.parentId,
      headUserId: dept.headUserId,
      headName: dept.headUserId ? userMap.get(dept.headUserId) || null : null,
      delegateUserId: dept.delegateUserId,
      delegateName: dept.delegateUserId ? userMap.get(dept.delegateUserId) || null : null,
      memberCount: dept.users.length,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Fetch departments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch departments' });
  }
});

// GET /api/v1/tenants/users
tenantsRouter.get('/users', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { tenantId: req.tenantId },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const sanitized = users.map((u: any) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      designation: u.designation,
      phone: u.phone,
      departmentId: u.departmentId,
      departmentName: u.department?.name,
      status: u.status,
      mfaEnabled: u.mfaEnabled,
      lastLoginAt: u.lastLoginAt,
    }));

    res.json({ success: true, data: sanitized });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// POST /api/v1/tenants/users/invite (Owner & Dept Head)
tenantsRouter.post('/users/invite', authMiddleware, requireRoles(['owner', 'dept_head']), async (req: AuthenticatedRequest, res) => {
  try {
    const { email, firstName, lastName, role, departmentId, designation } = req.body;

    if (!email || !firstName || !lastName || !role) {
      res.status(400).json({ success: false, error: 'Email, firstName, lastName, and role are required' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: req.tenantId!,
        email: email.trim().toLowerCase(),
      },
    });

    if (existingUser) {
      res.status(409).json({ success: false, error: 'User with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash('Admin@123', 10);

    const newUser = await prisma.user.create({
      data: {
        tenantId: req.tenantId!,
        departmentId: departmentId || null,
        email: email.trim().toLowerCase(),
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        designation: designation || 'Team Member',
        status: 'active',
        mfaEnabled: role === 'owner' || role === 'delegate',
        failedLoginAttempts: 0,
      },
      include: {
        department: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'USER_INVITED',
      resourceType: 'user',
      resourceId: newUser.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { email: newUser.email, role: newUser.role, departmentId },
    });

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        designation: newUser.designation,
        departmentId: newUser.departmentId,
        departmentName: newUser.department?.name,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ success: false, error: 'Failed to invite user' });
  }
});

// PATCH /api/v1/tenants/users/:id/role (Owner only)
tenantsRouter.patch('/users/:id/role', authMiddleware, requireRoles(['owner']), async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id as string, tenantId: req.tenantId },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const { role, departmentId } = req.body;
    const previousRole = user.role;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: role || user.role,
        departmentId: departmentId !== undefined ? departmentId : user.departmentId,
      },
    });

    // If promoted to delegate, update department's delegate reference
    if (role === 'delegate' && updatedUser.departmentId) {
      await prisma.department.update({
        where: { id: updatedUser.departmentId },
        data: { delegateUserId: updatedUser.id },
      });
    }

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'USER_ROLE_PROMOTED',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { previousRole, newRole: role, departmentId },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, error: 'Failed to update user role' });
  }
});

// PATCH /api/v1/tenants/settings (Owner only)
tenantsRouter.patch('/settings', authMiddleware, requireRoles(['owner']), async (req: AuthenticatedRequest, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId },
    });

    if (!tenant) {
      res.status(404).json({ success: false, error: 'Tenant not found' });
      return;
    }

    const currentSettings = typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings;
    const mergedSettings = req.body.settings ? { ...currentSettings, ...req.body.settings } : currentSettings;

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        settings: JSON.stringify(mergedSettings),
      },
    });

    await logAudit({
      tenantId: tenant.id,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'TENANT_SETTINGS_UPDATED',
      resourceType: 'tenant_settings',
      resourceId: tenant.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: req.body,
    });

    res.json({
      success: true,
      data: {
        ...updatedTenant,
        settings: mergedSettings,
      },
    });
  } catch (error) {
    console.error('Update tenant settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});
