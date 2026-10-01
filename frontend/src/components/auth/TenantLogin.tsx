import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, KeyRound, ArrowRight, ShieldCheck, Eye, EyeOff, Hexagon,
  AlertTriangle, CheckCircle2, Lock, Mail, Loader2, Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useSubdomain } from '../../context/SubdomainContext';

/**
 * Tenant Organization Login Page
 * 
 * This is shown when a user accesses org.prism.com/login.
 * It's branded with the resolved tenant's name and styling.
 * Users can only log in if they belong to this organization.
 */
export const TenantLogin: React.FC = () => {
  const { login, verifyMfa, sendEmailOtp } = useAuth();
  const { setActiveTab } = useApp();
  const { resolvedTenant, subdomainInfo, resolutionError, isResolving } = useSubdomain();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [mfaStep, setMfaStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const tenantName = resolvedTenant?.name || subdomainInfo.subdomain || 'Organization';
  const accentColor = resolvedTenant?.branding?.primaryColor || '#6366f1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mfaStep) {
      if (!otpCode || otpCode.trim().length !== 6) {
        setError('Please enter a valid 6-digit verification code.');
        return;
      }
      setIsSubmitting(true);
      const res = await verifyMfa(email, otpCode.trim());
      setIsSubmitting(false);

      if (res.success) {
        setActiveTab('enter');
      } else {
        setError(res.error || 'Invalid MFA code.');
      }
      return;
    }

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      setActiveTab('enter');
    } else if (res.mfaRequired) {
      setMfaStep(true);
      setInfo('MFA Required: Enter the 6-digit authenticator code.');
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  // Show tenant resolution error
  if (resolutionError) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a0a0f, #0d0d1a, #0a0a0f)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-8 py-12 max-w-md"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Building2 size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white/90 mb-3 font-outfit">Organization Not Found</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            The subdomain <span className="text-white/60 font-mono">"{subdomainInfo.subdomain}"</span> doesn't
            match any registered organization. Please check your URL or contact your administrator.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono text-white/30"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Lock size={10} />
            Expected: your-org.prism.com
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading while resolving tenant
  if (isResolving) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a0a0f, #0d0d1a, #0a0a0f)' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 size={24} className="text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest">
            Resolving organization...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 30%, #0f0d1f 60%, #0a0a0f 100%)',
      }}
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(${accentColor}40 1px, transparent 1px),
            linear-gradient(90deg, ${accentColor}40 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full opacity-[0.07]"
        style={{ background: `radial-gradient(ellipse, ${accentColor}, transparent 70%)` }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Tenant branding header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
            style={{
              background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            <Building2 size={24} style={{ color: accentColor }} strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-lg font-semibold text-white/90 font-outfit">{tenantName}</h1>
          <p className="text-xs text-white/30 mt-1 font-mono tracking-wider">
            {subdomainInfo.subdomain}.prism.com
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(15,15,25,0.95), rgba(10,10,18,0.98))',
            border: `1px solid ${accentColor}15`,
            boxShadow: `0 0 40px ${accentColor}05, 0 20px 40px rgba(0,0,0,0.4)`,
          }}
        >
          <div className="h-0.5 w-full" style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}80, transparent)` }} />

          <div className="p-8">
            <h2 className="text-base font-medium text-white/80 mb-6 font-outfit">Sign in to your workspace</h2>

            {/* Error / Info messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg mb-4"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <AlertTriangle size={13} className="text-red-400 shrink-0" />
                  <span className="text-xs text-red-300/90">{error}</span>
                </motion.div>
              )}
              {info && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg mb-4"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  <ShieldCheck size={13} className="text-blue-400 shrink-0" />
                  <span className="text-xs text-blue-300/90">{info}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mfaStep ? (
                /* MFA Code Input */
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white/90 placeholder-white/20 outline-none transition-all focus:ring-1"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        '--tw-ring-color': `${accentColor}40`,
                      } as any}
                      autoFocus
                      maxLength={6}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={`you@${subdomainInfo.subdomain || 'company'}.com`}
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white/90 placeholder-white/20 outline-none transition-all focus:ring-1"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-12 py-3 rounded-lg text-sm text-white/90 placeholder-white/20 outline-none transition-all focus:ring-1"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                style={{
                  background: isSubmitting
                    ? `${accentColor}30`
                    : `linear-gradient(135deg, ${accentColor}90, ${accentColor}70)`,
                  border: `1px solid ${accentColor}40`,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight size={14} />
                    <span>{mfaStep ? 'Verify Code' : 'Sign In'}</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* SSO hint */}
            <div className="mt-6 pt-5 border-t border-white/[0.04]">
              <div className="text-center">
                <p className="text-[10px] text-white/20 font-mono uppercase tracking-wider">
                  Enterprise SSO available for {tenantName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 px-2">
          <span className="text-[10px] text-white/10 font-mono">Powered by PRISM</span>
          <span className="text-[10px] text-white/10 font-mono">{resolvedTenant?.tier || 'Enterprise'}</span>
        </div>
      </motion.div>
    </div>
  );
};
