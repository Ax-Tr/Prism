import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldAlert, Eye, EyeOff, Lock, Mail, Loader2,
  Hexagon, AlertTriangle, Terminal, Fingerprint, Server
} from 'lucide-react';
import api from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';

/**
 * SuperAdmin Isolated Login Gate
 * 
 * This is the root operator authentication portal, accessible ONLY at:
 *   - prism.com/admin/login
 *   - admin.prism.com/login
 *   - localhost:3000/admin/login
 *
 * It uses sessionStorage for token storage (not localStorage) to prevent
 * cross-tab session leaks. The token is namespaced as `prism_root_token`.
 */
export const SuperAdminLogin: React.FC = () => {
  const { setActiveTab } = useApp();
  const [email, setEmail] = useState('root@prism.ai');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Root operator credentials are required.');
      setShakeKey(k => k + 1);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post<{ token: string; operator: any }>(
        '/api/v1/superadmin/auth/login',
        { email: email.trim().toLowerCase(), password }
      );

      if (res?.token) {
        // Store in sessionStorage (not localStorage) for security isolation
        sessionStorage.setItem('prism_root_token', res.token);
        sessionStorage.setItem('prism_root_operator', JSON.stringify(res.operator));
        setActiveTab('super_admin');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Access violation logged.');
      setShakeKey(k => k + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 30%, #110d1f 60%, #0a0a0f 100%)',
      }}
    >
      {/* Animated security grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.4), transparent 70%)' }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.5), transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Security classification header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-red-400/60 flex items-center gap-1.5">
            <ShieldAlert size={10} />
            CLASSIFIED • ROOT OPERATOR ACCESS
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        </motion.div>

        {/* Main card */}
        <div className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(15,15,25,0.95), rgba(10,10,18,0.98))',
            border: '1px solid rgba(139,92,246,0.15)',
            boxShadow: '0 0 60px rgba(139,92,246,0.05), 0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top accent bar */}
          <div className="h-0.5 w-full bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500" />

          <div className="p-8 pt-6">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <Hexagon size={28} className="text-violet-400" strokeWidth={1.5} />
              </motion.div>

              <h1 className="text-xl font-semibold text-white/90 tracking-tight font-outfit">
                Platform Root Operator
              </h1>
              <p className="text-xs text-white/30 mt-1 font-mono uppercase tracking-widest">
                Prism Fleet Command Center
              </p>
            </div>

            {/* Error display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key={shakeKey}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: [0, -6, 6, -3, 3, 0] }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-2 p-3 rounded-lg mb-6"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  <span className="text-xs text-red-300/90">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2">
                  Root Operator Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="root@prism.ai"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white/90 placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-violet-500/30"
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
                  Master Root Key
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter master root key"
                    className="w-full pl-10 pr-12 py-3 rounded-lg text-sm text-white/90 placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-violet-500/30"
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

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background: isSubmitting
                    ? 'rgba(139,92,246,0.2)'
                    : 'linear-gradient(135deg, rgba(139,92,246,0.6), rgba(109,40,217,0.6))',
                  border: '1px solid rgba(139,92,246,0.3)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span className="font-mono text-xs uppercase tracking-wider">Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint size={14} />
                    <span className="font-mono text-xs uppercase tracking-wider">Authenticate Root Operator</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Security footer */}
            <div className="mt-6 pt-5 border-t border-white/[0.04]">
              <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-white/15 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Shield size={8} /> AES-256</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Server size={8} /> SOC2</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Terminal size={8} /> Zero-Trust</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <p className="text-center text-[10px] text-white/10 mt-6 font-mono">
          All access attempts are logged and audited under SOC2 Type II compliance.
        </p>
      </motion.div>
    </div>
  );
};
