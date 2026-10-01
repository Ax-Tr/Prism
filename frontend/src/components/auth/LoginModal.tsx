import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, KeyRound, ArrowRight, ShieldCheck, Eye, EyeOff, Hexagon,
  ShieldAlert, CheckCircle2, Lock, Mail, Loader2
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

  // MFA & Status states
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
        setActiveTab('enter');
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
      setActiveTab('enter');
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
      setActiveTab('enter');
    } else {
      setErrorMessage(res.error || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020304] text-white relative overflow-hidden flex flex-col justify-center items-center">
      {/* Dynamic Animated Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            x: [0, 20, 0],
            y: [0, -25, 0],
            opacity: [0.18, 0.28, 0.18],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/4 -left-1/4 w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22)_0%,rgba(168,85,247,0.1)_45%,transparent_70%)] blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -30, 0],
            y: [0, 35, 0],
            opacity: [0.15, 0.24, 0.15],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute -bottom-1/4 -right-1/4 w-[850px] h-[850px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2)_0%,rgba(16,185,129,0.1)_45%,transparent_70%)] blur-3xl"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.42)_100%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:92px_100%]" />
      </div>

      {/* Top Header Controls */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => setActiveTab('landing')}
        className="absolute top-8 left-7 sm:left-9 z-20 text-[11px] font-mono tracking-[0.14em] uppercase text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-2 group cursor-pointer"
      >
        <span className="text-sm group-hover:-translate-x-1 transition-transform">←</span> Back to Overview
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 text-zinc-300"
      >
        <Hexagon className="w-[18px] h-[18px] stroke-[1.5] text-indigo-400" />
        <span className="font-mono text-[13px] tracking-[0.28em] uppercase font-bold">Prism</span>
      </motion.div>

      {/* Main Login Card with Spring Entrance */}
      <main className="relative z-10 w-full max-w-[490px] px-4 pt-20 pb-10">
        <motion.section
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full rounded-[32px] border border-white/[0.12] bg-[#090a0c]/85 shadow-[0_32px_120px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-2xl overflow-hidden"
        >
          <div className="px-8 sm:px-10 pt-9 pb-8">
            <div className="mb-6">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-indigo-400/80 mb-2 font-semibold">
                Identity & Access Management
              </div>
              <h1
                className="text-[25px] leading-tight text-zinc-100 font-normal"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
              >
                {mfaStep
                  ? 'Two-Factor Authentication'
                  : mode === 'signin'
                  ? 'Welcome back to Prism'
                  : 'Join the Enterprise Network'}
              </h1>
            </div>

            {/* Error Message Alert with Motion */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mb-5 rounded-[15px] border border-rose-500/35 bg-rose-950/40 p-3.5 flex items-start gap-3 text-rose-300 text-[12px] leading-relaxed shadow-lg overflow-hidden"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Message Alert with Motion */}
            <AnimatePresence>
              {infoMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mb-5 rounded-[15px] border border-cyan-500/35 bg-cyan-950/40 p-3.5 flex items-start gap-3 text-cyan-300 text-[12px] leading-relaxed shadow-lg overflow-hidden"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="flex-1">{infoMessage}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mode Toggle Switcher */}
            {!mfaStep && (
              <div className="h-[48px] rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-[4px] flex mb-6 relative">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMessage(null); }}
                  className={`relative z-10 flex-1 rounded-[12px] text-[11px] font-mono font-bold tracking-[0.14em] uppercase transition-colors ${
                    mode === 'signin' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('create'); setErrorMessage(null); }}
                  className={`relative z-10 flex-1 rounded-[12px] text-[11px] font-mono font-bold tracking-[0.14em] uppercase transition-colors ${
                    mode === 'create' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Create Account
                </button>

                {/* Animated active pill tab */}
                <motion.div
                  layout
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className={`absolute top-[4px] bottom-[4px] rounded-[12px] bg-white/[0.12] border border-white/[0.12] shadow-sm pointer-events-none ${
                    mode === 'signin' ? 'left-[4px] w-[calc(50%-4px)]' : 'left-[50%] w-[calc(50%-4px)]'
                  }`}
                />
              </div>
            )}

            {/* Animated Form Views */}
            <AnimatePresence mode="wait">
              {mfaStep ? (
                /* MFA Step UI */
                <motion.form
                  key="mfa-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-400 mb-2.5">
                      Enter 6-Digit Authenticator Code
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="888888"
                        className="w-full h-[54px] pl-11 pr-4 rounded-[16px] bg-cyan-950/20 border border-cyan-400/40 text-[20px] font-mono tracking-[0.45em] text-center text-cyan-200 placeholder-zinc-700 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                      />
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 mt-2 text-center">
                      Check your Google Authenticator, 1Password, or Authy app
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleSendEmailOtp}
                      className="flex-1 h-[44px] rounded-[14px] border border-white/[0.09] bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 text-[10px] font-mono tracking-[0.1em] uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Email Backup Code</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => { setMfaStep(false); setOtpCode(''); setErrorMessage(null); }}
                      className="h-[44px] px-4 rounded-[14px] border border-white/[0.09] bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 hover:text-zinc-200 text-[10px] font-mono uppercase transition-all cursor-pointer"
                    >
                      Back
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[54px] rounded-[16px] bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border border-cyan-400/40 hover:border-cyan-400/70 text-cyan-100 font-mono font-bold text-[12px] tracking-[0.14em] uppercase transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(6,182,212,0.15)] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Enter Workspace</span>
                        <ArrowRight className="w-4 h-4 text-cyan-400" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : mode === 'signin' ? (
                /* Sign In Form */
                <motion.div
                  key="signin-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-400 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="owner@prism.ai"
                          required
                          className="w-full h-[49px] pl-11 pr-4 rounded-[15px] bg-white/[0.04] border border-white/[0.10] text-[12px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-400/60 focus:bg-white/[0.06] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-400 mb-2">
                        Passphrase
                      </label>
                      <div className="relative">
                        <KeyRound className="w-3.5 h-3.5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-[49px] pl-11 pr-11 rounded-[15px] bg-white/[0.04] border border-white/[0.10] text-[12px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-400/60 focus:bg-white/[0.06] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Demo Switcher Capsule */}
                    <div className="rounded-[16px] border border-indigo-500/[0.18] bg-[#070b14]/90 p-3.5 mt-4">
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-indigo-300 mb-2.5 flex items-center justify-between font-semibold">
                        <span>Enterprise Personas (1-Click Test)</span>
                        <span className="text-[9px] text-zinc-500 font-mono">Password: Admin@123 / prism</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          ['ceo@nexora.com', 'CEO / EXECUTIVE', 'ceo@nexora.com'],
                          ['priya@nexora.com', 'DEPT HEAD (PRODUCT)', 'priya@nexora.com'],
                          ['arjun@nexora.com', 'MANAGER (ARCHITECT)', 'arjun@nexora.com'],
                          ['ravi@nexora.com', 'EMPLOYEE (BACKEND)', 'ravi@nexora.com'],
                          ['demo@nexora.com', 'ALL ROLES ACCESS', 'demo@nexora.com'],
                        ].map(([displayEmail, role, demoEmail]) => (
                          <motion.button
                            whileHover={{ x: 3 }}
                            key={displayEmail}
                            type="button"
                            onClick={() => handleDemoSelect(demoEmail)}
                            className="w-full flex items-center justify-between text-left group py-0.5 cursor-pointer"
                          >
                            <span className="font-mono text-[9px] text-zinc-400 group-hover:text-zinc-100 transition-colors">
                              {displayEmail}
                            </span>
                            <span className="font-mono text-[9px] text-zinc-600 group-hover:text-indigo-400 transition-colors font-medium">
                              {role}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-[54px] mt-2 rounded-[16px] bg-white/[0.12] border border-white/[0.18] text-zinc-100 font-mono font-bold text-[12px] tracking-[0.14em] uppercase hover:bg-white/[0.18] hover:border-white/[0.28] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 text-zinc-300 animate-spin" />
                      ) : (
                        <>
                          <span>Enter Workspace</span>
                          <ArrowRight className="w-4 h-4 text-zinc-400" />
                        </>
                      )}
                    </motion.button>
                  </form>

                  <div className="text-center mt-5 font-mono text-[9px] tracking-[0.16em] uppercase text-zinc-600">
                    Argon2id / Bcrypt · 15-Min Lockout Protection · TOTP Ready
                  </div>
                </motion.div>
              ) : (
                /* Create Account Form */
                <motion.form
                  key="create-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!name || !email || !password) return;
                    setIsSubmitting(true);
                    const res = await login(email, password);
                    setIsSubmitting(false);
                    if (res.success) setActiveTab('spectrum');
                    else setErrorMessage(res.error || 'Registration failed');
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-400 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Mercer"
                        required
                        className="w-full h-[49px] pl-11 pr-4 rounded-[15px] bg-white/[0.04] border border-white/[0.10] text-[12px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-400/60 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-400 mb-2">
                      Organization
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Nexora Enterprise"
                        required
                        className="w-full h-[49px] pl-11 pr-4 rounded-[15px] bg-white/[0.04] border border-white/[0.10] text-[12px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-400/60 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-400 mb-2">
                      Work Email
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@nexora.ai"
                        required
                        className="w-full h-[49px] pl-11 pr-4 rounded-[15px] bg-white/[0.04] border border-white/[0.10] text-[12px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-400/60 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-400 mb-2">
                      Passphrase (Min 8 characters)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full h-[49px] pl-11 pr-11 rounded-[15px] bg-white/[0.04] border border-white/[0.10] text-[12px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-400/60 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[54px] mt-2 rounded-[16px] bg-white/[0.12] border border-white/[0.18] text-zinc-100 font-mono font-bold text-[12px] tracking-[0.14em] uppercase hover:bg-white/[0.18] transition-all flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 text-zinc-300 animate-spin" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 text-zinc-400" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default LoginModal;
