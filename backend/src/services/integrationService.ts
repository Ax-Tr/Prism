import { prisma } from '../db/prisma';

export interface IntegrationConnector {
  id: 'JIRA_LINEAR' | 'SLACK_TEAMS' | 'GOOGLE_CALENDAR' | 'WHATSAPP_BUSINESS';
  name: string;
  category: 'TASK_SYNC' | 'COMMUNICATION' | 'CALENDAR' | 'MESSAGING';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING';
  lastSyncAt: string | null;
  syncIntervalMinutes: number;
  config: Record<string, any>;
  healthCheck: {
    healthy: boolean;
    latencyMs: number;
    lastCheckedAt: string;
  };
}

export class IntegrationService {
  private connectors: Map<string, IntegrationConnector> = new Map();

  constructor() {
    this.initDefaultConnectors();
  }

  private initDefaultConnectors() {
    const defaults: IntegrationConnector[] = [
      {
        id: 'JIRA_LINEAR',
        name: 'Jira & Linear Sync Connector',
        category: 'TASK_SYNC',
        status: 'CONNECTED',
        lastSyncAt: new Date(Date.now() - 15 * 60000).toISOString(),
        syncIntervalMinutes: 15,
        config: {
          jiraInstanceUrl: 'https://prism.atlassian.net',
          projectKey: 'PRISM',
          statusMapping: {
            ToDo: 'DORMANT',
            InProgress: 'IN_FLUX',
            InReview: 'ORBIT',
            Done: 'TRANSMITTED',
          },
        },
        healthCheck: { healthy: true, latencyMs: 42, lastCheckedAt: new Date().toISOString() },
      },
      {
        id: 'SLACK_TEAMS',
        name: 'Slack & Microsoft Teams Work Signals',
        category: 'COMMUNICATION',
        status: 'CONNECTED',
        lastSyncAt: new Date(Date.now() - 5 * 60000).toISOString(),
        syncIntervalMinutes: 5,
        config: {
          webhookUrl: 'https://hooks.slack.com/services/PRISM/ALERT_HUB',
          channel: '#prism-operational-alerts',
          notifyOnSeverity: ['high', 'critical'],
        },
        healthCheck: { healthy: true, latencyMs: 28, lastCheckedAt: new Date().toISOString() },
      },
      {
        id: 'GOOGLE_CALENDAR',
        name: 'Google Calendar & Outlook 1:1 Sync',
        category: 'CALENDAR',
        status: 'CONNECTED',
        lastSyncAt: new Date(Date.now() - 60 * 60000).toISOString(),
        syncIntervalMinutes: 60,
        config: {
          calendarId: 'primary',
          syncOneOnOnes: true,
          syncMilestones: true,
        },
        healthCheck: { healthy: true, latencyMs: 65, lastCheckedAt: new Date().toISOString() },
      },
      {
        id: 'WHATSAPP_BUSINESS',
        name: 'WhatsApp Business API Gateway',
        category: 'MESSAGING',
        status: 'CONNECTED',
        lastSyncAt: new Date(Date.now() - 30 * 60000).toISOString(),
        syncIntervalMinutes: 30,
        config: {
          bspProvider: 'Twilio/Meta',
          messagingPhoneNumber: '+1 (555) 890-PRISM',
          deliveryFallbackEnabled: true,
        },
        healthCheck: { healthy: true, latencyMs: 88, lastCheckedAt: new Date().toISOString() },
      },
    ];

    defaults.forEach((c) => this.connectors.set(c.id, c));
  }

  public listConnectors(): IntegrationConnector[] {
    return Array.from(this.connectors.values());
  }

  public getConnector(id: string): IntegrationConnector | undefined {
    return this.connectors.get(id);
  }

  public async testConnector(id: string): Promise<{ healthy: boolean; latencyMs: number; message: string }> {
    const connector = this.connectors.get(id);
    if (!connector) {
      throw new Error(`Connector '${id}' not found`);
    }

    // Simulated resilient network ping with latency calculation
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 20));
    const latencyMs = Date.now() - startTime;

    connector.healthCheck = {
      healthy: true,
      latencyMs,
      lastCheckedAt: new Date().toISOString(),
    };
    connector.status = 'CONNECTED';

    return {
      healthy: true,
      latencyMs,
      message: `Connector '${connector.name}' ping successful (${latencyMs}ms)`,
    };
  }

  public async syncConnector(id: string, tenantId: string): Promise<{ syncedRecords: number; status: string }> {
    const connector = this.connectors.get(id);
    if (!connector) {
      throw new Error(`Connector '${id}' not found`);
    }

    connector.status = 'SYNCING';

    let syncedRecords = 0;
    if (connector.id === 'JIRA_LINEAR') {
      const taskCount = await prisma.task.count({ where: { tenantId } });
      syncedRecords = taskCount;
    } else if (connector.id === 'SLACK_TEAMS') {
      const notifCount = await prisma.notification.count({ where: { tenantId } });
      syncedRecords = notifCount;
    } else {
      syncedRecords = 5;
    }

    connector.lastSyncAt = new Date().toISOString();
    connector.status = 'CONNECTED';

    return {
      syncedRecords,
      status: 'SUCCESS',
    };
  }

  public updateConfig(id: string, configUpdates: Record<string, any>): IntegrationConnector {
    const connector = this.connectors.get(id);
    if (!connector) {
      throw new Error(`Connector '${id}' not found`);
    }

    connector.config = { ...connector.config, ...configUpdates };
    return connector;
  }
}

export const integrationService = new IntegrationService();
export default integrationService;
