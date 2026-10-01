import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Lock, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  requiredRole?: string;
  title?: string;
}

export const AccessDeniedView: React.FC<Props> = ({
  requiredRole = 'Organization Owner or Department Head',
  title = '403 Forbidden • Access Restricted',
}) => {
  const { setActiveTab } = useApp();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel p-8 sm:p-10 rounded-3xl border border-rose-500/30 max-w-lg w-full text-center space-y-6 shadow-2xl relative bg-[#0b0709]/90"
      >
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-[0.25em] text-rose-400 uppercase font-bold">
            ZERO-TRUST SECURITY ENFORCEMENT
          </span>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            You are currently signed in as <strong className="text-white">{currentUser?.name || 'Guest'}</strong> (Role: <span className="font-mono text-amber-400">{currentUser?.role || 'EMPLOYEE'}</span>). You do not have sufficient administrative privileges to access this area.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Required Authorization:</span>
            <span className="text-rose-400 font-bold">{requiredRole}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Security Policy:</span>
            <span className="text-slate-300">Tenant RBAC Isolation (SOC2)</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('spectrum')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-mono text-white transition-colors cursor-pointer flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Workspace</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessDeniedView;
