import React from 'react';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LeaderboardView: React.FC = () => {
  const { employees } = useApp();

  // Custom evaluation categories
  const categories = ['OUTPUT', 'RETURN', 'GROWTH', 'MOTIVATION', 'WELLBEING'];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">PERFORMANCE REFRACTION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">The Leaderboard — Top Performers</h1>
          <p className="text-xs text-slate-400 mt-1">
            Refracted rankings across Output, Return, Growth, Motivation, and Wellbeing
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300">
          Rankings Refracted
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((c, i) => (
          <div key={c} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 shrink-0 flex items-center space-x-2">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{c}</span>
          </div>
        ))}
      </div>

      {/* Leaderboard Roster Cards */}
      <div className="space-y-4">
        {employees.map((emp, index) => (
          <div
            key={emp.id}
            className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm ${
                  index === 0
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : index === 1
                    ? 'bg-slate-300 text-slate-950'
                    : index === 2
                    ? 'bg-amber-700 text-white'
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}
              >
                #{index + 1}
              </div>

              <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />

              <div>
                <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                <p className="text-xs font-mono text-sky-400">{emp.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-right">
              <div>
                <span className="text-xs text-slate-400 block font-mono">OUTPUT SCORE</span>
                <span className="text-sm font-bold text-amber-400">{98 - index * 3} pts</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">GROWTH</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                  <TrendingUp className="w-3 h-3" /> +{(5 - index * 0.4).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
