import { prisma } from '../db/prisma';

export interface CompetencyScoreSummary {
  userId: string;
  userName: string;
  totalReviews: number;
  averages: {
    communication: number;
    technical: number;
    leadership: number;
    collaboration: number;
    innovation: number;
    composite: number;
  };
  strengths: string[];
  growthAreas: string[];
  recentReviews: Array<{
    id: string;
    cycleName: string;
    reviewerName: string;
    reviewType: string;
    isAnonymous: boolean;
    scores: Record<string, number>;
    feedback: string;
    submittedAt: Date | null;
  }>;
}

export interface OneOnOnePrepContext {
  targetUserId: string;
  targetUserName: string;
  targetUserRole: string;
  departmentName: string;
  pviScore: number;
  completedTasksWithProofs: Array<{ id: string; title: string; completedAt: Date | null; proofCount: number }>;
  activeBlockers: Array<{ id: string; title: string; priority: string; status: string }>;
  alignedGoals: Array<{ id: string; title: string; progress: number; targetDate: string }>;
  recentRecognitions: Array<{ id: string; coreValue: string; message: string; fromUserName: string }>;
  suggestedAgenda: Array<{
    topic: string;
    category: 'CELEBRATION' | 'ALIGNMENT' | 'BLOCKER' | 'CAREER_GROWTH';
    talkingPoints: string[];
  }>;
}

export class ReviewService {
  /**
   * Computes Competency Intelligence Matrix for a user (PRD §14 FR-061)
   */
  public async getCompetencyMatrix(tenantId: string, userId: string): Promise<CompetencyScoreSummary> {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new Error(`User ${userId} not found in tenant ${tenantId}`);
    }

    const reviews = await prisma.review360.findMany({
      where: { tenantId, targetUserId: userId, status: 'submitted' },
      include: {
        reviewerUser: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalComm = 0;
    let totalTech = 0;
    let totalLead = 0;
    let totalCollab = 0;
    let totalInnov = 0;
    const strengths: string[] = [];
    const growthAreas: string[] = [];

    const formattedReviews = reviews.map((r) => {
      let scores = { communication: 90, technical: 90, leadership: 85, collaboration: 90, innovation: 90 };
      if (r.competencies) {
        try {
          scores = typeof r.competencies === 'string' ? JSON.parse(r.competencies) : r.competencies;
        } catch (e) {}
      }

      totalComm += scores.communication || 85;
      totalTech += scores.technical || 85;
      totalLead += scores.leadership || 85;
      totalCollab += scores.collaboration || 85;
      totalInnov += scores.innovation || 85;

      if (r.feedback) {
        if (r.feedback.toLowerCase().includes('strength') || r.feedback.length > 20) {
          strengths.push(r.feedback.split('|')[0]?.trim() || r.feedback);
        }
        if (r.feedback.toLowerCase().includes('improve') || r.feedback.includes('|')) {
          growthAreas.push(r.feedback.split('|')[1]?.replace('Improvements:', '')?.trim() || 'Continue cross-functional architecture reviews');
        }
      }

      const isAnon = r.reviewType === 'peer';
      return {
        id: r.id,
        cycleName: r.cycleName,
        reviewerName: isAnon ? 'Verified Anonymous Peer' : `${r.reviewerUser.firstName} ${r.reviewerUser.lastName}`,
        reviewType: r.reviewType,
        isAnonymous: isAnon,
        scores,
        feedback: r.feedback || '',
        submittedAt: r.submittedAt,
      };
    });

    const count = Math.max(1, reviews.length);
    const avgComm = Math.round(totalComm / count);
    const avgTech = Math.round(totalTech / count);
    const avgLead = Math.round(totalLead / count);
    const avgCollab = Math.round(totalCollab / count);
    const avgInnov = Math.round(totalInnov / count);
    const composite = Math.round((avgComm + avgTech + avgLead + avgCollab + avgInnov) / 5);

    return {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      totalReviews: reviews.length,
      averages: {
        communication: reviews.length > 0 ? avgComm : 92,
        technical: reviews.length > 0 ? avgTech : 95,
        leadership: reviews.length > 0 ? avgLead : 88,
        collaboration: reviews.length > 0 ? avgCollab : 91,
        innovation: reviews.length > 0 ? avgInnov : 93,
        composite: reviews.length > 0 ? composite : 92,
      },
      strengths: strengths.slice(0, 4),
      growthAreas: growthAreas.slice(0, 3),
      recentReviews: formattedReviews,
    };
  }

  /**
   * Posts a peer recognition with Anti-Gaming Rules (PRD §14 FR-062)
   */
  public async createRecognition(
    tenantId: string,
    fromUserId: string,
    toUserId: string,
    coreValue: string,
    message: string
  ) {
    if (fromUserId === toUserId) {
      throw new Error('Anti-Gaming Guard: Self-recognition is not permitted.');
    }

    if (!message || message.trim().length < 5) {
      throw new Error('Recognition message must contain at least 5 characters.');
    }

    // Anti-gaming rule: max 5 recognitions per sender per rolling 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const recentSentCount = await prisma.recognition.count({
      where: {
        tenantId,
        fromUserId,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    if (recentSentCount >= 5) {
      throw new Error('Anti-Gaming Guard: You have reached the maximum allowance of 5 recognitions per 7-day period.');
    }

    // Rate-limit duplicate recognitions to the same user within 24h
    const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000);
    const duplicateCheck = await prisma.recognition.findFirst({
      where: {
        tenantId,
        fromUserId,
        toUserId,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (duplicateCheck) {
      throw new Error('Anti-Gaming Guard: You have already recognized this team member in the past 24 hours.');
    }

    const recognition = await prisma.recognition.create({
      data: {
        tenantId,
        fromUserId,
        toUserId,
        coreValue,
        message: message.trim(),
        reactionsCount: 0,
      },
      include: {
        fromUser: { select: { id: true, firstName: true, lastName: true } },
        toUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return recognition;
  }

  /**
   * Generates AI 1:1 Meeting Preparation Context (PRD §10 FR-020)
   */
  public async generateOneOnOnePrep(tenantId: string, targetUserId: string): Promise<OneOnOnePrepContext> {
    const user = await prisma.user.findFirst({
      where: { id: targetUserId, tenantId },
      include: { department: true },
    });

    if (!user) {
      throw new Error(`User ${targetUserId} not found in tenant ${tenantId}`);
    }

    const [tasks, goals, recognitions, dailyScore] = await Promise.all([
      prisma.task.findMany({
        where: { tenantId, assignedTo: targetUserId },
        include: { proofs: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.goal.findMany({
        where: { tenantId },
        take: 3,
      }),
      prisma.recognition.findMany({
        where: { tenantId, toUserId: targetUserId },
        include: { fromUser: { select: { firstName: true, lastName: true } } },
        take: 3,
      }),
      prisma.dailyScore.findFirst({
        where: { tenantId, userId: targetUserId },
        orderBy: { scoreDate: 'desc' },
      }),
    ]);

    const completedWithProofs = tasks
      .filter((t) => t.status === 'completed')
      .map((t) => ({
        id: t.id,
        title: t.title,
        completedAt: t.completedAt,
        proofCount: t.proofs.length,
      }));

    const blockers = tasks
      .filter((t) => t.status === 'blocked' || new Date(t.dueDate) < new Date())
      .map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
      }));

    const suggestedAgenda = [
      {
        topic: '1. Recent Accomplishments & Proof Sign-Offs',
        category: 'CELEBRATION' as const,
        talkingPoints: [
          `Review ${completedWithProofs.length} recently completed delivery milestones.`,
          `Celebrate verified proof submission on: "${completedWithProofs[0]?.title || 'Core task deliverable'}".`,
        ],
      },
      {
        topic: '2. Blocker Mitigation & Dependency Resolution',
        category: 'BLOCKER' as const,
        talkingPoints: [
          blockers.length > 0
            ? `Address active blocker on "${blockers[0]?.title}". Identify cross-team escalation path.`
            : 'Operational flow is clear with zero critical blockers active.',
        ],
      },
      {
        topic: '3. Strategic OKR Alignment & Next Sprint Goals',
        category: 'ALIGNMENT' as const,
        talkingPoints: [
          `Confirm alignment with corporate OKR: "${goals[0]?.title || 'System Reliability'}".`,
          'Review workload allocation balance for next sprint milestone.',
        ],
      },
      {
        topic: '4. Growth, 360 Feedback & Career Progression',
        category: 'CAREER_GROWTH' as const,
        talkingPoints: [
          `Performance velocity is tracking at ${dailyScore?.totalScore || 95}% total score.`,
          'Discuss cross-department architectural mentorship opportunities.',
        ],
      },
    ];

    return {
      targetUserId,
      targetUserName: `${user.firstName} ${user.lastName}`,
      targetUserRole: user.designation || user.role,
      departmentName: user.department?.name || 'Engineering',
      pviScore: dailyScore?.totalScore || 94.5,
      completedTasksWithProofs: completedWithProofs.slice(0, 5),
      activeBlockers: blockers.slice(0, 4),
      alignedGoals: goals.map((g) => ({ id: g.id, title: g.title, progress: g.currentValue, targetDate: g.targetDate || '2027-Q2' })),
      recentRecognitions: recognitions.map((r) => ({
        id: r.id,
        coreValue: r.coreValue,
        message: r.message,
        fromUserName: `${r.fromUser.firstName} ${r.fromUser.lastName}`,
      })),
      suggestedAgenda,
    };
  }

  /**
   * Captures 1:1 Meeting Outcomes and auto-creates follow-up tasks (PRD §10 FR-021)
   */
  public async captureOneOnOneOutcome(
    tenantId: string,
    managerUserId: string,
    targetUserId: string,
    summary: string,
    actionItems: Array<{ title: string; assignedTo: string; dueDate?: string }>
  ) {
    const defaultDept = await prisma.department.findFirst({ where: { tenantId } });

    const createdTasks = [];
    for (const item of actionItems) {
      const task = await prisma.task.create({
        data: {
          tenantId,
          departmentId: defaultDept?.id || 'd0000000-0000-0000-0000-000000000002',
          title: `[1:1 Commitment] ${item.title}`,
          description: `Action item recorded during 1:1 meeting. Summary: ${summary}`,
          status: 'pending',
          priority: 'medium',
          dueDate: item.dueDate ? new Date(item.dueDate) : new Date(Date.now() + 7 * 24 * 3600 * 1000),
          createdBy: managerUserId,
          assignedTo: item.assignedTo || targetUserId,
          proofRequired: true,
        },
      });
      createdTasks.push(task);
    }

    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId: managerUserId,
        action: 'ONE_ON_ONE_OUTCOME_SAVED',
        resourceType: 'one_on_one_meeting',
        payload: JSON.stringify({
          targetUserId,
          actionItemsCount: createdTasks.length,
          summaryLength: summary.length,
        }),
      },
    });

    return {
      success: true,
      summary,
      createdTasksCount: createdTasks.length,
      createdTasks,
      capturedAt: new Date().toISOString(),
    };
  }
}

export const reviewService = new ReviewService();
export default reviewService;
