import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Diamond, Target, Brain, Clock, Heart, Star, Zap,
  TrendingUp, TrendingDown, Minus, Calendar, MessageSquare, BarChart3,
  ArrowUpRight, Monitor, X, Check, Share2, FileText, Award
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { LIVE_EMPLOYEES } from '../../data/liveEmployees';

export const EmployeeDetailView: React.FC = () => {
  const { selectedEmployeeProfile, setSelectedEmployeeProfile, setActiveTab } = useApp();
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState('telemetry');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState('');

  // Find target employee from selectedEmployeeProfile or find by currentUser email or default to Arjun Sharma
  const targetEmployee =
    selectedEmployeeProfile ||
    LIVE_EMPLOYEES.find(e => (e as any).email?.toLowerCase() === currentUser?.email?.toLowerCase()) ||
    LIVE_EMPLOYEES.find(e => e.name.toLowerCase().includes((currentUser?.name || '').toLowerCase())) ||
    LIVE_EMPLOYEES[0];

  const emp: any = targetEmployee;

  // Track active section on scroll
  useEffect(() => {
    const sections = ['telemetry', 'kpis', 'capital', 'neural', 'temporal', 'nodes', 'biorhythm', 'resonance'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (scrollPos >= top && scrollPos < bottom) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'telemetry', icon: Diamond, label: 'Telemetry' },
    { id: 'kpis', icon: Target, label: 'KPI Goals' },
    { id: 'capital', icon: BarChart3, label: 'Capital Matrix' },
    { id: 'neural', icon: Brain, label: 'Neural Pathways' },
    { id: 'temporal', icon: Clock, label: 'Temporal Dynamics' },
    { id: 'nodes', icon: Target, label: 'Impact Nodes' },
    { id: 'biorhythm', icon: Heart, label: 'Bio-Rhythms' },
    { id: 'resonance', icon: Star, label: '360° Reviews' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const nameParts = emp.name.split(' ');
  const firstName = nameParts[0] || emp.name;
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div className="flex flex-col xl:flex-row min-h-screen relative bg-[#030303] text-zinc-100 selection:bg-indigo-500/30">
      {/* Fixed Sticky Left Hero Panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full xl:w-[40%] h-[55vw] md:h-[42vw] xl:h-screen xl:sticky top-0 overflow-hidden xl:block bg-[#09090b] relative border-r border-white/[0.06]"
      >
        <img
          src={emp.avatar}
          alt={emp.name}
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-90 contrast-125 opacity-80"
        />

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#030303] via-[#030303]/30 to-transparent h-[35%]" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent to-[#030303]" />

        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedEmployeeProfile(null);
            setActiveTab('team');
          }}
          className="absolute top-8 left-8 z-30 p-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Back to Team Roster"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Left Hero Content Info */}
        <div className="absolute bottom-10 left-8 right-8 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-cyan-400 uppercase tracking-[0.28em] text-[11px] font-mono font-bold border-l-2 border-cyan-400 pl-3 py-0.5">
                {emp.department}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-full border ${
                  emp.attritionRisk === 'High'
                    ? 'border-rose-500/50 text-rose-400 bg-rose-500/10'
                    : emp.attritionRisk === 'Medium'
                    ? 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                    : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                }`}
              >
                Risk: {emp.attritionRiskPercentage}%
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-light text-white leading-tight">{firstName}</h1>
            {lastName && (
              <h1
                className="text-4xl sm:text-5xl text-zinc-400 leading-tight mb-3"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
              >
                {lastName}
              </h1>
            )}

            <p className="text-sm md:text-base text-zinc-300 font-light mb-4">{emp.role}</p>

            <div className="flex flex-wrap gap-1.5">
              {emp.skills?.map((skill: string) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-300 backdrop-blur-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Right Anchor Nav (Desktop) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="group relative flex items-center justify-end cursor-pointer"
            >
              <span className="absolute right-12 text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-all duration-300 opacity-0 text-zinc-400 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0">
                {item.label}
              </span>
              <div
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 backdrop-blur-md ${
                  isActive
                    ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'border-white/15 bg-black/40 text-zinc-400 hover:border-white/30 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Sticky Horizontal Anchor Nav */}
      <div className="xl:hidden flex overflow-x-auto gap-2 px-4 py-3 border-b border-white/[0.08] sticky top-0 z-30 bg-[#060608]/90 backdrop-blur-xl">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-widest whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300'
                  : 'border-white/10 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Sections Panel */}
      <div className="w-full xl:w-[60%] p-6 sm:p-10 lg:p-16 relative z-20">
        <div className="max-w-3xl mx-auto space-y-24 pb-36">
          {/* 1. Core Telemetry */}
          <section id="telemetry" className="scroll-mt-24">
            <h2 className="text-zinc-400 uppercase tracking-[0.2em] text-xs font-mono font-semibold mb-8 flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Core Telemetry Matrix</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Efficiency', val: emp.performanceScore, color: '#c084fc', icon: Target },
                { label: 'Evolution', val: emp.learningProgress, color: '#22d3ee', icon: Brain },
                { label: 'Motivation', val: emp.motivationScore, color: '#f59e0b', icon: Zap },
                { label: 'Welfare', val: emp.welfareScore, color: '#10b981', icon: Heart },
              ].map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="3" fill="none" className="text-white/5" />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke={metric.color}
                          strokeWidth="4"
                          strokeLinecap="round"
                          fill="none"
                          initial={{ strokeDasharray: '264 264', strokeDashoffset: 264 }}
                          whileInView={{ strokeDashoffset: 264 - (264 * metric.val) / 100 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease: 'easeOut', delay: idx * 0.1 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-light text-white font-mono">{metric.val}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400 mt-3 flex items-center gap-1.5">
                      <Icon className="w-3 h-3" style={{ color: metric.color }} />
                      <span>{metric.label}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. KPI Goals */}
          <section id="kpis" className="scroll-mt-24">
            <h2 className="text-zinc-400 uppercase tracking-[0.2em] text-xs font-mono font-semibold mb-6 flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>KPI Performance & Variance</span>
            </h2>

            <div className="space-y-3.5">
              {(emp.kpis || []).map((kpi: any, idx: number) => {
                const passed = kpi.current >= kpi.target;
                const ratio = Math.min((kpi.current / kpi.target) * 100, 100);
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        ) : kpi.trend === 'down' ? (
                          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Minus className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        <span className="text-sm font-light text-zinc-200">{kpi.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-zinc-500">Weight: {kpi.weight}%</span>
                        <span className={passed ? 'text-emerald-400' : 'text-amber-400'}>
                          {kpi.current}
                          {kpi.unit} <span className="text-zinc-600">/ {kpi.target}{kpi.unit}</span>
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${ratio}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-full ${passed ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Capital & Compensation Matrix */}
          <section id="capital" className="scroll-mt-24">
            <h2 className="text-zinc-400 uppercase tracking-[0.2em] text-xs font-mono font-semibold mb-6 flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Capital & Compensation Matrix</span>
            </h2>

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/20 to-black border border-emerald-500/20 mb-6 relative overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Cost Investment</p>
                  <p className="text-2xl font-light text-zinc-200">${(emp.costInvestment / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Revenue Generated</p>
                  <p className="text-2xl font-light text-emerald-400">${(emp.revenueContribution / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Human Capital ROI</p>
                  <p className="text-2xl font-light text-white">{emp.roi}%</p>
                </div>
              </div>

              {/* Surplus value progress bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
                <div
                  className="h-full bg-white/30"
                  style={{ width: `${(emp.costInvestment / emp.revenueContribution) * 100}%` }}
                />
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex-1" />
              </div>
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-2">
                <span>Base Cost Vector</span>
                <span>Surplus Value Generated</span>
              </div>
            </div>

            {/* Payroll & Equity Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">Payroll Ledger (Annual)</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-white/[0.05]">
                    <span className="text-zinc-400">Base Salary</span>
                    <span className="font-mono text-zinc-200">${emp.compensation?.base?.toLocaleString() || '180,000'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/[0.05]">
                    <span className="text-zinc-400">Target Bonus</span>
                    <span className="font-mono text-emerald-400">+${emp.compensation?.bonus?.toLocaleString() || '35,000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Wellness Stipend</span>
                    <span className="font-mono text-cyan-400">${emp.compensation?.utilizedStipend || '2,400'} / ${emp.compensation?.wellnessStipend || '3,000'}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">Equity Vectors</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-white/[0.05]">
                    <span className="text-zinc-400">Vested Value</span>
                    <span className="font-mono text-zinc-200">${emp.compensation?.equityVested?.toLocaleString() || '120,000'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/[0.05]">
                    <span className="text-zinc-400">Unvested</span>
                    <span className="font-mono text-purple-400">${emp.compensation?.equityUnvested?.toLocaleString() || '240,000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Next Vesting Node</span>
                    <span className="font-mono text-zinc-400">{emp.compensation?.nextVestDate || '15-Nov-2026'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Neural Pathways (LMS) */}
          <section id="neural" className="scroll-mt-24">
            <h2 className="text-zinc-400 uppercase tracking-[0.2em] text-xs font-mono font-semibold mb-6 flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span>Neural Pathways (LMS Progression)</span>
            </h2>

            <div className="space-y-3">
              {(emp.lmsModules || []).map((mod: any) => (
                <div key={mod.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-9 h-9">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-white/10" />
                        <motion.circle
                          cx="18"
                          cy="18"
                          r="15"
                          stroke={mod.status === 'completed' ? '#10b981' : mod.status === 'in_progress' ? '#22d3ee' : '#6b7280'}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray="94 94"
                          initial={{ strokeDashoffset: 94 }}
                          whileInView={{ strokeDashoffset: 94 - (94 * mod.progress) / 100 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-light text-zinc-200">{mod.title}</h4>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{mod.status.replace('_', ' ')} · {mod.date}</p>
                    </div>
                  </div>
                  {mod.score && (
                    <div className="text-right">
                      <span className="text-base font-light text-emerald-400 font-mono">{mod.score}%</span>
                      <span className="block text-[9px] font-mono uppercase text-zinc-500">Score</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 5. Temporal Dynamics (WFM) */}
          <section id="temporal" className="scroll-mt-24">
            <h2 className="text-zinc-400 uppercase tracking-[0.2em] text-xs font-mono font-semibold mb-6 flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Temporal Dynamics & Output Velocity</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">Daily Output Velocity</h3>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={emp.dailyPerformance || []}>
                      <Tooltip contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="score" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: '#60a5fa' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">Timesheet Matrix (Hours vs Billable)</h3>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emp.timesheets || []}>
                      <Tooltip contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }} />
                      <XAxis dataKey="week" stroke="#52525b" fontSize={10} />
                      <Bar dataKey="hoursLogged" fill="#818cf8" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="billable" fill="#22d3ee" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Leave & Assets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Leave Matrix
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1 text-zinc-400">
                      <span>PTO (Used / Total)</span>
                      <span className="font-mono text-zinc-200">{emp.leaveBalance?.ptoUsed || 8} / {emp.leaveBalance?.ptoTotal || 24}</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${((emp.leaveBalance?.ptoUsed || 8) / (emp.leaveBalance?.ptoTotal || 24)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5" /> Assigned Hardware Assets
                </h3>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {(emp.equipment || ['Apple MacBook Pro 16" M3 Max', 'LG UltraFine 5K Display', 'YubiKey 5C NFC']).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Impact Nodes & Promotions */}
          <section id="nodes" className="scroll-mt-24">
            <h2 className="text-zinc-400 uppercase tracking-[0.2em] text-xs font-mono font-semibold mb-6 flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              <span>Impact Nodes & Career Evolution</span>
            </h2>

            <div className="space-y-3 mb-8">
              {(emp.okrs || []).map((okr: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-light text-zinc-200">{okr.objective}</span>
                    <span className="font-mono text-sm text-cyan-400">{okr.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400" style={{ width: `${okr.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Career ladder evolution */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-indigo-400" /> Projected Promotion Trajectory
              </h3>
              {(emp.projectedPromotions || [{ role: 'Lead Architect', timeframe: 'Q4 2026', probability: 88 }]).map((p: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-200">{p.role}</span>
                  <span className="font-mono text-purple-400">{p.timeframe} · {p.probability}% Probability</span>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Bio-Rhythm & Psychometrics */}
          <section id="biorhythm" className="scroll-mt-24">
            <h2 className="text-zinc-400 uppercase tracking-[0.2em] text-xs font-mono font-semibold mb-6 flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Bio-Rhythm & Psychometrics</span>
            </h2>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.07] flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" stroke="#fb7185" strokeWidth="3" fill="none" strokeDasharray="4 4" className="animate-[spin_20s_linear_infinite]" />
                  <circle cx="50" cy="50" r="30" stroke="#10b981" strokeWidth="6" strokeLinecap="round" fill="none" strokeDasharray="188 188" strokeDashoffset={188 - (188 * (emp.bioRhythm?.stressIndex || 35)) / 100} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-light text-white font-mono">{emp.bioRhythm?.stressIndex || 35}</span>
                  <span className="text-[9px] font-mono uppercase text-zinc-400">Stress</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-light text-white mb-1">Cognitive Load Telemetry</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  Based on focus block density ({emp.bioRhythm?.focusBlocksAvg || 4.2} hrs/day) and work log sentiment, systemic burnout probability is at {emp.bioRhythm?.burnoutProbability || 14}%.
                </p>
                <span className="px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] font-mono uppercase tracking-widest">
                  Optimal Zone
                </span>
              </div>
            </div>
          </section>

          {/* 8. 360° Feedback Matrix */}
          <section id="resonance" className="scroll-mt-24">
            <h2 className="text-zinc-400 uppercase tracking-[0.2em] text-xs font-mono font-semibold mb-6 flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <Star className="w-3.5 h-3.5 text-indigo-400" />
              <span>360° Feedback Matrix & Peer Reviews</span>
            </h2>

            <div className="space-y-4">
              {(emp.reviews360 || []).map((rev: any, idx: number) => (
                <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-light text-white">{rev.reviewer}</h4>
                      <p className="text-[10px] font-mono uppercase text-zinc-500">{rev.relation} · {rev.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-light text-white font-mono">{rev.overall}</span>
                      <span className="block text-[9px] font-mono text-zinc-500 uppercase">Overall</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/[0.05] pt-3 text-xs">
                    <div>
                      <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-wider block mb-1">Strengths</span>
                      <p className="text-zinc-300 italic font-serif leading-relaxed">"{rev.strengths}"</p>
                    </div>
                    <div>
                      <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider block mb-1">Growth Areas</span>
                      <p className="text-zinc-300 italic font-serif leading-relaxed">"{rev.improvements}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Export Report Action Bar */}
          <section className="pt-8 border-t border-white/[0.08]">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setReportModalOpen(true)}
              className="w-full p-6 rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.12] flex items-center justify-between transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-light text-white">Generate Profile Intelligence Report</h4>
                  <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mt-0.5">
                    Export full data matrix for HR review or 1:1 prep
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
            </motion.button>
          </section>
        </div>
      </div>

      {/* Export Report Modal */}
      <AnimatePresence>
        {reportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setReportModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#09090c] border border-white/15 shadow-2xl relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 mb-1">Profile Export</p>
                  <h3 className="text-xl font-light text-white">{emp.name}</h3>
                  <p className="text-xs text-zinc-400">{emp.role}</p>
                </div>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'Full Performance Report', desc: 'All KPIs, OKRs, scores, and trends', icon: FileText, color: '#c084fc' },
                  { label: '1:1 Prep Summary', desc: 'Key talking points and risk flags', icon: MessageSquare, color: '#38bdf8' },
                  { label: 'HR Compliance Pack', desc: 'Compensation, leave, and audit data', icon: Award, color: '#10b981' },
                  { label: 'Copy Profile Link', desc: 'Share a read-only view', icon: Share2, color: '#f59e0b' },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setCopiedNotification(opt.label);
                        setTimeout(() => {
                          setCopiedNotification('');
                          setReportModalOpen(false);
                        }, 1500);
                      }}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${opt.color}15`, color: opt.color }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-light text-zinc-200 group-hover:text-white">{opt.label}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{opt.desc}</p>
                      </div>
                      {copiedNotification === opt.label ? (
                        <span className="text-emerald-400 text-xs font-mono">✓ Done</span>
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 text-center">
                End-to-End Encrypted · Access Logged
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeDetailView;
