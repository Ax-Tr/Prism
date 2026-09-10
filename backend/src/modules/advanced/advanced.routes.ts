import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

export const advancedRouter = Router();

// ============================================================================
// 1. REVENUE ATTRIBUTION & QUALITY SCORING (P1)
// ============================================================================

export interface RevenueAttribution {
  id: string;
  tenantId: string;
  departmentId: string;
  userId: string;
  taskId: string;
  dealName: string;
  revenueAmount: number;
  qualityScoreMultiplier: number;
  attributedDate: string;
}

const revenueAttributions: RevenueAttribution[] = [
  {
    id: 'rev-001',
    tenantId: 'a0000000-0000-0000-0000-000000000001',
    departmentId: 'd0000000-0000-0000-0000-000000000004',
    userId: 'u0000000-0000-0000-0000-000000000004',
    taskId: 't0000000-0000-0000-0000-000000000001',
    dealName: 'Enterprise SaaS Pilot Contract — FinCorp Global',
    revenueAmount: 75000,
    qualityScoreMultiplier: 1.25,
    attributedDate: new Date(Date.now() - 86400000).toISOString(),
  },
];

// GET /api/v1/advanced/revenue-attribution
advancedRouter.get('/revenue-attribution', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const attributions = revenueAttributions.filter((r: any) => r.tenantId === req.tenantId);
    const totalAttributed = attributions.reduce((acc: number, curr: any) => acc + curr.revenueAmount, 0);

    const userIds = attributions.map((a: any) => a.userId);
    const deptIds = attributions.map((a: any) => a.departmentId);

    const [users, departments] = await Promise.all([
      prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true } }),
      prisma.department.findMany({ where: { id: { in: deptIds } }, select: { id: true, name: true } }),
    ]);

    const userMap = new Map<string, string>(users.map((u: any) => [u.id, `${u.firstName} ${u.lastName}`]));
    const deptMap = new Map<string, string>(departments.map((d: any) => [d.id, d.name]));

    const enriched = attributions.map((attr: any) => ({
      ...attr,
      userName: userMap.get(attr.userId) || 'Unassigned',
      departmentName: deptMap.get(attr.departmentId) || 'Growth',
    }));

    res.json({
      success: true,
      data: {
        totalRevenueAttributed: totalAttributed,
        currency: 'USD',
        records: enriched,
      },
    });
  } catch (error) {
    console.error('Fetch revenue attribution error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue attributions' });
  }
});

// POST /api/v1/advanced/revenue-attribution (Owner / Dept Head)
advancedRouter.post('/revenue-attribution', authMiddleware, requireRoles(['owner', 'dept_head']), async (req: AuthenticatedRequest, res) => {
  try {
    const { userId, departmentId, taskId, dealName, revenueAmount, qualityScoreMultiplier } = req.body;

    if (!userId || !dealName || revenueAmount === undefined) {
      res.status(400).json({ success: false, error: 'userId, dealName, and revenueAmount are required' });
      return;
    }

    const defaultDept = await prisma.department.findFirst({ where: { tenantId: req.tenantId } });

    const newAttr: RevenueAttribution = {
      id: `rev-${Date.now()}-${uuidv4().substring(0, 4)}`,
      tenantId: req.tenantId!,
      departmentId: departmentId || defaultDept?.id || '',
      userId,
      taskId: taskId || 'general',
      dealName,
      revenueAmount: Number(revenueAmount),
      qualityScoreMultiplier: qualityScoreMultiplier ? Number(qualityScoreMultiplier) : 1.0,
      attributedDate: new Date().toISOString(),
    };

    revenueAttributions.unshift(newAttr);

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'REVENUE_ATTRIBUTED_TO_TASK',
      resourceType: 'revenue_attribution',
      resourceId: newAttr.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { dealName, revenueAmount: newAttr.revenueAmount, userId },
    });

    res.status(201).json({ success: true, data: newAttr });
  } catch (error) {
    console.error('Create revenue attribution error:', error);
    res.status(500).json({ success: false, error: 'Failed to record revenue attribution' });
  }
});

// ============================================================================
// 2. WHATSAPP CONVERSATIONAL TASK BOT WEBHOOK (P2)
// ============================================================================

// POST /api/v1/advanced/whatsapp/webhook
advancedRouter.post('/whatsapp/webhook', async (req, res) => {
  try {
    const { senderPhone, text, messageId } = req.body;

    if (!text || !senderPhone) {
      res.status(400).json({ success: false, error: 'senderPhone and text are required' });
      return;
    }

    let senderUser = await prisma.user.findFirst({
      where: { phone: senderPhone },
    });

    if (!senderUser) {
      senderUser = await prisma.user.findFirst({
        where: { role: 'owner' },
      });
    }

    if (!senderUser) {
      res.status(404).json({ success: false, error: 'No user account found for sender phone' });
      return;
    }

    const defaultTitle = text.length > 50 ? `${text.substring(0, 47)}...` : text;
    const defaultDept = senderUser.departmentId || (await prisma.department.findFirst({ where: { tenantId: senderUser.tenantId } }))?.id || '';

    const newTask = await prisma.task.create({
      data: {
        tenantId: senderUser.tenantId,
        departmentId: defaultDept,
        title: `[WhatsApp] ${defaultTitle}`,
        description: `Created via WhatsApp conversational bot from ${senderPhone}: "${text}"`,
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000),
        assignedTo: senderUser.id,
        createdBy: senderUser.id,
        proofRequired: true,
      },
    });

    await logAudit({
      tenantId: senderUser.tenantId,
      actorId: senderUser.id,
      actorRole: senderUser.role,
      action: 'TASK_CREATED_VIA_WHATSAPP',
      resourceType: 'task',
      resourceId: newTask.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: 'WhatsApp-Business-Webhook/2.0',
      payload: { messageId, text, assignedTo: senderUser.id },
    });

    res.status(201).json({
      success: true,
      data: {
        botResponse: `✅ Task "${newTask.title}" created successfully and assigned to ${senderUser.firstName} ${senderUser.lastName}. Due in 24 hours with mandatory proof required.`,
        task: newTask,
      },
    });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ success: false, error: 'Failed to process WhatsApp webhook' });
  }
});

// ============================================================================
// 3. AI-ASSISTED PROMOTION & HIKE READINESS TELEMETRY (P4)
// ============================================================================

// GET /api/v1/advanced/promotion-readiness
advancedRouter.get('/promotion-readiness', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { tenantId: req.tenantId, status: 'active' },
      include: {
        department: { select: { id: true, name: true } },
      },
    });

    const readinessRecords = await Promise.all(
      users.map(async (user: any) => {
        const completedTasksCount = await prisma.task.count({
          where: { tenantId: req.tenantId, assignedTo: user.id, status: 'completed' },
        });

        const latestScore = await prisma.dailyScore.findFirst({
          where: { tenantId: req.tenantId, userId: user.id },
          orderBy: { scoreDate: 'desc' },
        });

        const avgScore = latestScore?.totalScore || 92.5;
        const readinessIndex = Math.min(100, Math.round(avgScore * 0.7 + (completedTasksCount >= 2 ? 28 : 15)));

        const recommendation =
          readinessIndex >= 90
            ? 'High Promotion Readiness — Exceeding SLA benchmarks with consistent quality proofs.'
            : readinessIndex >= 80
            ? 'Solid Performer — On track for standard annual merit review.'
            : 'Growth Opportunity — Focus on closing open task backlog within SLA deadlines.';

        return {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          role: user.role,
          designation: user.designation,
          departmentName: user.department?.name || 'Engineering',
          overallScore: avgScore,
          completedTasks: completedTasksCount,
          readinessIndex,
          tier:
            readinessIndex >= 90
              ? 'TIER_1_ACCELERATED'
              : readinessIndex >= 80
              ? 'TIER_2_COMMENDED'
              : 'TIER_3_DEVELOPING',
          aiRecommendation: recommendation,
        };
      })
    );

    res.json({ success: true, data: readinessRecords });
  } catch (error) {
    console.error('Fetch promotion readiness error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch promotion readiness records' });
  }
});
