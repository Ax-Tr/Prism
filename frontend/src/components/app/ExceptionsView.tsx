import React, { useState } from 'react';
import {
  AlertOctagon, AlertTriangle, ArrowRight, CheckCircle2,
  Clock, ShieldAlert, UserCheck, RefreshCw, Zap
} from 'lucide-react';

interface SystemException {
  id: string;
  department: string;
  type: 'missed_deadline' | 'approval_stalled' | 'continuity_gap' | 'low_discipline';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  assignedTo: string;
  delegate: string;
  status: 'OPEN' | 'RESOLVED';
  timeOpen: string;
}

const INITIAL_EXCEPTIONS: SystemException[] = [
  {
    id: 'EX-101',
    department: 'Engineering',
    type: 'approval_stalled',
    severity: 'high',
    title: 'Task Proof Awaiting Review > 2 Hours',
    description: 'Pull request proof for Append-Only Audit Logging Middleware is pending Dept Head review.',
    assignedTo: 'Sarah Kim',
    delegate: 'Elena Rostova',
    status: 'OPEN',
    timeOpen: '2h 15m',
  },
  {
    id: 'EX-102',
    department: 'Operations',
    type: 'continuity_gap',
    severity: 'medium',
    title: 'Manager Leave Handover Active',
    description: 'Marcus Chen on planned leave. Full temporary signing delegate routed to Jordan Taylor.',
    assignedTo: 'Marcus Chen',
    delegate: 'Jordan Taylor (Active)',
    status: 'RESOLVED',
    timeOpen: 'Resolved',
  },
  {
    id: 'EX-103',
    department: 'Growth & Partnerships',
    type: 'low_discipline',
    severity: 'medium',
    title: 'Daily Check-in Pending',
    description: 'Growth department has 1 pending standup log submission past the 11:00 AM window.',
    assignedTo: 'Growth Team',
    delegate: 'Auto-Escalate at 2:00 PM',
    status: 'OPEN',
    timeOpen: '45m',
  },
];

export const ExceptionsView: React.FC = () => {
  const [exceptions, setExceptions] = useState<SystemException[]>(INITIAL_EXCEPTIONS);
  const [autoResolveMsg, setAutoResolveMsg] = useState<string | null>(null);

  const handleResolve = (id: string) => {
    setExceptions((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, status: 'RESOLVED', timeOpen: 'Just Now' } : ex))
    );
    setAutoResolveMsg(`Exception ${id} marked as resolved and verified in audit log.`);
    setTimeout(() => setAutoResolveMsg(null), 3500);
  };

  const getSeverityBadge = (sev: SystemException['severity']) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-red-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Automated Exception Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Zero-Disruption Continuity Matrix
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <AlertOctagon className="w-7 h-7 text-amber-400" />
              Exceptions, Bottlenecks & Continuity Matrix
            </h1>
            <p className="text-sm text-slate-400">
              Real-time anomaly detection, stalled approvals, unassigned tasks, and automatic handover delegations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setAutoResolveMsg('Automated scanner synchronized. 0 new critical bottlenecks detected.');
                setTimeout(() => setAutoResolveMsg(null), 3000);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rescan System</span>
            </button>
          </div>
        </div>

        {autoResolveMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{autoResolveMsg}</span>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Open Bottlenecks</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {exceptions.filter((e) => e.status === 'OPEN').length} Active
          </p>
          <p className="text-[11px] text-amber-400">Automated escalation triggers armed</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Continuity Handover</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">100% Covered</p>
          <p className="text-[11px] text-emerald-400">Jordan Taylor active delegate</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">38 Minutes</p>
          <p className="text-[11px] text-slate-400">Within 2h SLA threshold</p>
        </div>
      </div>

      {/* Exception Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Active Exceptions & Continuity Triggers
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {exceptions.map((ex) => (
            <div
              key={ex.id}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                ex.status === 'OPEN'
                  ? 'border-amber-500/30 bg-amber-500/[0.02]'
                  : 'border-white/10 bg-white/[0.01] opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getSeverityBadge(ex.severity)}`}>
                      {ex.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">{ex.department}</span>
                    <span className="text-xs text-slate-500">• {ex.id}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{ex.title}</h3>
                  <p className="text-xs text-slate-400">{ex.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Assigned: <strong className="text-slate-200">{ex.assignedTo}</strong></span>
                    <span>Delegate / Fallback: <strong className="text-indigo-400">{ex.delegate}</strong></span>
                    <span>Duration: <strong className="text-amber-400">{ex.timeOpen}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {ex.status === 'OPEN' ? (
                    <button
                      onClick={() => handleResolve(ex.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve & Acknowledge</span>
                    </button>
                  ) : (
                    <span className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 text-xs font-medium border border-white/10">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ExceptionsView;
