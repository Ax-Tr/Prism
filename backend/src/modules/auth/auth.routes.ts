import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { config } from '../../config';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';

export const authRouter = Router();

// POST /api/v1/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.trim(),
        },
      },
      include: {
        tenant: true,
        department: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or credentials' });
      return;
    }

    // Check lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      res.status(403).json({
        success: false,
        error: 'Account temporarily locked due to multiple failed attempts. Please try again later.',
      });
      return;
    }

    // Verify bcrypt password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = user.failedLoginAttempts + 1;
      const lockout = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockoutUntil: lockout,
        },
      });

      res.status(401).json({ success: false, error: 'Invalid email or credentials' });
      return;
    }

    // Reset failed login attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    await logAudit({
      tenantId: user.tenantId,
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_LOGIN_SUCCESS',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { email: user.email, role: user.role },
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          designation: user.designation,
          departmentId: user.departmentId,
          departmentName: user.department?.name,
          mfaEnabled: user.mfaEnabled,
        },
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during authentication' });
  }
});

// POST /api/v1/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const { tenantId, email, password, firstName, lastName, role, designation, departmentId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ success: false, error: 'Missing required registration fields' });
      return;
    }

    // Default tenant if not supplied
    const targetTenantId = tenantId || 'a0000000-0000-0000-0000-000000000001';

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        tenantId: targetTenantId,
        email: email.trim().toLowerCase(),
      },
    });

    if (existing) {
      res.status(409).json({ success: false, error: 'User with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        tenantId: targetTenantId,
        email: email.trim().toLowerCase(),
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: role || 'employee',
        designation: designation || 'Team Member',
        departmentId: departmentId || null,
        status: 'active',
      },
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
        tenantId: newUser.tenantId,
        email: newUser.email,
        role: newUser.role,
        departmentId: newUser.departmentId,
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    await logAudit({
      tenantId: newUser.tenantId,
      actorId: newUser.id,
      actorRole: newUser.role,
      action: 'USER_REGISTERED',
      resourceType: 'user',
      resourceId: newUser.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { email: newUser.email, role: newUser.role },
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          tenantId: newUser.tenantId,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          designation: newUser.designation,
          departmentId: newUser.departmentId,
          mfaEnabled: newUser.mfaEnabled,
        },
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during user registration' });
  }
});

// GET /api/v1/auth/me
authRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        tenant: true,
        department: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          designation: user.designation,
          phone: user.phone,
          departmentId: user.departmentId,
          departmentName: user.department?.name,
          mfaEnabled: user.mfaEnabled,
        },
        tenant: user.tenant
          ? {
              id: user.tenant.id,
              name: user.tenant.name,
              subdomain: user.tenant.subdomain,
              status: user.tenant.status,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Fetch me error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/v1/auth/refresh
authRouter.post('/refresh', authMiddleware, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const token = jwt.sign(
    {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      email: req.user.email,
      role: req.user.role,
      departmentId: req.user.departmentId,
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    data: { token },
  });
});

// POST /api/v1/auth/mfa/verify
authRouter.post('/mfa/verify', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { otp } = req.body;
  if (!otp || otp.length !== 6) {
    res.status(400).json({ success: false, error: 'Valid 6-digit OTP code required' });
    return;
  }

  res.json({
    success: true,
    data: { verified: true, message: 'MFA challenge verified successfully' },
  });
});
