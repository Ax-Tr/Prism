import React from 'react';
import { Sliders, Shield, Key, Database, Cpu, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const CalibrationView: React.FC = () => {
  const { genesisConfig, updateGenesisConfig } = useApp();
  const { currentUser, logout } = useAuth();

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">SYSTEM CALIBRATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Calibration & Admin Controls</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organization identity, Luminary AI fine-tuning, privacy rules, and role management
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs"
        >
          Sign Out of Workspace
        </button>
      </div>

      {/* Account Info */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>Active Authenticated Session</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block">User Name</span>
            <span className="text-white font-bold">{currentUser?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Role</span>
            <span className="text-sky-400 font-bold">{currentUser?.role}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Department</span>
            <span className="text-purple-400 font-bold">{currentUser?.department}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Security Scoping</span>
            <span className="text-emerald-400 font-bold">JWT OAuth 2.1</span>
          </div>
        </div>
      </div>

      {/* Organization Calibration */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Luminary AI Engine Calibration</span>
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Organization Title</label>
            <input
              type="text"
              value={genesisConfig.companyName}
              onChange={e => updateGenesisConfig({ companyName: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Operational Mission Statement</label>
            <textarea
              value={genesisConfig.mission}
              onChange={e => updateGenesisConfig({ mission: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
