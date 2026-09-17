import { prisma } from '../db/prisma';
import { scoringEngine } from './scoringEngine';

export interface UserCapacityRecord {
  userId: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  departmentName: string;
  weeklyCapacityHours: number;
  assignedTasksCount: number;
  activeWorkloadHours: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  utilizationPercentage: number;
  status: 'UNDER_ALLOCATED' | 'OPTIMAL' | 'HEAVY' | 'OVERLOADED';
  burnoutRisk: {
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    score: number; // 0 - 100
    factors: string[];
  };
}

export interface DepartmentCapacitySummary {
  departmentId: string;
  departmentName: string;
  headCount: number;
  totalCapacityHours: number;
  totalWorkloadHours: number;
  averageUtilizationPercentage: number;
  overloadedMembersCount: number;
  highBurnoutRiskCount: number;
}

export interface ScenarioSimulationParams {
  tenantId: string;
  departmentId?: string;
  headcountDelta: number; // e.g. +2 new hires or -1
  workloadMultiplier: number; // e.g. 1.25 for 25% scope increase
  deadlineAccelerationDays: number; // e.g. 14 days earlier
}

export interface ScenarioSimulationResult {
  currentHeadcount: number;
  simulatedHeadcount: number;
  currentWorkloadHours: number;
  simulatedWorkloadHours: number;
  currentAverageUtilization: number;
  simulatedAverageUtilization: number;
  projectedDeliveryRisk: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  estimatedCompletionVarianceDays: number;
  recommendations: string[];
}

export class CapacityService {
  /**
   * Retrieves capacity roster across all users with real task hours and burnout risk
   */
  public async getCapacityRoster(tenantId: string, departmentId?: string): Promise<{
    roster: UserCapacityRecord[];
    summary: DepartmentCapacitySummary[];
  }> {
    const whereUser: any = { tenantId, status: 'active' };
    if (departmentId) {
      whereUser.departmentId = departmentId;
    }

    const users = await prisma.user.findMany({
      where: whereUser,
      include: {
        department: true,
      },
      orderBy: { lastName: 'asc' },
    });

    const tasks = await prisma.task.findMany({
      where: {
        tenantId,
        status: { in: ['pending', 'in_progress', 'proof_submitted'] },
      },
    });

    const completedTasks = await prisma.task.findMany({
      where: {
        tenantId,
        status: 'completed',
      },
    });

    const now = new Date();
    const roster: UserCapacityRecord[] = users.map((user) => {
      const userTasks = tasks.filter((t) => t.assignedTo === user.id);
      const userCompleted = completedTasks.filter((t) => t.assignedTo === user.id);
      const overdueTasks = userTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now);

      const weeklyCapacityHours = 40; // Standard 40h baseline
      const activeWorkloadHours = userTasks.reduce((sum, t) => sum + (t.estimatedHours || 8), 0);
      const utilizationPercentage = Math.round((activeWorkloadHours / weeklyCapacityHours) * 100);

      let status: 'UNDER_ALLOCATED' | 'OPTIMAL' | 'HEAVY' | 'OVERLOADED' = 'OPTIMAL';
      if (utilizationPercentage < 60) status = 'UNDER_ALLOCATED';
      else if (utilizationPercentage <= 85) status = 'OPTIMAL';
      else if (utilizationPercentage <= 100) status = 'HEAVY';
      else status = 'OVERLOADED';

      // Burnout Risk calculation (PRD §15 FR-070, §16 Wellbeing safeguard)
      const burnoutFactors: string[] = [];
      let burnoutScore = 20; // baseline

      if (utilizationPercentage > 100) {
        burnoutScore += 45;
        burnoutFactors.push(`High active workload utilization (${utilizationPercentage}%)`);
      } else if (utilizationPercentage > 85) {
        burnoutScore += 25;
        burnoutFactors.push(`Heavy weekly allocation (${utilizationPercentage}%)`);
      }

      if (overdueTasks.length >= 2) {
        burnoutScore += 25;
        burnoutFactors.push(`${overdueTasks.length} overdue critical delivery tasks`);
      } else if (overdueTasks.length === 1) {
        burnoutScore += 10;
        burnoutFactors.push(`1 overdue task in backlog`);
      }

      if (userTasks.length >= 5) {
        burnoutScore += 15;
        burnoutFactors.push(`High context switching across ${userTasks.length} concurrent tasks`);
      }

      burnoutScore = Math.min(100, Math.max(0, burnoutScore));

      let burnoutLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (burnoutScore >= 80) burnoutLevel = 'CRITICAL';
      else if (burnoutScore >= 60) burnoutLevel = 'HIGH';
      else if (burnoutScore >= 40) burnoutLevel = 'MODERATE';

      return {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        departmentName: user.department?.name || 'Unassigned',
        weeklyCapacityHours,
        assignedTasksCount: userTasks.length,
        activeWorkloadHours,
        completedTasksCount: userCompleted.length,
        overdueTasksCount: overdueTasks.length,
        utilizationPercentage,
        status,
        burnoutRisk: {
          level: burnoutLevel,
          score: burnoutScore,
          factors: burnoutFactors.length > 0 ? burnoutFactors : ['Workload within healthy parameters'],
        },
      };
    });

    // Aggregate summary per department
    const deptMap: Map<string, UserCapacityRecord[]> = new Map();
    roster.forEach((r) => {
      const deptKey = r.departmentId || 'unassigned';
      if (!deptMap.has(deptKey)) deptMap.set(deptKey, []);
      deptMap.get(deptKey)!.push(r);
    });

    const summary: DepartmentCapacitySummary[] = Array.from(deptMap.entries()).map(([deptId, members]) => {
      const totalCapacityHours = members.reduce((sum, m) => sum + m.weeklyCapacityHours, 0);
      const totalWorkloadHours = members.reduce((sum, m) => sum + m.activeWorkloadHours, 0);
      const avgUtil = totalCapacityHours > 0 ? Math.round((totalWorkloadHours / totalCapacityHours) * 100) : 0;

      return {
        departmentId: deptId,
        departmentName: members[0].departmentName,
        headCount: members.length,
        totalCapacityHours,
        totalWorkloadHours,
        averageUtilizationPercentage: avgUtil,
        overloadedMembersCount: members.filter((m) => m.status === 'OVERLOADED').length,
        highBurnoutRiskCount: members.filter((m) => m.burnoutRisk.level === 'HIGH' || m.burnoutRisk.level === 'CRITICAL').length,
      };
    });

    return { roster, summary };
  }

  /**
   * Organizational Scenario Simulator (PRD §15 FR-071)
   */
  public async simulateScenario(params: ScenarioSimulationParams): Promise<ScenarioSimulationResult> {
    const { roster } = await this.getCapacityRoster(params.tenantId, params.departmentId);

    const currentHeadcount = roster.length || 1;
    const simulatedHeadcount = Math.max(1, currentHeadcount + params.headcountDelta);

    const currentWorkloadHours = roster.reduce((sum, r) => sum + r.activeWorkloadHours, 0) || 40;
    const simulatedWorkloadHours = Math.round(currentWorkloadHours * (params.workloadMultiplier || 1.0));

    const currentCapacityTotal = currentHeadcount * 40;
    const simulatedCapacityTotal = simulatedHeadcount * 40;

    const currentAverageUtilization = Math.round((currentWorkloadHours / currentCapacityTotal) * 100);
    const simulatedAverageUtilization = Math.round((simulatedWorkloadHours / simulatedCapacityTotal) * 100);

    let projectedDeliveryRisk: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL' = 'LOW';
    if (simulatedAverageUtilization > 120) projectedDeliveryRisk = 'CRITICAL';
    else if (simulatedAverageUtilization > 95) projectedDeliveryRisk = 'ELEVATED';
    else if (simulatedAverageUtilization > 75) projectedDeliveryRisk = 'MODERATE';

    // Estimate completion variance in days based on utilization and accelerated deadlines
    let estimatedCompletionVarianceDays = 0;
    if (simulatedAverageUtilization > 100) {
      estimatedCompletionVarianceDays = Math.round(((simulatedAverageUtilization - 100) / 10) * 3);
    } else if (simulatedAverageUtilization < 70) {
      estimatedCompletionVarianceDays = -Math.round(((70 - simulatedAverageUtilization) / 10) * 2);
    }

    if (params.deadlineAccelerationDays > 0) {
      estimatedCompletionVarianceDays += Math.round(params.deadlineAccelerationDays * 0.4);
    }

    const recommendations: string[] = [];
    if (simulatedAverageUtilization > 100) {
      recommendations.push(
        `Team capacity exceeds 100% (${simulatedAverageUtilization}%). Add ${Math.ceil(
          (simulatedWorkloadHours - simulatedCapacityTotal) / 40
        )} temporary staff or re-sequence milestones.`
      );
      recommendations.push('Enforce strict Orbit proof gating to prevent quality debt accumulation.');
    } else if (simulatedAverageUtilization < 60) {
      recommendations.push(`Surplus bandwidth detected (${simulatedAverageUtilization}% utilization). Safe to pull forward Q2 roadmap initiatives.`);
    } else {
      recommendations.push(`Optimal bandwidth balance projected at ${simulatedAverageUtilization}% utilization.`);
    }

    if (params.deadlineAccelerationDays > 10) {
      recommendations.push('Aggressive deadline shift: Activate Luminary proactive anomaly monitoring.');
    }

    return {
      currentHeadcount,
      simulatedHeadcount,
      currentWorkloadHours,
      simulatedWorkloadHours,
      currentAverageUtilization,
      simulatedAverageUtilization,
      projectedDeliveryRisk,
      estimatedCompletionVarianceDays,
      recommendations,
    };
  }
}

export const capacityService = new CapacityService();
export default capacityService;
