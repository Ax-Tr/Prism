import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Plus, Clock, AlertCircle, Filter, X,
  FileCheck, Link as LinkIcon, CheckCircle2, Ban, ShieldAlert,
  ArrowRight, ExternalLink, Activity, BarChart3, RefreshCw,
  Upload, Eye, ChevronRight, Calendar, UserCheck, Check, Sparkles,
  Download, ShieldCheck, FileText, Code2, ListChecks, Database, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/apiClient';

interface TaskProof {
  id: string;
  proofType: string;
  proofUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  notes?: string;
  aiValidationStatus?: string;
  aiValidationNotes?: string;
  approvalStatus: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  orbitStage: 'DORMANT' | 'IN_FLUX' | 'ORBIT' | 'TRANSMITTED' | 'BLOCKED' | 'CANCELLED' | 'REWORK_REQUIRED';
  assignedTo?: string;
  assigneeName: string;
  assigneeRole?: string;
  assigneeDesignation?: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  proofRequired: boolean;
  proofCount: number;
  proofs: TaskProof[];
  estimatedHours: number;
  actualHours?: number;
  dueDate: string;
  isOverdue: boolean;
  hoursRemaining: number;
  startedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface WorkAnalytics {
  totalTasks: number;
  throughput: number;
  completionRatePercent: number;
  slaAdherencePercent: number;
  averageCycleTimeHours: number;
  inFlightCount: number;
  dormantCount: number;
  overdueCount: number;
  stageDistribution: {
    DORMANT: number;
    IN_FLUX: number;
    ORBIT: number;
    TRANSMITTED: number;
    BLOCKED: number;
  };
}

interface ProofQueueItem {
  id: string;
  taskId: string;
  taskTitle: string;
  taskPriority: string;
  departmentName: string;
  departmentCode: string;
  submittedBy: string;
  submitterName: string;
  submitterRole?: string;
  submitterDesignation?: string;
  proofType: string;
  proofUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  notes?: string;
  aiValidationStatus?: string;
  aiValidationNotes?: string;
  submittedAt: string;
  approvalStatus: string;
}

export const TasksView: React.FC = () => {
  const { currentUser } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'PROOF_QUEUE'>('KANBAN');

  // State Management
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [analytics, setAnalytics] = useState<WorkAnalytics | null>(null);
  const [proofQueue, setProofQueue] = useState<ProofQueueItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');

  // Modals & Panels
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<TaskItem | null>(null);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTaskForProof, setSelectedTaskForProof] = useState<TaskItem | null>(null);
  const [selectedTaskForCancel, setSelectedTaskForCancel] = useState<TaskItem | null>(null);
  const [selectedProofForReview, setSelectedProofForReview] = useState<ProofQueueItem | null>(null);

  // Review reason input
  const [reviewDecision, setReviewDecision] = useState<'accepted' | 'changes_requested'>('accepted');
  const [reviewNotes, setReviewNotes] = useState('');

  // New task form state
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    departmentId: '',
    assignedTo: '',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    estimatedHours: 8,
    proofRequired: true,
  });

  // Proof submission multi-type form state (PRD §12 FR-041)
  const [proofType, setProofType] = useState<'file' | 'link' | 'structured_data' | 'checklist' | 'code_commit'>('link');
  const [proofUrl, setProofUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [structuredDataJson, setStructuredDataJson] = useState('{\n  "benchmark_score": 98.4,\n  "latency_p99_ms": 42,\n  "coverage_percent": 94\n}');
  const [checklistItems, setChecklistItems] = useState([
    { item: 'Unit & integration test suites passed', completed: true },
    { item: 'Security SAST scan clean', completed: true },
    { item: 'PR reviewed and signed off', completed: true },
  ]);
  const [codeCommitForm, setCodeCommitForm] = useState({
    repo: 'enterprise/prism-core',
    commitHash: '8f9a2b4e7c1d',
    prUrl: 'https://github.com/enterprise/prism-core/pull/88',
  });
  const [proofSubmitting, setProofSubmitting] = useState(false);

  // Pre-validation preview state
  const [validationPreview, setValidationPreview] = useState<any | null>(null);
  const [validatingPreview, setValidatingPreview] = useState(false);

  // Cancel task form state
  const [cancelReason, setCancelReason] = useState('');

  // Feedback Notification
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Orbit Workflow Columns (PRD §12)
  const columns = [
    { stage: 'DORMANT', label: '1. Dormant (Backlog)', color: 'text-slate-400 border-slate-500/30 bg-slate-500/5' },
    { stage: 'IN_FLUX', label: '2. In Flux (Active Execution)', color: 'text-sky-400 border-sky-500/30 bg-sky-500/5' },
    { stage: 'ORBIT', label: '3. Orbit (Proof in Review)', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' },
    { stage: 'TRANSMITTED', label: '4. Transmitted (Completed)', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
  ];

  // 1. Fetch Tasks, Analytics & Proof Queue
  const fetchTasksData = async () => {
    try {
      setLoading(true);
      const [tasksRes, analyticsRes, queueRes, usersRes, deptsRes] = await Promise.all([
        api.get<TaskItem[]>('/api/v1/tasks'),
        api.get<WorkAnalytics>('/api/v1/tasks/analytics/workload'),
        api.get<{ items: ProofQueueItem[] }>('/api/v1/proofs/queue'),
        api.get<{ users: any[] }>('/api/v1/users'),
        api.get<any[]>('/api/v1/departments'),
      ]);

      if (tasksRes) setTasks(tasksRes);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (queueRes?.items) setProofQueue(queueRes.items);
      if (usersRes?.users) setUsers(usersRes.users);
      if (deptsRes) setDepartments(deptsRes);
    } catch (err) {
      console.warn('Error fetching tasks data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  // 2. Fetch Task History when Detail is Opened
  const handleOpenTaskDetail = async (task: TaskItem) => {
    setSelectedTaskDetail(task);
    setHistoryLoading(true);
    try {
      const historyRes = await api.get<any[]>(`/api/v1/tasks/${task.id}/history`);
      if (historyRes) setTaskHistory(historyRes);
    } catch (err) {
      console.warn('Error fetching task history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 3. State Machine Transition Trigger
  const handleTransitionStatus = async (taskId: string, targetStatus: string, notes?: string) => {
    try {
      const res = await api.patch<any>(`/api/v1/tasks/${taskId}/status`, {
        status: targetStatus,
        notes,
      });

      if (res) {
        setFeedbackMsg(`Task state transitioned to ${res.orbitStage}.`);
        setTimeout(() => setFeedbackMsg(null), 3500);
        fetchTasksData();
        if (selectedTaskDetail?.id === taskId) {
          handleOpenTaskDetail({ ...selectedTaskDetail, status: res.status, orbitStage: res.orbitStage });
        }
      }
    } catch (err: any) {
      alert(err.message || 'Transition rejected by Orbit state machine');
    }
  };

  // 4. Create Task Submit
  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<any>('/api/v1/tasks', {
        ...newTaskForm,
        departmentId: newTaskForm.departmentId || departments[0]?.id,
      });

      if (res) {
        setFeedbackMsg(`Task "${newTaskForm.title}" created in DORMANT state.`);
        setTimeout(() => setFeedbackMsg(null), 3500);
        setShowAddModal(false);
        setNewTaskForm({
          title: '',
          description: '',
          departmentId: departments[0]?.id || '',
          assignedTo: '',
          priority: 'high',
          dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
          estimatedHours: 8,
          proofRequired: true,
        });
        fetchTasksData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    }
  };

  // 5. Pre-validate Match Rules (PRD §12 S6-07)
  const handlePreValidateProof = async () => {
    try {
      setValidatingPreview(true);
      let payload: any = { proofType, notes: proofNotes };

      if (proofType === 'link') payload.proofUrl = proofUrl;
      if (proofType === 'structured_data') {
        try {
          payload.structuredData = JSON.parse(structuredDataJson);
        } catch {
          alert('Invalid JSON format in structured telemetry');
          return;
        }
      }
      if (proofType === 'checklist') payload.checklist = checklistItems;
      if (proofType === 'code_commit') payload.codeCommit = codeCommitForm;

      const res = await api.post<any>('/api/v1/proofs/validate', payload);
      if (res) setValidationPreview(res);
    } catch (err: any) {
      alert(err.message || 'Validation evaluation failed');
    } finally {
      setValidatingPreview(false);
    }
  };

  // 6. Submit Proof (Multi-Type Supporting Files, Links, Structured Data, Checklists, Commits)
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForProof) return;

    try {
      setProofSubmitting(true);

      if (proofType === 'file' && proofFile) {
        const formData = new FormData();
        formData.append('file', proofFile);
        formData.append('notes', proofNotes);

        const token = localStorage.getItem('prism_auth_token');
        const res = await fetch(`/api/v1/tasks/${selectedTaskForProof.id}/proofs/upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
      } else {
        let finalProofUrl = proofUrl;
        let finalNotes = proofNotes;

        if (proofType === 'structured_data') {
          finalProofUrl = 'telemetry://structured-payload';
          finalNotes = `Structured Telemetry:\n${structuredDataJson}\nNotes: ${proofNotes}`;
        } else if (proofType === 'checklist') {
          finalProofUrl = 'checklist://verification-gates';
          finalNotes = `Checklist Verification:\n${checklistItems.map((i) => `[${i.completed ? 'X' : ' '}] ${i.item}`).join('\n')}\nNotes: ${proofNotes}`;
        } else if (proofType === 'code_commit') {
          finalProofUrl = codeCommitForm.prUrl || `git://${codeCommitForm.repo}/commit/${codeCommitForm.commitHash}`;
          finalNotes = `Git Commit: ${codeCommitForm.commitHash} (${codeCommitForm.repo})\nNotes: ${proofNotes}`;
        }

        await api.post<any>(`/api/v1/tasks/${selectedTaskForProof.id}/proof`, {
          proofType,
          proofUrl: finalProofUrl,
          notes: finalNotes,
        });
      }

      setFeedbackMsg(`Proof of work submitted. Moved to ORBIT for verification.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
      setSelectedTaskForProof(null);
      setValidationPreview(null);
      setProofUrl('');
      setProofNotes('');
      setProofFile(null);
      fetchTasksData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit proof');
    } finally {
      setProofSubmitting(false);
    }
  };

  // 7. Review Proof from Queue / Modal
  const handleExecuteProofReview = async (proofId: string, decision: 'accepted' | 'changes_requested') => {
    try {
      const res = await api.post<any>(`/api/v1/proofs/${proofId}/review`, {
        decision,
        notes: reviewNotes || (decision === 'accepted' ? 'Proof verified and approved.' : 'Please revise delivery proof.'),
      });

      if (res) {
        setFeedbackMsg(decision === 'accepted' ? 'Proof approved! Task completed.' : 'Changes requested. Task moved to rework.');
        setTimeout(() => setFeedbackMsg(null), 3500);
        setSelectedProofForReview(null);
        setReviewNotes('');
        fetchTasksData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to review proof');
    }
  };

  // 8. Secure Presigned Download (PRD §12 S6-06)
  const handleSecureDownload = async (proofId: string) => {
    try {
      const res = await api.get<{ downloadUrl: string }>(`/api/v1/proofs/${proofId}/secure-url`);
      if (res?.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate secure download token');
    }
  };

  // 9. Cancel Task with Mandatory Reason
  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForCancel || cancelReason.trim().length < 5) return;

    try {
      await api.post<any>(`/api/v1/tasks/${selectedTaskForCancel.id}/cancel`, {
        reason: cancelReason.trim(),
      });

      setFeedbackMsg(`Task cancelled. Mandatory justification recorded in immutable audit ledger.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      setSelectedTaskForCancel(null);
      setCancelReason('');
      fetchTasksData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel task');
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesDept = filterDepartment === 'ALL' || t.departmentId === filterDepartment;
    const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'ALL' || t.assignedTo === filterAssignee;
    return matchesDept && matchesPriority && matchesAssignee;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">PROOF-DRIVEN ORBIT WORKFLOW & VERIFICATION (PRD §12)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Work Engine & Proof Vault</h1>
          <p className="text-xs text-slate-400 mt-1">
            4-Stage Orbit state machine (Dormant $\rightarrow$ In-Flux $\rightarrow$ Orbit $\rightarrow$ Transmitted) with evidence-gated verification and multi-type proof artifacts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab('KANBAN')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'KANBAN'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Orbit Kanban
            </button>
            <button
              onClick={() => setActiveTab('PROOF_QUEUE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'PROOF_QUEUE'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Proof Review Queue</span>
              {proofQueue.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500 text-white text-[10px] font-bold">
                  {proofQueue.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Bar (PRD §12 FR-042) */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Throughput</span>
            <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{analytics.throughput}</p>
            <span className="text-[10px] text-slate-500">Completed Tasks</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Completion Rate</span>
            <p className="text-xl font-extrabold text-sky-400 mt-0.5">{analytics.completionRatePercent}%</p>
            <span className="text-[10px] text-slate-500">Of Total Backlog</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Cycle Time</span>
            <p className="text-xl font-extrabold text-purple-400 mt-0.5">{analytics.averageCycleTimeHours}h</p>
            <span className="text-[10px] text-slate-500">Start to Complete</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">SLA Adherence</span>
            <p className="text-xl font-extrabold text-indigo-400 mt-0.5">{analytics.slaAdherencePercent}%</p>
            <span className="text-[10px] text-slate-500">On-Time Delivery</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">In Orbit (Review)</span>
            <p className="text-xl font-extrabold text-amber-400 mt-0.5">{analytics.stageDistribution.ORBIT}</p>
            <span className="text-[10px] text-slate-500">Awaiting Sign-off</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Aging & Overdue</span>
            <p className="text-xl font-extrabold text-rose-400 mt-0.5">{analytics.overdueCount}</p>
            <span className="text-[10px] text-slate-500">Action Required</span>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 1: KANBAN WORKFLOW VIEW                          */}
      {/* ==================================================== */}
      {activeTab === 'KANBAN' && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-mono text-slate-400">FILTERS:</span>
              </div>

              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900">{d.name} ({d.code})</option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">All Priorities</option>
                <option value="critical" className="bg-slate-900">Critical</option>
                <option value="high" className="bg-slate-900">High</option>
                <option value="medium" className="bg-slate-900">Medium</option>
                <option value="low" className="bg-slate-900">Low</option>
              </select>

              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">All Assignees</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900">{u.fullName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchTasksData}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 flex items-center space-x-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* 4-Stage Orbit Workflow Kanban Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.orbitStage === col.stage);
              return (
                <div key={col.stage} className={`glass-panel p-4 rounded-3xl border border-white/10 flex flex-col min-h-[560px] shadow-xl ${col.color.split(' ')[2]}`}>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <span className={`text-xs font-bold font-mono uppercase ${col.color.split(' ')[0]}`}>{col.label}</span>
                    <span className="text-xs font-mono text-slate-400 px-2.5 py-0.5 rounded-full bg-white/5 font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleOpenTaskDetail(task)}
                        className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/40 space-y-3 transition-all cursor-pointer group shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wide px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                            {task.departmentCode || 'OPS'}
                          </span>
                          <span
                            className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                              task.priority === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : task.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            }`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                        )}

                        {/* Metadata line */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[9px] text-purple-300 font-bold border border-white/10">
                              {task.assigneeName[0]}
                            </div>
                            <span className="truncate max-w-[90px]">{task.assigneeName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className="font-mono text-[10px]">{task.estimatedHours}h</span>
                          </div>
                        </div>

                        {/* Stage Transition Action Bar */}
                        <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {task.orbitStage === 'DORMANT' && (
                            <button
                              onClick={() => handleTransitionStatus(task.id, 'in_progress', 'Started execution.')}
                              className="w-full py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all"
                            >
                              <Activity className="w-3.5 h-3.5" />
                              <span>Start (Move to In-Flux)</span>
                            </button>
                          )}

                          {task.orbitStage === 'IN_FLUX' && (
                            <button
                              onClick={() => setSelectedTaskForProof(task)}
                              className="w-full py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Submit Proof (Move to Orbit)</span>
                            </button>
                          )}

                          {task.orbitStage === 'ORBIT' && task.proofs.length > 0 && (
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleExecuteProofReview(task.proofs[0].id, 'accepted')}
                                className="flex-1 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProofForReview({
                                    id: task.proofs[0].id,
                                    taskId: task.id,
                                    taskTitle: task.title,
                                    taskPriority: task.priority,
                                    departmentName: task.departmentName,
                                    departmentCode: task.departmentCode,
                                    submittedBy: task.assignedTo || 'user',
                                    submitterName: task.assigneeName,
                                    proofType: task.proofs[0].proofType,
                                    proofUrl: task.proofs[0].proofUrl,
                                    notes: task.proofs[0].notes,
                                    submittedAt: task.proofs[0].submittedAt,
                                    approvalStatus: task.proofs[0].approvalStatus,
                                  });
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-[11px] font-semibold"
                              >
                                Review
                              </button>
                            </div>
                          )}

                          {task.orbitStage !== 'TRANSMITTED' && task.orbitStage !== 'CANCELLED' && (
                            <button
                              onClick={() => setSelectedTaskForCancel(task)}
                              className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center space-x-1 pt-0.5 transition-colors self-end"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Cancel Task</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ==================================================== */}
      {/* TAB 2: PROOF REVIEW QUEUE & EVIDENCE VAULT (PRD §12) */}
      {/* ==================================================== */}
      {activeTab === 'PROOF_QUEUE' && (
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span>Pending Proof Verification Queue</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manager & Executive sign-off pipeline for evidence-gated task completion (PRD §12 FR-041).
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                {proofQueue.length} PENDING IN ORBIT
              </span>
            </div>

            {proofQueue.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">All Proofs Verified</h4>
                <p className="text-xs text-slate-400">Zero pending proof submissions requiring manager review.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {proofQueue.map((item) => (
                  <div key={item.id} className="p-4 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase">
                          {item.proofType}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold">
                          {item.departmentCode}
                        </span>
                        <span className="text-slate-500 text-[11px] font-mono">{new Date(item.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{item.taskTitle}</h4>
                      <p className="text-xs text-slate-400">
                        Submitted by <strong className="text-slate-200">{item.submitterName}</strong> ({item.submitterDesignation || 'Team Member'})
                      </p>
                      {item.notes && (
                        <p className="text-xs text-slate-300 bg-white/5 p-2 rounded-xl border border-white/5 mt-1">
                          "{item.notes}"
                        </p>
                      )}
                      {item.aiValidationNotes && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Synthesized Check: {item.aiValidationNotes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {item.proofUrl && (
                        <a
                          href={item.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-sky-300 border border-white/10 text-xs font-semibold flex items-center space-x-1 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Artifact</span>
                        </a>
                      )}

                      {item.fileName && (
                        <button
                          onClick={() => handleSecureDownload(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 border border-white/10 text-xs font-semibold flex items-center space-x-1 transition-all"
                        >
                          <Download className="w-3 h-3" />
                          <span>Secure Download</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleExecuteProofReview(item.id, 'accepted')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Proof</span>
                      </button>

                      <button
                        onClick={() => setSelectedProofForReview(item)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold"
                      >
                        Request Changes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 1: TASK DETAIL & TIMELINE DRAWER    */}
      {/* ========================================== */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-mono text-purple-300 font-bold uppercase">
                  {selectedTaskDetail.orbitStage}
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">{selectedTaskDetail.title}</h3>
                <p className="text-xs font-mono text-sky-400 mt-0.5">
                  {selectedTaskDetail.departmentName} — Assigned to {selectedTaskDetail.assigneeName}
                </p>
              </div>
              <button
                onClick={() => setSelectedTaskDetail(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <strong className="text-slate-400 font-mono block mb-1">Description:</strong>
                <p className="text-slate-300 leading-relaxed">{selectedTaskDetail.description || 'No detailed specifications provided.'}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Priority</span>
                  <p className="font-bold text-white mt-0.5">{selectedTaskDetail.priority.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Due Date</span>
                  <p className="font-bold text-white mt-0.5">{new Date(selectedTaskDetail.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Estimated</span>
                  <p className="font-bold text-purple-300 mt-0.5">{selectedTaskDetail.estimatedHours}h</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Proof Required</span>
                  <p className="font-bold text-emerald-400 mt-0.5">{selectedTaskDetail.proofRequired ? 'YES' : 'NO'}</p>
                </div>
              </div>

              {/* Proofs Section */}
              <div>
                <strong className="text-slate-400 font-mono block mb-2">Attached Proof Artifacts:</strong>
                {selectedTaskDetail.proofs && selectedTaskDetail.proofs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTaskDetail.proofs.map((p) => (
                      <div key={p.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300 uppercase text-[10px] font-mono">{p.proofType}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                            p.approvalStatus === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {p.approvalStatus.toUpperCase()}
                          </span>
                        </div>
                        {p.proofUrl && (
                          <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-sky-400 flex items-center space-x-1 hover:underline text-[11px]">
                            <span>{p.proofUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <p className="text-slate-400 text-[11px]">{p.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No proofs attached yet.</p>
                )}
              </div>

              {/* State Machine Transition History */}
              <div>
                <strong className="text-slate-400 font-mono block mb-2">State Machine Audit Trail:</strong>
                {historyLoading ? (
                  <p className="text-slate-400">Loading timeline...</p>
                ) : (
                  <div className="space-y-2 border-l-2 border-white/10 pl-3">
                    {taskHistory.map((h) => (
                      <div key={h.id} className="space-y-0.5 text-[11px]">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{h.newOrbitStage}</span>
                          <span className="text-slate-500 font-mono text-[10px]">{new Date(h.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-400">{h.notes || 'Status updated'} — <span className="text-purple-300">{h.actorName}</span></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedTaskDetail(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
            >
              Close Task
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: MULTI-TYPE PROOF SUBMISSION MODAL */}
      {/* ========================================== */}
      {selectedTaskForProof && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 max-w-xl w-full space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Submit Proof of Completion</h3>
              </div>
              <button onClick={() => setSelectedTaskForProof(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Submitting evidence for: <strong className="text-white">{selectedTaskForProof.title}</strong>
            </p>

            <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
              {/* Multi-type proof selector tabs */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Proof Category (PRD §12 FR-041)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'link', label: 'URL / Link', icon: LinkIcon },
                    { id: 'file', label: 'File Upload', icon: Upload },
                    { id: 'structured_data', label: 'Telemetry', icon: Database },
                    { id: 'checklist', label: 'Checklist', icon: ListChecks },
                    { id: 'code_commit', label: 'Git Commit', icon: Code2 },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setProofType(t.id as any);
                          setValidationPreview(null);
                        }}
                        className={`py-2 px-1.5 text-[11px] font-semibold rounded-xl border flex flex-col items-center space-y-1 transition-all ${
                          proofType === t.id
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Field Body per Type */}
              {proofType === 'file' && (
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Upload File Artifact (PDF, PNG, DOCX, ZIP, JSON - max 50MB)</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-purple-500/20 file:text-purple-300 file:font-semibold"
                  />
                </div>
              )}

              {proofType === 'link' && (
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Artifact Delivery Link *</label>
                  <input
                    type="text"
                    required
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://github.com/org/repo/pull/123 or https://figma.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {proofType === 'structured_data' && (
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Structured JSON Telemetry Payload</label>
                  <textarea
                    rows={4}
                    value={structuredDataJson}
                    onChange={(e) => setStructuredDataJson(e.target.value)}
                    className="w-full font-mono text-[11px] bg-slate-900 border border-white/10 rounded-xl p-3 text-emerald-300 focus:outline-none"
                  />
                </div>
              )}

              {proofType === 'checklist' && (
                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold block">Verification Gates</label>
                  <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                    {checklistItems.map((item, idx) => (
                      <label key={idx} className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => {
                            const updated = [...checklistItems];
                            updated[idx].completed = e.target.checked;
                            setChecklistItems(updated);
                          }}
                          className="rounded text-purple-500 focus:ring-purple-400"
                        />
                        <span>{item.item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {proofType === 'code_commit' && (
                <div className="space-y-2">
                  <div>
                    <label className="text-slate-300 font-semibold block">Git Repository</label>
                    <input
                      type="text"
                      value={codeCommitForm.repo}
                      onChange={(e) => setCodeCommitForm({ ...codeCommitForm, repo: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block">Commit Hash (SHA-1)</label>
                    <input
                      type="text"
                      value={codeCommitForm.commitHash}
                      onChange={(e) => setCodeCommitForm({ ...codeCommitForm, commitHash: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Verification Notes</label>
                <textarea
                  rows={2}
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="Describe test outcomes, delivery acceptance criteria, or PR review notes..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Match Rule Pre-validation result badge */}
              {validationPreview && (
                <div className={`p-3 rounded-2xl border text-xs ${
                  validationPreview.valid
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>Authenticity Score: {validationPreview.score}/100</span>
                    <span className="uppercase text-[10px] font-mono">{validationPreview.status}</span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-90">{validationPreview.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePreValidateProof}
                  disabled={validatingPreview}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{validatingPreview ? 'Testing...' : 'Test Match Rules'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTaskForProof(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={proofSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/25"
                  >
                    {proofSubmitting ? 'Uploading...' : 'Submit to Orbit'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: PROOF REVISION REQUEST MODAL      */}
      {/* ========================================== */}
      {selectedProofForReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Request Proof Revision</h3>
            </div>

            <p className="text-xs text-slate-400">
              Provide feedback for <strong className="text-white">{selectedProofForReview.submitterName}</strong> detailing necessary changes to meet acceptance criteria.
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Revision Notes (Mandatory min 5 chars)</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Explain required changes before this task can be verified..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProofForReview(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={reviewNotes.trim().length < 5}
                  onClick={() => handleExecuteProofReview(selectedProofForReview.id, 'changes_requested')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold"
                >
                  Send Revision Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 4: TASK CANCELLATION MODAL          */}
      {/* ========================================== */}
      {selectedTaskForCancel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Cancel Task (Mandatory Reason)</h3>
            </div>

            <p className="text-xs text-slate-400">
              Per PRD §12 FR-040, task cancellations must record a documented business justification into the immutable audit ledger.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Justification Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Explain why this task is being cancelled (min 5 characters)..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForCancel(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Keep Task
                </button>
                <button
                  type="submit"
                  disabled={cancelReason.trim().length < 5}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 5: CREATE TASK MODAL                */}
      {/* ========================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create New Orbit Task</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="e.g. Implement Proof Verification Checksum Service"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Description</label>
                <textarea
                  rows={2}
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  placeholder="Acceptance criteria and delivery requirements..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Department *</label>
                  <select
                    value={newTaskForm.departmentId}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, departmentId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Assignee</label>
                  <select
                    value={newTaskForm.assignedTo}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="" className="bg-slate-900">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id} className="bg-slate-900">{u.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="critical" className="bg-slate-900">Critical</option>
                    <option value="high" className="bg-slate-900">High</option>
                    <option value="medium" className="bg-slate-900">Medium</option>
                    <option value="low" className="bg-slate-900">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Est. Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={newTaskForm.estimatedHours}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-lg shadow-sky-500/20"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TasksView;
