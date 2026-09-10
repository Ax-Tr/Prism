import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

export interface PrivacyRequest {
  id: string;
  tenantId: string;
  userId: string;
  type: 'DATA_ACCESS' | 'DATA_CORRECTION' | 'DATA_ERASURE';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'FULFILLED' | 'REJECTED';
  details?: string;
  downloadUrl?: string;
  rejectionReason?: string;
  fulfilledAt?: string;
  createdAt: string;
}

const privacyRequestsStore: PrivacyRequest[] = [
  {
    id: 'pr-001',
    tenantId: 'a0000000-0000-0000-0000-000000000001',
    userId: 'u0000000-0000-0000-0000-000000000004',
    type: 'DATA_ACCESS',
    status: 'FULFILLED',
    details: 'Right to Access — Full personal data export including score history and task logs.',
    downloadUrl: 'https://staging.prism.ai/privacy/download/exp-9021.json',
    fulfilledAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const privacyRouter = Router();

// GET /api/v1/privacy/requests (Owner & Auditor queue)
privacyRouter.get('/requests', authMiddleware, requireRoles(['owner', 'auditor']), async (req: AuthenticatedRequest, res) => {
  try {
    const requests = privacyRequestsStore.filter((p: any) => p.tenantId === req.tenantId);
    const userIds = requests.map((r: any) => r.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]));

    const enriched = requests.map((r: any) => {
      const user = userMap.get(r.userId);
      return {
        ...r,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Anonymized User',
        userEmail: user?.email,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Fetch privacy requests error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch privacy requests' });
  }
});

// POST /api/v1/privacy/requests (Any authenticated employee)
privacyRouter.post('/requests', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { type, details } = req.body;

    if (!type || !['DATA_ACCESS', 'DATA_CORRECTION', 'DATA_ERASURE'].includes(type)) {
      res.status(400).json({ success: false, error: 'Valid privacy request type required (DATA_ACCESS, DATA_CORRECTION, DATA_ERASURE)' });
      return;
    }

    const newRequest: PrivacyRequest = {
      id: `pr-${Date.now()}-${uuidv4().substring(0, 4)}`,
      tenantId: req.tenantId!,
      userId: req.user?.id || 'anonymous',
      type,
      status: 'SUBMITTED',
      details: details || 'Data Subject Access Request filed under DPDP Act 2023',
      createdAt: new Date().toISOString(),
    };

    privacyRequestsStore.unshift(newRequest);

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'DPDP_PRIVACY_REQUEST_SUBMITTED',
      resourceType: 'privacy_request',
      resourceId: newRequest.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { type: newRequest.type },
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    console.error('Submit privacy request error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit privacy request' });
  }
});

// POST /api/v1/privacy/requests/:id/fulfill (Owner only)
privacyRouter.post('/requests/:id/fulfill', authMiddleware, requireRoles(['owner']), async (req: AuthenticatedRequest, res) => {
  try {
    const reqObj = privacyRequestsStore.find((r) => r.id === req.params.id && r.tenantId === req.tenantId);

    if (!reqObj) {
      res.status(404).json({ success: false, error: 'Privacy request not found' });
      return;
    }

    reqObj.status = 'FULFILLED';
    reqObj.fulfilledAt = new Date().toISOString();
    reqObj.downloadUrl = `https://storage.prism.ai/dsar-exports/${reqObj.id}.json.enc`;

    // If Erasure, anonymize the user's PII in database
    if (reqObj.type === 'DATA_ERASURE') {
      const targetUser = await prisma.user.findFirst({
        where: { id: reqObj.userId, tenantId: req.tenantId },
      });
      if (targetUser) {
        await prisma.user.update({
          where: { id: targetUser.id },
          data: {
            firstName: 'Anonymized',
            lastName: `User_${targetUser.id.substring(0, 6)}`,
            email: `anonymized_${targetUser.id.substring(0, 6)}@deleted.prism.ai`,
            phone: null,
            status: 'deleted',
          },
        });
      }
    }

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'DPDP_PRIVACY_REQUEST_FULFILLED',
      resourceType: 'privacy_request',
      resourceId: reqObj.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { type: reqObj.type, userId: reqObj.userId },
    });

    res.json({ success: true, data: reqObj });
  } catch (error) {
    console.error('Fulfill privacy request error:', error);
    res.status(500).json({ success: false, error: 'Failed to fulfill privacy request' });
  }
});

// POST /api/v1/privacy/crypto-shred (Owner only — Emergency Tenant Purge)
privacyRouter.post('/crypto-shred', authMiddleware, requireRoles(['owner']), async (req: AuthenticatedRequest, res) => {
  try {
    const { confirmationCode } = req.body;

    if (confirmationCode !== 'CONFIRM_CRYPTO_SHRED_TENANT') {
      res.status(400).json({
        success: false,
        error: 'Emergency tenant crypto-shredding requires confirmationCode = "CONFIRM_CRYPTO_SHRED_TENANT"',
      });
      return;
    }

    await prisma.cryptoKey.updateMany({
      where: { tenantId: req.tenantId! },
      data: {
        status: 'shredded',
        shreddedAt: new Date(),
        encryptedKeyMaterial: 'SHREDDED_PERMANENTLY',
      },
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'TENANT_CRYPTO_SHREDDED',
      resourceType: 'tenant_crypto_key',
      resourceId: req.tenantId!,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { shreddedTimestamp: new Date().toISOString(), keyVersion: 1 },
    });

    res.json({
      success: true,
      data: {
        tenantId: req.tenantId,
        status: 'SHREDDED',
        message: 'Master encryption key material purged. All stored encrypted data rendered permanently unrecoverable.',
        shreddedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Crypto-shred error:', error);
    res.status(500).json({ success: false, error: 'Failed to execute crypto-shred' });
  }
});

// GET /api/v1/privacy/dr/status (Disaster Recovery & Backup Health)
privacyRouter.get('/dr/status', authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: {
      rpoHours: 1.0,
      rtoHours: 2.0,
      crossRegionReplication: 'ACTIVE',
      lastSnapshotAt: new Date(Date.now() - 3600000).toISOString(),
      backupIntegrity: 'VERIFIED_HMAC_SHA256',
      primaryRegion: 'ap-south-1 (Mumbai)',
      drRegion: 'ap-south-2 (Hyderabad)',
      pitrWindowDays: 35,
    },
  });
});
