import React, { useState } from 'react';
import {
  User, KeyRound, ArrowRight, ShieldCheck, Eye, EyeOff, Hexagon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const LoginModal: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const { setActiveTab } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');

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
    <div className="min-h-screen w-full bg-[#020304] text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_45%,rgba(65,20,72,0.18),transparent_38%),radial-gradient(ellipse_at_82%_45%,rgba(8,48,48,0.13),transparent_38%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.38)_100%)]" />
        <div className="absolute inset-0 opacity-[0.018] bg-[linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:92px_100%]" />
      </div>

      <button
        onClick={() => setActiveTab('landing')}
        className="absolute top-9 left-7 sm:left-9 z-20 text-[11px] font-mono tracking-[0.12em] uppercase text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2"
      >
        <span className="text-sm">←</span> Back
      </button>

      <div className="absolute top-9 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 text-zinc-400">
        <Hexagon className="w-[18px] h-[18px] stroke-[1.4]" />
        <span className="font-mono text-[13px] tracking-[0.28em] uppercase">Prism</span>
      </div>

      <main className="relative z-10 min-h-screen flex items-start justify-center px-4 pt-[77px] pb-10">
        <section className="w-full max-w-[484px] rounded-[31px] border border-white/[0.10] bg-[#090a0c]/80 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl overflow-hidden">
          <div className="px-8 sm:px-9 pt-9 pb-7">
            <div className="mb-7">
              <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-zinc-600 mb-4">
                Prism Intelligence
              </div>
              <h1
                className="text-[23px] leading-none text-zinc-100"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic', fontWeight: 400 }}
              >
                {mode === 'signin' ? 'Good to see you again' : 'Join the network'}
              </h1>
            </div>

            <div className="h-[48px] rounded-[16px] border border-white/[0.08] bg-white/[0.015] p-[4px] flex mb-7">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 rounded-[11px] text-[11px] font-mono font-bold tracking-[0.13em] uppercase transition-all ${
                  mode === 'signin'
                    ? 'bg-white/[0.10] text-zinc-100 border border-white/[0.11]'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`flex-1 rounded-[11px] text-[11px] font-mono font-bold tracking-[0.13em] uppercase transition-all ${
                  mode === 'create'
                    ? 'bg-white/[0.10] text-zinc-100 border border-white/[0.11]'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                Create Account
              </button>
            </div>

            {mode === 'signin' ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-500 mb-2.5">
                      Email
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full h-[49px] pl-11 pr-4 rounded-[15px] bg-white/[0.035] border border-white/[0.09] text-[12px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-white/[0.18] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-500 mb-2.5">
                      Passphrase
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-[49px] pl-11 pr-11 rounded-[15px] bg-white/[0.035] border border-white/[0.09] text-[12px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-white/[0.18] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-zinc-400"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[15px] border border-cyan-400/[0.16] bg-[#071015]/80 px-3.5 py-3.5">
                    <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-cyan-400 mb-3">
                      Demo Accounts
                    </div>
                    <div className="space-y-2.5">
                      {[
                        ['ceo@nexora.com', 'CEO', 'ceo@nexora.com'],
                        ['priya@nexora.com', 'DEPT HEAD', 'engineering@nexora.com'],
                        ['arjun@nexora.com', 'MANAGER', 'arjun@nexora.com'],
                        ['ravi@nexora.com', 'EMPLOYEE', 'ravi@nexora.com'],
                        ['demo@nexora.com', 'ALL ROLES', 'demo@nexora.com'],
                      ].map(([displayEmail, role, demoEmail]) => (
                        <button
                          key={displayEmail}
                          type="button"
                          onClick={() => handleDemoSelect(demoEmail)}
                          className="w-full flex items-center justify-between text-left group"
                        >
                          <span className="font-mono text-[9px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                            {displayEmail}
                          </span>
                          <span className="font-mono text-[9px] text-zinc-700 group-hover:text-cyan-400 transition-colors">
                            {role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-[54px] rounded-[15px] bg-white/[0.10] border border-white/[0.16] text-zinc-200 font-mono font-bold text-[12px] tracking-[0.14em] uppercase hover:bg-white/[0.15] transition-all flex items-center justify-center gap-3"
                  >
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                  </button>
                </form>

                <div className="text-center mt-5 font-mono text-[9px] tracking-[0.15em] uppercase text-zinc-700">
                  End-to-end encrypted · SOC 2 Type II
                </div>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!name || !email || !password) return;
                  // Keep the existing authentication flow compatible with the app.
                  login(email, password);
                  setActiveTab('spectrum');
                }}
                className="space-y-5"
              >
                {/* Account progress */}
                <div className="flex items-center gap-3 mb-7 font-mono text-[10px] uppercase tracking-[0.14em]">
                  <span className="flex items-center gap-2 text-zinc-200">
                    <span className="w-5 h-5 rounded-full border border-white/50 flex items-center justify-center text-[9px]">
                      1
                    </span>
                    Account
                  </span>
                  <span className="w-7 h-px bg-white/10" />
                  <span className="flex items-center gap-2 text-zinc-600">
                    <span className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[9px]">
                      2
                    </span>
                    Org
                  </span>
                  <span className="w-7 h-px bg-white/10" />
                  <span className="flex items-center gap-2 text-zinc-700">
                    <span className="w-5 h-5 rounded-full border border-white/[0.06] flex items-center justify-center text-[9px]">
                      3
                    </span>
                    Invite
                  </span>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-500 mb-2.5">
                    Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full h-[49px] pl-11 pr-4 rounded-[15px] bg-white/[0.035] border border-white/[0.09] text-[12px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-white/[0.18] transition-all"
                    />
                  </div>
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-500 mb-2.5">
                    Organization
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Your organization"
                      required
                      className="w-full h-[49px] pl-11 pr-4 rounded-[15px] bg-white/[0.035] border border-white/[0.09] text-[12px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-white/[0.18] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-500 mb-2.5">
                    Email
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full h-[49px] pl-11 pr-4 rounded-[15px] bg-white/[0.035] border border-white/[0.09] text-[12px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-white/[0.18] transition-all"
                    />
                  </div>
                </div>

                {/* Passphrase */}
                <div>
                  <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-500 mb-2.5">
                    Passphrase
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full h-[49px] pl-11 pr-11 rounded-[15px] bg-white/[0.035] border border-white/[0.09] text-[12px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-white/[0.18] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-zinc-400"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-[54px] rounded-[15px] bg-white/[0.10] border border-white/[0.16] text-zinc-200 font-mono font-bold text-[12px] tracking-[0.14em] uppercase hover:bg-white/[0.15] transition-all flex items-center justify-center gap-3"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </button>

                <div className="text-center pt-1 font-mono text-[9px] tracking-[0.15em] uppercase text-zinc-700">
                  End-to-end encrypted · SOC 2 Type II
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginModal;
