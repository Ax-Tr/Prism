import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Users, Target, UserCheck, CheckSquare, Trophy,
  RotateCcw, Calendar, GitPullRequest, ShieldCheck, BarChart3,
  Sliders, Sparkles, MoreHorizontal, ChevronUp, Briefcase, Building2
} from 'lucide-react';
import { useApp, WorkspaceTab } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const BottomDock: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { currentUser } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const isOrgAdmin = currentUser && (
    currentUser.role === 'CEO' ||
    (currentUser as any).role === 'owner' ||
    currentUser.role === 'DEPT_HEAD'
  );

  const mainTabs: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
    { id: 'spectrum', label: 'Spectrum', icon: <Compass className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'kpis', label: 'KPIs', icon: <Target className="w-4 h-4" /> },
    { id: 'sanctum', label: 'Sanctum', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
  ];

  const secondaryTabs: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
    ...(isOrgAdmin
      ? [{ id: 'tenant_admin' as WorkspaceTab, label: 'Organization Admin', icon: <Building2 className="w-4 h-4 text-indigo-400" /> }]
      : []),
    { id: 'employee_detail', label: 'Refracted Profile', icon: <UserCheck className="w-4 h-4 text-cyan-400" /> },
    { id: 'capacity', label: 'Capacity & Growth', icon: <Briefcase className="w-4 h-4 text-indigo-400" /> },
    { id: 'the', label: 'The (Leaderboard)', icon: <Trophy className="w-4 h-4" /> },
    { id: '360', label: '360° Review', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar className="w-4 h-4" /> },
    { id: 'meridian', label: 'Meridian Roadmap', icon: <GitPullRequest className="w-4 h-4" /> },
    { id: 'checkpoint', label: 'Checkpoint Approvals', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'exceptions', label: 'Exceptions & Continuity', icon: <ShieldCheck className="w-4 h-4 text-amber-400" /> },
    { id: 'audit', label: 'Audit Log & DPDP', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { id: 'synthesis', label: 'Synthesis Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'calibration', label: 'Calibration Admin', icon: <Sliders className="w-4 h-4" /> },
    { id: 'genesis', label: 'Genesis Wizard', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const handleTabClick = (tabId: WorkspaceTab) => {
    setActiveTab(tabId);
    setMoreOpen(false);
  };

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="flex flex-col items-center pointer-events-auto"
      >
      {/* Expanded Secondary Menu */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="mb-3 p-3 rounded-2xl border border-white/12 bg-[#0a0a0c]/90 shadow-[0_20px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl grid grid-cols-2 sm:grid-cols-4 gap-2"
          >
            {secondaryTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/20 text-white border border-indigo-400/40 shadow-lg shadow-indigo-500/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {tab.icon}
                  <span className="whitespace-nowrap font-mono text-[11px]">{tab.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dock Container */}
      <nav className="relative px-2 py-1.5 rounded-full border border-white/[0.14] bg-[#090a0d]/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex items-center space-x-1">
        {mainTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative z-10 flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>

              {/* Animated Floating Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="dock-active-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-indigo-500/30 border border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.25)] -z-10"
                />
              )}
            </button>
          );
        })}

        {/* Expand / Collapse More Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-[10px] font-mono uppercase tracking-[0.1em] transition-colors cursor-pointer ${
            moreOpen || secondaryTabs.some(t => t.id === activeTab)
              ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="More Platform Modules"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">More</span>
          <ChevronUp className={`w-3 h-3 transition-transform duration-300 ${moreOpen ? 'rotate-180' : ''}`} />
        </motion.button>
      </nav>
      </motion.div>
    </div>
  );
};

export default BottomDock;
