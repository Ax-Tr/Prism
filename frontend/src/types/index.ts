export type UserRole =
  | 'CEO'
  | 'DEPT_HEAD'
  | 'MANAGER'
  | 'EMPLOYEE'
  | 'owner'
  | 'super_admin'
  | 'executive'
  | 'dept_head'
  | 'manager'
  | 'employee'
  | 'delegate'
  | 'hr'
  | 'auditor'
  | 'ai_admin'
  | 'sys_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  title: string;
  avatar: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatar: string;
  bandwidthLoad: number; // percentage e.g. 85
  focusArea: string;
  activeTasksCount: number;
  skills: string[];
  bio?: string;
  location?: string;
  oneOnOneNotes?: {
    lastMeeting: string;
    actionItems: string[];
    talkingPoints: string[];
  };
}

export type TaskStatus = 'DORMANT' | 'IN_FLUX' | 'ORBIT' | 'TRANSMITTED';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  department: string;
  points: number;
  estimatedHours: number;
  loggedHours: number;
  subtasks: TaskSubtask[];
}

export interface KPI {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  weight: number;
  status: 'on_track' | 'at_risk' | 'behind';
  category: string;
}

export interface SanctumSettings {
  autonomyVsAlignment: number; // 0 to 100
  analyticalVsIntuitive: number; // 0 to 100
  communicationFrequency: 'Realtime' | 'Daily Digest' | 'Weekly Brief';
  workStyle: 'Deep Work Focused' | 'Hyper Collaborative' | 'Balanced';
  aiAvatarPersona: string;
  autonomyLevel?: 'ADVISORY' | 'COLLABORATIVE' | 'AUTONOMOUS';
  communicationTone?: 'EXECUTIVE_CONCISE' | 'STRATEGIC_DETAILED' | 'SOCRATIC_COACHING';
  confidenceThreshold?: number;
  evidenceEnforcement?: boolean;
  dataMinimization?: boolean;
}

export interface Review360 {
  id: string;
  reviewer: string;
  reviewee: string;
  relation: 'Peer' | 'Manager' | 'Direct Report';
  date: string;
  scores: {
    communication: number;
    technical: number;
    leadership: number;
    collaboration: number;
    innovation: number;
  };
  strengths: string;
  improvements: string;
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Present' | 'Remote' | 'On Leave' | 'Absent';
  checkInTime?: string;
  anomalyFlag?: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  phase: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  progress: number; // 0 to 100
  targetDate: string;
  leadPerson: string;
  dependencies: string[];
}

export interface CheckpointApproval {
  id: string;
  title: string;
  category: 'Architectural' | 'Financial' | 'Deployment' | 'Strategic';
  urgency: 'URGENT' | 'HIGH' | 'ROUTINE';
  requestedBy: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  impactSummary: string;
  riskScore: number;
}

export interface SynthesisReport {
  id: string;
  title: string;
  date: string;
  executionVelocityScore: number; // e.g. 73
  aiNarrativeSummary: string;
  highlights: string[];
  risks: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'urgent' | 'warning' | 'info';
  read: boolean;
}

export interface GroundedEvidenceCitation {
  id: string;
  type: string;
  title: string;
  confidenceScore: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'luminary';
  text: string;
  timestamp: string;
  recommendations?: string[];
  evidenceCitations?: GroundedEvidenceCitation[];
  confidenceScore?: number;
  autonomyLevel?: string;
  governanceStatus?: string;
  model?: string;
}

export interface GenesisConfig {
  companyName: string;
  industry: string;
  mission: string;
  departments: string[];
  luminaryPersona: string;
  completed: boolean;
}
