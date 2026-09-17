import { Router } from 'express';
import { aiService } from '../../services/aiService';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../db/prisma';

export const aiRouter = Router();

/**
 * POST /api/v1/ai/luminary/chat
 * Multi-turn conversational Luminary AI with RAG, citations & prompt injection guard
 */
aiRouter.post('/luminary/chat', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Prompt is required' });
      return;
    }

    const aiResult = await aiService.processChat(req.tenantId!, prompt.trim(), req.userId);

    if (aiResult.governanceStatus === 'INJECTION_BLOCKED') {
      res.status(400).json({
        success: false,
        governanceStatus: 'INJECTION_BLOCKED',
        error: aiResult.response,
        data: aiResult,
      });
      return;
    }

    res.json({
      success: true,
      data: aiResult,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ success: false, error: 'Failed to process AI query' });
  }
});

/**
 * GET /api/v1/ai/luminary/stream
 * Proactive synthesized intelligence stream for Executive Command Center
 */
aiRouter.get('/luminary/stream', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const stream = await aiService.getIntelligenceStream(req.tenantId!);
    res.json({
      success: true,
      data: stream,
    });
  } catch (error) {
    console.error('AI stream error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve intelligence stream' });
  }
});

/**
 * POST /api/v1/ai/luminary/stream/:id/action
 * Execute actionable recommendation from Luminary stream
 */
aiRouter.post('/luminary/stream/:id/action', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.body;

    // Log action to audit ledger
    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId!,
        actorId: req.userId!,
        action: 'AI_STREAM_ACTION_EXECUTED',
        resourceType: `luminary_stream_${id}`,
        payload: JSON.stringify({ actionType, cardId: id }),
      },
    });

    res.json({
      success: true,
      message: `Action '${actionType || 'executed'}' processed for stream insight ${id}`,
      actionId: id,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI stream action error:', error);
    res.status(500).json({ success: false, error: 'Failed to execute stream action' });
  }
});

/**
 * GET /api/v1/ai/sanctum/config
 * Retrieve current Sanctum AI configuration
 */
aiRouter.get('/sanctum/config', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const config = await aiService.getSanctumConfig(req.tenantId!);
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Get Sanctum config error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve Sanctum config' });
  }
});

/**
 * POST /api/v1/ai/sanctum/config
 * Update Sanctum AI configuration (Autonomy tiers, tone, PII minimization)
 */
aiRouter.post('/sanctum/config', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const updates = req.body;
    const updatedConfig = await aiService.updateSanctumConfig(req.tenantId!, updates, req.userId);
    res.json({
      success: true,
      data: updatedConfig,
      message: 'Sanctum AI parameters synchronized successfully',
    });
  } catch (error) {
    console.error('Update Sanctum config error:', error);
    res.status(500).json({ success: false, error: 'Failed to update Sanctum config' });
  }
});
