import { logger } from '../utils/logger';
import { prisma } from '../db/prisma';

export interface NotificationPayload {
  tenantId: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName: string;
  title: string;
  message: string;
  eventType: 'TASK_ASSIGNED' | 'PROOF_SUBMITTED' | 'DISPUTE_FILED' | 'EXCEPTION_ESCALATED' | 'CONTINUITY_DELEGATED' | 'ALERT_TRIGGERED';
  preferredChannel?: 'IN_APP' | 'EMAIL' | 'WHATSAPP';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface UserNotificationPreferences {
  inApp: boolean;
  email: boolean;
  whatsApp: boolean;
  minSeverityForExternal: 'low' | 'medium' | 'high' | 'critical';
}

export interface OperationalAlert {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stage: 'DETECTED' | 'TRIAGED' | 'ACKNOWLEDGED' | 'ACTIONED' | 'RESOLVED' | 'VALIDATED';
  assignedTo?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  escalationDueAt: string;
  createdAt: string;
  updatedAt: string;
}

export const VALID_ALERT_TRANSITIONS: Record<string, string[]> = {
  DETECTED: ['TRIAGED', 'ACKNOWLEDGED'],
  TRIAGED: ['ACKNOWLEDGED', 'ACTIONED'],
  ACKNOWLEDGED: ['ACTIONED', 'RESOLVED'],
  ACTIONED: ['RESOLVED'],
  RESOLVED: ['VALIDATED'],
  VALIDATED: [],
};

export class NotificationService {
  private memoryAlerts: Map<string, OperationalAlert> = new Map();

  /**
   * Masks sensitive PII for external dispatch (PRD §20)
   */
  private sanitizeExternalMessage(message: string): string {
    return message
      .replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '[MASKED_EMAIL]')
      .replace(/\+?[0-9]{10,14}/g, '[MASKED_PHONE]');
  }

  /**
   * Multi-channel delivery with automatic fallback chain (WhatsApp -> Email -> In-App)
   */
  public async dispatchWithFallback(payload: NotificationPayload): Promise<{
    deliveredChannel: 'WHATSAPP' | 'EMAIL' | 'IN_APP';
    success: boolean;
    notificationId: string;
    fallbackUsed: boolean;
  }> {
    const preferred = payload.preferredChannel || 'WHATSAPP';
    let deliveredChannel: 'WHATSAPP' | 'EMAIL' | 'IN_APP' = 'IN_APP';
    let fallbackUsed = false;

    const sanitizedText = this.sanitizeExternalMessage(payload.message);

    // 1. Try WhatsApp if preferred and phone is available
    if (preferred === 'WHATSAPP' && payload.recipientPhone) {
      try {
        // Simulated WhatsApp delivery
        logger.info({ recipient: payload.recipientPhone, event: payload.eventType }, `[WhatsApp API] Message dispatched: ${sanitizedText}`);
        deliveredChannel = 'WHATSAPP';
      } catch (err) {
        logger.warn('WhatsApp delivery failed, falling back to Email');
        fallbackUsed = true;
      }
    }

    // 2. Try Email fallback if WhatsApp was skipped or failed
    if (deliveredChannel === 'IN_APP' && preferred !== 'IN_APP' && payload.recipientEmail) {
      try {
        logger.info({ recipient: payload.recipientEmail, event: payload.eventType }, `[Email API] Message dispatched: ${sanitizedText}`);
        deliveredChannel = 'EMAIL';
      } catch (err) {
        logger.warn('Email delivery failed, falling back to In-App notification');
        fallbackUsed = true;
      }
    }

    // 3. Guarantee persistent In-App delivery in database
    const savedNotification = await prisma.notification.create({
      data: {
        tenantId: payload.tenantId,
        userId: payload.recipientId,
        title: payload.title,
        message: payload.message,
        type: payload.eventType,
        channel: deliveredChannel,
        deliveryStatus: 'DELIVERED',
        read: false,
      },
    });

    return {
      deliveredChannel,
      success: true,
      notificationId: savedNotification.id,
      fallbackUsed,
    };
  }

  /**
   * Alert Lifecycle State Machine (PRD §25)
   */
  public createAlert(
    tenantId: string,
    title: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    source = 'ScoringEngine'
  ): OperationalAlert {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const escalationHours = severity === 'critical' ? 2 : severity === 'high' ? 8 : 24;

    const alert: OperationalAlert = {
      id,
      tenantId,
      title,
      description,
      source,
      severity,
      stage: 'DETECTED',
      escalationDueAt: new Date(now.getTime() + escalationHours * 3600000).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.memoryAlerts.set(id, alert);
    return alert;
  }

  public getAlerts(tenantId: string): OperationalAlert[] {
    const list = Array.from(this.memoryAlerts.values()).filter((a) => a.tenantId === tenantId);
    if (list.length === 0) {
      // Seed default alert for test/demo
      const defaultAlert = this.createAlert(
        tenantId,
        'Critical Path Task Dependency Delayed',
        'Database multi-region replica deployment task is currently blocked by pending security audit proof.',
        'high',
        'OrbitWorkEngine'
      );
      return [defaultAlert];
    }
    return list;
  }

  public transitionAlert(
    tenantId: string,
    alertId: string,
    targetStage: 'DETECTED' | 'TRIAGED' | 'ACKNOWLEDGED' | 'ACTIONED' | 'RESOLVED' | 'VALIDATED',
    actorId?: string
  ): OperationalAlert {
    const alert = this.memoryAlerts.get(alertId);
    if (!alert || alert.tenantId !== tenantId) {
      throw new Error(`Alert '${alertId}' not found`);
    }

    const allowed = VALID_ALERT_TRANSITIONS[alert.stage] || [];
    if (!allowed.includes(targetStage)) {
      throw new Error(`Invalid alert transition from '${alert.stage}' to '${targetStage}'. Allowed: [${allowed.join(', ')}]`);
    }

    alert.stage = targetStage;
    alert.updatedAt = new Date().toISOString();

    if (targetStage === 'ACKNOWLEDGED' && actorId) {
      alert.acknowledgedBy = actorId;
    } else if (targetStage === 'RESOLVED' && actorId) {
      alert.resolvedBy = actorId;
    }

    return alert;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
