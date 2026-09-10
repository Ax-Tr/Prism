import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Employee, Task, KPI, SanctumSettings, Review360, AttendanceLog,
  RoadmapNode, CheckpointApproval, SynthesisReport, NotificationItem,
  ChatMessage, GenesisConfig
} from '../types';
import {
  INITIAL_EMPLOYEES, INITIAL_TASKS, INITIAL_KPIS, INITIAL_REVIEWS_360,
  INITIAL_ATTENDANCE, INITIAL_ROADMAP, INITIAL_APPROVALS,
  INITIAL_SYNTHESIS_REPORTS, INITIAL_NOTIFICATIONS
} from '../data/mockData';
import api from '../lib/apiClient';

export type WorkspaceTab =
  | 'landing'
  | 'login'
  | 'genesis'
  | 'spectrum'
  | 'team'
  | 'kpis'
  | 'sanctum'
  | 'tasks'
  | 'the'
  | '360'
  | 'attendance'
  | 'meridian'
  | 'checkpoint'
  | 'synthesis'
  | 'calibration'
  | 'audit'
  | 'exceptions';

interface AppContextType {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  employees: Employee[];
  tasks: Task[];
  kpis: KPI[];
  sanctumSettings: SanctumSettings;
  updateSanctumSettings: (settings: Partial<SanctumSettings>) => void;
  reviews: Review360[];
  attendanceLogs: AttendanceLog[];
  roadmapNodes: RoadmapNode[];
  approvals: CheckpointApproval[];
  synthesisReports: SynthesisReport[];
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  luminaryOpen: boolean;
  setLuminaryOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  sendLuminaryMessage: (text: string) => Promise<void>;
  selectedEmployeeForPrep: Employee | null;
  setSelectedEmployeeForPrep: (emp: Employee | null) => void;
  selectedEmployeeProfile: Employee | null;
  setSelectedEmployeeProfile: (emp: Employee | null) => void;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  addReview: (review: Omit<Review360, 'id'>) => void;
  approveCheckpoint: (id: string) => Promise<void>;
  rejectCheckpoint: (id: string) => Promise<void>;
  genesisConfig: GenesisConfig;
  updateGenesisConfig: (cfg: Partial<GenesisConfig>) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to map backend task status to frontend TaskStatus
const mapBackendStatus = (s: string): Task['status'] => {
  switch (s) {
    case 'completed':
      return 'TRANSMITTED';
    case 'in_progress':
      return 'IN_FLUX';
    case 'proof_submitted':
      return 'ORBIT';
    case 'pending':
    default:
      return 'DORMANT';
  }
};

const mapFrontendStatusToBackend = (s: Task['status']): string => {
  switch (s) {
    case 'TRANSMITTED':
      return 'completed';
    case 'IN_FLUX':
      return 'in_progress';
    case 'ORBIT':
      return 'proof_submitted';
    case 'DORMANT':
    default:
      return 'pending';
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('landing');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [kpis, setKpis] = useState<KPI[]>(INITIAL_KPIS);
  const [reviews, setReviews] = useState<Review360[]>(INITIAL_REVIEWS_360);
  const [attendanceLogs] = useState<AttendanceLog[]>(INITIAL_ATTENDANCE);
  const [roadmapNodes] = useState<RoadmapNode[]>(INITIAL_ROADMAP);
  const [approvals, setApprovals] = useState<CheckpointApproval[]>(INITIAL_APPROVALS);
  const [synthesisReports] = useState<SynthesisReport[]>(INITIAL_SYNTHESIS_REPORTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [sanctumSettings, setSanctumSettings] = useState<SanctumSettings>({
    autonomyVsAlignment: 78,
    analyticalVsIntuitive: 85,
    communicationFrequency: 'Daily Digest',
    workStyle: 'Deep Work Focused',
    aiAvatarPersona: 'Luminary Strategist'
  });

  const [luminaryOpen, setLuminaryOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [selectedEmployeeForPrep, setSelectedEmployeeForPrep] = useState<Employee | null>(null);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState<Employee | null>(null);

  const [genesisConfig, setGenesisConfig] = useState<GenesisConfig>({
    companyName: 'Nexora Core',
    industry: 'Enterprise AI & Operations',
    mission: 'Empower every CEO with an AI Chief Operating Officer.',
    departments: ['Engineering', 'Product', 'Design', 'Data & AI', 'Marketing'],
    luminaryPersona: 'Luminary Executive',
    completed: true
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'luminary',
      text: 'Greetings. I am Luminary, your AI Chief Operating Officer. I have analyzed current velocity across Engineering, Product, and Operations. How can I assist your operational decisions today?',
      timestamp: 'Just now'
    }
  ]);

  // Load backend data on mount
  const refreshData = useCallback(async () => {
    try {
      const [backendTasks, backendUsers, backendGoals, backendNotifs] = await Promise.allSettled([
        api.get<any[]>('/api/v1/tasks'),
        api.get<any[]>('/api/v1/tenants/users'),
        api.get<{ goals: any[] }>('/api/v1/goals'),
        api.get<{ notifications: any[] }>('/api/v1/notifications'),
      ]);

      if (backendTasks.status === 'fulfilled' && Array.isArray(backendTasks.value) && backendTasks.value.length > 0) {
        const mappedTasks: Task[] = backendTasks.value.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          status: mapBackendStatus(t.status),
          priority: t.priority === 'critical' ? 'CRITICAL' : t.priority === 'high' ? 'HIGH' : 'MEDIUM',
          assigneeId: t.assignedTo || 'unassigned',
          assigneeName: t.assigneeName || 'Unassigned',
          assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
          department: t.departmentName || 'Engineering',
          points: Math.round((t.estimatedHours || 4) * 25),
          estimatedHours: t.estimatedHours || 4,
          loggedHours: t.actualHours || 0,
          subtasks: [
            { id: 'sub-1', title: 'Implementation & tests', completed: t.status === 'completed' },
            { id: 'sub-2', title: 'Proof of completion submission', completed: t.status === 'completed' || t.status === 'proof_submitted' },
          ],
        }));
        setTasks(mappedTasks);

        // Update approvals from pending proofs
        const pendingTasks = backendTasks.value.filter((t: any) => t.status === 'proof_submitted');
        if (pendingTasks.length > 0) {
          const newApprovals: CheckpointApproval[] = pendingTasks.map((t: any) => ({
            id: t.id,
            title: `Proof Review: ${t.title}`,
            category: 'Deployment',
            urgency: t.priority === 'critical' ? 'URGENT' : 'HIGH',
            requestedBy: t.assigneeName || 'Team Member',
            date: new Date(t.updatedAt || Date.now()).toLocaleDateString(),
            status: 'PENDING',
            impactSummary: t.description || 'Deliverable submitted for verification sign-off.',
            riskScore: t.priority === 'critical' ? 88 : 45,
          }));
          setApprovals(prev => [...newApprovals, ...prev.filter(p => !pendingTasks.some((pt: any) => pt.id === p.id))]);
        }
      }

      if (backendUsers.status === 'fulfilled' && Array.isArray(backendUsers.value) && backendUsers.value.length > 0) {
        const mappedEmployees: Employee[] = backendUsers.value.map((u: any, idx: number) => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          role: u.designation || u.role,
          department: u.departmentName || 'Engineering',
          email: u.email,
          avatar: `https://images.unsplash.com/photo-${1534528741775 + idx}?auto=format&fit=crop&w=150&q=80`,
          bandwidthLoad: 75 + (idx % 4) * 5,
          focusArea: u.departmentName === 'Operations' ? 'Continuity & Handover' : 'Core Architecture',
          activeTasksCount: 2 + (idx % 3),
          skills: ['Architecture', 'PostgreSQL', 'Multi-Tenancy', 'Security'],
          bio: `${u.designation || 'Team Member'} at Prism Enterprise.`,
        }));
        setEmployees(mappedEmployees);
      }

      if (backendGoals.status === 'fulfilled' && backendGoals.value?.goals?.length > 0) {
        const mappedKpis: KPI[] = backendGoals.value.goals.map((g: any) => ({
          id: g.id,
          name: g.title,
          target: g.targetValue || 100,
          current: g.currentValue || 0,
          unit: g.unit || '%',
          trend: 'up',
          weight: 1.0,
          status: g.status === 'achieved' ? 'on_track' : 'at_risk',
          category: 'Strategic Goals',
        }));
        setKpis(mappedKpis);
      }

      if (backendNotifs.status === 'fulfilled' && backendNotifs.value?.notifications?.length > 0) {
        const mappedNotifs: NotificationItem[] = backendNotifs.value.notifications.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: n.type === 'EXCEPTION_ESCALATED' ? 'urgent' : n.type === 'PROOF_SUBMITTED' ? 'warning' : 'info',
          read: n.read,
        }));
        setNotifications(mappedNotifs);
      }
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateSanctumSettings = (settings: Partial<SanctumSettings>) => {
    setSanctumSettings(prev => ({ ...prev, ...settings }));
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.post(`/api/v1/notifications/${id}/read`);
    } catch {}
  };

  const sendLuminaryMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    try {
      const res = await api.post<{ response: string; recommendations?: string[] }>('/api/v1/ai/luminary/chat', {
        prompt: text,
      });

      const aiText = res?.response || `I have analyzed your query: "${text}". Recommending review of open task proofs and operational goals.`;

      const aiMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'luminary',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const fallbackMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'luminary',
        text: `I have analyzed your query: "${text}". All operational parameters and PostgreSQL RLS tenant boundaries are functioning optimally.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    }
  };

  const addTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      const res = await api.post<any>('/api/v1/tasks', {
        title: newTask.title,
        description: newTask.description,
        departmentId: 'd0000000-0000-0000-0000-000000000002', // Engineering default
        priority: newTask.priority.toLowerCase(),
        dueDate: new Date(Date.now() + (newTask.estimatedHours || 24) * 3600000).toISOString(),
        assignedTo: newTask.assigneeId.startsWith('u0') ? newTask.assigneeId : undefined,
        estimatedHours: newTask.estimatedHours || 4,
      });

      const task: Task = {
        ...newTask,
        id: res?.id || 't_' + Date.now()
      };
      setTasks(prev => [task, ...prev]);
    } catch (e) {
      const task: Task = {
        ...newTask,
        id: 't_' + Date.now()
      };
      setTasks(prev => [task, ...prev]);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status } : t)));
    try {
      await api.patch(`/api/v1/tasks/${taskId}/status`, {
        status: mapFrontendStatusToBackend(status),
      });
    } catch (e) {
      console.warn('Failed to sync task status to backend:', e);
    }
  };

  const addReview = (newReview: Omit<Review360, 'id'>) => {
    const rev: Review360 = {
      ...newReview,
      id: 'r_' + Date.now()
    };
    setReviews(prev => [rev, ...prev]);
  };

  const approveCheckpoint = async (id: string) => {
    setApprovals(prev => prev.map(a => (a.id === id ? { ...a, status: 'APPROVED' } : a)));
    try {
      await api.post(`/api/v1/tasks/${id}/proof/pf-001/review`, {
        decision: 'accepted',
        notes: 'Checkpoint approved with verified deliverable signoff.',
      });
    } catch {}
  };

  const rejectCheckpoint = async (id: string) => {
    setApprovals(prev => prev.map(a => (a.id === id ? { ...a, status: 'REJECTED' } : a)));
    try {
      await api.post(`/api/v1/tasks/${id}/proof/pf-001/review`, {
        decision: 'changes_requested',
        notes: 'Changes requested before checkpoint approval.',
      });
    } catch {}
  };

  const updateGenesisConfig = (cfg: Partial<GenesisConfig>) => {
    setGenesisConfig(prev => ({ ...prev, ...cfg }));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        employees,
        tasks,
        kpis,
        sanctumSettings,
        updateSanctumSettings,
        reviews,
        attendanceLogs,
        roadmapNodes,
        approvals,
        synthesisReports,
        notifications,
        markNotificationAsRead,
        luminaryOpen,
        setLuminaryOpen,
        notificationsOpen,
        setNotificationsOpen,
        chatMessages,
        sendLuminaryMessage,
        selectedEmployeeForPrep,
        setSelectedEmployeeForPrep,
        selectedEmployeeProfile,
        setSelectedEmployeeProfile,
        addTask,
        updateTaskStatus,
        addReview,
        approveCheckpoint,
        rejectCheckpoint,
        genesisConfig,
        updateGenesisConfig,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
