import { prisma } from '../db/prisma';

export interface ScoringWeights {
  task_completion: number;
  speed: number;
  discipline: number;
  attendance: number;
}

export interface UserScoreBreakdown {
  userId: string;
  departmentId: string | null;
  totalScore: number;
  taskCompletionScore: number;
  speedScore: number;
  disciplineScore: number;
  attendanceScore: number;
  tasksAssigned: number;
  tasksCompleted: number;
  proofsApproved: number;
}

export class ScoringEngine {
  /**
   * Calculates daily performance score for a specific user within a tenant
   */
  public async calculateUserScore(tenantId: string, userId: string, _scoreDate: string): Promise<UserScoreBreakdown> {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new Error(`User ${userId} not found in tenant ${tenantId}`);
    }

    // 1. Fetch Tenant Scoring Weights
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    let weights: ScoringWeights = {
      task_completion: 0.4,
      speed: 0.2,
      discipline: 0.2,
      attendance: 0.2,
    };

    if (tenant?.settings) {
      try {
        const parsed = typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings;
        if (parsed.scoring_weights) {
          weights = { ...weights, ...parsed.scoring_weights };
        }
      } catch (e) {
        console.warn('Failed to parse tenant scoring weights, using defaults');
      }
    }

    // 2. Fetch User Tasks
    const userTasks = await prisma.task.findMany({
      where: { tenantId, assignedTo: userId },
      include: { proofs: true },
    });

    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter((t: any) => t.status === 'completed');
    const now = new Date();

    // 2a. Task Completion Score
    let taskCompletionScore = 95.0;
    if (totalTasks > 0) {
      taskCompletionScore = Math.min(100, Math.round((completedTasks.length / totalTasks) * 100));
    }

    // 2b. Speed Score (Adherence to Due Dates)
    let speedScore = 95.0;
    if (totalTasks > 0) {
      let speedPoints = 0;
      for (const t of userTasks) {
        const due = new Date(t.dueDate);
        if (t.status === 'completed' && t.completedAt) {
          const completed = new Date(t.completedAt);
          if (completed <= due) {
            speedPoints += 100;
          } else {
            const diffHours = (completed.getTime() - due.getTime()) / (1000 * 60 * 60);
            speedPoints += diffHours <= 24 ? 80 : 50;
          }
        } else if (t.status === 'in_progress' || t.status === 'pending') {
          if (now > due) {
            speedPoints += 50; // overdue penalty
          } else {
            speedPoints += 90; // on track
          }
        } else {
          speedPoints += 85;
        }
      }
      speedScore = Math.round(speedPoints / totalTasks);
    }

    // 2c. Discipline Score (Proof Submissions and Approvals)
    let disciplineScore = 94.0;
    let proofsApprovedCount = 0;

    const tasksRequiringProof = userTasks.filter((t: any) => t.proofRequired);
    if (tasksRequiringProof.length > 0) {
      let disciplinePoints = 0;
      for (const t of tasksRequiringProof) {
        const proofs = t.proofs;
        if (proofs.length === 0) {
          if (t.status === 'completed') {
            disciplinePoints += 40; // completed without submitted proof
          } else {
            disciplinePoints += 80; // work in progress
          }
        } else {
          const accepted = proofs.filter((p: any) => p.approvalStatus === 'accepted');
          const pending = proofs.filter((p: any) => p.approvalStatus === 'pending');
          proofsApprovedCount += accepted.length;

          if (accepted.length > 0) {
            disciplinePoints += 100;
          } else if (pending.length > 0) {
            disciplinePoints += 90;
          } else {
            disciplinePoints += 65; // changes requested
          }
        }
      }
      disciplineScore = Math.round(disciplinePoints / tasksRequiringProof.length);
    }

    // 2d. Attendance Score
    let attendanceScore = 98.0;
    if (user.status === 'on_leave') {
      const activeLeave = await prisma.leaveRequest.findFirst({
        where: { tenantId, userId, status: 'approved' },
      });
      attendanceScore = activeLeave?.continuityActivated ? 88.0 : 75.0;
    } else if (user.status === 'inactive') {
      attendanceScore = 50.0;
    }

    // 3. Weighted Total Calculation
    const totalWeight = weights.task_completion + weights.speed + weights.discipline + weights.attendance;
    const weightedSum =
      taskCompletionScore * weights.task_completion +
      speedScore * weights.speed +
      disciplineScore * weights.discipline +
      attendanceScore * weights.attendance;

    const totalScore = parseFloat((weightedSum / (totalWeight || 1.0)).toFixed(1));

    return {
      userId,
      departmentId: user.departmentId,
      totalScore,
      taskCompletionScore,
      speedScore,
      disciplineScore,
      attendanceScore,
      tasksAssigned: totalTasks,
      tasksCompleted: completedTasks.length,
      proofsApproved: proofsApprovedCount,
    };
  }

  /**
   * Recalculates and persists daily scores for all active users in a tenant
   */
  public async calculateTenantDailyScores(tenantId: string, scoreDate: string) {
    const activeUsers = await prisma.user.findMany({
      where: { tenantId, status: { in: ['active', 'on_leave'] } },
    });

    const results = [];

    for (const user of activeUsers) {
      const score = await this.calculateUserScore(tenantId, user.id, scoreDate);

      const saved = await prisma.dailyScore.upsert({
        where: {
          tenantId_userId_scoreDate: {
            tenantId,
            userId: user.id,
            scoreDate,
          },
        },
        update: {
          totalScore: score.totalScore,
          taskCompletionScore: score.taskCompletionScore,
          speedScore: score.speedScore,
          disciplineScore: score.disciplineScore,
          attendanceScore: score.attendanceScore,
          tasksAssigned: score.tasksAssigned,
          tasksCompleted: score.tasksCompleted,
          proofsApproved: score.proofsApproved,
          calculatedAt: new Date(),
        },
        create: {
          tenantId,
          userId: user.id,
          departmentId: score.departmentId,
          scoreDate,
          totalScore: score.totalScore,
          taskCompletionScore: score.taskCompletionScore,
          speedScore: score.speedScore,
          disciplineScore: score.disciplineScore,
          attendanceScore: score.attendanceScore,
          tasksAssigned: score.tasksAssigned,
          tasksCompleted: score.tasksCompleted,
          proofsApproved: score.proofsApproved,
        },
      });

      results.push(saved);
    }

    return results;
  }
}

export const scoringEngine = new ScoringEngine();
export default scoringEngine;
