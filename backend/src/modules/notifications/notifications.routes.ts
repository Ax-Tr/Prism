import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';

export interface NotificationItem {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'PROOF_SUBMITTED' | 'PROOF_REVIEWED' | 'EXCEPTION_ESCALATED' | 'LEAVE_STATUS' | 'SCORING_UPDATE';
  channel: 'IN_APP' | 'WHATSAPP' | 'EMAIL';
  deliveryStatus: 'DELIVERED' | 'FALLBACK_EMAIL' | 'FALLBACK_IN_APP';
  read: boolean;
  resourceId?: string;
  createdAt: string;
}

const notificationsStore: NotificationItem[] = [
  {
    id: 'notif-001',
    tenantId: 'a0000000-0000-0000-0000-000000000001',
    userId: 'u0000000-0000-0000-0000-000000000001',
    title: 'Task Proof Awaiting Review',
    message: 'Sarah Kim submitted proof for "Build Append-Only Audit Logging Middleware".',
    type: 'PROOF_SUBMITTED',
    channel: 'IN_APP',
    deliveryStatus: 'DELIVERED',
    read: false,
    resourceId: 't0000000-0000-0000-0000-000000000002',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-002',
    tenantId: 'a0000000-0000-0000-0000-000000000001',
    userId: 'u0000000-0000-0000-0000-000000000006',
    title: 'Continuity Delegate Activated',
    message: 'You have been assigned temporary signing authority for Operations during Marcus Chen’s leave.',
    type: 'LEAVE_STATUS',
    channel: 'WHATSAPP',
    deliveryStatus: 'DELIVERED',
    read: true,
    resourceId: 'lv-001',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'notif-003',
    tenantId: 'a0000000-0000-0000-0000-000000000001',
    userId: 'u0000000-0000-0000-0000-000000000001',
    title: 'Daily Performance Scores Computed',
    message: 'All departments synchronized with 94.2% average tenant health score.',
    type: 'SCORING_UPDATE',
    channel: 'EMAIL',
    deliveryStatus: 'DELIVERED',
    read: true,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

export const notificationsRouter = Router();

// GET /api/v1/notifications
notificationsRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userNotifs = notificationsStore.filter((n) => n.tenantId === req.tenantId);
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  res.json({
    success: true,
    data: {
      unreadCount,
      total: userNotifs.length,
      notifications: userNotifs,
    },
  });
});

// POST /api/v1/notifications/:id/read
notificationsRouter.post('/:id/read', authMiddleware, (req: AuthenticatedRequest, res) => {
  const notif = notificationsStore.find((n) => n.id === req.params.id);
  if (!notif) {
    res.status(404).json({ success: false, error: 'Notification not found' });
    return;
  }

  notif.read = true;
  res.json({ success: true, data: notif });
});

// POST /api/v1/notifications/dispatch (Internal multi-channel dispatcher)
notificationsRouter.post('/dispatch', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, message, type, preferredChannel } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, error: 'Title and message are required' });
      return;
    }

    const channel = preferredChannel || 'IN_APP';
    const deliveryStatus = 'DELIVERED';

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${uuidv4().substring(0, 4)}`,
      tenantId: req.tenantId!,
      userId: req.user?.id || 'all',
      title,
      message,
      type: type || 'TASK_ASSIGNED',
      channel,
      deliveryStatus,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notificationsStore.unshift(newNotif);

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'NOTIFICATION_DISPATCHED',
      resourceType: 'notification',
      resourceId: newNotif.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { title, channel, deliveryStatus },
    });

    res.status(201).json({ success: true, data: newNotif });
  } catch (error) {
    console.error('Dispatch notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to dispatch notification' });
  }
});
