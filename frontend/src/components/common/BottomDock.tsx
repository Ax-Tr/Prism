import React, { useState } from 'react';
import {
  Compass, Users, Target, UserCheck, CheckSquare, Trophy,
  RotateCcw, Calendar, GitPullRequest, ShieldCheck, BarChart3,
  Sliders, Sparkles, MoreHorizontal, ChevronUp, Briefcase
} from 'lucide-react';
import { useApp, WorkspaceTab } from '../../context/AppContext';

export const BottomDock: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);

  const mainTabs: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
    { id: 'spectrum', label: 'Spectrum', icon: <Compass className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'kpis', label: 'KPIs', icon: <Target className="w-4 h-4" /> },
    { id: 'sanctum', label: 'Sanctum', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
  ];

  const secondaryTabs: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center prism-float">
      {/* Expanded Secondary Menu */}
      {moreOpen && (
        <div className="mb-3 p-3 glass-panel rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {secondaryTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-lg shadow-sky-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Dock Container */}
      <nav className="glass-panel px-2 py-2 rounded-full border border-white/15 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl flex items-center space-x-1">
        {mainTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-[0.1em] transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/15 text-indigo-200 border border-indigo-300/30 shadow-lg shadow-indigo-500/10 scale-105'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Expand / Collapse More Toggle */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
            moreOpen || secondaryTabs.some(t => t.id === activeTab)
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="More Platform Modules"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">More</span>
          <ChevronUp className={`w-3 h-3 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
        </button>
      </nav>
    </div>
  );
};
