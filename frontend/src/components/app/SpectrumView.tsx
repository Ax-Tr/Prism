import React from 'react';
import { Compass, Zap, Activity, AlertTriangle, ArrowUpRight, TrendingUp, Users, CheckSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SpectrumView: React.FC = () => {
  const { employees, tasks, kpis, synthesisReports, setActiveTab } = useApp();

  const latestReport = synthesisReports[0];
  const activeTasks = tasks.filter(t => t.status === 'IN_FLUX');

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Spectrum Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Operational Velocity & Executive Intelligence refractions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-center">
            <span className="block text-[10px] font-mono text-slate-400">VELOCITY INDEX</span>
            <span className="text-2xl font-bold text-sky-400">{latestReport?.executionVelocityScore || 73}/100</span>
          </div>
          <button
            onClick={() => setActiveTab('synthesis')}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all"
          >
            <span>Synthesis Report</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Team Bandwidth</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">82% <span className="text-xs text-emerald-400 font-normal">Optimal</span></p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Sprint Tasks</span>
            <CheckSquare className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{activeTasks.length} <span className="text-xs text-slate-400 font-normal">in flux</span></p>
          <p className="text-[11px] text-slate-400 mt-2">Across 4 engineering streams</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">KPI Target Health</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">80% <span className="text-xs text-emerald-400 font-normal">On Track</span></p>
          <p className="text-[11px] text-slate-400 mt-2">4 of 5 primary OKRs green</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Risk Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">1 <span className="text-xs text-amber-400 font-normal">Flagged</span></p>
          <p className="text-[11px] text-amber-400/80 mt-2">Attendance leave anomaly on Nov 12</p>
        </div>
      </div>

      {/* Executive Narrative & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-sky-400" />
              <span>Luminary Executive AI Narrative</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">UPDATED JUST NOW</span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-200 leading-relaxed">
            {latestReport?.aiNarrativeSummary ||
              'Engineering is currently operating at high momentum with Auth Service core implementation 2 weeks ahead of baseline schedule.'}
          </div>

          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider pt-2">Key Highlights</h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {latestReport?.highlights.map((h, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Team Roster Snippet */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Team Load</h3>
            <button onClick={() => setActiveTab('team')} className="text-xs text-sky-400 hover:underline">
              View All ↗
            </button>
          </div>

          <div className="space-y-3">
            {employees.slice(0, 4).map(emp => (
              <div key={emp.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center space-x-2.5">
                  <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-semibold text-white">{emp.name}</p>
                    <p className="text-[10px] text-slate-400">{emp.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-purple-400">{emp.bandwidthLoad}%</span>
                  <span className="block text-[9px] text-slate-500">load</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
