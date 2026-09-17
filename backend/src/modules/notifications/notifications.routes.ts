import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { notificationService } from '../../services/notificationService';

export const notificationsRouter = Router();

// GET /api/v1/notifications
notificationsRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userNotifs = await prisma.notification.findMany({
      where: {
        tenantId: req.tenantId!,
        OR: [
          { userId: req.user?.id },
          { userId: 'all' },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = userNotifs.filter((n) => !n.read).length;

    res.json({
      success: true,
      data: {
        unreadCount,
        total: userNotifs.length,
        notifications: userNotifs,
      },
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// POST /api/v1/notifications/:id/read
notificationsRouter.post('/:id/read', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const notif = await prisma.notification.findFirst({
      where: {
        id: req.params.id as string,
        tenantId: req.tenantId!,
      },
    });

    if (!notif) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id: notif.id },
      data: { read: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

// POST /api/v1/notifications/read-all
notificationsRouter.post('/read-all', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        tenantId: req.tenantId!,
        userId: req.user?.id,
        read: false,
      },
      data: { read: true },
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notifications read' });
  }
});

// POST /api/v1/notifications/dispatch (Multi-channel fallback dispatcher)
notificationsRouter.post('/dispatch', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, message, type, preferredChannel, targetUserId, severity } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, error: 'Title and message are required' });
      return;
    }

    const recipientId = targetUserId || req.user?.id || 'all';

    const dispatchResult = await notificationService.dispatchWithFallback({
      tenantId: req.tenantId!,
      recipientId,
      recipientName: req.user?.firstName || 'Team Member',
      recipientEmail: req.user?.email,
      title,
      message,
      eventType: type || 'TASK_ASSIGNED',
      preferredChannel: preferredChannel || 'WHATSAPP',
      severity: severity || 'medium',
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'NOTIFICATION_DISPATCHED',
      resourceType: 'notification',
      resourceId: dispatchResult.notificationId,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { title, channel: dispatchResult.deliveredChannel, fallbackUsed: dispatchResult.fallbackUsed },
    });

    res.status(201).json({
      success: true,
      data: dispatchResult,
    });
  } catch (error) {
    console.error('Dispatch notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to dispatch notification' });
  }
});

// ============================================================================
// ALERT LIFECYCLE (PRD §25)
// ============================================================================

// GET /api/v1/notifications/alerts
notificationsRouter.get('/alerts', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const alerts = notificationService.getAlerts(req.tenantId!);
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Fetch alerts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch operational alerts' });
  }
});

// POST /api/v1/notifications/alerts/trigger
notificationsRouter.post('/alerts/trigger', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, severity, source } = req.body;
    if (!title || !description) {
      res.status(400).json({ success: false, error: 'title and description are required' });
      return;
    }

    const newAlert = notificationService.createAlert(req.tenantId!, title, description, severity || 'high', source || 'UserTriggered');
    res.status(201).json({ success: true, data: newAlert });
  } catch (error) {
    console.error('Trigger alert error:', error);
    res.status(500).json({ success: false, error: 'Failed to trigger operational alert' });
  }
});

// PATCH /api/v1/notifications/alerts/:id/transition
notificationsRouter.patch('/alerts/:id/transition', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { targetStage } = req.body;

    if (!targetStage) {
      res.status(400).json({ success: false, error: 'targetStage is required' });
      return;
    }

    const updatedAlert = notificationService.transitionAlert(req.tenantId!, id as string, targetStage, req.user?.id);

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'ALERT_LIFECYCLE_TRANSITIONED',
      resourceType: 'operational_alert',
      resourceId: id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { targetStage, severity: updatedAlert.severity },
    });

    res.json({ success: true, data: updatedAlert });
  } catch (error: any) {
    console.error('Transition alert error:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to transition alert stage' });
  }
});
