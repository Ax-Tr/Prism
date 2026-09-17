import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldAlert,
  UserCheck,
  RefreshCw,
  Zap,
  Calendar,
  UserPlus,
  Flame,
  FileCheck2,
  FileText,
  Lock,
  PlusCircle,
  HelpCircle,
  RotateCcw,
  Search,
  Activity,
  Filter,
  Layers,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Tag,
  Users,
  Crosshair,
} from 'lucide-react';
import api from '../../lib/apiClient';

interface SystemException {
  id: string;
  departmentId?: string;
  departmentName?: string;
  taskId?: string;
  taskTitle?: string;
  assignedUserId?: string;
  assignedUser?: { id: string; firstName: string; lastName: string; role: string };
  exceptionType: 'missed_deadline' | 'approval_stalled' | 'unassigned_high_priority' | 'continuity_gap' | 'low_discipline' | string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  details?: string;
  status: 'open' | 'triaged' | 'investigating' | 'actioned' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

interface RootCauseAnalysis {
  exceptionId: string;
  title: string;
  exceptionType: string;
  severity: string;
  primaryRootCause: string;
  fiveWhys: string[];
  contributingFactors: string[];
  blastRadiusAssessment: string;
  preventiveActionRecommendations: Array<{
    title: string;
    description: string;
    priority: string;
    suggestedAssigneeId?: string;
  }>;
}

interface BlamelessPostMortem {
  incidentId: string;
  incidentTitle: string;
  severityGrade: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  detectionMethod: string;
  leadInvestigator: string;
  executiveSummary: string;
  timeline: Array<{ timeOffset: string; event: string }>;
  rootCauseFiveWhys: string[];
  impactAssessment: {
    slaBreachHours: number;
    blockedDownstreamWorkflows: number;
    affectedTeams: string[];
  };
  correctiveAndPreventiveActions: Array<{
    actionTitle: string;
    owner: string;
    status: 'COMPLETED' | 'SCHEDULED' | 'IN_PROGRESS';
  }>;
  lessonsLearned: {
    whatWentWell: string[];
    whatWentWrong: string[];
    whereWeGotLucky: string[];
  };
  markdownDocument: string;
  generatedAt: string;
}

interface LeaveRecord {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  departmentName: string;
  handoverUserId: string | null;
  handoverUserName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  continuityActivated: boolean;
}

interface HandoverDossier {
  userId: string;
  userName: string;
  departmentName: string;
  leavePeriod: {
    startDate: string;
    endDate: string;
    durationDays: number;
  };
  handoverDelegate: {
    userId: string;
    name: string;
    role: string;
  } | null;
  activeTasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate: string | null;
    proofRequired: boolean;
  }>;
  criticalDeadlines: Array<{
    taskId: string;
    title: string;
    dueDate: string;
  }>;
  handoverReadinessScore: number;
  recommendedActionPlan: string[];
}

export const ExceptionsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EXCEPTIONS' | 'CONTINUITY'>('EXCEPTIONS');
  const [exceptions, setExceptions] = useState<SystemException[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // AI Root Cause Drawer
  const [analysisDrawerOpen, setAnalysisDrawerOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<RootCauseAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Post-Mortem Modal
  const [postMortemModalOpen, setPostMortemModalOpen] = useState(false);
  const [postMortemData, setPostMortemData] = useState<BlamelessPostMortem | null>(null);
  const [copiedPostMortem, setCopiedPostMortem] = useState(false);

  // Triage Modal
  const [triageModalOpen, setTriageModalOpen] = useState(false);
  const [selectedExceptionForTriage, setSelectedExceptionForTriage] = useState<SystemException | null>(null);
  const [triageSeverity, setTriageSeverity] = useState('high');
  const [triageAssignee, setTriageAssignee] = useState('');
  const [triageNotes, setTriageNotes] = useState('');

  // Resolve Modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedExceptionForResolve, setSelectedExceptionForResolve] = useState<SystemException | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Leave Modal State
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [handoverUserId, setHandoverUserId] = useState('');
  const [reason, setReason] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Dossier Modal State
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<HandoverDossier | null>(null);

  // Return Debrief Modal State
  const [debriefModalOpen, setDebriefModalOpen] = useState(false);
  const [debriefResult, setDebriefResult] = useState<any | null>(null);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/exceptions');
      if (Array.isArray(res)) setExceptions(res);
      else if (res?.data && Array.isArray(res.data)) setExceptions(res.data);
    } catch (err) {
      console.error('Failed to load exceptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeavesAndUsers = async () => {
    try {
      const [leaveRes, usersRes] = await Promise.all([
        api.get<any>('/continuity/leaves'),
        api.get<any>('/users'),
      ]);

      if (Array.isArray(leaveRes)) setLeaves(leaveRes);
      if (usersRes?.users) setTeamMembers(usersRes.users);
    } catch (err) {
      console.error('Failed to load continuity data:', err);
    }
  };

  useEffect(() => {
    fetchExceptions();
    fetchLeavesAndUsers();
  }, []);

  const handleRunScan = async () => {
    try {
      setScanning(true);
      const res = await api.post<any>('/exceptions/scan');
      const count = res?.detectedCount || res?.data?.detectedCount || 0;
      setFeedbackMsg(`Automated scan complete: ${count} new operational exception(s) flagged.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchExceptions();
    } catch (err) {
      console.error('Exception scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleOpenAnalysis = async (exceptionId: string) => {
    try {
      setAnalysisLoading(true);
      setAnalysisDrawerOpen(true);
      const res = await api.get<any>(`/exceptions/${exceptionId}/analysis`);
      setSelectedAnalysis(res?.data || res);
    } catch (err) {
      console.error('Failed to load root cause analysis:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleDispatchCapaTasks = async () => {
    if (!selectedAnalysis) return;
    try {
      await api.post<any>(`/exceptions/${selectedAnalysis.exceptionId}/action-items`, {
        actions: selectedAnalysis.preventiveActionRecommendations,
      });
      setFeedbackMsg(`Successfully dispatched ${selectedAnalysis.preventiveActionRecommendations.length} CAPA tasks to Orbit.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      setAnalysisDrawerOpen(false);
      fetchExceptions();
    } catch (err) {
      console.error('Failed to dispatch CAPA tasks:', err);
    }
  };

  const handleOpenPostMortem = async (exceptionId: string) => {
    try {
      const res = await api.get<any>(`/exceptions/${exceptionId}/post-mortem`);
      setPostMortemData(res?.data || res);
      setPostMortemModalOpen(true);
    } catch (err) {
      console.error('Failed to load post-mortem report:', err);
    }
  };

  const handleCopyPostMortem = () => {
    if (postMortemData?.markdownDocument) {
      navigator.clipboard.writeText(postMortemData.markdownDocument);
      setCopiedPostMortem(true);
      setTimeout(() => setCopiedPostMortem(false), 2500);
    }
  };

  const handleOpenTriage = (ex: SystemException) => {
    setSelectedExceptionForTriage(ex);
    setTriageSeverity(ex.severity);
    setTriageAssignee(ex.assignedUserId || '');
    setTriageNotes('');
    setTriageModalOpen(true);
  };

  const handleSubmitTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExceptionForTriage) return;
    try {
      await api.post<any>(`/exceptions/${selectedExceptionForTriage.id}/triage`, {
        severity: triageSeverity,
        assignedUserId: triageAssignee || undefined,
        triageNotes,
        status: 'triaged',
      });
      setFeedbackMsg(`Exception '${selectedExceptionForTriage.title}' successfully triaged.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
      setTriageModalOpen(false);
      fetchExceptions();
    } catch (err) {
      console.error('Failed to triage exception:', err);
    }
  };

  const handleOpenResolve = (ex: SystemException) => {
    setSelectedExceptionForResolve(ex);
    setResolutionNotes('');
    setResolveModalOpen(true);
  };

  const handleSubmitResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExceptionForResolve) return;
    try {
      await api.post<any>(`/exceptions/${selectedExceptionForResolve.id}/resolve`, {
        notes: resolutionNotes,
      });
      setFeedbackMsg(`Exception resolved & recorded in immutable audit log.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
      setResolveModalOpen(false);
      fetchExceptions();
    } catch (err) {
      console.error('Failed to resolve exception:', err);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<any>('/continuity/leaves', {
        startDate,
        endDate,
        handoverUserId: handoverUserId || undefined,
        reason,
      });

      setLeaveModalOpen(false);
      setStartDate('');
      setEndDate('');
      setHandoverUserId('');
      setReason('');
      setFeedbackMsg(`Zero-Context Leave Handover activated: ${res.delegatedTasksCount || 0} active tasks delegated.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchLeavesAndUsers();
    } catch (err) {
      console.error('Failed to submit leave:', err);
    }
  };

  const handleViewDossier = async (leaveId: string) => {
    try {
      const dossier = await api.get<any>(`/continuity/leaves/${leaveId}/dossier`);
      setSelectedDossier(dossier);
      setDossierModalOpen(true);
    } catch (err) {
      console.error('Failed to load dossier:', err);
    }
  };

  const handleEmergencyEscalation = async (leaveId: string) => {
    try {
      const res = await api.post<any>(`/continuity/leaves/${leaveId}/emergency`);
      setFeedbackMsg(`Emergency coverage escalated to ${res.assignedDelegateName}. ${res.delegatedTasksCount} tasks routed.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchLeavesAndUsers();
    } catch (err) {
      console.error('Emergency escalation error:', err);
    }
  };

  const handleProcessReturn = async (leaveId: string) => {
    try {
      const res = await api.post<any>(`/continuity/leaves/${leaveId}/handback`);
      setDebriefResult(res);
      setDebriefModalOpen(true);
      fetchLeavesAndUsers();
    } catch (err) {
      console.error('Return handback error:', err);
    }
  };

  const filteredExceptions = exceptions.filter((ex) => {
    if (severityFilter !== 'ALL' && ex.severity.toLowerCase() !== severityFilter.toLowerCase()) return false;
    if (statusFilter !== 'ALL' && ex.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const openExceptionsCount = exceptions.filter((e) => e.status !== 'resolved').length;
  const criticalCount = exceptions.filter((e) => e.severity === 'critical' && e.status !== 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-300 pb-32">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                PRD §23 Incident & Exception Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PRD §21 Continuity & Handover
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <AlertOctagon className="w-7 h-7 text-rose-400" />
              Exception Handling, Incident Engine & Continuity Matrix
            </h1>
            <p className="text-xs text-slate-400">
              Automated anomaly detection, 4-tier severity matrix, AI 5-Why root cause analysis, CAPA action generator, and SRE blameless post-mortems.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunScan}
              disabled={scanning}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono font-bold border border-rose-500/30 transition-all shadow-lg shadow-rose-500/10"
            >
              <Activity className={`w-4 h-4 ${scanning ? 'animate-spin text-rose-400' : ''}`} />
              <span>{scanning ? 'Auditing Database...' : 'Run Telemetry Scan'}</span>
            </button>
            <button
              onClick={() => {
                fetchExceptions();
                fetchLeavesAndUsers();
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/15 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs font-mono animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex rounded-2xl bg-white/5 p-1 text-xs font-mono max-w-md border border-white/10">
          <button
            onClick={() => setActiveTab('EXCEPTIONS')}
            className={`flex-1 py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'EXCEPTIONS'
                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> Incident Exceptions ({openExceptionsCount})
          </button>
          <button
            onClick={() => setActiveTab('CONTINUITY')}
            className={`flex-1 py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'CONTINUITY'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Continuity & Handover ({leaves.filter((l) => l.continuityActivated).length})
          </button>
        </div>

        {activeTab === 'CONTINUITY' ? (
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Plan Leave & Delegate
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {/* Severity Filter */}
            <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[11px] font-mono">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    severityFilter === s
                      ? s === 'CRITICAL'
                        ? 'bg-red-500/30 text-red-300 font-bold'
                        : 'bg-white/15 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: OPERATIONAL EXCEPTIONS */}
      {activeTab === 'EXCEPTIONS' && (
        <div className="space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Active Incidents</span>
              <div className="text-2xl font-bold text-white font-mono">{openExceptionsCount}</div>
              <span className="text-[10px] text-slate-400 font-mono">Across all departments</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-red-500/20 space-y-1 bg-red-500/[0.02]">
              <span className="text-[10px] font-mono text-red-400 uppercase">P1 Critical SLA Risks</span>
              <div className="text-2xl font-bold text-red-400 font-mono">{criticalCount}</div>
              <span className="text-[10px] text-red-300 font-mono">&lt; 4h remediation SLA</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Mean Time to Triage</span>
              <div className="text-2xl font-bold text-sky-400 font-mono">14.2m</div>
              <span className="text-[10px] text-slate-400 font-mono">Autonomous classification</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">CAPA Prevention Rate</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">92%</div>
              <span className="text-[10px] text-slate-400 font-mono">Direct task conversion</span>
            </div>
          </div>

          {/* Exceptions List */}
          <div className="space-y-3">
            {filteredExceptions.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">No Active Operational Exceptions</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  All systems operating within established SLA parameters. Run a telemetry scan to check for new anomalies.
                </p>
              </div>
            ) : (
              filteredExceptions.map((ex) => (
                <div
                  key={ex.id}
                  className={`glass-panel p-5 rounded-2xl border transition-all ${
                    ex.status === 'resolved'
                      ? 'border-white/10 bg-white/[0.01] opacity-70'
                      : ex.severity === 'critical'
                      ? 'border-red-500/40 bg-red-500/[0.03]'
                      : 'border-white/15 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            ex.severity === 'critical'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : ex.severity === 'high'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                          }`}
                        >
                          {ex.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300 border border-white/10">
                          {ex.exceptionType}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">{ex.departmentName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {ex.id.slice(0, 8)}...</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            ex.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : ex.status === 'actioned'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {ex.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white">{ex.title}</h3>
                      <p className="text-xs text-slate-400">{ex.details}</p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                        {ex.taskTitle && (
                          <span>
                            Linked Task: <strong className="text-sky-300">{ex.taskTitle}</strong>
                          </span>
                        )}
                        {ex.assignedUser && (
                          <span>
                            Incident Lead: <strong className="text-indigo-300">{ex.assignedUser.firstName} {ex.assignedUser.lastName}</strong>
                          </span>
                        )}
                        <span>Detected: <strong className="text-slate-200">{new Date(ex.createdAt).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleOpenAnalysis(ex.id)}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/10"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>5-Why Analysis</span>
                      </button>

                      <button
                        onClick={() => handleOpenPostMortem(ex.id)}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        <span>Post-Mortem</span>
                      </button>

                      {ex.status !== 'resolved' && (
                        <>
                          <button
                            onClick={() => handleOpenTriage(ex)}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono flex items-center gap-1"
                          >
                            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                            <span>Triage</span>
                          </button>

                          <button
                            onClick={() => handleOpenResolve(ex)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONTINUITY & LEAVE HANDOVER */}
      {activeTab === 'CONTINUITY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Active Handovers</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                {leaves.filter((l) => l.continuityActivated).length} Delegated
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Automatic task routing engaged</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Zero-Context Loss Coverage</span>
              <div className="text-2xl font-bold text-sky-400 font-mono">100% Guaranteed</div>
              <span className="text-[10px] text-slate-400 font-mono">SLA dead-zone prevention active</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Emergency Protocol</span>
              <div className="text-2xl font-bold text-indigo-400 font-mono">Dept Delegate Fallback</div>
              <span className="text-[10px] text-slate-400 font-mono">Automatic routing on unplanned leave</span>
            </div>
          </div>

          <div className="space-y-3">
            {leaves.map((leave) => (
              <div key={leave.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{leave.userName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                        {leave.departmentName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Period: <strong className="text-slate-200">{leave.startDate}</strong> to{' '}
                      <strong className="text-slate-200">{leave.endDate}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        leave.status === 'completed'
                          ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                          : leave.continuityActivated
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {leave.continuityActivated ? 'Continuity Active' : leave.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 text-slate-300">
                    <p>Reason: {leave.reason}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Temporary Delegate:{' '}
                      <strong className="text-indigo-400">{leave.handoverUserName || 'Not Assigned'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDossier(leave.id)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-400" /> View Dossier
                    </button>

                    {!leave.handoverUserId && leave.status !== 'completed' && (
                      <button
                        onClick={() => handleEmergencyEscalation(leave.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1"
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> Trigger Emergency Coverage
                      </button>
                    )}

                    {leave.status !== 'completed' && (
                      <button
                        onClick={() => handleProcessReturn(leave.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-400" /> Return & Debrief
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 5-WHY ROOT CAUSE ANALYSIS DRAWER / MODAL */}
      {analysisDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-purple-500/30 p-6 space-y-5 bg-slate-950/95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">AI 5-Why Root Cause Diagnosis</h2>
              </div>
              <button
                onClick={() => setAnalysisDrawerOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {analysisLoading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs animate-pulse">
                Synthesizing multi-order systemic causal factors...
              </div>
            ) : selectedAnalysis ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">Primary Root Cause</span>
                  <p className="text-sm font-semibold text-white">{selectedAnalysis.primaryRootCause}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">5-Why Progressive Diagnostic Chain</h4>
                  <div className="space-y-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono">
                    {selectedAnalysis.fiveWhys.map((why, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-300">
                        <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>{why}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">Blast Radius & Impact</h4>
                  <p className="text-xs text-amber-300 font-mono p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    {selectedAnalysis.blastRadiusAssessment}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">Preventive Corrective Actions (CAPA)</h4>
                  <div className="space-y-2">
                    {selectedAnalysis.preventiveActionRecommendations.map((capa, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{capa.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300">
                            {capa.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{capa.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    onClick={() => setAnalysisDrawerOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleDispatchCapaTasks}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Dispatch CAPA Tasks to Orbit
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* SRE BLAMELESS POST-MORTEM MODAL */}
      {postMortemModalOpen && postMortemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-sky-500/30 p-6 space-y-5 bg-slate-950/95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-bold text-white">SRE Blameless Post-Mortem Report</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {postMortemData.severityGrade}
                </span>
              </div>
              <button
                onClick={() => setPostMortemModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Executive Summary</span>
                <p className="text-slate-200">{postMortemData.executiveSummary}</p>
                <div className="flex gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Lead Investigator: <strong className="text-white">{postMortemData.leadInvestigator}</strong></span>
                  <span>Detection Method: <strong className="text-sky-400">{postMortemData.detectionMethod}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Timeline of Events</span>
                <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                  {postMortemData.timeline.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-16 font-bold text-sky-400 flex-shrink-0">{item.timeOffset}</span>
                      <span className="text-slate-300">{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Lessons Learned</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="font-bold text-emerald-400">What Went Well</span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                      {postMortemData.lessonsLearned.whatWentWell.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                    <span className="font-bold text-rose-400">What Went Wrong</span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                      {postMortemData.lessonsLearned.whatWentWrong.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <span className="font-bold text-amber-400">Where We Got Lucky</span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                      {postMortemData.lessonsLearned.whereWeGotLucky.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <span className="text-[11px] font-mono text-slate-500">
                Adheres to Google SRE & PRD §23 blameless post-mortem specifications.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPostMortem}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copiedPostMortem ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPostMortem ? 'Copied Markdown' : 'Copy Post-Mortem'}</span>
                </button>
                <button
                  onClick={() => setPostMortemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRIAGE MODAL */}
      {triageModalOpen && selectedExceptionForTriage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <form
            onSubmit={handleSubmitTriage}
            className="glass-panel w-full max-w-lg rounded-3xl border border-amber-500/30 p-6 space-y-4 bg-slate-950/95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Crosshair className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Incident Triage & Commander Assignment</h2>
              </div>
              <button
                type="button"
                onClick={() => setTriageModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Severity Override</label>
                <select
                  value={triageSeverity}
                  onChange={(e) => setTriageSeverity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="critical">CRITICAL (P1 - 4h SLA)</option>
                  <option value="high">HIGH (P2 - 12h SLA)</option>
                  <option value="medium">MEDIUM (P3 - 24h SLA)</option>
                  <option value="low">LOW (P4 - 72h SLA)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Assign Incident Lead</label>
                <select
                  value={triageAssignee}
                  onChange={(e) => setTriageAssignee(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Triage Justification Notes</label>
                <textarea
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="e.g. Confirmed localized impact on cluster replication; assigned lead engineer."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10 font-mono">
              <button
                type="button"
                onClick={() => setTriageModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Commit Triage
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESOLVE MODAL */}
      {resolveModalOpen && selectedExceptionForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <form
            onSubmit={handleSubmitResolve}
            className="glass-panel w-full max-w-lg rounded-3xl border border-emerald-500/30 p-6 space-y-4 bg-slate-950/95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Resolve Operational Exception</h2>
              </div>
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400">Exception Title</span>
                <p className="font-bold text-white">{selectedExceptionForResolve.title}</p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Resolution & Corrective Summary Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Backlog unblocked via automated shard load balancing and CAPA task verification."
                  rows={3}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10 font-mono">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Sign-off & Resolve
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PLAN LEAVE MODAL */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateLeave}
            className="glass-panel w-full max-w-lg rounded-3xl border border-emerald-500/30 p-6 space-y-4 bg-slate-950/95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Plan Leave & Delegate Continuity</h2>
              </div>
              <button
                type="button"
                onClick={() => setLeaveModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Designated Handover Delegate</label>
                <select
                  value={handoverUserId}
                  onChange={(e) => setHandoverUserId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Delegate...</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Leave Reason / Handover Context</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Planned Annual Leave. Handing over all sprint commitments."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10 font-mono">
              <button
                type="button"
                onClick={() => setLeaveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Activate Protocol
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DOSSIER MODAL */}
      {dossierModalOpen && selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-sky-500/30 p-6 space-y-4 bg-slate-950/95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h2 className="text-base font-bold text-white">Zero-Context-Loss Handover Dossier</h2>
              </div>
              <button
                onClick={() => setDossierModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <div>
                  <span className="text-[10px] uppercase text-sky-400 font-bold">Handover Readiness Score</span>
                  <div className="text-xl font-bold text-sky-300">{selectedDossier.handoverReadinessScore}%</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400">Duration</span>
                  <div className="text-white font-bold">{selectedDossier.leavePeriod.durationDays} Days</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Active Transferred Workstreams</span>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {selectedDossier.activeTasks.map((t) => (
                    <div key={t.id} className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-white font-medium">{t.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-slate-300">{t.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase text-slate-400 font-bold">AI Recommended Action Plan</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {selectedDossier.recommendedActionPlan.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-white/10">
              <button
                onClick={() => setDossierModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN DEBRIEF MODAL */}
      {debriefModalOpen && debriefResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-emerald-500/30 p-6 space-y-4 bg-slate-950/95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Return Debrief & Workstream Handback</h2>
              </div>
              <button
                onClick={() => setDebriefModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <p className="text-slate-300 leading-relaxed p-3 rounded-xl bg-white/5 border border-white/10">
                {debriefResult.debriefReport}
              </p>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-lg font-bold text-emerald-300 font-mono">
                    {debriefResult.tasksCompletedDuringLeave?.length || 0}
                  </div>
                  <span className="text-[10px] text-slate-400">Tasks Completed During Absence</span>
                </div>
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                  <div className="text-lg font-bold text-sky-300 font-mono">
                    {debriefResult.restoredTasksCount || 0}
                  </div>
                  <span className="text-[10px] text-slate-400">Active Tasks Restored</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-white/10">
              <button
                onClick={() => setDebriefModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono"
              >
                Acknowledge Handback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExceptionsView;
