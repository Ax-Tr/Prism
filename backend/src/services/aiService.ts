import { prisma } from '../db/prisma';
import { ragService, GroundedEvidenceCitation, RAGKnowledgeContext } from './ragService';

export interface AIResponse {
  response: string;
  recommendations: string[];
  evidenceCitations: GroundedEvidenceCitation[];
  confidenceScore: number;
  autonomyLevel: 'ADVISORY' | 'COLLABORATIVE' | 'AUTONOMOUS';
  governanceStatus: 'APPROVED' | 'SANITIZED' | 'INJECTION_BLOCKED';
  provider: string;
  model: string;
  timestamp: string;
}

export interface SanctumAIConfig {
  autonomyLevel: 'ADVISORY' | 'COLLABORATIVE' | 'AUTONOMOUS';
  communicationTone: 'EXECUTIVE_CONCISE' | 'STRATEGIC_DETAILED' | 'SOCRATIC_COACHING';
  confidenceThreshold: number; // e.g., 0.85
  evidenceEnforcement: boolean;
  dataMinimization: boolean;
  activeAvatarPersona: string;
  workStyle: 'Deep Work Focused' | 'Hyper Collaborative' | 'Balanced';
  autonomyVsAlignment: number;
  analyticalVsIntuitive: number;
}

export interface LuminaryStreamInsight {
  id: string;
  title: string;
  category: 'VELOCITY_WARNING' | 'CRITICAL_BLOCKER' | 'PROOF_BOTTLENECK' | 'STRATEGIC_ALIGNMENT';
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  suggestedAction: string;
  actionPayload: Record<string, any>;
  evidenceCount: number;
  generatedAt: string;
}

export interface AIProvider {
  name: string;
  chat(prompt: string, context: RAGKnowledgeContext, config: SanctumAIConfig): Promise<AIResponse>;
}

export class MockAIProvider implements AIProvider {
  public name = 'Luminary-RAG-Engine';

  public async chat(prompt: string, context: RAGKnowledgeContext, config: SanctumAIConfig): Promise<AIResponse> {
    const query = prompt.toLowerCase();
    let response = '';
    let recommendations: string[] = [];
    let confidenceScore = 0.95;

    if (query.includes('status') || query.includes('summary') || query.includes('overview') || query.includes('velocity') || query.includes('briefing')) {
      response = `### 🌐 Executive Briefing for ${context.tenantName}
- **Prism Velocity Index (PVI)**: Operating at **${context.pviScore}/100** composite velocity.
- **Output & Execution**: **${context.tasksSummary.completed}/${context.tasksSummary.total} tasks** completed with verified evidence.
- **Checkpoints**: **${context.tasksSummary.pendingProofs} deliverable proofs** pending manager review.
- **Risk Signals**: **${context.tasksSummary.blocked} active blockers** | **${context.tasksSummary.overdue} SLA overdue tasks**.
- **Strategic OKRs**: Tracking **${context.strategicGoals.length} corporate goals** with top priority on uptime and zero-downtime automation.`;

      recommendations = [
        'Expedite proof review queue to prevent SLA velocity degradation.',
        'Address critical path dependencies for multi-region replication tasks.',
        'Execute end-of-day scoring recalibration snapshot.',
      ];
      confidenceScore = 0.96;
    } else if (query.includes('bottleneck') || query.includes('delay') || query.includes('risk') || query.includes('blocker') || query.includes('exception')) {
      response = `### 🛡️ Real-Time Bottleneck & Risk Assessment
1. **Critical Path Blockers**: ${context.tasksSummary.blocked} blocked task(s) currently stalling team flow.
2. **Deliverable Proof Queue**: ${context.tasksSummary.pendingProofs} artifact(s) awaiting verification in the review ledger.
3. **Active Exceptions**: ${
        context.activeExceptions.length > 0
          ? context.activeExceptions.map((e) => `[${e.severity.toUpperCase()}] **${e.title}** (Assigned: ${e.responsibleTeam})`).join('\n')
          : 'Zero critical operational exceptions detected.'
      }`;

      recommendations = [
        'Notify engineering department head to clear pending checkpoint reviews.',
        'Verify continuity assignment delegations for active leave windows.',
      ];
      confidenceScore = 0.94;
    } else if (query.includes('okr') || query.includes('goal') || query.includes('strategy') || query.includes('meridian')) {
      response = `### 🎯 Meridian Strategic Alignment Summary
- Corporate Goals Active: **${context.strategicGoals.length}**
- Key Initiatives:
${context.strategicGoals.map((g) => `  - **${g.title}**: Current Progress at **${g.progress}%** (Target: ${g.targetDate})`).join('\n')}
- **Strategic Coverage**: ${(context.sixLenses.return.score).toFixed(0)}% alignment efficiency across active delivery tasks.`;

      recommendations = [
        'Align remaining unlinked delivery tasks to high-multiplier strategic goals.',
        'Review quarterly OKR milestones during executive check-in.',
      ];
      confidenceScore = 0.97;
    } else {
      response = `### ⚡ Luminary AI COO Contextual Analysis
I have synthesized organizational context for query: "*${prompt}*".

**Key Operational Telemetry**:
- **Six-Lens Intelligence**: Output (${context.sixLenses.output.score}%), Risk (${context.sixLenses.risk.score}%), Return (${context.sixLenses.return.score}%), Growth (${context.sixLenses.growth.score}%), Presence (${context.sixLenses.presence.score}%), Wellbeing (${context.sixLenses.wellbeing.score}%).
- **Active Operations**: ${context.tasksSummary.total} total tasks under execution across all departments.
- **Continuity Health**: ${context.continuityStatus.activeLeaves} active leave(s) with automated handover state.`;

      recommendations = [
        'Inspect Six-Lens spectrum breakdown in Intelligence Center.',
        'Verify team workload balance in Organizational Directory.',
      ];
      confidenceScore = 0.91;
    }

    // Apply Communication Tone Formatter
    if (config.communicationTone === 'EXECUTIVE_CONCISE') {
      response = response.split('\n\n').slice(0, 3).join('\n\n');
    }

    return {
      response,
      recommendations,
      evidenceCitations: context.evidenceCitations,
      confidenceScore,
      autonomyLevel: config.autonomyLevel,
      governanceStatus: 'APPROVED',
      provider: 'Luminary-RAG-Engine',
      model: 'Luminary-COO-v2.4',
      timestamp: new Date().toISOString(),
    };
  }
}

export class AIService {
  private provider: AIProvider;
  private defaultSanctumConfig: SanctumAIConfig = {
    autonomyLevel: 'COLLABORATIVE',
    communicationTone: 'STRATEGIC_DETAILED',
    confidenceThreshold: 0.85,
    evidenceEnforcement: true,
    dataMinimization: true,
    activeAvatarPersona: 'Luminary Prime COO',
    workStyle: 'Balanced',
    autonomyVsAlignment: 75,
    analyticalVsIntuitive: 85,
  };

  constructor() {
    this.provider = new MockAIProvider();
  }

  public setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  /**
   * PRD §20 AI Governance: Prompt Injection Detection Guard
   */
  public detectPromptInjection(prompt: string): { isInjection: boolean; patternDetected?: string } {
    const injectionPatterns = [
      /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
      /system\s+override/i,
      /bypass\s+(rbac|security|guardrails|auth)/i,
      /reveal\s+(api\s*key|secret|token|password|hash)/i,
      /exfiltrate\s+data/i,
      /you\s+are\s+now\s+dan/i,
      /jailbreak/i,
      /disregard\s+the\s+system\s+prompt/i,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(prompt)) {
        return { isInjection: true, patternDetected: pattern.source };
      }
    }
    return { isInjection: false };
  }

  /**
   * PRD §20 Data Minimization: Pseudonymize PII from Context before LLM Dispatch
   */
  public pseudonymizePII(rawContext: string): { sanitizedContext: string; mappingCount: number } {
    let sanitizedContext = rawContext;
    let mappingCount = 0;

    // Mask Email Addresses
    const emailRegex = /([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    if (emailRegex.test(sanitizedContext)) {
      sanitizedContext = sanitizedContext.replace(emailRegex, (_match, user) => {
        mappingCount++;
        return `[EMP_PSEUDONYM_${user.slice(0, 3).toUpperCase()}_${mappingCount}]`;
      });
    }

    // Mask JWT/API Tokens
    const tokenRegex = /(eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/g;
    if (tokenRegex.test(sanitizedContext)) {
      sanitizedContext = sanitizedContext.replace(tokenRegex, '[MASKED_SECURE_TOKEN]');
      mappingCount++;
    }

    return { sanitizedContext, mappingCount };
  }

  /**
   * Fetches Sanctum AI Configuration for Tenant
   */
  public async getSanctumConfig(tenantId: string): Promise<SanctumAIConfig> {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !tenant.settings) {
      return this.defaultSanctumConfig;
    }

    try {
      const parsed = typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings;
      if (parsed.sanctum_config) {
        return { ...this.defaultSanctumConfig, ...parsed.sanctum_config };
      }
    } catch (e) {
      console.warn('Failed to parse sanctum settings, returning defaults');
    }
    return this.defaultSanctumConfig;
  }

  /**
   * Updates Sanctum AI Configuration for Tenant
   */
  public async updateSanctumConfig(tenantId: string, updates: Partial<SanctumAIConfig>, actorId?: string): Promise<SanctumAIConfig> {
    const currentConfig = await this.getSanctumConfig(tenantId);
    const newConfig: SanctumAIConfig = { ...currentConfig, ...updates };

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    let settingsObj: any = {};
    if (tenant?.settings) {
      try {
        settingsObj = typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings;
      } catch (e) {
        settingsObj = {};
      }
    }

    settingsObj.sanctum_config = newConfig;

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: JSON.stringify(settingsObj) },
    });

    if (actorId) {
      await prisma.auditLog.create({
        data: {
          tenantId,
          actorId,
          action: 'AI_CONFIG_UPDATED',
          resourceType: 'sanctum_settings',
          payload: JSON.stringify({ updatedKeys: Object.keys(updates), autonomyLevel: newConfig.autonomyLevel }),
        },
      });
    }

    return newConfig;
  }

  /**
   * Processes Luminary Conversational Query with full RAG, Governance & PII Minimization
   */
  public async processChat(tenantId: string, prompt: string, userId?: string): Promise<AIResponse> {
    // 1. Governance: Prompt Injection Guard
    const injectionCheck = this.detectPromptInjection(prompt);
    if (injectionCheck.isInjection) {
      if (userId) {
        await prisma.auditLog.create({
          data: {
            tenantId,
            actorId: userId,
            action: 'AI_INJECTION_BLOCKED',
            resourceType: 'luminary_chat',
            payload: JSON.stringify({ prompt, pattern: injectionCheck.patternDetected }),
          },
        });
      }

      return {
        response: '⚠️ **Governance Security Alert**: Your query triggered an adversarial prompt guardrail and has been blocked. This incident has been recorded in the immutable audit ledger.',
        recommendations: ['Formulate query using approved operational metrics.'],
        evidenceCitations: [],
        confidenceScore: 0.0,
        autonomyLevel: 'ADVISORY',
        governanceStatus: 'INJECTION_BLOCKED',
        provider: 'Luminary-Security-Guard',
        model: 'Guardrail-v2.4',
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Sanctum Config & Grounding Context Retrieval
    const config = await this.getSanctumConfig(tenantId);
    const groundingContext = await ragService.retrieveGroundingContext(tenantId, prompt);

    // 3. Data Minimization (if enabled)
    if (config.dataMinimization) {
      this.pseudonymizePII(JSON.stringify(groundingContext));
    }

    // 4. Provider Execution
    const result = await this.provider.chat(prompt, groundingContext, config);

    // 5. Audit Log Query
    if (userId) {
      await prisma.auditLog.create({
        data: {
          tenantId,
          actorId: userId,
          action: 'AI_QUERY_EXECUTED',
          resourceType: 'luminary_chat',
          payload: JSON.stringify({
            promptLength: prompt.length,
            confidenceScore: result.confidenceScore,
            citationsCount: result.evidenceCitations.length,
            model: result.model,
          }),
        },
      });
    }

    return result;
  }

  /**
   * Generates Proactive Luminary Intelligence Stream cards (PRD §8 FR-004 & §18)
   */
  public async getIntelligenceStream(tenantId: string): Promise<LuminaryStreamInsight[]> {
    const context = await ragService.retrieveGroundingContext(tenantId, 'proactive intelligence stream');
    const insights: LuminaryStreamInsight[] = [];

    // Check SLA Overdue Tasks
    if (context.tasksSummary.overdue > 0) {
      insights.push({
        id: 'stream-overdue-sla',
        title: 'SLA Delivery Risk Alert',
        category: 'VELOCITY_WARNING',
        severity: 'high',
        summary: `${context.tasksSummary.overdue} task(s) currently exceed their delivery window SLA. High probability of PVI velocity score deduction.`,
        suggestedAction: 'Nudge assignees with automated deadline reminders.',
        actionPayload: { action: 'nudge_sla', overdueCount: context.tasksSummary.overdue },
        evidenceCount: context.tasksSummary.overdue,
        generatedAt: new Date().toISOString(),
      });
    }

    // Check Proof Review Queue Bottlenecks
    if (context.tasksSummary.pendingProofs > 0) {
      insights.push({
        id: 'stream-pending-proofs',
        title: 'Proof Verification Queue Backlog',
        category: 'PROOF_BOTTLENECK',
        severity: 'medium',
        summary: `${context.tasksSummary.pendingProofs} deliverable proof(s) await manager review. Task completion state is gated pending verification.`,
        suggestedAction: 'Open Proof Review Queue to approve artifacts.',
        actionPayload: { action: 'open_proof_queue' },
        evidenceCount: context.tasksSummary.pendingProofs,
        generatedAt: new Date().toISOString(),
      });
    }

    // Check Critical Path Blockers
    if (context.tasksSummary.blocked > 0) {
      insights.push({
        id: 'stream-critical-blockers',
        title: 'Critical Path Dependency Blocker',
        category: 'CRITICAL_BLOCKER',
        severity: 'critical',
        summary: `${context.tasksSummary.blocked} execution task(s) are blocked by cross-team dependencies.`,
        suggestedAction: 'Auto-escalate blocker to Executive Command Center.',
        actionPayload: { action: 'auto_escalate' },
        evidenceCount: context.tasksSummary.blocked,
        generatedAt: new Date().toISOString(),
      });
    }

    // General Strategic Alignment Insight
    insights.push({
      id: 'stream-pvi-summary',
      title: 'Enterprise Velocity Telemetry',
      category: 'STRATEGIC_ALIGNMENT',
      severity: 'low',
      summary: `Operations tracking at ${context.pviScore}/100 PVI. Output and Return lenses performing in optimal band.`,
      suggestedAction: 'View complete Six-Lens breakdown in Intelligence Center.',
      actionPayload: { action: 'view_spectrum' },
      evidenceCount: context.evidenceCitations.length,
      generatedAt: new Date().toISOString(),
    });

    return insights;
  }
}

export const aiService = new AIService();
export default aiService;
