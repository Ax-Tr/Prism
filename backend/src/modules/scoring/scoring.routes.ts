import { Router, Response } from 'express';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { scoringEngine } from '../../services/scoringEngine';

export const scoringRouter = Router();

// ==========================================
// 1. GET /api/v1/scoring/six-lenses — PRD §16 Six-Lens Intelligence API
// Output, Risk, Return, Growth, Presence, Wellbeing + Velocity Index
// ==========================================
scoringRouter.get('/six-lenses', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { departmentId } = req.query;
    const sixLenses = await scoringEngine.calculateSixLenses(req.tenantId!, departmentId as string);

    res.json({
      success: true,
      data: {
        lenses: sixLenses,
        standardsDisclosure: {
          specification: 'PRD-v2.4 §16 SIX_LENS_SCORING_SPEC',
          safeguardPolicy: 'Activity ≠ Value (No unverified claims; all signals anchored to cryptographic proofs)',
          auditLedgerGuaranteed: true,
        },
      },
    });
  } catch (error) {
    console.error('Fetch six-lenses error:', error);
    res.status(500).json({ success: false, error: 'Failed to compute six-lens intelligence' });
  }
});

// ==========================================
// 2. GET /api/v1/scoring/daily — List Individual Scores & Disputed State
// ==========================================
scoringRouter.get('/daily', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { departmentId, userId, limit = '50', page = '1' } = req.query;

    const where: any = {
      tenantId: req.tenantId!,
    };
    if (departmentId && departmentId !== 'ALL') where.departmentId = departmentId as string;
    if (userId && userId !== 'ALL') where.userId = userId as string;

    const take = parseInt(limit as string, 10) || 50;
    const skip = (Math.max(1, parseInt(page as string, 10)) - 1) * take;

    const [scores, total] = await Promise.all([
      prisma.dailyScore.findMany({
        where,
        include: {
          disputes: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { scoreDate: 'desc' },
        skip,
        take,
      }),
      prisma.dailyScore.count({ where }),
    ]);

    const userIds = Array.from(new Set(scores.map((s: any) => s.userId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { department: { select: { id: true, name: true, code: true } } },
    });

    const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]));

    const enriched = scores.map((sc: any) => {
      const user = userMap.get(sc.userId);
      const activeDispute = sc.disputes && sc.disputes.length > 0 ? sc.disputes[0] : null;
      return {
        ...sc,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        userRole: user?.role,
        designation: user?.designation,
        departmentName: user?.department?.name || 'General Operations',
        departmentCode: user?.department?.code || 'OPS',
        disputeStatus: activeDispute?.status,
        activeDispute,
      };
    });

    res.json({
      success: true,
      data: {
        items: enriched,
        pagination: {
          total,
          page: parseInt(page as string, 10) || 1,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    console.error('Fetch daily scores error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch daily scores' });
  }
});

// ==========================================
// 3. POST /api/v1/scoring/calculate-now — Recalculate and Snapshot
// ==========================================
scoringRouter.post('/calculate-now', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const computed = await scoringEngine.calculateTenantDailyScores(req.tenantId!, today);

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'SCORING_RUN_MANUALLY',
      resourceType: 'scoring_engine',
      resourceId: today,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { usersScored: computed.length, scoreDate: today },
    });

    res.json({ success: true, data: { date: today, computedCount: computed.length, scores: computed } });
  } catch (error) {
    console.error('Calculate scoring error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate scores' });
  }
});

// ==========================================
// 4. GET /api/v1/scoring/disputes — Score Disputes Queue (PRD §16 S8-08)
// ==========================================
scoringRouter.get('/disputes', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status = 'OPEN' } = req.query;
    const where: any = { tenantId: req.tenantId! };
    if (status !== 'ALL') where.status = status as string;

    const disputes = await prisma.scoreDispute.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: true, designation: true } },
        score: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = disputes.map((d: any) => ({
      id: d.id,
      scoreId: d.scoreId,
      userId: d.userId,
      userName: `${d.user.firstName} ${d.user.lastName}`,
      userRole: d.user.role,
      designation: d.user.designation,
      scoreDate: d.score.scoreDate,
      originalScore: d.score.totalScore,
      reason: d.reason,
      status: d.status,
      adjustedScore: d.adjustedScore,
      reviewedBy: d.reviewedBy,
      resolutionNotes: d.resolutionNotes,
      createdAt: d.createdAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Fetch disputes error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve score disputes' });
  }
});

// ==========================================
// 5. POST /api/v1/scoring/disputes — File Score Dispute (PRD §16 S8-08)
// ==========================================
scoringRouter.post('/disputes', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { scoreId, reason } = req.body;

    if (!scoreId || !reason || reason.trim().length < 5) {
      res.status(400).json({ success: false, error: 'scoreId and a dispute justification of at least 5 characters are required' });
      return;
    }

    const score = await prisma.dailyScore.findFirst({
      where: { id: scoreId, tenantId: req.tenantId! },
    });

    if (!score) {
      res.status(404).json({ success: false, error: 'Score record not found' });
      return;
    }

    const newDispute = await prisma.scoreDispute.create({
      data: {
        tenantId: req.tenantId!,
        userId: req.user?.id || score.userId,
        scoreId,
        reason: reason.trim(),
        status: 'OPEN',
      },
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'SCORE_DISPUTE_FILED',
      resourceType: 'score_dispute',
      resourceId: newDispute.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { scoreId, reason: newDispute.reason },
    });

    res.status(201).json({ success: true, data: newDispute });
  } catch (error) {
    console.error('File score dispute error:', error);
    res.status(500).json({ success: false, error: 'Failed to file score dispute' });
  }
});

// ==========================================
// 6. POST /api/v1/scoring/disputes/:id/resolve — Resolve Score Dispute (PRD §16 S8-08)
// ==========================================
scoringRouter.post('/disputes/:id/resolve', authMiddleware, requireRoles(['owner', 'super_admin', 'dept_head', 'hr']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { decision, adjustedScore, notes } = req.body;

    if (!decision || !['CORRECTED', 'UPHELD'].includes(decision)) {
      res.status(400).json({ success: false, error: "Decision must be 'CORRECTED' or 'UPHELD'" });
      return;
    }

    const dispute = await prisma.scoreDispute.findFirst({
      where: { id: req.params.id as string, tenantId: req.tenantId! },
      include: { score: true },
    });

    if (!dispute) {
      res.status(404).json({ success: false, error: 'Dispute not found' });
      return;
    }

    const adjScore = decision === 'CORRECTED' && adjustedScore !== undefined ? Number(adjustedScore) : undefined;

    const updatedDispute = await prisma.scoreDispute.update({
      where: { id: dispute.id },
      data: {
        status: decision,
        reviewedBy: req.user?.id,
        resolutionNotes: notes || `Dispute ${decision.toLowerCase()} by reviewer`,
        adjustedScore: adjScore,
      },
    });

    if (decision === 'CORRECTED' && adjScore !== undefined) {
      await prisma.dailyScore.update({
        where: { id: dispute.scoreId },
        data: { totalScore: adjScore },
      });
    }

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'SCORE_DISPUTE_RESOLVED',
      resourceType: 'score_dispute',
      resourceId: dispute.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { decision, adjustedScore: adjScore, notes },
    });

    res.json({ success: true, data: updatedDispute });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve dispute' });
  }
});
