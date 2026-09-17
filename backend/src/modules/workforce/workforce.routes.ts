import { Router, Request, Response } from 'express';
import { authenticateJwt, requireTenant } from '../../middleware/auth.middleware';
import { capacityService } from '../../services/capacityService';
import { skillService } from '../../services/skillService';
import { careerService } from '../../services/careerService';
import { logger } from '../../utils/logger';

export const workforceRouter = Router();

workforceRouter.use(authenticateJwt);
workforceRouter.use(requireTenant);

/**
 * GET /api/v1/workforce/capacity/roster
 * PRD §15 FR-070: Team capacity, workload allocation & burnout risk
 */
workforceRouter.get('/capacity/roster', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const departmentId = req.query.departmentId as string | undefined;

    const data = await capacityService.getCapacityRoster(tenantId, departmentId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    logger.error({ error }, 'Failed to retrieve capacity roster');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/workforce/capacity/simulate
 * PRD §15 FR-071: Scenario simulator for staffing, scope, and deadline shifts
 */
workforceRouter.post('/capacity/simulate', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const { departmentId, headcountDelta, workloadMultiplier, deadlineAccelerationDays } = req.body;

    const simulation = await capacityService.simulateScenario({
      tenantId,
      departmentId,
      headcountDelta: Number(headcountDelta) || 0,
      workloadMultiplier: Number(workloadMultiplier) || 1.0,
      deadlineAccelerationDays: Number(deadlineAccelerationDays) || 0,
    });

    return res.status(200).json({ success: true, data: simulation });
  } catch (error: any) {
    logger.error({ error }, 'Failed to execute capacity simulation');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/workforce/skills/ontology
 * PRD §15 FR-072: Organizational skill taxonomy & levels
 */
workforceRouter.get('/skills/ontology', async (_req: Request, res: Response) => {
  try {
    const ontology = skillService.getOntology();
    return res.status(200).json({ success: true, data: ontology });
  } catch (error: any) {
    logger.error({ error }, 'Failed to retrieve skill ontology');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/workforce/skills/matrix
 * PRD §15 FR-072: Team skill matrix and SPOF gap detection
 */
workforceRouter.get('/skills/matrix', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const departmentId = req.query.departmentId as string | undefined;

    const matrix = await skillService.getSkillMatrix(tenantId, departmentId);
    return res.status(200).json({ success: true, data: matrix });
  } catch (error: any) {
    logger.error({ error }, 'Failed to retrieve skill matrix');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/workforce/skills/match-team
 * PRD §15 FR-072: Intelligent squad candidate matching
 */
workforceRouter.post('/skills/match-team', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const { requiredSkills, maxTeamSize, targetDepartmentId } = req.body;

    if (!requiredSkills || !Array.isArray(requiredSkills)) {
      return res.status(400).json({ success: false, error: 'requiredSkills array is required' });
    }

    const match = await skillService.matchProjectTeam(tenantId, {
      requiredSkills,
      maxTeamSize: Number(maxTeamSize) || 3,
      targetDepartmentId,
    });

    return res.status(200).json({ success: true, data: match });
  } catch (error: any) {
    logger.error({ error }, 'Failed to match project team');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/workforce/career/paths/:userId
 * PRD §15 FR-073: Career ladder progression & promotion readiness
 */
workforceRouter.get('/career/paths/:userId', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const userId = req.params.userId;

    const careerPath = await careerService.getCareerPath(tenantId, userId);
    return res.status(200).json({ success: true, data: careerPath });
  } catch (error: any) {
    logger.error({ error }, 'Failed to retrieve career progression path');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/workforce/career/goals
 * PRD §15 FR-073: Career development growth target setting
 */
workforceRouter.post('/career/goals', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const { userId, title, targetLevelId, notes } = req.body;

    if (!userId || !title || !targetLevelId) {
      return res.status(400).json({ success: false, error: 'userId, title, and targetLevelId are required' });
    }

    const result = await careerService.createCareerGoal(tenantId, userId, title, targetLevelId, notes);
    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    logger.error({ error }, 'Failed to create career growth goal');
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default workforceRouter;
