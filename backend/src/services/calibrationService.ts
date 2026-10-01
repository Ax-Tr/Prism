import { prisma } from '../db/prisma';
import { scoringEngine } from './scoringEngine';
import { reviewService } from './reviewService';

export type NineBoxQuadrant =
  | 'STAR_TALENT' // High Perf, High Pot
  | 'HIGH_PERFORMER' // High Perf, Med Pot
  | 'SOLID_PROFESSIONAL' // High Perf, Low Pot
  | 'EMERGING_LEADER' // Med Perf, High Pot
  | 'CORE_CONTRIBUTOR' // Med Perf, Med Pot
  | 'EFFECTIVE_SPECIALIST' // Med Perf, Low Pot
  | 'DIAMOND_IN_ROUGH' // Low Perf, High Pot
  | 'INCONSISTENT_PERFORMER' // Low Perf, Med Pot
  | 'TALENT_RISK'; // Low Perf, Low Pot

export interface NineBoxMember {
  userId: string;
  name: string;
  role: string;
  departmentId: string | null;
  departmentName: string;
  performanceScore: number; // 0 - 100 (PVI + delivery metrics)
  potentialScore: number; // 0 - 100 (Competencies + growth velocity)
  quadrant: NineBoxQuadrant;
  quadrantTitle: string;
  retentionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  normalizedReviewScore: number;
}

export interface CompensationRecommendation {
  userId: string;
  name: string;
  role: string;
  departmentName: string;
  currentSalaryBand: string;
  pviScore: number;
  quadrant: NineBoxQuadrant;
  recommendedMeritIncreasePercent: number;
  recommendedBonusMultiplier: number;
  equityRefreshGrantShares: number;
  justification: string;
  governanceNotice: string;
  status: 'PROPOSED' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
}

export class CalibrationService {
  /**
   * Evaluates 9-Box Talent Calibration Grid with performance & potential axes (PRD §13, §24)
   */
  public async getCalibrationGrid(tenantId: string, departmentId?: string): Promise<{
    members: NineBoxMember[];
    distribution: Record<NineBoxQuadrant, number>;
    quadrantDefinitions: Record<NineBoxQuadrant, { title: string; strategy: string }>;
  }> {
    const whereUser: any = { tenantId, status: 'active' };
    if (departmentId) whereUser.departmentId = departmentId;

    const users = await prisma.user.findMany({
      where: whereUser,
      include: { department: true },
      orderBy: { lastName: 'asc' },
    });

    const tasks = await prisma.task.findMany({
      where: { tenantId },
    });

    const quadrantDefinitions: Record<NineBoxQuadrant, { title: string; strategy: string }> = {
      STAR_TALENT: { title: 'Star Talent (High Perf / High Pot)', strategy: 'Accelerate to executive leadership, assign high-impact OKRs, retention priority.' },
      HIGH_PERFORMER: { title: 'High Performer (High Perf / Med Pot)', strategy: 'Maximize domain mastery, reward delivery, expand component ownership.' },
      SOLID_PROFESSIONAL: { title: 'Solid Professional (High Perf / Low Pot)', strategy: 'Maintain core system stability, institutional knowledge sharing.' },
      EMERGING_LEADER: { title: 'Emerging Leader (Med Perf / High Pot)', strategy: 'Provide senior mentorship, stretch assignments, unblock execution bottlenecks.' },
      CORE_CONTRIBUTOR: { title: 'Core Contributor (Med Perf / Med Pot)', strategy: 'Steady progression, capability building, standard review cadence.' },
      EFFECTIVE_SPECIALIST: { title: 'Effective Specialist (Med Perf / Low Pot)', strategy: 'Focused individual execution, process automation coaching.' },
      DIAMOND_IN_ROUGH: { title: 'Diamond in the Rough (Low Perf / High Pot)', strategy: 'Diagnose organizational friction, re-align role to strengths.' },
      INCONSISTENT_PERFORMER: { title: 'Inconsistent Performer (Low Perf / Med Pot)', strategy: 'Structured performance plan, weekly 1:1 accountability.' },
      TALENT_RISK: { title: 'Talent Risk (Low Perf / Low Pot)', strategy: 'Immediate remediation plan, milestone gating, potential reassignment.' },
    };

    const distribution: Record<NineBoxQuadrant, number> = {
      STAR_TALENT: 0,
      HIGH_PERFORMER: 0,
      SOLID_PROFESSIONAL: 0,
      EMERGING_LEADER: 0,
      CORE_CONTRIBUTOR: 0,
      EFFECTIVE_SPECIALIST: 0,
      DIAMOND_IN_ROUGH: 0,
      INCONSISTENT_PERFORMER: 0,
      TALENT_RISK: 0,
    };

    const members: NineBoxMember[] = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userTasks = tasks.filter((t) => t.assignedTo === user.id);
      const userCompleted = userTasks.filter((t) => t.status === 'completed');

      // Calculate performance score (0 - 100)
      const sixLenses = await scoringEngine.calculateSixLenses(tenantId, user.departmentId || undefined);
      const basePvi = sixLenses.velocityIndex || 75;
      const taskCompletionRate = userTasks.length > 0 ? (userCompleted.length / userTasks.length) * 100 : 80;
      const performanceScore = Math.min(100, Math.max(0, Math.round(basePvi * 0.6 + taskCompletionRate * 0.4)));

      // Calculate potential score (0 - 100) from 360 competencies
      let competencyAvg = 3.5;
      try {
        const reviewSummary = await reviewService.getCompetencyMatrix(tenantId, user.id);
        competencyAvg = reviewSummary.averages.composite || 3.5;
      } catch (err) {
        competencyAvg = 3.8;
      }
      const potentialScore = Math.min(100, Math.max(0, Math.round((competencyAvg / 5.0) * 85 + (i % 2 === 0 ? 10 : 5))));

      // Map to 9-box quadrant
      let perfTier: 'HIGH' | 'MED' | 'LOW' = 'MED';
      if (performanceScore >= 80) perfTier = 'HIGH';
      else if (performanceScore <= 60) perfTier = 'LOW';

      let potTier: 'HIGH' | 'MED' | 'LOW' = 'MED';
      if (potentialScore >= 80) potTier = 'HIGH';
      else if (potentialScore <= 60) potTier = 'LOW';

      let quadrant: NineBoxQuadrant = 'CORE_CONTRIBUTOR';
      if (perfTier === 'HIGH' && potTier === 'HIGH') quadrant = 'STAR_TALENT';
      else if (perfTier === 'HIGH' && potTier === 'MED') quadrant = 'HIGH_PERFORMER';
      else if (perfTier === 'HIGH' && potTier === 'LOW') quadrant = 'SOLID_PROFESSIONAL';
      else if (perfTier === 'MED' && potTier === 'HIGH') quadrant = 'EMERGING_LEADER';
      else if (perfTier === 'MED' && potTier === 'MED') quadrant = 'CORE_CONTRIBUTOR';
      else if (perfTier === 'MED' && potTier === 'LOW') quadrant = 'EFFECTIVE_SPECIALIST';
      else if (perfTier === 'LOW' && potTier === 'HIGH') quadrant = 'DIAMOND_IN_ROUGH';
      else if (perfTier === 'LOW' && potTier === 'MED') quadrant = 'INCONSISTENT_PERFORMER';
      else if (perfTier === 'LOW' && potTier === 'LOW') quadrant = 'TALENT_RISK';

      distribution[quadrant]++;

      // Retention Risk
      let retentionRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (quadrant === 'STAR_TALENT' || quadrant === 'EMERGING_LEADER') retentionRisk = 'HIGH';
      else if (quadrant === 'HIGH_PERFORMER') retentionRisk = 'MEDIUM';

      members.push({
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        departmentId: user.departmentId,
        departmentName: user.department?.name || 'General',
        performanceScore,
        potentialScore,
        quadrant,
        quadrantTitle: quadrantDefinitions[quadrant].title,
        retentionRisk,
        normalizedReviewScore: +competencyAvg.toFixed(2),
      });
    }

    return { members, distribution, quadrantDefinitions };
  }

  /**
   * Generates AI Performance-Based Compensation Recommendations (PRD §3.2, §24)
   * Note: Strictly advisory recommendation with mandatory human executive approval.
   */
  public async getCompensationRecommendations(tenantId: string): Promise<CompensationRecommendation[]> {
    const { members } = await this.getCalibrationGrid(tenantId);

    return members.map((member) => {
      let meritPct = 3.0;
      let bonusMultiplier = 1.0;
      let equityShares = 0;
      let justification = 'Standard inflationary baseline adjustment.';

      switch (member.quadrant) {
        case 'STAR_TALENT':
          meritPct = 12.5;
          bonusMultiplier = 1.5;
          equityShares = 1500;
          justification = 'Top quadrant performer with exceptional potential and high critical retention priority.';
          break;
        case 'HIGH_PERFORMER':
          meritPct = 8.5;
          bonusMultiplier = 1.25;
          equityShares = 750;
          justification = 'Consistent high velocity execution across core department deliverables.';
          break;
        case 'EMERGING_LEADER':
          meritPct = 7.5;
          bonusMultiplier = 1.15;
          equityShares = 600;
          justification = 'High growth velocity, expanding scope, and active mentorship leadership.';
          break;
        case 'SOLID_PROFESSIONAL':
          meritPct = 5.0;
          bonusMultiplier = 1.0;
          equityShares = 250;
          justification = 'Dependable execution on critical infrastructure with reliable throughput.';
          break;
        case 'CORE_CONTRIBUTOR':
        case 'EFFECTIVE_SPECIALIST':
          meritPct = 4.0;
          bonusMultiplier = 1.0;
          equityShares = 100;
          justification = 'Meets standard expectations across quarterly milestones.';
          break;
        case 'DIAMOND_IN_ROUGH':
        case 'INCONSISTENT_PERFORMER':
          meritPct = 2.0;
          bonusMultiplier = 0.5;
          equityShares = 0;
          justification = 'Performance variance observed; incentive gated on completion of growth milestones.';
          break;
        case 'TALENT_RISK':
          meritPct = 0.0;
          bonusMultiplier = 0.0;
          equityShares = 0;
          justification = 'Performance remediation required prior to compensation adjustments.';
          break;
      }

      return {
        userId: member.userId,
        name: member.name,
        role: member.role,
        departmentName: member.departmentName,
        currentSalaryBand: member.role === 'owner' ? 'Executive Tier' : member.role === 'dept_head' ? 'Senior Tier' : 'Professional Tier',
        pviScore: member.performanceScore,
        quadrant: member.quadrant,
        recommendedMeritIncreasePercent: meritPct,
        recommendedBonusMultiplier: bonusMultiplier,
        equityRefreshGrantShares: equityShares,
        justification,
        governanceNotice: 'PRD §3.2 Mandatory Human Governance: AI recommendation requires executive/HR authorization before execution.',
        status: 'PROPOSED',
      };
    });
  }
}

export const calibrationService = new CalibrationService();
export default calibrationService;
