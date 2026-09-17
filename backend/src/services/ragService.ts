import { prisma } from '../db/prisma';
import { scoringEngine, SixLensTelemetry } from './scoringEngine';

export interface GroundedEvidenceCitation {
  id: string;
  type: 'task' | 'goal' | 'proof' | 'exception' | 'score' | 'continuity';
  title: string;
  confidenceScore: number;
  snippet: string;
}

export interface RAGKnowledgeContext {
  tenantId: string;
  tenantName: string;
  pviScore: number;
  sixLenses: SixLensTelemetry;
  tasksSummary: {
    total: number;
    completed: number;
    blocked: number;
    overdue: number;
    pendingProofs: number;
  };
  criticalTasks: Array<{ id: string; title: string; priority: string; status: string; assignee: string }>;
  strategicGoals: Array<{ id: string; title: string; progress: number; targetDate: string }>;
  activeExceptions: Array<{ id: string; title: string; severity: string; responsibleTeam: string }>;
  continuityStatus: { activeLeaves: number; automatedHandovers: number };
  evidenceCitations: GroundedEvidenceCitation[];
}

export class RAGService {
  /**
   * Retrieves and synthesizes full organizational knowledge graph for RAG grounding
   */
  public async retrieveGroundingContext(tenantId: string, query: string): Promise<RAGKnowledgeContext> {
    const queryLower = query.toLowerCase();

    const [tenant, tasks, goals, exceptions, leaves, continuities, sixLenses] = await Promise.all([
      prisma.tenant.findUnique({ where: { id: tenantId } }),
      prisma.task.findMany({
        where: { tenantId },
        include: { proofs: true, priorityRel: { include: { goal: true } } },
      }),
      prisma.goal.findMany({
        where: { tenantId },
        include: { priorities: true },
      }),
      prisma.systemException.findMany({
        where: { tenantId, status: 'open' },
      }),
      prisma.leaveRequest.findMany({
        where: { tenantId, status: 'approved' },
      }),
      prisma.continuityAssignment.findMany({
        where: { tenantId, status: 'active' },
      }),
      scoringEngine.calculateSixLenses(tenantId),
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const blockedTasks = tasks.filter((t) => t.status === 'blocked');
    const now = new Date();
    const overdueTasks = tasks.filter((t) => new Date(t.dueDate) < now && t.status !== 'completed' && t.status !== 'cancelled');
    const pendingProofsCount = tasks.reduce((acc, t) => acc + t.proofs.filter((p) => p.approvalStatus === 'pending').length, 0);

    const citations: GroundedEvidenceCitation[] = [];

    // Extract relevant task citations
    for (const task of tasks) {
      if (
        queryLower.includes(task.title.toLowerCase()) ||
        queryLower.includes(task.priority.toLowerCase()) ||
        (task.status === 'blocked' && (queryLower.includes('block') || queryLower.includes('risk'))) ||
        (overdueTasks.some((ot) => ot.id === task.id) && (queryLower.includes('overdue') || queryLower.includes('sla') || queryLower.includes('delay')))
      ) {
        citations.push({
          id: task.id,
          type: 'task',
          title: task.title,
          confidenceScore: 0.94,
          snippet: `[Task] ${task.title} (Status: ${task.status.toUpperCase()}, Priority: ${task.priority.toUpperCase()})`,
        });
      }
    }

    // Extract relevant goal citations
    for (const goal of goals) {
      if (queryLower.includes(goal.title.toLowerCase()) || queryLower.includes('goal') || queryLower.includes('okr') || queryLower.includes('strategy') || queryLower.includes('pillar')) {
        citations.push({
          id: goal.id,
          type: 'goal',
          title: goal.title,
          confidenceScore: 0.96,
          snippet: `[Goal] ${goal.title} (Target: ${goal.targetValue}${goal.unit || '%'}, Current: ${goal.currentValue}${goal.unit || '%'})`,
        });
      }
    }

    // Extract relevant exception citations
    for (const exc of exceptions) {
      if (queryLower.includes(exc.title.toLowerCase()) || queryLower.includes('exception') || queryLower.includes('risk') || queryLower.includes('blocker') || queryLower.includes('issue')) {
        citations.push({
          id: exc.id,
          type: 'exception',
          title: exc.title,
          confidenceScore: 0.92,
          snippet: `[Exception: ${exc.severity.toUpperCase()}] ${exc.title}`,
        });
      }
    }

    // Ensure at least top general citations if specific keywords did not isolate items
    if (citations.length === 0) {
      if (tasks.length > 0) {
        citations.push({
          id: tasks[0].id,
          type: 'task',
          title: tasks[0].title,
          confidenceScore: 0.88,
          snippet: `[Task] ${tasks[0].title} (Status: ${tasks[0].status})`,
        });
      }
      if (goals.length > 0) {
        citations.push({
          id: goals[0].id,
          type: 'goal',
          title: goals[0].title,
          confidenceScore: 0.91,
          snippet: `[Strategic Goal] ${goals[0].title}`,
        });
      }
    }

    return {
      tenantId,
      tenantName: tenant?.name || 'Prism Enterprise Inc.',
      pviScore: sixLenses.velocityIndex,
      sixLenses,
      tasksSummary: {
        total: totalTasks,
        completed: completedTasks.length,
        blocked: blockedTasks.length,
        overdue: overdueTasks.length,
        pendingProofs: pendingProofsCount,
      },
      criticalTasks: tasks.slice(0, 5).map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        assignee: t.assignedTo || 'Unassigned',
      })),
      strategicGoals: goals.slice(0, 4).map((g) => ({
        id: g.id,
        title: g.title,
        progress: g.currentValue,
        targetDate: g.targetDate || '2027-Q2',
      })),
      activeExceptions: exceptions.map((e) => ({
        id: e.id,
        title: e.title,
        severity: e.severity,
        responsibleTeam: e.exceptionType || 'Operations',
      })),
      continuityStatus: {
        activeLeaves: leaves.length,
        automatedHandovers: continuities.length,
      },
      evidenceCitations: citations.slice(0, 6),
    };
  }
}

export const ragService = new RAGService();
export default ragService;
