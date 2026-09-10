import React, { useState } from 'react';
import { Sparkles, Building2, Users, Bot, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GenesisWizard: React.FC = () => {
  const { genesisConfig, updateGenesisConfig, setActiveTab } = useApp();
  const [step, setStep] = useState(1);

  const [companyName, setCompanyName] = useState(genesisConfig.companyName);
  const [industry, setIndustry] = useState(genesisConfig.industry);
  const [mission, setMission] = useState(genesisConfig.mission);
  const [luminaryPersona, setLuminaryPersona] = useState(genesisConfig.luminaryPersona);

  const handleFinish = () => {
    updateGenesisConfig({
      companyName,
      industry,
      mission,
      luminaryPersona,
      completed: true
    });
    setActiveTab('spectrum');
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 sm:p-8 flex items-center justify-center pb-32">
      <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border border-white/15 shadow-2xl">
        {/* Stepper Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">GENESIS SETUP</span>
            <h2 className="text-2xl font-bold text-white mt-1">Initialize Organization & AI COO</h2>
          </div>
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                  s === step
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30'
                    : s < step
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/5 text-slate-500 border border-white/10'
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Company Initialization */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-400" />
              <span>Step 1: Company Identity & Mission</span>
            </h3>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Organization Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Industry / Domain</label>
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Core Operational Mission</label>
              <textarea
                value={mission}
                onChange={e => setMission(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-2 ml-auto"
            >
              <span>Continue to Departments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Department Mapping */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>Step 2: Department Architecture</span>
            </h3>
            <p className="text-xs text-slate-400">Default operational departments configured for {companyName}:</p>
            <div className="grid grid-cols-2 gap-3">
              {['Engineering', 'Product', 'Design', 'Data & AI', 'Marketing', 'Executive Ops'].map(dept => (
                <div key={dept} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{dept}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center space-x-2"
              >
                <span>Bootstrap Luminary AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Luminary AI Bootstrapping */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-sky-500/30">
              <Bot className="w-8 h-8 text-slate-950 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-white">Bootstrapping Luminary AI COO</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Luminary will continuously analyze your velocity, risk signals, and KPI variance to deliver real-time operational advice.
            </p>
            <div className="max-w-xs mx-auto text-left space-y-2">
              <label className="block text-xs text-slate-300">Luminary Persona Profile</label>
              <select
                value={luminaryPersona}
                onChange={e => setLuminaryPersona(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              >
                <option value="Luminary Executive" className="bg-slate-900">Luminary Executive (Balanced & Analytical)</option>
                <option value="Luminary Agile Coach" className="bg-slate-900">Luminary Agile Coach (Velocity Focused)</option>
                <option value="Luminary Security Lead" className="bg-slate-900">Luminary Security Lead (Strict Compliance)</option>
              </select>
            </div>
            <button
              onClick={handleFinish}
              className="mt-6 px-8 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/20 hover:scale-105 transition-transform"
            >
              Complete Genesis & Launch Spectrum
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
