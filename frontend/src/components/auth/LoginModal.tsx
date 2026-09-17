import React, { useState } from 'react';
import {
  User, KeyRound, ArrowRight, ShieldCheck, Eye, EyeOff, Hexagon,
  AlertCircle, ShieldAlert, CheckCircle2, Lock, RefreshCw, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const LoginModal: React.FC = () => {
  const { login, verifyMfa, sendEmailOtp, switchDemoRole } = useAuth();
  const { setActiveTab } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');

  // Sprint 2 MFA & Error states
  const [mfaStep, setMfaStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (mfaStep) {
      if (!otpCode || otpCode.trim().length !== 6) {
        setErrorMessage('Please enter a valid 6-digit verification code.');
        return;
      }
      setIsSubmitting(true);
      const res = await verifyMfa(email, otpCode.trim());
      setIsSubmitting(false);

      if (res.success) {
        setActiveTab('spectrum');
      } else {
        setErrorMessage(res.error || 'Invalid 6-digit MFA code. Please try again.');
      }
      return;
    }

    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      setActiveTab('spectrum');
    } else if (res.mfaRequired) {
      setMfaStep(true);
      setInfoMessage('MFA Required: Enter the 6-digit authenticator code (or use 888888 for testing).');
    } else {
      setErrorMessage(res.error || 'Failed to authenticate.');
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email) return;
    setIsSubmitting(true);
    const res = await sendEmailOtp(email);
    setIsSubmitting(false);
    if (res.sent) {
      setInfoMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleDemoSelect = async (demoEmail: string) => {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    const res = await switchDemoRole(demoEmail);
    setIsSubmitting(false);
    if (res.success) {
      setActiveTab('spectrum');
    } else {
      setErrorMessage(res.error || 'Demo login failed');
    }
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
            <div className="mb-6">
              <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-zinc-600 mb-3">
                Prism Identity & Access Management
              </div>
              <h1
                className="text-[23px] leading-none text-zinc-100"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic', fontWeight: 400 }}
              >
                {mfaStep
                  ? 'Two-Factor Authentication'
                  : mode === 'signin'
                  ? 'Good to see you again'
                  : 'Join the network'}
              </h1>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 rounded-[14px] border border-rose-500/30 bg-rose-950/30 p-3.5 flex items-start gap-3 text-rose-300 text-[12px] leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Info Message Alert */}
            {infoMessage && (
              <div className="mb-5 rounded-[14px] border border-cyan-500/30 bg-cyan-950/30 p-3.5 flex items-start gap-3 text-cyan-300 text-[12px] leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>{infoMessage}</div>
              </div>
            )}

            {!mfaStep && (
              <div className="h-[48px] rounded-[16px] border border-white/[0.08] bg-white/[0.015] p-[4px] flex mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMessage(null); }}
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
                  onClick={() => { setMode('create'); setErrorMessage(null); }}
                  className={`flex-1 rounded-[11px] text-[11px] font-mono font-bold tracking-[0.13em] uppercase transition-all ${
                    mode === 'create'
                      ? 'bg-white/[0.10] text-zinc-100 border border-white/[0.11]'
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {mfaStep ? (
              /* MFA Step UI */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-400 mb-2.5">
                    Enter 6-Digit Authenticator Code
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="888888"
                      className="w-full h-[52px] pl-11 pr-4 rounded-[15px] bg-white/[0.04] border border-cyan-400/40 text-[18px] font-mono tracking-[0.4em] text-center text-cyan-300 placeholder-zinc-700 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 mt-2 text-center">
                    Check your Google Authenticator, 1Password, or Authy app
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    className="flex-1 h-[42px] rounded-[13px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 text-[10px] font-mono tracking-[0.1em] uppercase flex items-center justify-center gap-2 transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Backup Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMfaStep(false); setOtpCode(''); setErrorMessage(null); }}
                    className="h-[42px] px-4 rounded-[13px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 text-[10px] font-mono uppercase transition-all"
                  >
                    Back
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[54px] rounded-[15px] bg-cyan-500/20 border border-cyan-400/30 hover:bg-cyan-500/30 text-cyan-200 font-mono font-bold text-[12px] tracking-[0.14em] uppercase transition-all flex items-center justify-center gap-3"
                >
                  <span>{isSubmitting ? 'Verifying...' : 'Verify & Enter Workspace'}</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>
              </form>
            ) : mode === 'signin' ? (
              /* Sign In Form */
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
                        placeholder="owner@prism.ai"
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
                    <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-cyan-400 mb-3 flex items-center justify-between">
                      <span>Enterprise Seed Accounts (MFA Ready)</span>
                      <span className="text-[9px] text-zinc-600 font-mono">Password: Admin@123</span>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        ['owner@prism.ai', 'CEO / OWNER (MFA)', 'owner@prism.ai'],
                        ['elena@prism.ai', 'VP ENGINEERING', 'elena@prism.ai'],
                        ['marcus@prism.ai', 'DIR OPERATIONS', 'marcus@prism.ai'],
                        ['alex@prism.ai', 'SR ENGINEER', 'alex@prism.ai'],
                        ['sarah@prism.ai', 'FULL STACK ENG', 'sarah@prism.ai'],
                        ['jordan@prism.ai', 'DELEGATE / OPS', 'jordan@prism.ai'],
                      ].map(([displayEmail, role, demoEmail]) => (
                        <button
                          key={displayEmail}
                          type="button"
                          onClick={() => handleDemoSelect(demoEmail)}
                          className="w-full flex items-center justify-between text-left group"
                        >
                          <span className="font-mono text-[9px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                            {displayEmail}
                          </span>
                          <span className="font-mono text-[9px] text-zinc-600 group-hover:text-cyan-400 transition-colors">
                            {role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[54px] rounded-[15px] bg-white/[0.10] border border-white/[0.16] text-zinc-200 font-mono font-bold text-[12px] tracking-[0.14em] uppercase hover:bg-white/[0.15] transition-all flex items-center justify-center gap-3"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Enter Workspace'}</span>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                  </button>
                </form>

                <div className="text-center mt-5 font-mono text-[9px] tracking-[0.15em] uppercase text-zinc-700">
                  Argon2id / Bcrypt · 15-Min Lockout Protection · TOTP Ready
                </div>
              </>
            ) : (
              /* Create Account Form */
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!name || !email || !password) return;
                  const res = await login(email, password);
                  if (res.success) setActiveTab('spectrum');
                  else setErrorMessage(res.error || 'Registration failed');
                }}
                className="space-y-5"
              >
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

                <div>
                  <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-500 mb-2.5">
                    Passphrase (Min 8 characters with numbers)
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
                  disabled={isSubmitting}
                  className="w-full h-[54px] rounded-[15px] bg-white/[0.10] border border-white/[0.16] text-zinc-200 font-mono font-bold text-[12px] tracking-[0.14em] uppercase hover:bg-white/[0.15] transition-all flex items-center justify-center gap-3"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginModal;
