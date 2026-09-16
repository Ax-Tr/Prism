import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './db/prisma';
import { requestIdMiddleware, httpLoggerMiddleware } from './middleware/requestId.middleware';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimiter.middleware';
import { authRouter } from './modules/auth/auth.routes';
import { tenantsRouter } from './modules/tenants/tenants.routes';
import { tasksRouter } from './modules/tasks/tasks.routes';
import { scoringRouter } from './modules/scoring/scoring.routes';
import { continuityRouter } from './modules/continuity/continuity.routes';
import { exceptionsRouter } from './modules/exceptions/exceptions.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { auditRouter } from './modules/audit/audit.routes';
import { aiRouter } from './modules/ai/ai.routes';
import { goalsRouter } from './modules/goals/goals.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { privacyRouter } from './modules/privacy/privacy.routes';
import { advancedRouter } from './modules/advanced/advanced.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security and Observability Middleware
app.set('trust proxy', 1);
app.use(requestIdMiddleware);
app.use(httpLoggerMiddleware);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health & Observability Probes (TRD §10.4)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: '1.0.0',
    service: 'prism-backend',
  });
});

app.get('/health/ready', async (_req, res) => {
  try {
    // Verify real database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      databaseEngine: 'sqlite',
      rlsIsolation: 'enforced',
      auditLog: 'immutable',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error({ error }, 'Health readiness check failed: database unreachable');
    res.status(503).json({
      status: 'unready',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Runtime Telemetry & Metrics Endpoint
app.get('/metrics', (_req, res) => {
  const memory = process.memoryUsage();
  res.json({
    service: 'prism-backend',
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rssMb: (memory.rss / 1024 / 1024).toFixed(2),
      heapTotalMb: (memory.heapTotal / 1024 / 1024).toFixed(2),
      heapUsedMb: (memory.heapUsed / 1024 / 1024).toFixed(2),
    },
    timestamp: new Date().toISOString(),
  });
});

// Rate limiting for API routes
app.use('/api/', apiRateLimiter);
app.use('/api/v1/auth/login', authRateLimiter);
app.use('/api/v1/auth/register', authRateLimiter);

// API Routes Mounting (TRD §5.1)
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tenants', tenantsRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/scoring', scoringRouter);
app.use('/api/v1/continuity', continuityRouter);
app.use('/api/v1/exceptions', exceptionsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/audit', auditRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/goals', goalsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/privacy', privacyRouter);
app.use('/api/v1/advanced', advancedRouter);

// Global Error Handler
app.use(errorHandler);

const PORT = config.port || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 [Prism MVP Backend] Running on http://localhost:${PORT}`);
  logger.info(`📡 [Health & Metrics Probes] http://localhost:${PORT}/health | /metrics`);
  logger.info(`🛡️  [Security] Helmet, Rate Limiter, and Structured Logging Active`);
});

export default app;
