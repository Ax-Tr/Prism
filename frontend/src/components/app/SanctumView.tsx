import React from 'react';
import { UserCheck, Sliders, Bot, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SanctumView: React.FC = () => {
  const { sanctumSettings, updateSanctumSettings } = useApp();

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">PERSONAL AVATAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Sanctum — Digital Twin Persona</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your AI avatar behavioral parameters, autonomy levels, and decision heuristics
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs font-mono text-sky-300">
          Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Visualizer */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-1 shadow-2xl shadow-sky-500/30">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <Bot className="w-12 h-12 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{sanctumSettings.aiAvatarPersona}</h3>
            <p className="text-xs text-slate-400 font-mono">Digital Executive Twin</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
            Luminary Agent Synced
          </div>
        </div>

        {/* Sliders & Parameters */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Behavioral Decision Heuristics</span>
          </h3>

          {/* Autonomy vs Alignment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Autonomy vs Alignment</span>
              <span className="font-mono text-sky-400 font-bold">{sanctumSettings.autonomyVsAlignment}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sanctumSettings.autonomyVsAlignment}
              onChange={e => updateSanctumSettings({ autonomyVsAlignment: Number(e.target.value) })}
              className="w-full accent-sky-500 bg-white/10 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Strict Alignment</span>
              <span>Full Autonomy</span>
            </div>
          </div>

          {/* Analytical vs Intuitive */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Analytical vs Intuitive Heuristic</span>
              <span className="font-mono text-purple-400 font-bold">{sanctumSettings.analyticalVsIntuitive}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sanctumSettings.analyticalVsIntuitive}
              onChange={e => updateSanctumSettings({ analyticalVsIntuitive: Number(e.target.value) })}
              className="w-full accent-purple-500 bg-white/10 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Data-Driven Only</span>
              <span>Intuitive Heuristic</span>
            </div>
          </div>

          {/* Work Style Selection */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-medium text-slate-300">Preferred Work Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Deep Work Focused', 'Hyper Collaborative', 'Balanced'] as const).map(ws => (
                <button
                  key={ws}
                  onClick={() => updateSanctumSettings({ workStyle: ws })}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    sanctumSettings.workStyle === ws
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {ws}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
