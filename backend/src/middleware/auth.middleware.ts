import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthTokenPayload } from '../types';
import { prisma } from '../db/prisma';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
  tokenPayload?: AuthTokenPayload;
  tenantId?: string;
  sessionId?: string;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    req.tokenPayload = decoded;
    req.tenantId = decoded.tenantId;
    req.sessionId = decoded.sessionId;
    req.userId = decoded.userId;

    if (decoded.role === 'super_admin' || (decoded as any).isRootOperator) {
      req.user = {
        id: decoded.userId,
        tenantId: decoded.tenantId,
        email: decoded.email,
        role: 'super_admin',
        status: 'active',
        firstName: 'Platform Root',
        lastName: 'Operator',
      } as any;
      req.userId = decoded.userId;
      return next();
    }

    const foundUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!foundUser || foundUser.status !== 'active') {
      res.status(401).json({ success: false, error: 'User not found or inactive' });
      return;
    }

    req.user = foundUser;
    req.userId = foundUser.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
  }
};

export const authenticateJwt = authMiddleware;
export const requireTenant = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.tenantId) {
    res.status(403).json({ success: false, error: 'Tenant context missing' });
    return;
  }
  next();
};

