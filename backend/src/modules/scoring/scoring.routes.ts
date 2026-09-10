import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { scoringEngine } from '../../services/scoringEngine';

export interface ScoreDispute {
  id: string;
  tenantId: string;
  userId: string;
  scoreId: string;
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'UPHELD' | 'CORRECTED';
  adjustedScore?: number;
  reviewedBy?: string;
  resolutionNotes?: string;
  createdAt: string;
}

// In-memory / structured dispute cache
const disputesStore: ScoreDispute[] = [];

export const scoringRouter = Router();

// GET /api/v1/scoring/daily
scoringRouter.get('/daily', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const scores = await prisma.dailyScore.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { scoreDate: 'desc' },
    });

    const userIds = scores.map((s: any) => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { department: { select: { id: true, name: true } } },
    });

    const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]));

    const enriched = scores.map((sc: any) => {
      const user = userMap.get(sc.userId);
      const dispute = disputesStore.find((d: any) => d.scoreId === sc.id);
      return {
        ...sc,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        userRole: user?.role,
        departmentName: user?.department?.name || 'General',
        disputeStatus: dispute?.status,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Fetch daily scores error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch daily scores' });
  }
});

// POST /api/v1/scoring/calculate-now
scoringRouter.post('/calculate-now', authMiddleware, async (req: AuthenticatedRequest, res) => {
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
      payload: { usersScored: computed.length },
    });

    res.json({ success: true, data: { date: today, computedCount: computed.length, scores: computed } });
  } catch (error) {
    console.error('Calculate scoring error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate scores' });
  }
});

// POST /api/v1/scoring/disputes (Employee dispute submission)
scoringRouter.post('/disputes', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { scoreId, reason } = req.body;

    if (!scoreId || !reason || reason.trim().length < 5) {
      res.status(400).json({ success: false, error: 'scoreId and a dispute reason of at least 5 characters are required' });
      return;
    }

    const newDispute: ScoreDispute = {
      id: `disp-${Date.now()}-${uuidv4().substring(0, 4)}`,
      tenantId: req.tenantId!,
      userId: req.user?.id || 'anonymous',
      scoreId,
      reason,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    disputesStore.unshift(newDispute);

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'SCORE_DISPUTE_FILED',
      resourceType: 'score_dispute',
      resourceId: newDispute.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { scoreId, reason },
    });

    res.status(201).json({ success: true, data: newDispute });
  } catch (error) {
    console.error('File score dispute error:', error);
    res.status(500).json({ success: false, error: 'Failed to file dispute' });
  }
});

// POST /api/v1/scoring/disputes/:id/resolve (Dept Head / Owner)
scoringRouter.post('/disputes/:id/resolve', authMiddleware, requireRoles(['owner', 'dept_head']), async (req: AuthenticatedRequest, res) => {
  try {
    const { decision, adjustedScore, notes } = req.body;
    const dispute = disputesStore.find((d) => d.id === req.params.id && d.tenantId === req.tenantId);

    if (!dispute) {
      res.status(404).json({ success: false, error: 'Dispute not found' });
      return;
    }

    dispute.status = decision === 'CORRECTED' ? 'CORRECTED' : 'UPHELD';
    dispute.reviewedBy = req.user?.id;
    dispute.resolutionNotes = notes;

    if (decision === 'CORRECTED' && adjustedScore !== undefined) {
      dispute.adjustedScore = Number(adjustedScore);
      await prisma.dailyScore.update({
        where: { id: dispute.scoreId },
        data: { totalScore: Number(adjustedScore) },
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
      payload: { decision, adjustedScore, notes },
    });

    res.json({ success: true, data: dispute });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve dispute' });
  }
});
