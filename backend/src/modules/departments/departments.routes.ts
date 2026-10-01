import { Router, Response } from 'express';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

export const departmentsRouter = Router();

// ==========================================
// 1. GET /api/v1/departments — List All Departments
// ==========================================
departmentsRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      where: { tenantId: req.tenantId! },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, role: true, designation: true, status: true },
        },
        priorities: {
          select: { id: true, title: true, weight: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const allUsers = await prisma.user.findMany({
      where: { tenantId: req.tenantId! },
      select: { id: true, firstName: true, lastName: true, email: true, designation: true },
    });

    const userMap = new Map<string, any>(allUsers.map((u: any) => [u.id, u]));
    const deptMap = new Map<string, string>(departments.map((d: any) => [d.id, d.name]));

    const enriched = departments.map((dept: any) => {
      const head = dept.headUserId ? userMap.get(dept.headUserId) : null;
      const delegate = dept.delegateUserId ? userMap.get(dept.delegateUserId) : null;

      return {
        id: dept.id,
        tenantId: dept.tenantId,
        name: dept.name,
        code: dept.code,
        parentId: dept.parentId,
        parentName: dept.parentId ? deptMap.get(dept.parentId) || null : null,
        headUserId: dept.headUserId,
        headName: head ? `${head.firstName} ${head.lastName}` : null,
        headEmail: head?.email || null,
        headDesignation: head?.designation || null,
        delegateUserId: dept.delegateUserId,
        delegateName: delegate ? `${delegate.firstName} ${delegate.lastName}` : null,
        delegateEmail: delegate?.email || null,
        memberCount: dept.users.length,
        activeMembersCount: dept.users.filter((u: any) => u.status === 'active').length,
        prioritiesCount: dept.priorities.length,
        members: dept.users,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Fetch departments error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve departments' });
  }
});

// ==========================================
// 2. GET /api/v1/departments/tree — Hierarchical Tree Graph (PRD §9 FR-010)
// ==========================================
departmentsRouter.get('/tree', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      where: { tenantId: req.tenantId! },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, role: true, designation: true, email: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const allUsers = await prisma.user.findMany({
      where: { tenantId: req.tenantId! },
      select: { id: true, firstName: true, lastName: true, designation: true },
    });
    const userMap = new Map<string, any>(allUsers.map((u: any) => [u.id, u]));

    // Construct recursive tree
    interface TreeNode {
      id: string;
      name: string;
      code: string;
      parentId: string | null;
      headUserId: string | null;
      headName: string | null;
      headDesignation: string | null;
      delegateUserId: string | null;
      delegateName: string | null;
      memberCount: number;
      members: any[];
      children: TreeNode[];
    }

    const nodeMap = new Map<string, TreeNode>();

    departments.forEach((d: any) => {
      const head = d.headUserId ? userMap.get(d.headUserId) : null;
      const delegate = d.delegateUserId ? userMap.get(d.delegateUserId) : null;

      nodeMap.set(d.id, {
        id: d.id,
        name: d.name,
        code: d.code,
        parentId: d.parentId,
        headUserId: d.headUserId,
        headName: head ? `${head.firstName} ${head.lastName}` : null,
        headDesignation: head?.designation || null,
        delegateUserId: d.delegateUserId,
        delegateName: delegate ? `${delegate.firstName} ${delegate.lastName}` : null,
        memberCount: d.users.length,
        members: d.users,
        children: [],
      });
    });

    const rootNodes: TreeNode[] = [];

    nodeMap.forEach((node) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    res.json({
      success: true,
      data: {
        totalDepartments: departments.length,
        tree: rootNodes,
      },
    });
  } catch (error) {
    console.error('Department tree error:', error);
    res.status(500).json({ success: false, error: 'Failed to build department tree graph' });
  }
});

// ==========================================
// 3. GET /api/v1/departments/org/chart — Organizational Graph API (PRD §9 S4-06)
// ==========================================
departmentsRouter.get('/org/chart', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [departments, users] = await Promise.all([
      prisma.department.findMany({
        where: { tenantId: req.tenantId! },
        include: { users: true },
      }),
      prisma.user.findMany({
        where: { tenantId: req.tenantId!, status: 'active' },
        include: { department: true },
      }),
    ]);

    // Find executive / CEO leaders
    const executives = users.filter((u: any) => u.role === 'owner' || u.role === 'super_admin' || u.role === 'executive');

    // Build hierarchical nodes
    const graphNodes = users.map((u: any) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      role: u.role,
      designation: u.designation || 'Team Member',
      departmentId: u.departmentId,
      departmentName: u.department?.name || 'Executive Leadership',
      departmentCode: u.department?.code || 'EXEC',
      isDepartmentHead: u.department?.headUserId === u.id,
      isDelegate: u.department?.delegateUserId === u.id,
      email: u.email,
    }));

    // Build reporting edges
    const graphEdges: { from: string; to: string; relationship: string }[] = [];

    const owner = executives.find((e: any) => e.role === 'owner') || executives[0];

    departments.forEach((dept: any) => {
      if (dept.headUserId && owner && dept.headUserId !== owner.id) {
        graphEdges.push({
          from: owner.id,
          to: dept.headUserId,
          relationship: 'REPORTS_TO_EXECUTIVE',
        });
      }

      if (dept.headUserId && dept.delegateUserId && dept.headUserId !== dept.delegateUserId) {
        graphEdges.push({
          from: dept.headUserId,
          to: dept.delegateUserId,
          relationship: 'DELEGATE_HANDOFF',
        });
      }

      dept.users.forEach((member: any) => {
        if (dept.headUserId && member.id !== dept.headUserId && member.id !== dept.delegateUserId) {
          graphEdges.push({
            from: dept.headUserId,
            to: member.id,
            relationship: 'MANAGES_TEAM_MEMBER',
          });
        }
      });
    });

    res.json({
      success: true,
      data: {
        executivesCount: executives.length,
        departmentsCount: departments.length,
        totalMembersCount: users.length,
        nodes: graphNodes,
        edges: graphEdges,
      },
    });
  } catch (error) {
    console.error('Org chart error:', error);
    res.status(500).json({ success: false, error: 'Failed to construct organizational graph' });
  }
});

// ==========================================
// 4. POST /api/v1/departments — Create Department (PRD §9 S4-04)
// ==========================================
departmentsRouter.post('/', authMiddleware, requireRoles(['owner', 'super_admin', 'hr']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, code, parentId, headUserId, delegateUserId } = req.body;

    if (!name || !code) {
      res.status(400).json({ success: false, error: 'Department name and unique code are required' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();

    const existingCode = await prisma.department.findFirst({
      where: { tenantId: req.tenantId!, code: cleanCode },
    });

    if (existingCode) {
      res.status(409).json({ success: false, error: `Department code '${cleanCode}' is already in use` });
      return;
    }

    const newDept = await prisma.department.create({
      data: {
        tenantId: req.tenantId!,
        name: name.trim(),
        code: cleanCode,
        parentId: parentId || null,
        headUserId: headUserId || null,
        delegateUserId: delegateUserId || null,
      },
    });

    // If head user was assigned, update their role to dept_head if they are an employee
    if (headUserId) {
      await prisma.user.updateMany({
        where: { id: headUserId, role: 'employee' },
        data: { role: 'dept_head', departmentId: newDept.id },
      });
    }

    // If delegate was assigned, ensure departmentId matches
    if (delegateUserId) {
      await prisma.user.updateMany({
        where: { id: delegateUserId },
        data: { role: 'delegate', departmentId: newDept.id },
      });
    }

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'DEPARTMENT_CREATED',
      resourceType: 'department',
      resourceId: newDept.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { name: newDept.name, code: newDept.code, parentId, headUserId },
    });

    res.status(201).json({
      success: true,
      data: newDept,
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ success: false, error: 'Failed to create department' });
  }
});

// ==========================================
// 5. PATCH /api/v1/departments/:id — Update Department
// ==========================================
departmentsRouter.patch('/:id', authMiddleware, requireRoles(['owner', 'super_admin', 'dept_head', 'hr']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deptId = req.params.id as string;

    const existing = await prisma.department.findFirst({
      where: { id: deptId, tenantId: req.tenantId! },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Department not found' });
      return;
    }

    const { name, code, parentId, headUserId, delegateUserId } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (code !== undefined) updateData.code = code.trim().toUpperCase();
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (headUserId !== undefined) updateData.headUserId = headUserId || null;
    if (delegateUserId !== undefined) updateData.delegateUserId = delegateUserId || null;

    const updated = await prisma.department.update({
      where: { id: deptId },
      data: updateData,
    });

    // Reconcile user roles if head/delegate changed
    if (headUserId && headUserId !== existing.headUserId) {
      await prisma.user.updateMany({
        where: { id: headUserId, role: 'employee' },
        data: { role: 'dept_head', departmentId: deptId },
      });
    }

    if (delegateUserId && delegateUserId !== existing.delegateUserId) {
      await prisma.user.updateMany({
        where: { id: delegateUserId },
        data: { role: 'delegate', departmentId: deptId },
      });
    }

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'DEPARTMENT_UPDATED',
      resourceType: 'department',
      resourceId: updated.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { previous: existing, updated: updateData },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ success: false, error: 'Failed to update department' });
  }
});

// ==========================================
// 6. DELETE /api/v1/departments/:id — Delete Department
// ==========================================
departmentsRouter.delete('/:id', authMiddleware, requireRoles(['owner', 'super_admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deptId = req.params.id as string;

    const dept = await prisma.department.findFirst({
      where: { id: deptId, tenantId: req.tenantId! },
      include: {
        users: { select: { id: true } },
        tasks: { select: { id: true } },
      },
    });

    if (!dept) {
      res.status(404).json({ success: false, error: 'Department not found' });
      return;
    }

    // Reassign or unbind member users
    if (dept.users.length > 0) {
      await prisma.user.updateMany({
        where: { departmentId: deptId },
        data: { departmentId: null },
      });
    }

    // Unbind child departments
    await prisma.department.updateMany({
      where: { parentId: deptId },
      data: { parentId: null },
    });

    await prisma.department.delete({
      where: { id: deptId },
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'DEPARTMENT_DELETED',
      resourceType: 'department',
      resourceId: deptId,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { deletedDepartment: dept.name, code: dept.code, orphanedUsersCount: dept.users.length },
    });

    res.json({
      success: true,
      message: `Department '${dept.name}' deleted successfully. Assigned members were unlinked.`,
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete department' });
  }
});
