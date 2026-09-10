import React from 'react';
import { BarChart3, Download, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SynthesisView: React.FC = () => {
  const { synthesisReports } = useApp();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">EXECUTIVE REPORTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Synthesis — Velocity Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            AI COO operational narratives, velocity scores, and lead/lag risk summaries
          </p>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Executive PDF</span>
        </button>
      </div>

      {/* Synthesis Reports Stream */}
      <div className="space-y-6">
        {synthesisReports.map(rep => (
          <div key={rep.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">{rep.title}</h3>
                <span className="text-xs font-mono text-slate-400">{rep.date}</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-sky-400">{rep.executionVelocityScore}</span>
                <span className="block text-[10px] font-mono text-slate-400">VELOCITY INDEX</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-200 leading-relaxed">
              <strong className="block font-mono text-sky-400 uppercase mb-1">Luminary Executive Narrative</strong>
              <p>{rep.aiNarrativeSummary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <span className="font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Operational Highlights
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {rep.highlights.map((h, i) => (
                    <li key={i}>• {h}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <span className="font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Risk Flags & Bottlenecks
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {rep.risks.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
