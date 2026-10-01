import { prisma } from '../db/prisma';

export interface CheckpointItem {
  id: string;
  tenantId: string;
  title: string;
  category: 'ARCHITECTURE_CHANGE' | 'BUDGET_ALLOCATION' | 'STRATEGIC_PIVOT' | 'PROMOTION_APPROVAL' | 'CONTINUITY_DELEGATION';
  description: string;
  requesterId: string;
  requesterName: string;
  departmentName: string;
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  evidenceAttachments: Array<{ name: string; url: string; verified: boolean }>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EVIDENCE_REQUESTED';
  decidedBy?: string;
  decidedByName?: string;
  decidedAt?: string;
  decisionNotes?: string;
  createdAt: string;
}

export interface DecisionRoomRecord {
  id: string;
  tenantId: string;
  title: string;
  context: string;
  selectedAlternative: string;
  alternativesConsidered: string[];
  assumptions: string[];
  evidenceCitations: string[];
  approverId: string;
  approverName: string;
  expectedOutcome: string;
  actualOutcome?: string;
  outcomeReviewDueDate: string;
  status: 'FINALIZED' | 'REVIEWED' | 'SUPERSEDED';
  createdAt: string;
  finalizedAt: string;
}

export class DecisionService {
  private memoryCheckpoints: Map<string, CheckpointItem> = new Map();
  private memoryDecisions: Map<string, DecisionRoomRecord> = new Map();

  constructor() {
    this.seedDefaultCheckpoints();
  }

  private seedDefaultCheckpoints() {
    const defaults: CheckpointItem[] = [
      {
        id: 'chk-001',
        tenantId: 'prism-enterprise-default',
        title: 'Multi-Region Sharding Infrastructure Deployment',
        category: 'ARCHITECTURE_CHANGE',
        description: 'Authorize zero-downtime deployment of secondary replication cluster in EU-Central with cross-region quorum failover.',
        requesterId: 'user-eng-1',
        requesterName: 'Alex Rivera',
        departmentName: 'Engineering',
        riskScore: 78,
        riskLevel: 'HIGH',
        riskFactors: [
          'Direct write quorum failover latency variance',
          'Database replication token synchronization during traffic peak',
          'Cross-region egress bandwidth cost multiplier',
        ],
        evidenceAttachments: [
          { name: 'Load_Testing_Proof.json', url: '/uploads/load_test_results.json', verified: true },
          { name: 'Failover_Simulation_Run.pdf', url: '/uploads/failover_sim.pdf', verified: true },
        ],
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'chk-002',
        tenantId: 'prism-enterprise-default',
        title: 'Q1 Performance Merit Compensation Pool Release',
        category: 'BUDGET_ALLOCATION',
        description: 'Authorize calibrated merit increase distribution ($145,000 pool) based on 9-box performance grid and PVI index.',
        requesterId: 'user-hr-1',
        requesterName: 'Elena Rostova',
        departmentName: 'People & HR',
        riskScore: 42,
        riskLevel: 'MEDIUM',
        riskFactors: ['Department budget variance threshold', 'Retention equity refresh pool allocation'],
        evidenceAttachments: [{ name: 'Calibrated_9Box_Roster.csv', url: '/api/v1/governance/calibration/export', verified: true }],
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ];

    defaults.forEach((c) => this.memoryCheckpoints.set(c.id, c));
  }

  /**
   * Retrieves all checkpoints for a tenant (PRD §13 FR-050)
   */
  public getCheckpoints(tenantId: string): CheckpointItem[] {
    const list = Array.from(this.memoryCheckpoints.values());
    return list.map((c) => ({ ...c, tenantId }));
  }

  /**
   * Executive Decision on a Checkpoint (Approve / Reject / Request Evidence)
   */
  public async decideCheckpoint(
    tenantId: string,
    checkpointId: string,
    actorId: string,
    actorName: string,
    decision: 'APPROVED' | 'REJECTED' | 'EVIDENCE_REQUESTED',
    decisionNotes?: string
  ): Promise<CheckpointItem> {
    let checkpoint = this.memoryCheckpoints.get(checkpointId);
    if (!checkpoint) {
      // Create if not found
      checkpoint = {
        id: checkpointId,
        tenantId,
        title: 'Executive Operational Checkpoint',
        category: 'ARCHITECTURE_CHANGE',
        description: 'High-impact decision authorization',
        requesterId: actorId,
        requesterName: actorName,
        departmentName: 'Executive',
        riskScore: 65,
        riskLevel: 'MEDIUM',
        riskFactors: ['Standard operational impact'],
        evidenceAttachments: [],
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      this.memoryCheckpoints.set(checkpointId, checkpoint);
    }

    checkpoint.status = decision;
    checkpoint.decidedBy = actorId;
    checkpoint.decidedByName = actorName;
    checkpoint.decidedAt = new Date().toISOString();
    checkpoint.decisionNotes = decisionNotes || `Decision recorded as ${decision}`;

    // Record immutable audit log entry
    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId,
        action: `CHECKPOINT_${decision}`,
        resourceType: 'CHECKPOINT',
        payload: JSON.stringify({
          checkpointId,
          title: checkpoint.title,
          decision,
          decisionNotes,
        }),
      },
    });

    return checkpoint;
  }

  /**
   * Captures an immutable record in the Executive Decision Room (PRD §13 FR-052)
   */
  public async recordDecision(
    tenantId: string,
    actorId: string,
    actorName: string,
    data: {
      title: string;
      context: string;
      selectedAlternative: string;
      alternativesConsidered: string[];
      assumptions: string[];
      evidenceCitations: string[];
      expectedOutcome: string;
      reviewDays?: number;
    }
  ): Promise<DecisionRoomRecord> {
    const id = `decision-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const reviewDays = data.reviewDays || 30;

    const record: DecisionRoomRecord = {
      id,
      tenantId,
      title: data.title,
      context: data.context,
      selectedAlternative: data.selectedAlternative,
      alternativesConsidered: data.alternativesConsidered || [],
      assumptions: data.assumptions || [],
      evidenceCitations: data.evidenceCitations || [],
      approverId: actorId,
      approverName: actorName,
      expectedOutcome: data.expectedOutcome,
      outcomeReviewDueDate: new Date(now.getTime() + reviewDays * 86400000).toISOString(),
      status: 'FINALIZED',
      createdAt: now.toISOString(),
      finalizedAt: now.toISOString(),
    };

    this.memoryDecisions.set(id, record);

    // Record in immutable audit log (PRD §13 FR-052)
    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId,
        action: 'DECISION_ROOM_FINALIZED',
        resourceType: 'DECISION_ROOM',
        payload: JSON.stringify({
          decisionId: id,
          title: record.title,
          selectedAlternative: record.selectedAlternative,
          expectedOutcome: record.expectedOutcome,
        }),
      },
    });

    return record;
  }

  /**
   * Retrieves all finalized decision room records (PRD §13 FR-053)
   */
  public getDecisions(tenantId: string): DecisionRoomRecord[] {
    const list = Array.from(this.memoryDecisions.values()).filter((d) => d.tenantId === tenantId);
    if (list.length === 0) {
      // Seed default decision record
      const defaultRecord: DecisionRoomRecord = {
        id: 'decision-seed-001',
        tenantId,
        title: 'Q1 Core Multi-Region Topology Selection',
        context: 'Evaluating active-active vs active-passive database architecture for 99.99% enterprise uptime SLA.',
        selectedAlternative: 'Active-Active Multi-Region with SQLite local read replicas and PostgreSQL master write consensus',
        alternativesConsidered: [
          'Single region PostgreSQL with cold standby backup',
          'Active-Active Multi-Region with synchronized write consensus',
          'Distributed CockroachDB cluster',
        ],
        assumptions: [
          'Global write latency remains below 45ms across primary VPC interconnects',
          'Read traffic accounts for >85% of total query volume',
        ],
        evidenceCitations: ['PROOF-7890 (Replication Benchmark)', 'OKRs: Pillar 1 Platform Resilience'],
        approverId: 'owner-seed-user',
        approverName: 'Alex Rivera (COO/Founder)',
        expectedOutcome: 'Zero-downtime failover with <100ms P95 latency across all global client nodes.',
        outcomeReviewDueDate: new Date(Date.now() + 20 * 86400000).toISOString(),
        status: 'FINALIZED',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        finalizedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      };
      this.memoryDecisions.set(defaultRecord.id, defaultRecord);
      return [defaultRecord];
    }
    return list;
  }
}

export const decisionService = new DecisionService();
export default decisionService;
