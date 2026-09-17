import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { analyticsService } from '../../services/analyticsService';
import { logAudit } from '../../db/audit';

export const analyticsRouter = Router();

// GET /api/v1/analytics/briefing - Board-level executive intelligence briefing (PRD §26 FR-090)
analyticsRouter.get('/briefing', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const briefing = await analyticsService.generateExecutiveBriefing(req.tenantId!);
    res.json({ success: true, data: briefing });
  } catch (error) {
    console.error('Executive briefing error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate executive briefing' });
  }
});

// GET /api/v1/analytics/department-efficiency - Cross-department efficiency index (DEI) (PRD §26 FR-091)
analyticsRouter.get('/department-efficiency', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const dei = await analyticsService.getDepartmentEfficiencyIndex(req.tenantId!);
    res.json({ success: true, data: dei });
  } catch (error) {
    console.error('Department efficiency index error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch department efficiency index' });
  }
});

// GET /api/v1/analytics/flight-risk - Flight & attrition risk forecast (PRD §26 FR-092)
analyticsRouter.get('/flight-risk', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const forecast = await analyticsService.getFlightRiskForecast(req.tenantId!);
    res.json({ success: true, data: forecast });
  } catch (error) {
    console.error('Flight risk forecast error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch flight risk forecast' });
  }
});

// GET /api/v1/analytics/custom-kpis - List custom executive KPIs (PRD §26 FR-093)
analyticsRouter.get('/custom-kpis', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const kpis = analyticsService.getCustomKpis(req.tenantId!);
    res.json({ success: true, data: kpis });
  } catch (error) {
    console.error('Fetch custom KPIs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch custom KPIs' });
  }
});

// POST /api/v1/analytics/custom-kpis - Create custom KPI formula (PRD §26 FR-093)
analyticsRouter.post('/custom-kpis', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, category, formulaDescription, weights, targetValue, currentValue, unit } = req.body;
    if (!name || !category) {
      res.status(400).json({ success: false, error: 'Name and category are required' });
      return;
    }

    const created = analyticsService.createCustomKpi(req.tenantId!, req.user!.id, {
      name,
      category,
      formulaDescription: formulaDescription || 'Custom Weighted KPI',
      weights: weights || { throughput: 0.25, speed: 0.25, quality: 0.25, discipline: 0.25 },
      targetValue: targetValue || 100,
      currentValue: currentValue || 85,
      unit: unit || 'pts',
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'CUSTOM_KPI_CREATED',
      resourceType: 'custom_kpi',
      resourceId: created.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { kpiName: name, category },
    });

    res.json({ success: true, data: created });
  } catch (error) {
    console.error('Create custom KPI error:', error);
    res.status(500).json({ success: false, error: 'Failed to create custom KPI' });
  }
});

// GET /api/v1/analytics/export/csv - RFC4180 CSV Executive Telemetry Export
analyticsRouter.get('/export/csv', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const csvContent = await analyticsService.exportExecutiveCsv(req.tenantId!);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="prism_executive_analytics_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export analytics CSV error:', error);
    res.status(500).json({ success: false, error: 'Failed to export executive CSV' });
  }
});
