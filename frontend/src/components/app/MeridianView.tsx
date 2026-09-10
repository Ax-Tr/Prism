import React, { useState } from 'react';
import {
  GitPullRequest, Layers, Network, CheckCircle2, Clock,
  Plus, Target, TrendingUp, Edit3, X, ChevronRight, BarChart2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GoalItem {
  id: string;
  title: string;
  category: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'ACTIVE' | 'ACHIEVED' | 'AT_RISK';
  targetDate: string;
  linkedPriorities: { dept: string; title: string; weight: number }[];
}

const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'G-101',
    title: 'Scale Infrastructure & Achieve 99.9% Uptime',
    category: 'Engineering & Platform',
    targetMetric: 'Uptime SLA',
    targetValue: 99.9,
    currentValue: 99.7,
    unit: '%',
    status: 'ACTIVE',
    targetDate: '2026-12-31',
    linkedPriorities: [
      { dept: 'Engineering', title: 'Deploy PostgreSQL RLS & Audit Layer', weight: 1.5 },
      { dept: 'Operations', title: 'Zero-Disruption Continuity Matrix', weight: 1.2 },
    ],
  },
  {
    id: 'G-102',
    title: 'Deliver AI-BOS Phase 1 MVP Release',
    category: 'Product & Architecture',
    targetMetric: 'FRD Core Modules',
    targetValue: 16,
    currentValue: 12,
    unit: 'modules',
    status: 'ACTIVE',
    targetDate: '2027-03-28',
    linkedPriorities: [
      { dept: 'Engineering', title: 'High-Throughput Task & Proof Engine', weight: 1.0 },
      { dept: 'Executive', title: 'Luminary AI COO Reasoning Proxy', weight: 1.4 },
    ],
  },
  {
    id: 'G-103',
    title: 'Expand Multi-Tenant Client Pilot Network',
    category: 'Growth & Partnerships',
    targetMetric: 'Active Enterprise Pilots',
    targetValue: 20,
    currentValue: 18,
    unit: 'enterprises',
    status: 'ACHIEVED',
    targetDate: '2026-10-15',
    linkedPriorities: [
      { dept: 'Growth', title: 'Enterprise Security Compliance Review', weight: 1.0 },
    ],
  },
];

export const MeridianView: React.FC = () => {
  const { roadmapNodes } = useApp();
  const [viewMode, setViewMode] = useState<'Signal Path' | 'Goals & OKRs' | 'Priorities'>('Goals & OKRs');
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOALS);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // New goal state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Engineering & Platform');
  const [newTargetMetric, setNewTargetMetric] = useState('');
  const [newTargetValue, setNewTargetValue] = useState<number>(100);
  const [newUnit, setNewUnit] = useState('%');
  const [newTargetDate, setNewTargetDate] = useState('2026-12-31');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: GoalItem = {
      id: `G-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      targetMetric: newTargetMetric || 'Target Metric',
      targetValue: Number(newTargetValue),
      currentValue: 0,
      unit: newUnit,
      status: 'ACTIVE',
      targetDate: newTargetDate,
      linkedPriorities: [
        { dept: 'Engineering', title: 'Strategic Core Alignment', weight: 1.0 },
      ],
    };

    setGoals([newGoal, ...goals]);
    setNewTitle('');
    setShowGoalModal(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <GitPullRequest className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">STRATEGIC MERIDIAN & OKRs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Meridian — Milestone & Goal Network</h1>
          <p className="text-xs text-slate-400 mt-1">
            Company-wide goal cascade, department priority weights, and milestone progression tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Switcher */}
          <div className="flex items-center space-x-1 p-1 bg-white/5 border border-white/10 rounded-2xl">
            {(['Goals & OKRs', 'Signal Path', 'Priorities'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
            className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Goals & OKRs View */}
      {viewMode === 'Goals & OKRs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progressPct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
              return (
                <div
                  key={goal.id}
                  className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 hover:border-purple-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">{goal.category}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          goal.status === 'ACHIEVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{goal.title}</h3>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>{goal.targetMetric}</span>
                        <span className="font-mono font-bold text-white">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            goal.status === 'ACHIEVED' ? 'bg-emerald-400' : 'bg-gradient-to-r from-purple-500 to-sky-400'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>Progress: {progressPct}%</span>
                        <span>Target: {goal.targetDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-semibold text-slate-400">Department Priority Links</span>
                    <div className="space-y-1.5">
                      {goal.linkedPriorities.map((lp, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                          <span className="truncate pr-2">• {lp.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-purple-300">
                            {lp.dept} (×{lp.weight})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Signal Path View */}
      {viewMode === 'Signal Path' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapNodes.map((node) => (
            <div key={node.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-400 uppercase">{node.phase}</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    node.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : node.status === 'in_progress'
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  {node.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{node.title}</h3>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Target: {node.targetDate}</span>
                <span>Lead: {node.leadPerson}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Progress</span>
                  <span>{node.progress}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${node.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Priorities View */}
      {viewMode === 'Priorities' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-base font-semibold text-white">Department Priority Distribution & Scoring Weights</h2>
          <p className="text-xs text-slate-400">
            Task points and performance score contributions scale dynamically by department priority multipliers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <strong className="text-white">Engineering & Product</strong>
                <span className="font-mono text-sky-400 font-bold">Multiplier 1.5×</span>
              </div>
              <p className="text-xs text-slate-400">
                Primary OKR: Deliver Multi-Tenant Zero-Leakage Architecture & Task Engine.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <strong className="text-white">Operations & Continuity</strong>
                <span className="font-mono text-purple-400 font-bold">Multiplier 1.2×</span>
              </div>
              <p className="text-xs text-slate-400">
                Primary OKR: Zero-Disruption Handover Matrix for Manager Leave.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/15 max-w-md w-full space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Create Strategic Goal</h3>
              </div>
              <button onClick={() => setShowGoalModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Expand Pilot Enterprises to 50"
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Engineering & Platform" className="bg-slate-900">Engineering</option>
                    <option value="Product & Architecture" className="bg-slate-900">Product</option>
                    <option value="Growth & Partnerships" className="bg-slate-900">Growth</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Value</label>
                  <input
                    type="number"
                    required
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all"
                >
                  Save Goal
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
