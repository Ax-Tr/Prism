import React from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KpiView: React.FC = () => {
  const { kpis } = useApp();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">STRATEGIC OBJECTIVES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">KPI & OKR Variance Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Quarterly target variance, priority weightings, and real-time metric trends
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300">
          Q4 Cycle Active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map(k => {
          const pct = Math.min(100, Math.round((k.current / k.target) * 100));
          return (
            <div key={k.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{k.category}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{k.name}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    k.status === 'on_track'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  }`}
                >
                  {k.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-white">{k.current}</span>
                  <span className="text-xs text-slate-400 ml-1">{k.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">Target: {k.target} {k.unit}</span>
                  <span className="block text-[10px] text-slate-500 font-mono">Weight: {k.weight}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Progress</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      k.status === 'on_track' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
