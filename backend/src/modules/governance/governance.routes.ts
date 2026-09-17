import { Router, Request, Response } from 'express';
import { authenticateJwt, requireTenant } from '../../middleware/auth.middleware';
import { calibrationService } from '../../services/calibrationService';
import { decisionService } from '../../services/decisionService';
import { logger } from '../../utils/logger';

export const governanceRouter = Router();

governanceRouter.use(authenticateJwt);
governanceRouter.use(requireTenant);

/**
 * GET /api/v1/governance/calibration/9box
 * PRD §13, §24: 9-Box Talent Calibration Grid
 */
governanceRouter.get('/calibration/9box', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const departmentId = req.query.departmentId as string | undefined;

    const data = await calibrationService.getCalibrationGrid(tenantId, departmentId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    logger.error({ error }, 'Failed to retrieve calibration grid');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/governance/compensation/recommendations
 * PRD §3.2, §24: Governed Performance-Based Compensation Recommendations
 */
governanceRouter.get('/compensation/recommendations', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const data = await calibrationService.getCompensationRecommendations(tenantId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    logger.error({ error }, 'Failed to retrieve compensation recommendations');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/governance/checkpoints
 * PRD §13 FR-050: Executive Checkpoint Approvals Tray
 */
governanceRouter.get('/checkpoints', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const data = decisionService.getCheckpoints(tenantId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    logger.error({ error }, 'Failed to retrieve checkpoints');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/governance/checkpoints/:id/decide
 * PRD §13 FR-050: Executive Decision on Checkpoint
 */
governanceRouter.post('/checkpoints/:id/decide', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const user = (req as any).user;
    const checkpointId = req.params.id;
    const { decision, decisionNotes } = req.body;

    if (!['APPROVED', 'REJECTED', 'EVIDENCE_REQUESTED'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'decision must be APPROVED, REJECTED, or EVIDENCE_REQUESTED' });
    }

    const updated = await decisionService.decideCheckpoint(
      tenantId,
      checkpointId,
      user.id,
      `${user.firstName} ${user.lastName}`,
      decision,
      decisionNotes
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    logger.error({ error }, 'Failed to record checkpoint decision');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/governance/decisions
 * PRD §13 FR-052: Executive Decision Room & History
 */
governanceRouter.get('/decisions', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const data = decisionService.getDecisions(tenantId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    logger.error({ error }, 'Failed to retrieve decision room records');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/governance/decisions
 * PRD §13 FR-052: Capture Finalized Decision in Decision Room
 */
governanceRouter.post('/decisions', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const user = (req as any).user;
    const { title, context, selectedAlternative, alternativesConsidered, assumptions, evidenceCitations, expectedOutcome, reviewDays } = req.body;

    if (!title || !selectedAlternative || !expectedOutcome) {
      return res.status(400).json({ success: false, error: 'title, selectedAlternative, and expectedOutcome are required' });
    }

    const record = await decisionService.recordDecision(
      tenantId,
      user.id,
      `${user.firstName} ${user.lastName}`,
      {
        title,
        context: context || '',
        selectedAlternative,
        alternativesConsidered: alternativesConsidered || [],
        assumptions: assumptions || [],
        evidenceCitations: evidenceCitations || [],
        expectedOutcome,
        reviewDays: Number(reviewDays) || 30,
      }
    );

    return res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    logger.error({ error }, 'Failed to record decision room record');
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default governanceRouter;
