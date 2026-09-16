import { Employee, Task, KPI, Review360, AttendanceLog, RoadmapNode, CheckpointApproval, SynthesisReport, NotificationItem, User } from '../types';
import { LIVE_EMPLOYEES } from './liveEmployees';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Aarav Sharma',
    email: 'ceo@nexora.com',
    role: 'CEO',
    department: 'Executive',
    title: 'Chief Executive Officer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 'u2',
    name: 'Priya Patel',
    email: 'priya@nexora.com',
    role: 'DEPT_HEAD',
    department: 'User Experience',
    title: 'VP of Product Design',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 'u3',
    name: 'Arjun Sharma',
    email: 'arjun@nexora.com',
    role: 'MANAGER',
    department: 'Core Architecture',
    title: 'Senior Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 'u4',
    name: 'Ravi Verma',
    email: 'ravi@nexora.com',
    role: 'EMPLOYEE',
    department: 'Data Infrastructure',
    title: 'Backend Developer',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=1080&auto=format&fit=crop'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = LIVE_EMPLOYEES.map((e: any) => ({
  id: e.id,
  name: e.name,
  role: e.role,
  department: e.department,
  email: `${e.name.toLowerCase().replace(/\s+/g, '.')}@nexora.com`,
  avatar: e.avatar,
  bandwidthLoad: e.performanceScore || 85,
  focusArea: e.recentFeedback || 'Core Platform Architecture & Scaling',
  activeTasksCount: e.skills?.length || 4,
  skills: e.skills || ['Architecture', 'TypeScript', 'React', 'Cloud'],
  bio: `${e.role} in ${e.department} at Nexora Prism. Stage: ${e.stage || 'Established'}.`,
  location: 'Bengaluru / Hybrid',
  oneOnOneNotes: {
    lastMeeting: '12 Oct 2026',
    actionItems: ['Review quarterly milestones', 'Finalize system design review'],
    talkingPoints: ['Career progression', 'Sprint bandwidth optimization']
  }
}));

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-101',
    title: 'Migrate Session Token to Rotating Refresh Token',
    description: 'Security enhancement to minimize stolen token replay attacks using HMAC signature verification.',
    status: 'IN_FLUX',
    priority: 'CRITICAL',
    assigneeId: 'e1',
    assigneeName: 'Arjun Sharma',
    assigneeAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1080&auto=format&fit=crop',
    department: 'Core Architecture',
    points: 120,
    estimatedHours: 8,
    loggedHours: 5.5,
    subtasks: [
      { id: 'st-1', title: 'Implement Redis token blocklist', completed: true },
      { id: 'st-2', title: 'Update AuthContext interceptors', completed: true },
      { id: 'st-3', title: 'Add rotation unit tests', completed: false },
    ],
  },
  {
    id: 't-102',
    title: 'Design Glassmorphism Spectrum Lens Tokens',
    description: 'Complete HSL color mapping for Output, Risk, Return, Growth, Presence, and Wellbeing lenses.',
    status: 'TRANSMITTED',
    priority: 'HIGH',
    assigneeId: 'e2',
    assigneeName: 'Neha Gupta',
    assigneeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1080&auto=format&fit=crop',
    department: 'User Experience',
    points: 90,
    estimatedHours: 6,
    loggedHours: 6,
    subtasks: [
      { id: 'st-4', title: 'Create Tailwind color palette', completed: true },
      { id: 'st-5', title: 'Export Figma design tokens', completed: true },
    ],
  },
  {
    id: 't-103',
    title: 'PostgreSQL Multi-Tenant Schema Validation',
    description: 'Enforce tenant_id isolation in all raw queries and Prisma middleware.',
    status: 'ORBIT',
    priority: 'CRITICAL',
    assigneeId: 'e3',
    assigneeName: 'Vikram Singh',
    assigneeAvatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=1080&auto=format&fit=crop',
    department: 'Data Infrastructure',
    points: 150,
    estimatedHours: 12,
    loggedHours: 10,
    subtasks: [
      { id: 'st-6', title: 'Write tenant isolation middleware', completed: true },
      { id: 'st-7', title: 'Simulate cross-tenant leak attempt', completed: true },
      { id: 'st-8', title: 'Submit proof of verification', completed: true },
    ],
  },
  {
    id: 't-104',
    title: 'Real-time WebSocket Telemetry Feed',
    description: 'Stream live performance scores and team activity signals to Spectrum dashboard.',
    status: 'DORMANT',
    priority: 'MEDIUM',
    assigneeId: 'e6',
    assigneeName: 'Aditya Kumar',
    assigneeAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1080&auto=format&fit=crop',
    department: 'Data Infrastructure',
    points: 80,
    estimatedHours: 5,
    loggedHours: 0,
    subtasks: [
      { id: 'st-9', title: 'Setup WebSocket gateway in Express', completed: false },
      { id: 'st-10', title: 'Connect frontend subscriber hook', completed: false },
    ],
  },
];

export const INITIAL_KPIS: KPI[] = [
  {
    id: 'kpi-1',
    name: 'Platform Engineering Velocity',
    target: 95,
    current: 92,
    unit: 'pts',
    trend: 'up',
    weight: 1.2,
    status: 'on_track',
    category: 'Core Engineering',
  },
  {
    id: 'kpi-2',
    name: 'Security & Auth Reliability',
    target: 99.9,
    current: 99.98,
    unit: '%',
    trend: 'up',
    weight: 1.5,
    status: 'on_track',
    category: 'Security & Compliance',
  },
  {
    id: 'kpi-3',
    name: 'Team Capacity Utilization',
    target: 85,
    current: 82,
    unit: '%',
    trend: 'stable',
    weight: 1.0,
    status: 'on_track',
    category: 'Human Capital',
  },
  {
    id: 'kpi-4',
    name: 'Tenant Data Isolation SLA',
    target: 100,
    current: 100,
    unit: '%',
    trend: 'up',
    weight: 2.0,
    status: 'on_track',
    category: 'Security & Compliance',
  },
];

export const INITIAL_REVIEWS_360: Review360[] = [
  {
    id: 'rev-1',
    reviewer: 'Neha Gupta',
    reviewee: 'Arjun Sharma',
    relation: 'Peer',
    date: '2026-10-15',
    scores: {
      technical: 95,
      communication: 88,
      leadership: 92,
      innovation: 94,
      collaboration: 96,
    },
    strengths: 'Outstanding architecture foresight and mentoring of junior engineers.',
    improvements: 'Can delegate more implementation tasks to focus on strategic roadmap.',
  },
  {
    id: 'rev-2',
    reviewer: 'Arjun Sharma',
    reviewee: 'Vikram Singh',
    relation: 'Manager',
    date: '2026-10-18',
    scores: {
      technical: 90,
      communication: 85,
      leadership: 82,
      innovation: 88,
      collaboration: 92,
    },
    strengths: 'Strong database optimization and reliable API delivery.',
    improvements: 'Improve cross-functional documentation for frontend consumers.',
  },
];

export const INITIAL_ATTENDANCE: AttendanceLog[] = [
  {
    id: 'att-1',
    employeeId: 'e1',
    employeeName: 'Arjun Sharma',
    date: '2026-11-03',
    checkInTime: '09:15 AM',
    status: 'Present',
  },
  {
    id: 'att-2',
    employeeId: 'e2',
    employeeName: 'Neha Gupta',
    date: '2026-11-03',
    checkInTime: '09:30 AM',
    status: 'Remote',
  },
  {
    id: 'att-3',
    employeeId: 'e3',
    employeeName: 'Vikram Singh',
    date: '2026-11-03',
    checkInTime: '09:00 AM',
    status: 'Present',
  },
];

export const INITIAL_ROADMAP: RoadmapNode[] = [
  {
    id: 'rm-1',
    title: 'Enterprise Single-Sign-On & MFA',
    phase: 'Q1 2026',
    status: 'completed',
    leadPerson: 'Arjun Sharma',
    targetDate: '2026-03-31',
    progress: 100,
    dependencies: [],
  },
  {
    id: 'rm-2',
    title: 'Prism Multi-Tenant RLS Database Grid',
    phase: 'Q2 2026',
    status: 'in_progress',
    leadPerson: 'Vikram Singh',
    targetDate: '2026-06-30',
    progress: 75,
    dependencies: ['rm-1'],
  },
  {
    id: 'rm-3',
    title: 'AI Luminary Co-Pilot Executive Synthesis',
    phase: 'Q3 2026',
    status: 'upcoming',
    leadPerson: 'Aditya Kumar',
    targetDate: '2026-09-30',
    progress: 30,
    dependencies: ['rm-2'],
  },
];

export const INITIAL_APPROVALS: CheckpointApproval[] = [
  {
    id: 'appr-1',
    title: 'Proof Review: Multi-Tenant Tenant Isolation Middleware',
    category: 'Deployment',
    urgency: 'HIGH',
    requestedBy: 'Vikram Singh',
    date: '16 Sep 2026',
    status: 'PENDING',
    impactSummary: 'Verification of RLS constraints and Prisma query interceptors.',
    riskScore: 25,
  },
  {
    id: 'appr-2',
    title: 'Checkpoint Review: Spectrum Lens Color Calibration Tokens',
    category: 'Architectural',
    urgency: 'ROUTINE',
    requestedBy: 'Neha Gupta',
    date: '15 Sep 2026',
    status: 'APPROVED',
    impactSummary: 'Harmonized 6-lens visual design system for dark/light themes.',
    riskScore: 10,
  },
];

export const INITIAL_SYNTHESIS_REPORTS: SynthesisReport[] = [
  {
    id: 'syn-1',
    title: 'Q3 Operational Velocity & Engineering Throughput',
    date: '16 Sep 2026',
    executionVelocityScore: 92,
    aiNarrativeSummary: 'Engineering velocity rose 14% month-over-month. Security compliance is at 99.98% SLA with zero unauthorized cross-tenant alerts.',
    highlights: [
      'Multi-tenant database migration completed ahead of schedule',
      'Bandwidth across Core Architecture remains balanced at 88% capacity',
      'Zero unauthorized cross-tenant security alerts detected'
    ],
    risks: [
      'Sprint bandwidth bottleneck if 2 critical deployments coincide'
    ],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Checkpoint Signoff Pending',
    message: 'Vikram Singh submitted proof for Multi-Tenant Schema Validation.',
    timestamp: '10m ago',
    type: 'warning',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Luminary Grid Synchronized',
    message: 'All 8 team member telemetry streams are active and calibrated.',
    timestamp: '1h ago',
    type: 'info',
    read: true,
  },
];
