import React, { useState } from 'react';
import {
  UserCheck,
  Sliders,
  Bot,
  Sparkles,
  ShieldCheck,
  Lock,
  FileCheck2,
  Cpu,
  Zap,
  CheckCircle2,
  Layers,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SanctumView: React.FC = () => {
  const { sanctumSettings, updateSanctumSettings } = useApp();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdate = async (updates: any) => {
    await updateSanctumSettings(updates);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const autonomyTiers = [
    {
      id: 'ADVISORY',
      title: 'Tier 1: Advisory',
      desc: 'Produces operational briefings, risk alerts, and recommendations. Requires human action for all state changes.',
      badge: 'Read-Only Heuristics',
    },
    {
      id: 'COLLABORATIVE',
      title: 'Tier 2: Collaborative',
      desc: 'Pre-drafts checkpoint reviews, generates exception summaries, and stages task assignments for approval.',
      badge: 'Human-in-the-Loop',
    },
    {
      id: 'AUTONOMOUS',
      title: 'Tier 3: Autonomous',
      desc: 'Auto-dispatches SLA deadline nudges, routes continuity delegations, and schedules daily score snapshots.',
      badge: 'Bounded Automation',
    },
  ];

  const communicationTones = [
    { id: 'EXECUTIVE_CONCISE', title: 'Executive Concise', desc: 'Short, bulleted briefings focused on high-level PVI and risk.' },
    { id: 'STRATEGIC_DETAILED', title: 'Strategic Detailed', desc: 'Comprehensive operational synthesis with full OKR and proof citations.' },
    { id: 'SOCRATIC_COACHING', title: 'Socratic Coaching', desc: 'Guiding queries prompting team leads to evaluate bottlenecks and dependencies.' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">PERSONAL AVATAR & AI GOVERNANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Sanctum — Digital Twin Persona & Autonomy</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your AI avatar behavioral parameters, autonomy tiers, PII minimization, and decision heuristics (PRD §19 & §20)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved & Synced
            </span>
          )}
          <div className="px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs font-mono text-sky-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400 animate-pulse" /> RAG Engine Synced
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar Visualizer & Persona */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-1 shadow-2xl shadow-sky-500/30">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <Bot className="w-12 h-12 text-sky-400 animate-pulse" />
              </div>
            </div>
            <div className="w-full">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Avatar Persona Name</label>
              <input
                type="text"
                value={sanctumSettings.aiAvatarPersona || 'Luminary Prime COO'}
                onChange={(e) => handleUpdate({ aiAvatarPersona: e.target.value })}
                className="w-full text-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-sky-500/50"
              />
              <p className="text-xs text-slate-400 font-mono mt-1">Executive AI COO</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Prompt Guardrails Active
            </div>
          </div>

          {/* AI Security & Governance Status Box */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>AI Governance & Security Controls (PRD §20)</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Prompt Injection Defense</span>
                  <span className="text-[11px] text-slate-400">Heuristic pattern detection active</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Immutable Audit Ledger</span>
                  <span className="text-[11px] text-slate-400">All queries & actions recorded</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-mono border border-sky-500/30">
                  ENFORCED
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Tenant Isolation</span>
                  <span className="text-[11px] text-slate-400">PostgreSQL RLS Zero-Leak</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Autonomy Tiers & Parameters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Autonomy Level Selection */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Autonomy Tiers & Delegated Authority (PRD §19)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {autonomyTiers.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => handleUpdate({ autonomyLevel: tier.id })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    (sanctumSettings.autonomyLevel || 'COLLABORATIVE') === tier.id
                      ? 'bg-sky-500/15 border-sky-500/60 shadow-lg shadow-sky-500/10'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tier.title}</span>
                      <span className="text-[9px] font-mono text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-md">
                        {tier.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">{tier.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    {(sanctumSettings.autonomyLevel || 'COLLABORATIVE') === tier.id ? (
                      <span className="text-sky-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected Tier
                      </span>
                    ) : (
                      <span>Click to activate</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Communication Tone */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Communication Synthesis Tone</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {communicationTones.map((tone) => (
                <div
                  key={tone.id}
                  onClick={() => handleUpdate({ communicationTone: tone.id })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    (sanctumSettings.communicationTone || 'STRATEGIC_DETAILED') === tone.id
                      ? 'bg-purple-500/15 border-purple-500/60 shadow-lg shadow-purple-500/10'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold text-white block">{tone.title}</span>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{tone.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Governance & Privacy Toggles */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Evidence Guardrails</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PII Masking */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <EyeOff className="w-4 h-4 text-sky-400" /> AI Data Minimization (PII Masking)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Pseudonymize employee names & emails before LLM calls</p>
                </div>
                <input
                  type="checkbox"
                  checked={sanctumSettings.dataMinimization !== false}
                  onChange={(e) => handleUpdate({ dataMinimization: e.target.checked })}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              {/* Evidence Enforcement */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" /> Evidence Citation Enforcement
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Mandate proof artifacts and goal IDs on all assessments</p>
                </div>
                <input
                  type="checkbox"
                  checked={sanctumSettings.evidenceEnforcement !== false}
                  onChange={(e) => handleUpdate({ evidenceEnforcement: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Autonomy vs Alignment */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Autonomy vs Alignment Ratio</span>
                  <span className="font-mono text-sky-400 font-bold">{sanctumSettings.autonomyVsAlignment}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sanctumSettings.autonomyVsAlignment}
                  onChange={(e) => handleUpdate({ autonomyVsAlignment: Number(e.target.value) })}
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
                  onChange={(e) => handleUpdate({ analyticalVsIntuitive: Number(e.target.value) })}
                  className="w-full accent-purple-500 bg-white/10 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Data-Driven Only</span>
                  <span>Intuitive Heuristic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

