import React, { useState } from 'react';
import { User, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const LoginModal: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const { setActiveTab } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, password);
    setActiveTab('spectrum');
  };

  const handleDemoSelect = (demoEmail: string) => {
    switchDemoRole(demoEmail);
    setActiveTab('spectrum');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden pb-32">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/15 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400 mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Nexora Prism Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">Select a demo role or enter workspace credentials</p>
        </div>

        {/* Demo Fast Login Cards */}
        <div className="space-y-2 mb-6">
          <p className="text-[11px] font-mono text-sky-400 uppercase tracking-wider">Fast Demo Access</p>
          <button
            onClick={() => handleDemoSelect('ceo@nexora.com')}
            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-left transition-all group"
          >
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-sky-400">Aarav Sharma (CEO)</p>
              <p className="text-[10px] text-slate-400">Full executive oversight & admin controls</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
          </button>
          <button
            onClick={() => handleDemoSelect('engineering@nexora.com')}
            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-left transition-all group"
          >
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-sky-400">Neha Gupta (VP of Engineering)</p>
              <p className="text-[10px] text-slate-400">Department metrics, velocity & 360 reviews</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
          </button>
          <button
            onClick={() => handleDemoSelect('arjun@nexora.com')}
            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-left transition-all group"
          >
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-sky-400">Arjun Sharma (Lead Architect)</p>
              <p className="text-[10px] text-slate-400">Sprint Kanban, 1:1 prep & Sanctum avatar</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        <div className="relative my-6 text-center">
          <hr className="border-white/10" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-[#050505] text-[10px] text-slate-500 font-mono">
            OR ENTER CREDENTIALS
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@nexora.com"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-sky-500/20"
          >
            Enter Workspace
          </button>
        </form>
      </div>
    </div>
  );
};
