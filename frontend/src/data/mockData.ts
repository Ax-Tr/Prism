import { Employee, Task, KPI, Review360, AttendanceLog, RoadmapNode, CheckpointApproval, SynthesisReport, NotificationItem, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Aarav Sharma',
    email: 'ceo@nexora.com',
    role: 'CEO',
    department: 'Executive',
    title: 'Chief Executive Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'u2',
    name: 'Neha Gupta',
    email: 'engineering@nexora.com',
    role: 'DEPT_HEAD',
    department: 'Engineering',
    title: 'VP of Engineering',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'u3',
    name: 'Vikram Singh',
    email: 'product@nexora.com',
    role: 'DEPT_HEAD',
    department: 'Product',
    title: 'Head of Product',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'u4',
    name: 'Arjun Sharma',
    email: 'arjun@nexora.com',
    role: 'MANAGER',
    department: 'Engineering',
    title: 'Lead Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: 'Arjun Sharma',
    role: 'Lead Architect',
    department: 'Engineering',
    email: 'arjun@nexora.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    bandwidthLoad: 88,
    focusArea: 'Auth Service Migration & Security Hardening',
    activeTasksCount: 4,
    skills: ['React 19', 'TypeScript', 'PostgreSQL', 'System Architecture', 'Rust'],
    bio: 'Pioneering distributed infrastructure and security frameworks for Nexora Prism.',
    location: 'Bengaluru / Hybrid',
    oneOnOneNotes: {
      lastMeeting: '02 Nov 2026',
      actionItems: ['Finalize OAuth 2.1 pkce flow', 'Review junior dev PRs for API gateway'],
      talkingPoints: ['Career progression to Staff Engineer', 'Capacity management for Q4']
    }
  },
  {
    id: 'e2',
    name: 'Neha Gupta',
    role: 'VP of Engineering',
    department: 'Engineering',
    email: 'neha@nexora.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    bandwidthLoad: 75,
    focusArea: 'Engineering Ops & Resource Allocation',
    activeTasksCount: 3,
    skills: ['Leadership', 'Engineering Management', 'CI/CD', 'Cloud Infra'],
    location: 'Delhi / Remote'
  },
  {
    id: 'e3',
    name: 'Vikram Singh',
    role: 'Head of Product',
    department: 'Product',
    email: 'vikram@nexora.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    bandwidthLoad: 82,
    focusArea: 'Roadmap Refinement & User Analytics',
    activeTasksCount: 5,
    skills: ['Product Strategy', 'OKR Framing', 'User Journey Mapping', 'A/B Testing'],
    location: 'Mumbai / Onsite'
  },
  {
    id: 'e4',
    name: 'Kavya Reddy',
    role: 'Lead UX Designer',
    department: 'Design',
    email: 'kavya@nexora.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    bandwidthLoad: 92,
    focusArea: 'Design System v2 & Glassmorphic UI Tokens',
    activeTasksCount: 6,
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Micro-interactions'],
    location: 'Hyderabad / Hybrid'
  },
  {
    id: 'e5',
    name: 'Rohan Mehta',
    role: 'Senior Backend Engineer',
    department: 'Engineering',
    email: 'rohan@nexora.com',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    bandwidthLoad: 68,
    focusArea: 'Database Query Optimization & Caching',
    activeTasksCount: 3,
    skills: ['Node.js', 'Redis', 'GraphQL', 'Docker', 'Kubernetes'],
    location: 'Bengaluru / Remote'
  },
  {
    id: 'e6',
    name: 'Aditya Kumar',
    role: 'AI / ML Specialist',
    department: 'Data & AI',
    email: 'aditya@nexora.com',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    bandwidthLoad: 85,
    focusArea: 'Luminary COO LLM Prompt Tuning & RAG Integration',
    activeTasksCount: 4,
    skills: ['PyTorch', 'LLMs', 'Vector Databases', 'Python', 'Prompt Engineering'],
    location: 'Pune / Remote'
  },
  {
    id: 'e7',
    name: 'Ananya Reddy',
    role: 'Product Marketing Manager',
    department: 'Marketing',
    email: 'ananya@nexora.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    bandwidthLoad: 64,
    focusArea: 'Q4 GTM Launch Strategy & Positioning',
    activeTasksCount: 2,
    skills: ['GTM Strategy', 'Copywriting', 'SEO', 'Product Launches'],
    location: 'Bengaluru / Hybrid'
  },
  {
    id: 'e8',
    name: 'Karan Patel',
    role: 'DevOps & Security Specialist',
    department: 'Engineering',
    email: 'karan@nexora.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    bandwidthLoad: 78,
    focusArea: 'Zero-Trust Architecture & CI/CD Pipeline Automation',
    activeTasksCount: 4,
    skills: ['Terraform', 'AWS', 'Cybersecurity', 'DevSecOps', 'Prometheus'],
    location: 'Ahmedabad / Remote'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'OAuth 2.1 PKCE Flow Implementation',
    description: 'Enforce PKCE flow across all client authentication endpoints to secure mobile and SPA tokens.',
    status: 'IN_FLUX',
    priority: 'CRITICAL',
    assigneeId: 'e1',
    assigneeName: 'Arjun Sharma',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    department: 'Engineering',
    points: 8,
    estimatedHours: 24,
    loggedHours: 18,
    subtasks: [
      { id: 'st1', title: 'Update Auth Server spec', completed: true },
      { id: 'st2', title: 'Implement PKCE challenge validation', completed: true },
      { id: 'st3', title: 'Integration testing with frontend SPA', completed: false }
    ]
  },
  {
    id: 't2',
    title: 'Design System v2 Glass Tokens',
    description: 'Refactor Tailwind configuration and base components to utilize refined glassmorphism theme tokens.',
    status: 'IN_FLUX',
    priority: 'HIGH',
    assigneeId: 'e4',
    assigneeName: 'Kavya Reddy',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    department: 'Design',
    points: 5,
    estimatedHours: 16,
    loggedHours: 12,
    subtasks: [
      { id: 'st4', title: 'Color palette definition', completed: true },
      { id: 'st5', title: 'Component backdrop-blur audit', completed: false }
    ]
  },
  {
    id: 't3',
    title: 'Luminary RAG Context Pipeline',
    description: 'Connect internal vector database index to Luminary AI COO engine for real-time task synthesis.',
    status: 'ORBIT',
    priority: 'CRITICAL',
    assigneeId: 'e6',
    assigneeName: 'Aditya Kumar',
    assigneeAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    department: 'Data & AI',
    points: 13,
    estimatedHours: 40,
    loggedHours: 38,
    subtasks: [
      { id: 'st6', title: 'Vector embeddings extraction', completed: true },
      { id: 'st7', title: 'Cosine similarity ranking', completed: true }
    ]
  },
  {
    id: 't4',
    title: 'PostgreSQL Read Replica Setup',
    description: 'Provision multi-region read replicas to decrease query latency for analytical dashboard requests.',
    status: 'DORMANT',
    priority: 'MEDIUM',
    assigneeId: 'e5',
    assigneeName: 'Rohan Mehta',
    assigneeAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    department: 'Engineering',
    points: 5,
    estimatedHours: 20,
    loggedHours: 0,
    subtasks: [
      { id: 'st8', title: 'AWS RDS Replica configuration', completed: false }
    ]
  },
  {
    id: 't5',
    title: 'Zero-Trust Network Perimeter Audit',
    description: 'Execute automated dependency scan and penetration test on public ingress points.',
    status: 'TRANSMITTED',
    priority: 'HIGH',
    assigneeId: 'e8',
    assigneeName: 'Karan Patel',
    assigneeAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    department: 'Engineering',
    points: 3,
    estimatedHours: 12,
    loggedHours: 12,
    subtasks: [
      { id: 'st9', title: 'Vulnerability scan output review', completed: true }
    ]
  }
];

export const INITIAL_KPIS: KPI[] = [
  {
    id: 'k1',
    name: 'Code Review Turnaround',
    target: 24,
    current: 18,
    unit: 'hrs',
    trend: 'up',
    weight: 25,
    status: 'on_track',
    category: 'Engineering'
  },
  {
    id: 'k2',
    name: 'Sprint Velocity',
    target: 42,
    current: 47,
    unit: 'pts',
    trend: 'up',
    weight: 30,
    status: 'on_track',
    category: 'Product'
  },
  {
    id: 'k3',
    name: 'Bug Escape Rate',
    target: 2.0,
    current: 1.2,
    unit: '%',
    trend: 'up',
    weight: 20,
    status: 'on_track',
    category: 'Quality'
  },
  {
    id: 'k4',
    name: 'Documentation Coverage',
    target: 90,
    current: 87,
    unit: '%',
    trend: 'stable',
    weight: 15,
    status: 'at_risk',
    category: 'Engineering'
  },
  {
    id: 'k5',
    name: 'Mentorship & 1:1 Cadence',
    target: 4,
    current: 4,
    unit: 'hrs/mo',
    trend: 'stable',
    weight: 10,
    status: 'on_track',
    category: 'People'
  }
];

export const INITIAL_REVIEWS_360: Review360[] = [
  {
    id: 'r1',
    reviewer: 'Neha Gupta',
    reviewee: 'Arjun Sharma',
    relation: 'Peer',
    date: 'Nov 2026',
    scores: {
      communication: 92,
      technical: 96,
      leadership: 88,
      collaboration: 90,
      innovation: 95
    },
    strengths: 'Arjun consistently delivers exceptional architecture specs. His auth service refactoring plan was incredibly thorough.',
    improvements: 'Could delegate more junior task reviews to free up strategic planning bandwidth.'
  },
  {
    id: 'r2',
    reviewer: 'Vikram Singh',
    reviewee: 'Kavya Reddy',
    relation: 'Peer',
    date: 'Oct 2026',
    scores: {
      communication: 95,
      technical: 90,
      leadership: 92,
      collaboration: 94,
      innovation: 98
    },
    strengths: 'Outstanding design vision and rapid turnaround on design system v2 interactive tokens.',
    improvements: 'Ensure accessibility audit comments are flagged in Figma components before design handoff.'
  }
];

export const INITIAL_ATTENDANCE: AttendanceLog[] = [
  { id: 'a1', employeeId: 'e1', employeeName: 'Arjun Sharma', date: '2026-11-08', status: 'Present', checkInTime: '09:14 AM' },
  { id: 'a2', employeeId: 'e2', employeeName: 'Neha Gupta', date: '2026-11-08', status: 'Remote', checkInTime: '08:50 AM' },
  { id: 'a3', employeeId: 'e3', employeeName: 'Vikram Singh', date: '2026-11-08', status: 'Present', checkInTime: '09:05 AM' },
  { id: 'a4', employeeId: 'e4', employeeName: 'Kavya Reddy', date: '2026-11-08', status: 'Present', checkInTime: '09:30 AM' },
  { id: 'a5', employeeId: 'e5', employeeName: 'Rohan Mehta', date: '2026-11-12', status: 'On Leave', anomalyFlag: 'Mass absence on Nov 12 - 38% of team on leave. Investigate team morale & upcoming sprint deadline.' }
];

export const INITIAL_ROADMAP: RoadmapNode[] = [
  { id: 'm1', title: 'Authentication Service Core', phase: 'Phase 1', status: 'completed', progress: 100, targetDate: '15 Oct', leadPerson: 'Arjun S.', dependencies: [] },
  { id: 'm2', title: 'Design System v2 Refactor', phase: 'Phase 1', status: 'completed', progress: 100, targetDate: '30 Oct', leadPerson: 'Kavya R.', dependencies: [] },
  { id: 'm3', title: 'API Gateway & Rate Limiting', phase: 'Phase 2', status: 'in_progress', progress: 75, targetDate: '20 Nov', leadPerson: 'Rohan M.', dependencies: ['m1'] },
  { id: 'm4', title: 'Luminary AI COO RAG Engine', phase: 'Phase 2', status: 'in_progress', progress: 60, targetDate: '30 Nov', leadPerson: 'Aditya K.', dependencies: ['m1', 'm3'] },
  { id: 'm5', title: 'Beta Customer Onboarding', phase: 'Phase 3', status: 'upcoming', progress: 15, targetDate: '15 Dec', leadPerson: 'Vikram S.', dependencies: ['m4'] },
  { id: 'm6', title: 'Global Infrastructure Scaling', phase: 'Phase 3', status: 'upcoming', progress: 0, targetDate: '15 Jan', leadPerson: 'Karan P.', dependencies: ['m3'] }
];

export const INITIAL_APPROVALS: CheckpointApproval[] = [
  {
    id: 'ap1',
    title: 'Multi-Region RDS Cluster Budget Increase',
    category: 'Financial',
    urgency: 'URGENT',
    requestedBy: 'Rohan Mehta',
    date: '07 Nov 2026',
    status: 'PENDING',
    impactSummary: 'Requires $1,200/mo additional AWS cloud allocation for read-replica nodes.',
    riskScore: 35
  },
  {
    id: 'ap2',
    title: 'Zero-Trust Identity Provider Migration',
    category: 'Architectural',
    urgency: 'HIGH',
    requestedBy: 'Arjun Sharma',
    date: '05 Nov 2026',
    status: 'APPROVED',
    impactSummary: 'Migrate internal microservices to OAuth 2.1 PKCE bearer tokens.',
    riskScore: 68
  }
];

export const INITIAL_SYNTHESIS_REPORTS: SynthesisReport[] = [
  {
    id: 'sr1',
    title: 'Executive Velocity & Risk Report — Q4 W2',
    date: '08 Nov 2026',
    executionVelocityScore: 73,
    aiNarrativeSummary: 'Engineering velocity is 2 weeks ahead on the core Authentication milestone. However, design handoff for Meridian visual graph nodes is currently lagging by 4 days due to resource constraints.',
    highlights: [
      'Auth Service PKCE implementation reached 75% completion.',
      'Code review turnaround time improved from 24h to 18h.',
      'Luminary AI Assistant response latency reduced to < 400ms.'
    ],
    risks: [
      'Design team bandwidth load is currently at 92%.',
      'Mass leave anomaly flagged for mid-November sprint end.'
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Checkpoint Sign-off Required',
    message: 'Rohan Mehta requested budget approval for RDS Read Replica cluster.',
    timestamp: '10 min ago',
    type: 'urgent',
    read: false
  },
  {
    id: 'n2',
    title: 'Meridian Milestone Warning',
    message: 'API Gateway milestone is 2 days behind target velocity.',
    timestamp: '1 hour ago',
    type: 'warning',
    read: false
  },
  {
    id: 'n3',
    title: 'Synthesis Weekly Report Generated',
    message: 'Q4 Week 2 executive summary is now ready for CEO review.',
    timestamp: '3 hours ago',
    type: 'info',
    read: true
  }
];
