import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Star, TrendingUp, Award, ArrowUpRight, Zap, Target,
  Flame, Sparkles, Filter, Search, ShieldCheck, Heart, Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LIVE_EMPLOYEES } from '../../data/liveEmployees';

export const LeaderboardView: React.FC = () => {
  const { setSelectedEmployeeProfile, setActiveTab } = useApp();
  const [selectedDimension, setSelectedDimension] = useState<string>('OUTPUT');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const dimensions = [
    { id: 'OUTPUT', label: 'Output Velocity', icon: Zap, color: 'text-amber-400' },
    { id: 'RETURN', label: 'Capital Return', icon: Target, color: 'text-emerald-400' },
    { id: 'GROWTH', label: 'Competency Growth', icon: TrendingUp, color: 'text-sky-400' },
    { id: 'MOTIVATION', label: 'Motivation Rhythms', icon: Flame, color: 'text-rose-400' },
    { id: 'WELLBEING', label: 'Welfare Resonance', icon: Heart, color: 'text-purple-400' },
  ];

  // Derive ranked employees with dynamic scores according to dimension
  const rankedEmployees = [...LIVE_EMPLOYEES]
    .map((emp, idx) => {
      let score = 98 - idx * 2.2;
      if (selectedDimension === 'RETURN') score = emp.roi || (180 + (idx % 4) * 20);
      else if (selectedDimension === 'GROWTH') score = emp.learningProgress || (80 + (idx % 6) * 3);
      else if (selectedDimension === 'MOTIVATION') score = emp.motivationScore || (85 + (idx % 5) * 2);
      else if (selectedDimension === 'WELLBEING') score = emp.welfareScore || (88 + (idx % 4) * 2);

      return {
        ...emp,
        score: Math.round(score),
        growthRate: +(4.8 - idx * 0.35 + (idx % 2 === 0 ? 0.6 : -0.2)).toFixed(1),
      };
    })
    .sort((a, b) => b.score - a.score)
    .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.role.toLowerCase().includes(searchQuery.toLowerCase()));

  const top3 = rankedEmployees.slice(0, 3);
  const remaining = rankedEmployees.slice(3);

  const handleOpenRefractedProfile = (emp: any) => {
    setSelectedEmployeeProfile(emp);
    setActiveTab('employee_detail');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">PERFORMANCE REFRACTION MATRIX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">The Leaderboard — Top Performers</h1>
          <p className="text-xs text-slate-400 mt-1">
            Refracted rankings across Output, Return, Growth, Motivation, and Wellbeing (PRD §17)
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>Real-time Velocity Calibrated</span>
        </div>
      </div>

      {/* Dimension Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {dimensions.map(dim => {
          const Icon = dim.icon;
          const isActive = selectedDimension === dim.id;
          return (
            <button
              key={dim.id}
              onClick={() => setSelectedDimension(dim.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-mono uppercase flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-lg shadow-amber-500/10'
                  : 'glass-panel text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
              }`}
            >
              <Icon className={`w-4 h-4 ${dim.color}`} />
              <span>{dim.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* #2 Silver */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => handleOpenRefractedProfile(top3[1])}
            className="glass-panel p-6 rounded-3xl border border-slate-400/30 bg-gradient-to-b from-slate-400/10 to-transparent flex flex-col items-center text-center space-y-4 shadow-xl cursor-pointer relative group"
          >
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-slate-300 text-slate-950 font-mono font-extrabold text-[11px]">
              #2 SILVER
            </div>
            <img
              src={top3[1].avatar}
              alt={top3[1].name}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-300 shadow-xl group-hover:scale-105 transition-transform"
            />
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">{top3[1].name}</h3>
              <p className="text-xs font-mono text-sky-400">{top3[1].role}</p>
              <p className="text-[11px] text-slate-400">{top3[1].department}</p>
            </div>
            <div className="w-full pt-3 border-t border-white/10 flex items-center justify-around">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">SCORE</span>
                <span className="text-2xl font-mono font-extrabold text-white">{top3[1].score}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">VELOCITY</span>
                <span className="text-sm font-mono font-bold text-emerald-400">+{top3[1].growthRate}%</span>
              </div>
            </div>
          </motion.div>

          {/* #1 Gold Champion */}
          <motion.div
            whileHover={{ y: -6 }}
            onClick={() => handleOpenRefractedProfile(top3[0])}
            className="glass-panel p-7 rounded-3xl border border-amber-400/50 bg-gradient-to-b from-amber-500/15 via-purple-500/10 to-transparent flex flex-col items-center text-center space-y-4 shadow-2xl cursor-pointer relative group md:-translate-y-2"
          >
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-mono font-extrabold text-xs shadow-lg shadow-amber-400/40 flex items-center space-x-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>#1 CHAMPION</span>
            </div>
            <div className="relative">
              <img
                src={top3[0].avatar}
                alt={top3[0].name}
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-2xl group-hover:scale-105 transition-transform"
              />
              <div className="absolute -bottom-2 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg">
                <Star className="w-4 h-4 fill-slate-950" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors">{top3[0].name}</h3>
              <p className="text-xs font-mono text-amber-300 font-bold">{top3[0].role}</p>
              <p className="text-[11px] text-slate-400">{top3[0].department}</p>
            </div>
            <div className="w-full pt-3 border-t border-white/10 flex items-center justify-around">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">SCORE</span>
                <span className="text-3xl font-mono font-extrabold text-amber-400">{top3[0].score}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">VELOCITY</span>
                <span className="text-sm font-mono font-bold text-emerald-400">+{top3[0].growthRate}%</span>
              </div>
            </div>
          </motion.div>

          {/* #3 Bronze */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => handleOpenRefractedProfile(top3[2])}
            className="glass-panel p-6 rounded-3xl border border-amber-700/40 bg-gradient-to-b from-amber-700/10 to-transparent flex flex-col items-center text-center space-y-4 shadow-xl cursor-pointer relative group"
          >
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-amber-700 text-white font-mono font-extrabold text-[11px]">
              #3 BRONZE
            </div>
            <img
              src={top3[2].avatar}
              alt={top3[2].name}
              className="w-20 h-20 rounded-full object-cover border-2 border-amber-700 shadow-xl group-hover:scale-105 transition-transform"
            />
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">{top3[2].name}</h3>
              <p className="text-xs font-mono text-sky-400">{top3[2].role}</p>
              <p className="text-[11px] text-slate-400">{top3[2].department}</p>
            </div>
            <div className="w-full pt-3 border-t border-white/10 flex items-center justify-around">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">SCORE</span>
                <span className="text-2xl font-mono font-extrabold text-white">{top3[2].score}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">VELOCITY</span>
                <span className="text-sm font-mono font-bold text-emerald-400">+{top3[2].growthRate}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-white/10">
        <div className="font-mono text-xs text-slate-300 font-bold uppercase tracking-wider">
          Complete Enterprise Refracted Roster ({rankedEmployees.length})
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ranked talent..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      {/* Full Ranked Leaderboard Table / Cards */}
      <div className="space-y-3">
        {rankedEmployees.map((emp, index) => (
          <motion.div
            whileHover={{ x: 3 }}
            key={emp.id}
            onClick={() => handleOpenRefractedProfile(emp)}
            className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm shrink-0 ${
                  index === 0
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                    : index === 1
                    ? 'bg-slate-300 text-slate-950'
                    : index === 2
                    ? 'bg-amber-700 text-white'
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}
              >
                #{index + 1}
              </div>

              <img
                src={emp.avatar}
                alt={emp.name}
                className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0"
              />

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  {emp.name}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="font-mono text-sky-400">{emp.role}</span>
                  <span>•</span>
                  <span>{emp.department}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 sm:space-x-8 text-right">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono uppercase">
                  {selectedDimension}
                </span>
                <span className="text-base font-mono font-extrabold text-amber-400">
                  {emp.score} pts
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">VELOCITY</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-end gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +{emp.growthRate}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-300 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardView;
