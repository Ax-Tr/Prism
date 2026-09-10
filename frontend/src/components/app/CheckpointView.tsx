import React from 'react';
import { ShieldCheck, AlertCircle, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CheckpointView: React.FC = () => {
  const { approvals, approveCheckpoint, rejectCheckpoint } = useApp();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-mono text-rose-400 uppercase tracking-widest">APPROVALS RADAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Checkpoint — Priority Approvals</h1>
          <p className="text-xs text-slate-400 mt-1">
            Urgency radar mapping architectural, financial, and deployment sign-offs
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300">
          Urgency Radar Active
        </div>
      </div>

      {/* Approvals Queue Cards */}
      <div className="space-y-4">
        {approvals.map(ap => (
          <div key={ap.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      ap.urgency === 'URGENT'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {ap.urgency}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{ap.category}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{ap.title}</h3>
                <p className="text-xs text-slate-400">Requested by: {ap.requestedBy} • {ap.date}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                  ap.status === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : ap.status === 'REJECTED'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {ap.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-2xl border border-white/5">{ap.impactSummary}</p>

            {ap.status === 'PENDING' && (
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => approveCheckpoint(ap.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Grant Executive Sign-off</span>
                </button>
                <button
                  onClick={() => rejectCheckpoint(ap.id)}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center space-x-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
