import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prisma';
import { authenticateJwt, requireTenant } from '../../middleware/auth.middleware';
import { continuityService } from '../../services/continuityService';
import { logger } from '../../utils/logger';

export const continuityRouter = Router();

continuityRouter.use(authenticateJwt);
continuityRouter.use(requireTenant);

/**
 * GET /api/v1/continuity/leaves
 * PRD §21: Lists all leaves with enriched user, delegate, and continuity status
 */
continuityRouter.get('/leaves', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;

    const leaves = await prisma.leaveRequest.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const userIds = new Set<string>();
    leaves.forEach((l) => {
      userIds.add(l.userId);
      if (l.handoverUserId) userIds.add(l.handoverUserId);
    });

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      include: { department: { select: { id: true, name: true } } },
    });

    const userMap = new Map<string, any>(users.map((u) => [u.id, u]));

    const enriched = leaves.map((leave) => {
      const user = userMap.get(leave.userId);
      const handover = leave.handoverUserId ? userMap.get(leave.handoverUserId) : null;

      return {
        ...leave,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        userRole: user?.role,
        departmentName: user?.department?.name || 'Operations',
        handoverUserName: handover ? `${handover.firstName} ${handover.lastName}` : 'Unassigned',
      };
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch leave records');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/continuity/leaves
 * PRD §21: Submit planned leave with Zero-Context-Loss task delegation
 */
continuityRouter.post('/leaves', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const user = (req as any).user;
    const { startDate, endDate, handoverUserId, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'startDate and endDate are required' });
    }

    const result = await continuityService.submitLeaveWithContinuity(tenantId, user.id, {
      startDate,
      endDate,
      handoverUserId,
      reason,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    logger.error({ error }, 'Failed to create leave with continuity');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/continuity/leaves/:id/dossier
 * PRD §21: Retrieve handover dossier for a specific leave window
 */
continuityRouter.get('/leaves/:id/dossier', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const leaveId = req.params.id;

    const leave = await prisma.leaveRequest.findFirst({ where: { id: leaveId, tenantId } });
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    const dossier = await continuityService.generateHandoverDossier(
      tenantId,
      leave.userId,
      leave.startDate,
      leave.endDate,
      leave.handoverUserId || undefined
    );

    return res.status(200).json({ success: true, data: dossier });
  } catch (error: any) {
    logger.error({ error }, 'Failed to generate handover dossier');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/continuity/leaves/:id/emergency
 * PRD §21: Escalate emergency coverage to department delegate / head
 */
continuityRouter.post('/leaves/:id/emergency', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const user = (req as any).user;
    const leaveId = req.params.id;

    const result = await continuityService.escalateEmergencyCoverage(tenantId, leaveId, user.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error({ error }, 'Failed to escalate emergency coverage');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/continuity/leaves/:id/handback
 * PRD §21: Return from leave, synthesize debrief report, and restore task ownership
 */
continuityRouter.post('/leaves/:id/handback', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const user = (req as any).user;
    const leaveId = req.params.id;

    const debrief = await continuityService.processReturnAndHandback(tenantId, leaveId, user.id);
    return res.status(200).json({ success: true, data: debrief });
  } catch (error: any) {
    logger.error({ error }, 'Failed to process return and handback');
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default continuityRouter;
