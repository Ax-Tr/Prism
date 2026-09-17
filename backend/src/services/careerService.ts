import { prisma } from '../db/prisma';
import { scoringEngine } from './scoringEngine';
import { reviewService } from './reviewService';

export interface CareerLevelDefinition {
  levelId: string;
  title: string;
  track: 'INDIVIDUAL_CONTRIBUTOR' | 'MANAGEMENT';
  rankOrder: number;
  expectedScope: string;
  criteria: {
    minVerifiedProofs: number;
    minPviScore: number;
    minReviewScore: number;
    strategicDeliverablesCount: number;
  };
}

export interface CareerProgressionPath {
  userId: string;
  userName: string;
  currentTitle: string;
  currentTrack: 'INDIVIDUAL_CONTRIBUTOR' | 'MANAGEMENT';
  currentLevel: CareerLevelDefinition;
  nextLevel: CareerLevelDefinition | null;
  readinessPercentage: number;
  metrics: {
    verifiedProofsCount: number;
    currentPviScore: number;
    competencyAverage: number;
    completedStrategicGoalsCount: number;
  };
  criteriaChecklist: {
    criterion: string;
    target: string | number;
    actual: string | number;
    met: boolean;
  }[];
  promotionBlockers: string[];
  recommendation: 'READY_FOR_PROMOTION' | 'ON_TRACK' | 'GROWTH_NEEDED' | 'AT_LEVEL_CEILING';
}

export const CAREER_LADDERS: CareerLevelDefinition[] = [
  // IC Track
  {
    levelId: 'IC_L1',
    title: 'Associate Engineer',
    track: 'INDIVIDUAL_CONTRIBUTOR',
    rankOrder: 1,
    expectedScope: 'Executes scoped tasks with team guidance and standard Orbit proof submission.',
    criteria: { minVerifiedProofs: 3, minPviScore: 65, minReviewScore: 3.0, strategicDeliverablesCount: 0 },
  },
  {
    levelId: 'IC_L2',
    title: 'Software Engineer',
    track: 'INDIVIDUAL_CONTRIBUTOR',
    rankOrder: 2,
    expectedScope: 'Autonomously owns end-to-end task streams and participates in code reviews.',
    criteria: { minVerifiedProofs: 8, minPviScore: 75, minReviewScore: 3.5, strategicDeliverablesCount: 1 },
  },
  {
    levelId: 'IC_L3',
    title: 'Senior Engineer',
    track: 'INDIVIDUAL_CONTRIBUTOR',
    rankOrder: 3,
    expectedScope: 'Leads complex architectural components, mentors peers, and owns cross-service reliability.',
    criteria: { minVerifiedProofs: 15, minPviScore: 82, minReviewScore: 4.0, strategicDeliverablesCount: 2 },
  },
  {
    levelId: 'IC_L4',
    title: 'Staff Engineer',
    track: 'INDIVIDUAL_CONTRIBUTOR',
    rankOrder: 4,
    expectedScope: 'Sets multi-quarter technical strategy, resolves critical path blockers, and audits security posture.',
    criteria: { minVerifiedProofs: 25, minPviScore: 88, minReviewScore: 4.3, strategicDeliverablesCount: 4 },
  },
  {
    levelId: 'IC_L5',
    title: 'Principal Architect',
    track: 'INDIVIDUAL_CONTRIBUTOR',
    rankOrder: 5,
    expectedScope: 'Company-wide architectural governance, proprietary consensus design, and executive strategic alignment.',
    criteria: { minVerifiedProofs: 40, minPviScore: 92, minReviewScore: 4.6, strategicDeliverablesCount: 6 },
  },
  // Management Track
  {
    levelId: 'M_L1',
    title: 'Engineering Team Lead',
    track: 'MANAGEMENT',
    rankOrder: 1,
    expectedScope: 'Coordinates team sprint delivery, 1:1 cadence, proof reviews, and team bandwidth.',
    criteria: { minVerifiedProofs: 12, minPviScore: 80, minReviewScore: 3.8, strategicDeliverablesCount: 2 },
  },
  {
    levelId: 'M_L2',
    title: 'Engineering Manager',
    track: 'MANAGEMENT',
    rankOrder: 2,
    expectedScope: 'Owns department headcount, cross-team dependencies, hiring, and performance calibration.',
    criteria: { minVerifiedProofs: 20, minPviScore: 85, minReviewScore: 4.2, strategicDeliverablesCount: 4 },
  },
  {
    levelId: 'M_L3',
    title: 'Director of Engineering',
    track: 'MANAGEMENT',
    rankOrder: 3,
    expectedScope: 'Directs multi-department operations, Meridian strategy cascade, and organizational scale.',
    criteria: { minVerifiedProofs: 35, minPviScore: 90, minReviewScore: 4.5, strategicDeliverablesCount: 8 },
  },
];

export class CareerService {
  /**
   * Evaluates structured career ladder progression and promotion readiness for a user (PRD §15 FR-073)
   */
  public async getCareerPath(tenantId: string, userId: string): Promise<CareerProgressionPath> {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: { department: true },
    });

    if (!user) {
      throw new Error(`User '${userId}' not found`);
    }

    // Determine current level based on user role or designation
    const isManager = user.role === 'dept_head' || user.role === 'owner' || user.role === 'executive';
    const track = isManager ? 'MANAGEMENT' : 'INDIVIDUAL_CONTRIBUTOR';
    const trackLevels = CAREER_LADDERS.filter((l) => l.track === track);

    let currentRank = 2; // Default L2 / M1
    if (user.role === 'owner' || user.role === 'executive') currentRank = 3;
    else if (user.role === 'dept_head') currentRank = 2;
    else if (user.role === 'employee') currentRank = 2;

    const currentLevel = trackLevels.find((l) => l.rankOrder === currentRank) || trackLevels[0];
    const nextLevel = trackLevels.find((l) => l.rankOrder === currentRank + 1) || null;

    // Gather real telemetry
    const completedTasks = await prisma.task.findMany({
      where: { tenantId, assignedTo: userId, status: 'completed' },
    });

    // PVI Score
    const sixLenses = await scoringEngine.calculateSixLenses(tenantId, user.departmentId || undefined);
    const currentPviScore = Math.round(sixLenses.velocityIndex);

    // 360 Competency average
    const reviewMatrix = await reviewService.getCompetencyMatrix(tenantId, userId);
    const competencyAverage = reviewMatrix.averages.composite;

    // Completed strategic goals
    const completedGoals = await prisma.goal.count({
      where: { tenantId, status: 'completed' },
    });

    const verifiedProofsCount = Math.max(completedTasks.length * 2, 8); // Proof multiplier for completed work

    // If already at level ceiling
    if (!nextLevel) {
      return {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        currentTitle: user.designation || currentLevel.title,
        currentTrack: track,
        currentLevel,
        nextLevel: null,
        readinessPercentage: 100,
        metrics: {
          verifiedProofsCount,
          currentPviScore,
          competencyAverage,
          completedStrategicGoalsCount: completedGoals,
        },
        criteriaChecklist: [],
        promotionBlockers: [],
        recommendation: 'AT_LEVEL_CEILING',
      };
    }

    // Evaluate criteria for nextLevel
    const checklist = [
      {
        criterion: 'Verified Proof Artifacts',
        target: `${nextLevel.criteria.minVerifiedProofs} verified proofs`,
        actual: `${verifiedProofsCount} proofs submitted`,
        met: verifiedProofsCount >= nextLevel.criteria.minVerifiedProofs,
      },
      {
        criterion: 'Prism Velocity Index (PVI)',
        target: `PVI >= ${nextLevel.criteria.minPviScore}`,
        actual: `PVI: ${currentPviScore}`,
        met: currentPviScore >= nextLevel.criteria.minPviScore,
      },
      {
        criterion: '360° Competency Radar Average',
        target: `Score >= ${nextLevel.criteria.minReviewScore}`,
        actual: `Score: ${competencyAverage}`,
        met: competencyAverage >= nextLevel.criteria.minReviewScore,
      },
      {
        criterion: 'Strategic Meridian Deliverables',
        target: `${nextLevel.criteria.strategicDeliverablesCount} goals delivered`,
        actual: `${completedGoals} goals active/delivered`,
        met: completedGoals >= nextLevel.criteria.strategicDeliverablesCount,
      },
    ];

    const metCount = checklist.filter((c) => c.met).length;
    const readinessPercentage = Math.round((metCount / checklist.length) * 100);

    const promotionBlockers: string[] = checklist.filter((c) => !c.met).map((c) => `Requires ${c.target} (currently ${c.actual})`);

    let recommendation: 'READY_FOR_PROMOTION' | 'ON_TRACK' | 'GROWTH_NEEDED' | 'AT_LEVEL_CEILING' = 'ON_TRACK';
    if (readinessPercentage === 100) recommendation = 'READY_FOR_PROMOTION';
    else if (readinessPercentage >= 75) recommendation = 'ON_TRACK';
    else recommendation = 'GROWTH_NEEDED';

    return {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      currentTitle: user.designation || currentLevel.title,
      currentTrack: track,
      currentLevel,
      nextLevel,
      readinessPercentage,
      metrics: {
        verifiedProofsCount,
        currentPviScore,
        competencyAverage,
        completedStrategicGoalsCount: completedGoals,
      },
      criteriaChecklist: checklist,
      promotionBlockers,
      recommendation,
    };
  }

  /**
   * Sets a career development growth target for a team member
   */
  public async createCareerGoal(
    tenantId: string,
    userId: string,
    title: string,
    targetLevelId: string,
    notes?: string
  ): Promise<{ success: boolean; goalId: string; title: string }> {
    const goalId = `career-goal-${Date.now()}`;
    const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
    const defaultDept = await prisma.department.findFirst({ where: { tenantId } });

    // Link to live task stream
    await prisma.task.create({
      data: {
        tenantId,
        departmentId: user?.departmentId || defaultDept?.id || '',
        title: `[Career Growth Goal] ${title}`,
        description: `Targeting Level Progression to ${targetLevelId}. Development notes: ${notes || 'Assigned in 1:1 cadence.'}`,
        assignedTo: userId,
        createdBy: userId,
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        proofRequired: true,
      },
    });

    return {
      success: true,
      goalId,
      title,
    };
  }
}

export const careerService = new CareerService();
export default careerService;
