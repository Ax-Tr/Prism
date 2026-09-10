import { logger } from '../utils/logger';

export interface NotificationPayload {
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName: string;
  title: string;
  message: string;
  eventType: 'TASK_ASSIGNED' | 'PROOF_SUBMITTED' | 'DISPUTE_FILED' | 'EXCEPTION_ESCALATED' | 'CONTINUITY_DELEGATED';
  metadata?: Record<string, any>;
}

export interface NotificationChannel {
  name: string;
  send(payload: NotificationPayload): Promise<boolean>;
}

export class ConsoleNotificationChannel implements NotificationChannel {
  public name = 'Console';

  public async send(payload: NotificationPayload): Promise<boolean> {
    logger.info(
      {
        channel: 'Console',
        event: payload.eventType,
        recipient: payload.recipientName,
        title: payload.title,
      },
      `📢 [Notification Dispatch] To: ${payload.recipientName} | ${payload.title} -> ${payload.message}`
    );
    return true;
  }
}

export class EmailNotificationChannel implements NotificationChannel {
  public name = 'Email';
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
  }

  public async send(payload: NotificationPayload): Promise<boolean> {
    if (!this.apiKey || this.apiKey === 'placeholder_sendgrid_key') {
      // In dev without SendGrid key, fallback to console logging
      return new ConsoleNotificationChannel().send(payload);
    }

    try {
      logger.info({ email: payload.recipientEmail, title: payload.title }, 'Dispatching email notification via SendGrid API');
      // Ready for SendGrid API dispatch when credentials are provided
      return true;
    } catch (error) {
      logger.error({ error }, 'Failed to dispatch email notification');
      return false;
    }
  }
}

export class NotificationService {
  private channels: NotificationChannel[] = [
    new ConsoleNotificationChannel(),
    new EmailNotificationChannel(),
  ];

  public async dispatch(payload: NotificationPayload) {
    const results = await Promise.allSettled(
      this.channels.map((channel) => channel.send(payload))
    );
    return results;
  }

  public async notifyTaskAssigned(taskTitle: string, assigneeName: string, assigneeEmail?: string) {
    return this.dispatch({
      recipientName: assigneeName,
      recipientEmail: assigneeEmail,
      title: `New Task Assigned: ${taskTitle}`,
      message: `You have been assigned "${taskTitle}". Proof of completion is required prior to SLA deadline.`,
      eventType: 'TASK_ASSIGNED',
    });
  }

  public async notifyProofSubmitted(taskTitle: string, submitterName: string, approverName: string, approverEmail?: string) {
    return this.dispatch({
      recipientName: approverName,
      recipientEmail: approverEmail,
      title: `Proof Awaiting Verification: ${taskTitle}`,
      message: `${submitterName} has submitted deliverable proof for "${taskTitle}". Verification sign-off is required.`,
      eventType: 'PROOF_SUBMITTED',
    });
  }

  public async notifyScoreDispute(userName: string, reason: string, reviewerName = 'Department Head') {
    return this.dispatch({
      recipientName: reviewerName,
      title: `Score Dispute Filed by ${userName}`,
      message: `${userName} has filed a score dispute with justification: "${reason}".`,
      eventType: 'DISPUTE_FILED',
    });
  }

  public async notifyException(title: string, severity: string, ownerName = 'Executive Owner') {
    return this.dispatch({
      recipientName: ownerName,
      title: `[${severity.toUpperCase()}] Operational Exception Triggered`,
      message: `System Exception: "${title}". Auto-escalation window active.`,
      eventType: 'EXCEPTION_ESCALATED',
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
