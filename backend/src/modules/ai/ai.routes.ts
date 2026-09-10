import { Router } from 'express';
import { aiService } from '../../services/aiService';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';

export const aiRouter = Router();

// POST /api/v1/ai/luminary/chat
aiRouter.post('/luminary/chat', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, error: 'Prompt is required' });
      return;
    }

    const aiResult = await aiService.processChat(req.tenantId!, prompt);

    res.json({
      success: true,
      data: {
        prompt,
        response: aiResult.response,
        recommendations: aiResult.recommendations,
        provider: aiResult.provider,
        model: aiResult.model,
        timestamp: aiResult.timestamp,
      },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ success: false, error: 'Failed to process AI query' });
  }
});
