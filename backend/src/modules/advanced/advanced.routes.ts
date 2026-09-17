import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { reviewService } from '../../services/reviewService';

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

// ============================================================================
// 4. 360° COMPETENCY REVIEWS (PRD §14 FR-060, FR-061)
// ============================================================================

// GET /api/v1/advanced/reviews
advancedRouter.get('/reviews', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const reviews = await prisma.review360.findMany({
      where: { tenantId: req.tenantId },
      include: {
        targetUser: { select: { id: true, firstName: true, lastName: true, role: true } },
        reviewerUser: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = reviews.map((r) => {
      const isAnon = r.reviewType === 'peer';
      return {
        id: r.id,
        cycleName: r.cycleName,
        targetUserId: r.targetUserId,
        targetUserName: `${r.targetUser.firstName} ${r.targetUser.lastName}`,
        reviewerUserId: isAnon ? 'ANONYMOUS' : r.reviewerUserId,
        reviewerUserName: isAnon ? 'Anonymous Peer Reviewer' : `${r.reviewerUser.firstName} ${r.reviewerUser.lastName}`,
        reviewType: r.reviewType,
        isAnonymous: isAnon,
        competencies: typeof r.competencies === 'string' ? JSON.parse(r.competencies) : r.competencies,
        feedback: r.feedback,
        status: r.status,
        submittedAt: r.submittedAt,
        createdAt: r.createdAt,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch 360 reviews' });
  }
});

// GET /api/v1/advanced/reviews/matrix/:userId (PRD §14 FR-061)
advancedRouter.get('/reviews/matrix/:userId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const matrix = await reviewService.getCompetencyMatrix(req.tenantId!, userId as string);
    res.json({ success: true, data: matrix });
  } catch (error: any) {
    console.error('Fetch competency matrix error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch competency matrix' });
  }
});

// POST /api/v1/advanced/reviews
advancedRouter.post('/reviews', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { targetUserId, cycleName, reviewType, competencies, feedback } = req.body;

    if (!targetUserId || !cycleName || !competencies) {
      res.status(400).json({ success: false, error: 'targetUserId, cycleName, and competencies are required' });
      return;
    }

    const newReview = await prisma.review360.create({
      data: {
        tenantId: req.tenantId!,
        targetUserId,
        reviewerUserId: req.user?.id!,
        cycleName,
        reviewType: reviewType || 'peer',
        competencies: typeof competencies === 'string' ? competencies : JSON.stringify(competencies),
        feedback: feedback || '',
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'REVIEW_360_SUBMITTED',
      resourceType: 'review_360',
      resourceId: newReview.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { targetUserId, cycleName, reviewType },
    });

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

// ============================================================================
// 5. RECOGNITIONS & VALUES FEED WITH ANTI-GAMING (PRD §14 FR-062)
// ============================================================================

// GET /api/v1/advanced/recognitions
advancedRouter.get('/recognitions', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { coreValue } = req.query;
    const whereClause: any = { tenantId: req.tenantId };
    if (coreValue) {
      whereClause.coreValue = coreValue as string;
    }

    const recognitions = await prisma.recognition.findMany({
      where: whereClause,
      include: {
        fromUser: { select: { id: true, firstName: true, lastName: true } },
        toUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = recognitions.map((r) => ({
      id: r.id,
      fromUserId: r.fromUserId,
      fromUserName: `${r.fromUser.firstName} ${r.fromUser.lastName}`,
      toUserId: r.toUserId,
      toUserName: `${r.toUser.firstName} ${r.toUser.lastName}`,
      coreValue: r.coreValue,
      message: r.message,
      reactionsCount: r.reactionsCount,
      createdAt: r.createdAt,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Fetch recognitions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recognitions' });
  }
});

// POST /api/v1/advanced/recognitions (with Anti-Gaming Guardrails)
advancedRouter.post('/recognitions', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { toUserId, coreValue, message } = req.body;

    if (!toUserId || !coreValue || !message) {
      res.status(400).json({ success: false, error: 'toUserId, coreValue, and message are required' });
      return;
    }

    const newRecognition = await reviewService.createRecognition(
      req.tenantId!,
      req.user?.id!,
      toUserId,
      coreValue,
      message
    );

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'RECOGNITION_POSTED',
      resourceType: 'recognition',
      resourceId: newRecognition.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { toUserId, coreValue },
    });

    res.status(201).json({ success: true, data: newRecognition });
  } catch (error: any) {
    console.error('Post recognition error:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to post recognition' });
  }
});

// POST /api/v1/advanced/recognitions/:id/react
advancedRouter.post('/recognitions/:id/react', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await prisma.recognition.update({
      where: { id: req.params.id as string },
      data: {
        reactionsCount: { increment: 1 },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('React recognition error:', error);
    res.status(500).json({ success: false, error: 'Failed to react to recognition' });
  }
});

// ============================================================================
// 6. 1:1 INTELLIGENCE & OUTCOME COMMITMENTS (PRD §10 FR-020, FR-021)
// ============================================================================

// GET /api/v1/advanced/one-on-one/prep/:userId
advancedRouter.get('/one-on-one/prep/:userId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const prepData = await reviewService.generateOneOnOnePrep(req.tenantId!, userId as string);
    res.json({ success: true, data: prepData });
  } catch (error: any) {
    console.error('Generate 1:1 prep error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate 1:1 prep agenda' });
  }
});

// POST /api/v1/advanced/one-on-one/outcomes
advancedRouter.post('/one-on-one/outcomes', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { targetUserId, summary, actionItems } = req.body;

    if (!targetUserId || !summary) {
      res.status(400).json({ success: false, error: 'targetUserId and summary are required' });
      return;
    }

    const outcome = await reviewService.captureOneOnOneOutcome(
      req.tenantId!,
      req.user?.id!,
      targetUserId,
      summary,
      Array.isArray(actionItems) ? actionItems : []
    );

    res.status(201).json(outcome);
  } catch (error: any) {
    console.error('Capture 1:1 outcome error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to record 1:1 meeting outcomes' });
  }
});

