import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { complianceService } from '../../services/complianceService';

export const complianceRouter = Router();

// GET /api/v1/compliance/soc2 - Full SOC2 Type II Trust Criteria Audit (PRD §27, §28, §29)
complianceRouter.get('/soc2', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const audit = await complianceService.auditSoc2Compliance(req.tenantId!);
    res.json({ success: true, data: audit });
  } catch (error) {
    console.error('SOC2 audit error:', error);
    res.status(500).json({ success: false, error: 'Failed to execute SOC2 compliance audit' });
  }
});

// GET /api/v1/compliance/dr - Disaster Recovery & Multi-AZ Replication Audit (PRD §30)
complianceRouter.get('/dr', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const dr = await complianceService.auditDisasterRecovery(req.tenantId!);
    res.json({ success: true, data: dr });
  } catch (error) {
    console.error('Disaster recovery audit error:', error);
    res.status(500).json({ success: false, error: 'Failed to execute disaster recovery audit' });
  }
});

// GET /api/v1/compliance/benchmark - Performance & Load Benchmark (PRD §31)
complianceRouter.get('/benchmark', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const benchmark = await complianceService.benchmarkPerformance(req.tenantId!);
    res.json({ success: true, data: benchmark });
  } catch (error) {
    console.error('Benchmark error:', error);
    res.status(500).json({ success: false, error: 'Failed to execute performance benchmark' });
  }
});

// GET /api/v1/compliance/readiness - Complete Platform Launch Certification & Readiness Report (PRD §27–§31)
complianceRouter.get('/readiness', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const readiness = await complianceService.getLaunchReadiness(req.tenantId!);
    res.json({ success: true, data: readiness });
  } catch (error) {
    console.error('Launch readiness error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate launch readiness report' });
  }
});
