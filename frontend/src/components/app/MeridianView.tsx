import React, { useState, useEffect } from 'react';
import {
  GitPullRequest, Layers, Network, CheckCircle2, Clock,
  Plus, Target, TrendingUp, Edit3, X, ChevronRight, BarChart2,
  AlertTriangle, ShieldCheck, FileCheck, ArrowUpRight, RefreshCw,
  Sliders, ChevronDown, Activity, Sparkles
} from 'lucide-react';
import api from '../../lib/apiClient';

interface TaskPreview {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  proofRequired: boolean;
  proofs: { id: string; proofType: string; approvalStatus: string }[];
}

interface PriorityHierarchyItem {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  rankOrder: number;
  weight: number;
  tasksCount: number;
  tasks: TaskPreview[];
}

interface GoalHierarchyItem {
  id: string;
  title: string;
  description: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  status: string;
  overallProgress: number;
  taskProgressPct: number;
  metricProgressPct: number;
  totalTasks: number;
  completedTasks: number;
  verifiedProofs: number;
  priorities: PriorityHierarchyItem[];
}

interface DependencyBlocker {
  taskId: string;
  taskTitle: string;
  department: string;
  departmentCode: string;
  status: string;
  isOverdue: boolean;
  blockerAgeHours: number;
  linkedGoal: string;
  riskLevel: 'HIGH' | 'MEDIUM';
}

interface DependencyGraphData {
  nodes: any[];
  edges: any[];
  blockers: DependencyBlocker[];
  criticalPathRiskScore: 'HIGH' | 'ELEVATED' | 'NOMINAL';
}

export const MeridianView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'Strategic Cascade' | 'Dependency Graph' | 'Department Priorities'>('Strategic Cascade');
  const [goals, setGoals] = useState<GoalHierarchyItem[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [vision, setVision] = useState('');
  const [depGraph, setDepGraph] = useState<DependencyGraphData | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Expanded goal IDs in cascade tree
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  // Modals
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoalForCheckin, setSelectedGoalForCheckin] = useState<GoalHierarchyItem | null>(null);

  // New goal form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetMetric, setNewTargetMetric] = useState('Uptime SLA');
  const [newTargetValue, setNewTargetValue] = useState<number>(99.9);
  const [newUnit, setNewUnit] = useState('%');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTargetDate, setNewTargetDate] = useState('2026-12-31');

  // Check-in form state
  const [checkinValue, setCheckinValue] = useState<number>(0);
  const [checkinStatus, setCheckinStatus] = useState<string>('active');

  // Feedback Notification
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // 1. Fetch Strategic Hierarchy & Dependency Graph
  const fetchStrategyData = async () => {
    try {
      setLoading(true);
      const [hierarchyRes, graphRes, deptsRes] = await Promise.all([
        api.get<{ vision: string; pillars: any[]; goals: GoalHierarchyItem[] }>('/api/v1/goals/hierarchy'),
        api.get<DependencyGraphData>('/api/v1/goals/dependencies/graph'),
        api.get<any[]>('/api/v1/departments'),
      ]);

      if (hierarchyRes) {
        setGoals(hierarchyRes.goals || []);
        setPillars(hierarchyRes.pillars || []);
        setVision(hierarchyRes.vision || '');
        // Auto-expand first goal
        if (hierarchyRes.goals && hierarchyRes.goals.length > 0) {
          setExpandedGoals({ [hierarchyRes.goals[0].id]: true });
        }
      }

      if (graphRes) setDepGraph(graphRes);
      if (deptsRes) setDepartments(deptsRes);
    } catch (err) {
      console.warn('Error fetching strategic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategyData();
  }, []);

  const toggleGoalExpand = (goalId: string) => {
    setExpandedGoals((prev) => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  // 2. Handle Create Strategic Goal
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.post<any>('/api/v1/goals', {
        title: newTitle.trim(),
        description: newDescription.trim(),
        targetMetric: newTargetMetric,
        targetValue: Number(newTargetValue),
        unit: newUnit,
        startDate: newStartDate,
        targetDate: newTargetDate,
      });

      if (res) {
        setFeedbackMsg(`Strategic Goal "${newTitle}" created and aligned with vision.`);
        setTimeout(() => setFeedbackMsg(null), 3500);
        setShowGoalModal(false);
        setNewTitle('');
        setNewDescription('');
        fetchStrategyData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create goal');
    }
  };

  // 3. Handle OKR Check-in & Progress Update
  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForCheckin) return;

    try {
      const res = await api.patch<any>(`/api/v1/goals/${selectedGoalForCheckin.id}`, {
        currentValue: Number(checkinValue),
        status: checkinStatus,
      });

      if (res) {
        setFeedbackMsg(`Goal progress updated to ${checkinValue} ${selectedGoalForCheckin.unit}.`);
        setTimeout(() => setFeedbackMsg(null), 3500);
        setSelectedGoalForCheckin(null);
        fetchStrategyData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update goal check-in');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <GitPullRequest className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">STRATEGY CASCADE & OKR TRACEABILITY (PRD §11)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Meridian Strategy & OKR Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Bidirectional strategic cascade linking corporate vision $\rightarrow$ strategic pillars $\rightarrow$ OKRs $\rightarrow$ department priorities $\rightarrow$ proof-verified tasks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-2xl">
            {(['Strategic Cascade', 'Dependency Graph', 'Department Priorities'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === mode
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowGoalModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Vision & Strategic Pillars Hero Banner */}
      {vision && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 bg-purple-500/[0.03] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-widest flex items-center space-x-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CORPORATE VISION & STRATEGIC PILLARS</span>
            </span>
            <button
              onClick={fetchStrategyData}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed italic">
            "{vision}"
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Pillar 0{idx + 1}</span>
                <h4 className="text-xs font-bold text-white">{pillar.name}</h4>
                <p className="text-[11px] text-slate-400 leading-normal">{pillar.description}</p>
              </div>
            ))}
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
      {/* VIEW 1: STRATEGIC CASCADE & OKR TREE (PRD §11 FR-030) */}
      {/* ==================================================== */}
      {viewMode === 'Strategic Cascade' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-mono">
            <span>CASCADE TREE: VISION $\rightarrow$ GOALS $\rightarrow$ PRIORITIES $\rightarrow$ VERIFIED TASKS</span>
            <span>{goals.length} ACTIVE STRATEGIC OBJECTIVES</span>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => {
              const isExpanded = !!expandedGoals[goal.id];
              return (
                <div
                  key={goal.id}
                  className="glass-panel rounded-3xl border border-white/10 hover:border-purple-500/30 transition-all overflow-hidden shadow-xl"
                >
                  {/* Goal Header Summary Card */}
                  <div
                    onClick={() => toggleGoalExpand(goal.id)}
                    className="p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          goal.status === 'achieved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : goal.status === 'at_risk'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          {goal.status.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">Target: {goal.targetDate}</span>
                      </div>

                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <span>{goal.title}</span>
                      </h3>

                      {goal.description && (
                        <p className="text-xs text-slate-400">{goal.description}</p>
                      )}
                    </div>

                    {/* Progress Bar & Metric Stats */}
                    <div className="flex items-center space-x-6 shrink-0 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Metric Progression</span>
                        <p className="text-sm font-extrabold text-purple-300">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </p>
                        <div className="w-32 bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${goal.metricProgressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedGoalForCheckin(goal);
                            setCheckinValue(goal.currentValue);
                            setCheckinStatus(goal.status);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Check-in</span>
                        </button>

                        <div className="p-1 rounded-full text-slate-400">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Cascade Children (Priorities & Linked Tasks) */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-white/5 bg-black/20 space-y-4 animate-in fade-in duration-200">
                      <div className="pt-3">
                        <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-bold">
                          Departmental Priorities & Execution Cascade ({goal.priorities.length} Linked Units)
                        </span>
                      </div>

                      {goal.priorities.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-3">No departmental priorities linked yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {goal.priorities.map((priority) => (
                            <div key={priority.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                                  {priority.departmentCode} (Multiplier ×{priority.weight})
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  Rank #{priority.rankOrder}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-white">{priority.title}</h4>

                              {/* Nested Tasks */}
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Delivery Stream ({priority.tasks.length} tasks)</span>
                                {priority.tasks.map((task) => (
                                  <div key={task.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                                    <div className="space-y-0.5 truncate pr-2">
                                      <p className="text-slate-200 font-medium truncate">{task.title}</p>
                                      <span className="text-[10px] font-mono text-slate-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5 shrink-0">
                                      {task.proofs && task.proofs.some((p) => p.approvalStatus === 'accepted') && (
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                      )}
                                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                                        task.status === 'completed'
                                          ? 'bg-emerald-500/20 text-emerald-300'
                                          : 'bg-sky-500/20 text-sky-300'
                                      }`}>
                                        {task.status.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 2: DEPENDENCY GRAPH & BLOCKERS (PRD §11 FR-032) */}
      {/* ==================================================== */}
      {viewMode === 'Dependency Graph' && depGraph && (
        <div className="space-y-6">
          {/* Critical Path Risk Summary */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">CROSS-TEAM DEPENDENCY MATRIX</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Critical Path Blockers & Risk Telemetry</h3>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                depGraph.criticalPathRiskScore === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : depGraph.criticalPathRiskScore === 'ELEVATED'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                RISK LEVEL: {depGraph.criticalPathRiskScore}
              </span>
            </div>

            {depGraph.blockers.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Critical Path Blockers</h4>
                <p className="text-xs text-slate-400">All cross-team dependencies and OKR milestones are executing within nominal SLAs.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {depGraph.blockers.map((blocker) => (
                  <div key={blocker.taskId} className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                        {blocker.departmentCode}
                      </span>
                      <span className="text-rose-400 font-mono text-[10px] font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Aging {blocker.blockerAgeHours}h</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{blocker.taskTitle}</h4>
                    <p className="text-xs text-slate-400">
                      Impacts Goal: <strong className="text-purple-300">{blocker.linkedGoal}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 3: DEPARTMENT PRIORITIES & MULTIPLIERS          */}
      {/* ==================================================== */}
      {viewMode === 'Department Priorities' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Department Priority Distribution & Scoring Multipliers</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Task velocity, performance merit scoring, and SLA weights scale dynamically by department strategic priority rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <strong className="text-white">Engineering & Platform (ENG)</strong>
                <span className="font-mono text-purple-300 font-bold px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">Multiplier 1.5×</span>
              </div>
              <p className="text-xs text-slate-400">
                Primary Goal: Scale Multi-Tenant Infrastructure, Proof Storage & RBAC Security Layers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <strong className="text-white">Operations & Continuity (OPS)</strong>
                <span className="font-mono text-sky-300 font-bold px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20">Multiplier 1.2×</span>
              </div>
              <p className="text-xs text-slate-400">
                Primary Goal: Zero-Disruption Operational Handover Matrix for Manager Leaves.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 1: CREATE STRATEGIC GOAL MODAL      */}
      {/* ========================================== */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Create Strategic Corporate Goal</h3>
              </div>
              <button onClick={() => setShowGoalModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Achieve 99.99% Operational Uptime SLA"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Description & Intent</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Strategic importance, key deliverables, and organizational alignment..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Target Metric Name *</label>
                  <input
                    type="text"
                    required
                    value={newTargetMetric}
                    onChange={(e) => setNewTargetMetric(e.target.value)}
                    placeholder="e.g. Uptime SLA"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Target Numerical Value *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Unit (e.g. %, modules, pilots)</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Target Target Date *</label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold shadow-lg shadow-purple-500/20"
                >
                  Save Strategic Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: OKR CHECK-IN MODAL               */}
      {/* ========================================== */}
      {selectedGoalForCheckin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">OKR Progress Check-in</h3>
              </div>
              <button onClick={() => setSelectedGoalForCheckin(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Updating progress telemetry for: <strong className="text-white">{selectedGoalForCheckin.title}</strong>
            </p>

            <form onSubmit={handleCheckinSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>Current Metric Value</span>
                  <span className="font-mono text-purple-300 font-bold">{checkinValue} / {selectedGoalForCheckin.targetValue} {selectedGoalForCheckin.unit}</span>
                </div>
                <input
                  type="number"
                  step="any"
                  required
                  value={checkinValue}
                  onChange={(e) => setCheckinValue(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Health Status</label>
                <select
                  value={checkinStatus}
                  onChange={(e) => setCheckinStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="active" className="bg-slate-900">Active (On Track)</option>
                  <option value="at_risk" className="bg-slate-900">At Risk (Behind Target)</option>
                  <option value="achieved" className="bg-slate-900">Achieved (Completed)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForCheckin(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold"
                >
                  Submit Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MeridianView;
