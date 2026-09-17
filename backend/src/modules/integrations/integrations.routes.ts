import { Router } from 'express';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { integrationService } from '../../services/integrationService';

export const integrationsRouter = Router();

// GET /api/v1/integrations
integrationsRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const connectors = integrationService.listConnectors();
    res.json({
      success: true,
      data: connectors,
    });
  } catch (error) {
    console.error('Fetch integrations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch integrations' });
  }
});

// POST /api/v1/integrations/:connector/test
integrationsRouter.post('/:connector/test', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { connector } = req.params;
    const testResult = await integrationService.testConnector(connector as string);

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'INTEGRATION_TESTED',
      resourceType: 'integration_connector',
      resourceId: connector,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { latencyMs: testResult.latencyMs, healthy: testResult.healthy },
    });

    res.json({
      success: true,
      data: testResult,
    });
  } catch (error: any) {
    console.error('Test integration error:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to test integration connector' });
  }
});

// POST /api/v1/integrations/:connector/sync
integrationsRouter.post('/:connector/sync', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { connector } = req.params;
    const syncResult = await integrationService.syncConnector(connector as string, req.tenantId!);

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'INTEGRATION_SYNCED',
      resourceType: 'integration_connector',
      resourceId: connector,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { syncedRecords: syncResult.syncedRecords },
    });

    res.json({
      success: true,
      data: syncResult,
      message: `Connector '${connector}' synchronized successfully`,
    });
  } catch (error: any) {
    console.error('Sync integration error:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to sync integration connector' });
  }
});
