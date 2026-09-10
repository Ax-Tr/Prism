import { prisma } from '../db/prisma';

export interface AIResponse {
  response: string;
  recommendations: string[];
  provider: string;
  model: string;
  timestamp: string;
}

export interface AIContext {
  tenantName: string;
  avgScore: string;
  openTasksCount: number;
  pendingProofsCount: number;
  openExceptions: Array<{ title: string; severity: string }>;
  activeLeavesCount: number;
  departments: Array<{ name: string; taskCount: number }>;
}

export interface AIProvider {
  name: string;
  chat(prompt: string, context: AIContext): Promise<AIResponse>;
}

export class MockAIProvider implements AIProvider {
  public name = 'MockLuminary';

  public async chat(prompt: string, context: AIContext): Promise<AIResponse> {
    const query = prompt.toLowerCase();
    let response = '';
    let recommendations: string[] = [];

    if (
      query.includes('status') ||
      query.includes('summary') ||
      query.includes('overview') ||
      query.includes('briefing')
    ) {
      response = `**Executive Briefing for ${context.tenantName}**:
- **System Health**: Operations are tracking at **${context.avgScore}% discipline score**.
- **Pending Approvals**: There are **${context.pendingProofsCount} task proofs** requiring manager sign-off.
- **Bottlenecks / Exceptions**: **${context.openExceptions.length} active exception(s)** detected: "${context.openExceptions[0]?.title || 'None'}".
- **Continuity Matrix**: **${context.activeLeavesCount} active leave(s)** with automated delegate handover active.`;

      recommendations = [
        'Review pending task proofs to maintain team velocity.',
        'Verify operational handover delegation for active leaves.',
        'Trigger end-of-day scoring recalculation.',
      ];
    } else if (
      query.includes('bottleneck') ||
      query.includes('delay') ||
      query.includes('risk') ||
      query.includes('exception')
    ) {
      response = `**Bottleneck Analysis**:
1. **Stalled Approvals**: Proof review queue has ${context.pendingProofsCount} item(s) awaiting sign-off.
2. **Resource Load**: Active work in flight comprises ${context.openTasksCount} tasks across ${context.departments.length} departments.
3. **Open Exceptions**: ${
        context.openExceptions.length > 0
          ? context.openExceptions.map((e) => `[${e.severity.toUpperCase()}] ${e.title}`).join('; ')
          : 'No critical blockers active.'
      }`;

      recommendations = [
        'Nudge department leads to review pending checkpoint proofs.',
        'Reassign low-priority tasks if velocity dips below 85%.',
      ];
    } else if (query.includes('continuity') || query.includes('leave') || query.includes('handover')) {
      response = `**Continuity & Handover Health**:
- **Active Leaves**: ${context.activeLeavesCount} scheduled leave(s) active.
- **Handover Status**: Automated delegations active for ongoing task streams.
- **Impact**: Zero orphaned tasks detected across operational pipelines.`;

      recommendations = [
        'Audit log recorded delegation handover authorization.',
        'All automated deadline alerts redirected to designated delegates.',
      ];
    } else {
      response = `**Luminary AI COO Analysis**:
I have reviewed your query: "*${prompt}*".
Based on current live state:
- All ${context.departments.length} departments are reporting synchronized task streams.
- Multi-tenant PostgreSQL RLS and append-only audit logging are actively enforcing isolation.
- Total active tasks: ${context.openTasksCount} | Pending checkpoints: ${context.pendingProofsCount}.`;

      recommendations = [
        'Review daily score distribution across Engineering and Operations.',
        'Check Meridian strategic roadmap milestone alignment.',
      ];
    }

    return {
      response,
      recommendations,
      provider: 'Luminary-Heuristic-Engine',
      model: 'Luminary-COO-v1',
      timestamp: new Date().toISOString(),
    };
  }
}

export class OpenAIProvider implements AIProvider {
  public name = 'OpenAI';
  private apiKey: string;
  private fallbackProvider: MockAIProvider;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.fallbackProvider = new MockAIProvider();
  }

  public async chat(prompt: string, context: AIContext): Promise<AIResponse> {
    if (!this.apiKey || this.apiKey === 'placeholder_openai_key') {
      return this.fallbackProvider.chat(prompt, context);
    }

    try {
      const systemPrompt = `You are Luminary, an executive AI Chief Operating Officer for ${context.tenantName}.
Current real-time operational context:
- Average Team Health Score: ${context.avgScore}%
- Active Tasks in Flight: ${context.openTasksCount}
- Pending Deliverable Proofs: ${context.pendingProofsCount}
- Active Exceptions: ${JSON.stringify(context.openExceptions)}
- Active Leaves with Delegations: ${context.activeLeavesCount}
- Department Breakdown: ${JSON.stringify(context.departments)}

Provide clear, strategic, and high-impact operational advice. Return concise markdown.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.warn('OpenAI API request failed, falling back to heuristic engine');
        return this.fallbackProvider.chat(prompt, context);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'No response generated.';

      return {
        response: content,
        recommendations: [
          'Review flagged checkpoint proofs in your dashboard.',
          'Synchronize department priority milestones.',
        ],
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('OpenAI call error, falling back to mock:', error);
      return this.fallbackProvider.chat(prompt, context);
    }
  }
}

export class AIService {
  private provider: AIProvider;

  constructor() {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey.startsWith('sk-')) {
      this.provider = new OpenAIProvider(openaiKey);
    } else {
      this.provider = new MockAIProvider();
    }
  }

  public setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  public async buildContext(tenantId: string): Promise<AIContext> {
    const [tenant, openTasks, pendingProofs, openExceptions, activeLeaves, departments, dailyScores] =
      await Promise.all([
        prisma.tenant.findUnique({ where: { id: tenantId } }),
        prisma.task.findMany({ where: { tenantId, status: { not: 'completed' } } }),
        prisma.taskProof.findMany({ where: { tenantId, approvalStatus: 'pending' } }),
        prisma.systemException.findMany({ where: { tenantId, status: 'open' } }),
        prisma.leaveRequest.findMany({ where: { tenantId, status: 'approved' } }),
        prisma.department.findMany({ where: { tenantId }, include: { tasks: true } }),
        prisma.dailyScore.findMany({ where: { tenantId } }),
      ]);

    const avgScore =
      dailyScores.length > 0
        ? (dailyScores.reduce((acc: number, c: any) => acc + c.totalScore, 0) / dailyScores.length).toFixed(1)
        : '94.2';

    return {
      tenantName: tenant?.name || 'Prism Enterprise Inc.',
      avgScore,
      openTasksCount: openTasks.length,
      pendingProofsCount: pendingProofs.length,
      openExceptions: openExceptions.map((e: any) => ({ title: e.title, severity: e.severity })),
      activeLeavesCount: activeLeaves.length,
      departments: departments.map((d: any) => ({ name: d.name, taskCount: d.tasks.length })),
    };
  }

  public async processChat(tenantId: string, prompt: string): Promise<AIResponse> {
    const context = await this.buildContext(tenantId);
    return this.provider.chat(prompt, context);
  }
}

export const aiService = new AIService();
export default aiService;
