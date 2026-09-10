export type UserRole = 'owner' | 'dept_head' | 'employee' | 'delegate' | 'auditor';

export type TaskStatus = 'pending' | 'in_progress' | 'proof_submitted' | 'approved' | 'rejected' | 'completed' | 'blocked';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type ProofType = 'link' | 'file' | 'metrics_snapshot' | 'code_pr' | 'document';

export type AIValidationStatus = 'unverified' | 'valid' | 'suspicious' | 'incomplete';

export type ExceptionSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ExceptionType = 'missed_deadline' | 'approval_stalled' | 'unassigned_high_priority' | 'continuity_gap' | 'low_discipline';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'suspended' | 'deleted';
  settings: {
    default_timezone: string;
    mfa_required_roles: UserRole[];
    max_proof_file_size_mb: number;
    auto_escalation_hours: number;
    scoring_weights: {
      task_completion: number;
      speed: number;
      discipline: number;
      attendance: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  parentId?: string;
  headUserId?: string;
  delegateUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  departmentId?: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  designation?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'deleted';
  mfaEnabled: boolean;
  failedLoginAttempts: number;
  lockoutUntil?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  targetMetric?: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  startDate: string;
  targetDate: string;
  status: 'active' | 'achieved' | 'at_risk' | 'missed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentPriority {
  id: string;
  tenantId: string;
  departmentId: string;
  goalId?: string;
  title: string;
  rankOrder: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskProof {
  id: string;
  tenantId: string;
  taskId: string;
  submittedBy: string;
  proofType: ProofType;
  proofUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  notes?: string;
  aiValidationStatus: AIValidationStatus;
  aiValidationNotes?: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvalStatus: 'pending' | 'accepted' | 'changes_requested';
}

export interface Task {
  id: string;
  tenantId: string;
  departmentId: string;
  priorityId?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  createdBy: string;
  approverId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  startedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  proofRequired: boolean;
  estimatedHours?: number;
  actualHours?: number;
  proofs?: TaskProof[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  userId: string;
  handoverUserId?: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  continuityActivated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyScore {
  id: string;
  tenantId: string;
  userId: string;
  departmentId: string;
  scoreDate: string;
  totalScore: number;
  taskCompletionScore: number;
  speedScore: number;
  disciplineScore: number;
  attendanceScore: number;
  tasksAssigned: number;
  tasksCompleted: number;
  proofsApproved: number;
  calculatedAt: string;
}

export interface SystemException {
  id: string;
  tenantId: string;
  departmentId?: string;
  taskId?: string;
  assignedUserId?: string;
  exceptionType: ExceptionType;
  severity: ExceptionSeverity;
  title: string;
  details?: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  actorId?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  payload?: any;
  createdAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
  departmentId?: string;
}
