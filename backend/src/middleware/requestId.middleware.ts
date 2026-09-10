import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pinoHttp from 'pino-http';
import { logger } from '../utils/logger';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const reqId = (req.headers['x-request-id'] as string) || uuidv4();
  (req as any).id = reqId;
  res.setHeader('x-request-id', reqId);
  next();
};

export const httpLoggerMiddleware = pinoHttp({
  logger,
  genReqId: (req: any) => req.id || (req.headers['x-request-id'] as string) || uuidv4(),
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/health/ready',
  },
});
