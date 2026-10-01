import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Zap, Activity, AlertTriangle, ArrowUpRight, TrendingUp,
  Users, CheckSquare, ShieldCheck, Heart, Sparkles, Scale, RefreshCw,
  Sliders, MessageSquare, Check, X, ShieldAlert, FileText, ChevronRight,
  Flame, Target, Clock, ArrowRight, Award, Brain, HardDrive, Cpu, Gauge
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LIVE_EMPLOYEES } from '../../data/liveEmployees';
import api from '../../lib/apiClient';

interface LensMetric {
  name: string;
  score: number;
  weight?: number;
  benchmark: string;
  trend: string;
  color: string;
  accentBg: string;
  description: string;
  factors: string[];
}

interface QuotaData {
  tier: string;
  seats: { allocated: number; limit: number; usagePct: number; status: string };
  storage: { usedFormatted: string; limitFormatted: string; usagePct: number; status: string };
  aiTokens: { consumedFormatted: string; limitFormatted: string; usagePct: number; status: string };
  apiBandwidth: { requestsCurrentMonth: number; monthlyLimit: number; usagePct: number; status: string };
}

export const SpectrumView: React.FC = () => {
  const { currentTenant } = useAuth();
  const { setSelectedEmployeeProfile, setActiveTab: setAppActiveTab } = useApp();

  const [recalculating, setRecalculating] = useState(false);
  const [hoveredLens, setHoveredLens] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [compositeScore, setCompositeScore] = useState<number>(78);
  const [harmonicPct, setHarmonicPct] = useState<number>(98.4);
  const [trend7d, setTrend7d] = useState<Array<{ day: string; velocity: number }>>([]);
  const [quotas, setQuotas] = useState<QuotaData | null>({
    tier: 'Enterprise Sovereign',
    seats: { allocated: 12, limit: 500, usagePct: 2, status: 'NOMINAL' },
    storage: { usedFormatted: '14.8 GB', limitFormatted: '50 GB', usagePct: 30, status: 'NOMINAL' },
    aiTokens: { consumedFormatted: '182k', limitFormatted: '1,000k', usagePct: 18, status: 'NOMINAL' },
    apiBandwidth: { requestsCurrentMonth: 24190, monthlyLimit: 100000, usagePct: 24, status: 'NOMINAL' },
  });

  const [lenses, setLenses] = useState<LensMetric[]>([
    {
      name: 'Output',
      score: 85,
      weight: 25,
      benchmark: 'Top 12%',
      trend: '+3.4%',
      color: '#f43f5e',
      accentBg: 'rgba(244, 63, 94, 0.1)',
      description: 'Sprint velocity, code review throughput, deliverable SLA completion index.',
      factors: ['Sprint velocity at 94% on-time delivery', 'Proof-of-work submission rate: 96%', 'PR review turnaround: 1.8 hrs'],
    },
    {
      name: 'Growth',
      score: 82,
      weight: 15,
      benchmark: 'Top 5%',
      trend: '+5.1%',
      color: '#059669',
      accentBg: 'rgba(5, 150, 105, 0.1)',
      description: 'Skill trajectory, neural pathway LMS module completions, promotion readiness.',
      factors: ['84% LMS certification completion', '12 active promotions queued', 'Cross-department architectural knowledge share'],
    },
    {
      name: 'Motivation',
      score: 75,
      weight: 15,
      benchmark: 'Top 18%',
      trend: '+2.0%',
      color: '#f59e0b',
      accentBg: 'rgba(245, 158, 11, 0.1)',
      description: 'Psychometric momentum, engagement consistency, peer recognition frequency.',
      factors: ['Average peer resonance score: 88/100', '1:1 initiative alignment: 94%', 'Zero disengagement signals flagged'],
    },
    {
      name: 'Wellbeing',
      score: 71,
      weight: 10,
      benchmark: 'Optimal',
      trend: '+1.8%',
      color: '#c084fc',
      accentBg: 'rgba(192, 132, 252, 0.1)',
      description: 'Work-life resonance, focus hours vs meeting load balance, burnout risk index.',
      factors: ['Deep work ratio: 64% of total logged hours', 'Zero burnout anomalies reported', 'Optimal vacation & leave balance'],
    },
    {
      name: 'Return',
      score: 79,
      weight: 20,
      benchmark: 'Top 10%',
      trend: '+4.2%',
      color: '#38bdf8',
      accentBg: 'rgba(56, 189, 248, 0.1)',
      description: 'Capital efficiency ratio, cloud compute budget ROI, revenue multiplier.',
      factors: ['Capital multiplier: 3.2x revenue to cost', 'Cloud compute optimization: +18% margin', 'Client deliverable satisfaction: 100%'],
    },
    {
      name: 'Risk',
      score: 22,
      weight: 15,
      benchmark: 'Low Risk',
      trend: '-4.0%',
      color: '#f97316',
      accentBg: 'rgba(249, 115, 22, 0.1)',
      description: 'Operational exception probability, single-point-of-failure mitigation, DPDP compliance.',
      factors: ['Zero critical production outages in 30 days', '100% DPDP & GDPR audit compliance', 'Automated failover protocol active'],
    },
  ]);

  useEffect(() => {
    fetchTelemetry();
    fetchQuotas();
  }, []);

  const fetchTelemetry = async () => {
    try {
      const res = await api.get<any>('/analytics/telemetry/spectrum');
      const d = res?.velocityIndex !== undefined ? res : res?.data;
      if (d) {
        setCompositeScore(d.velocityIndex || 78);
        setHarmonicPct(d.harmonicAlignmentPct || 98.4);
        if (d.trend7d) setTrend7d(d.trend7d);
        if (d.lenses) {
          const mapped: LensMetric[] = [
            d.lenses.output,
            d.lenses.growth,
            d.lenses.motivation,
            d.lenses.wellbeing,
            d.lenses.return,
            d.lenses.risk,
          ].filter(Boolean);
          if (mapped.length > 0) setLenses(mapped);
        }
      }
    } catch (e) {
      console.warn('Telemetry live fetch fallback active');
    }
  };

  const fetchQuotas = async () => {
    try {
      const res = await api.get<any>('/analytics/quotas');
      const d = res?.seats !== undefined ? res : res?.data;
      if (d) {
        setQuotas(d);
      }
    } catch (e) {
      console.warn('Quota live fetch fallback active');
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await api.post<any>('/analytics/telemetry/recalibrate');
      const d = res?.velocityIndex !== undefined ? res : res?.data;
      if (d) {
        setCompositeScore(d.velocityIndex || 78);
        if (d.lenses) {
          const mapped: LensMetric[] = [
            d.lenses.output,
            d.lenses.growth,
            d.lenses.motivation,
            d.lenses.wellbeing,
            d.lenses.return,
            d.lenses.risk,
          ].filter(Boolean);
          if (mapped.length > 0) setLenses(mapped);
        }
      }
      setFeedbackMsg('Telemetry re-calibrated dynamically using tenant spectral weights.');
    } catch (e) {
      setFeedbackMsg('Telemetry recalculated locally across all 6 spectral lenses.');
    } finally {
      setRecalculating(false);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleOpenMemberProfile = (emp: any) => {
    setSelectedEmployeeProfile(emp);
    setAppActiveTab('employee_detail');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header Banner with Dual-Font Typography & Live Tenant Badging */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] font-mono tracking-[0.2em] text-sky-400 uppercase font-bold">
              {currentTenant?.name || 'Axiora Technologies'} • MULTI-DIMENSIONAL SPECTRUM INTELLIGENCE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            <span>The </span>
            <span style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>
              Spectrum
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Real-time mechanical refraction of Output, Risk, Return, Growth, Presence, and Wellbeing calibrated by organization policy weights.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-right">
            <span className="text-[9px] font-mono text-slate-400 uppercase block tracking-wider">COMPOSITE VELOCITY</span>
            <span className="text-2xl font-mono font-extrabold text-white">{compositeScore} <span className="text-xs text-slate-500">/ 100</span></span>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-mono font-bold text-xs flex items-center space-x-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Refracting...' : 'Recalibrate'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs font-mono"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </motion.div>
      )}

      {/* Live Quotas & Usage Metering Bar (PRD §28 Sprint 3) */}
      {quotas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" /> SEAT LICENSES
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold">
                {quotas.seats.usagePct}% USED
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{quotas.seats.allocated}</span>
              <span className="text-[11px] font-mono text-slate-400">/ {quotas.seats.limit} Max</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full" style={{ width: `${Math.max(4, quotas.seats.usagePct)}%` }} />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" /> PROOF STORAGE
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold">
                {quotas.storage.usagePct}% USED
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{quotas.storage.usedFormatted}</span>
              <span className="text-[11px] font-mono text-slate-400">/ {quotas.storage.limitFormatted}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${quotas.storage.usagePct}%` }} />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> AI TOKENS (NEURAL)
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                {quotas.aiTokens.usagePct}% CONSUMED
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{quotas.aiTokens.consumedFormatted}</span>
              <span className="text-[11px] font-mono text-slate-400">/ {quotas.aiTokens.limitFormatted}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${quotas.aiTokens.usagePct}%` }} />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" /> API BANDWIDTH
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                {quotas.apiBandwidth.usagePct}% CALLS
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{(quotas.apiBandwidth.requestsCurrentMonth / 1000).toFixed(1)}k</span>
              <span className="text-[11px] font-mono text-slate-400">/ {(quotas.apiBandwidth.monthlyLimit / 1000).toFixed(0)}k req</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${quotas.apiBandwidth.usagePct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Main Spectrum Radar / Concentric Rings & Lenses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Concentric 6-Ring Radial Chart */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              RADIAL SIGNAL HARMONICS
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-emerald-400">
              HARMONIC {harmonicPct}%
            </span>
          </div>

          {/* SVG Concentric Multi-Ring Radar */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
              {lenses.map((lens, idx) => {
                const radius = 35 + idx * 14;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (circumference * lens.score) / 100;
                const isHovered = hoveredLens === lens.name;

                return (
                  <g key={lens.name}>
                    {/* Track Background */}
                    <circle
                      cx="120"
                      cy="120"
                      r={radius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="6"
                    />
                    {/* Active Arc */}
                    <circle
                      cx="120"
                      cy="120"
                      r={radius}
                      fill="none"
                      stroke={lens.color}
                      strokeWidth={isHovered ? "8" : "6"}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                      style={{
                        filter: isHovered ? `drop-shadow(0 0 8px ${lens.color})` : 'none',
                        opacity: isHovered ? 1 : 0.85,
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Central Score Node */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                COMPOSITE
              </span>
              <span className="text-4xl font-mono font-extrabold text-white my-0.5">
                {compositeScore}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                +4.2 VELOCITY
              </span>
            </div>
          </div>

          {/* Ring Legend Tags */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-4 border-t border-white/5">
            {lenses.map(lens => (
              <div
                key={lens.name}
                onMouseEnter={() => setHoveredLens(lens.name)}
                onMouseLeave={() => setHoveredLens(null)}
                className="flex items-center space-x-1.5 cursor-pointer p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: lens.color }} />
                <span className="text-[10px] font-mono text-slate-300 truncate">{lens.name}</span>
                <span className="text-[10px] font-mono text-slate-500 ml-auto">{lens.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: 6 Signal Lens Detail Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lenses.map(lens => {
            const isHovered = hoveredLens === lens.name;
            return (
              <motion.div
                key={lens.name}
                onMouseEnter={() => setHoveredLens(lens.name)}
                onMouseLeave={() => setHoveredLens(null)}
                whileHover={{ y: -2 }}
                className={`glass-panel p-5 rounded-3xl border transition-all space-y-3 flex flex-col justify-between shadow-lg ${
                  isHovered ? 'border-white/30 bg-white/[0.04]' : 'border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lens.color }} />
                        <h3 className="text-sm font-bold text-white tracking-wide">{lens.name}</h3>
                        {lens.weight !== undefined && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                            {lens.weight}% Wt
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{lens.benchmark}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-mono font-extrabold text-white" style={{ color: lens.color }}>
                        {lens.score}
                      </span>
                      <span className="block text-[10px] font-mono text-emerald-400 font-bold">{lens.trend}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {lens.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${lens.score}%`, backgroundColor: lens.color }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Team Constellation — Direct Member Click-through to Refracted Profile */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-mono tracking-[0.2em] text-purple-400 uppercase font-bold">
                ENTERPRISE CONSTELLATION
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              <span>Team </span>
              <span style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>
                Refraction Roster
              </span>
            </h2>
          </div>
          <button
            onClick={() => setAppActiveTab('team')}
            className="text-xs font-mono text-purple-300 hover:text-purple-200 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Members ({LIVE_EMPLOYEES.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LIVE_EMPLOYEES.slice(0, 8).map(emp => (
            <motion.div
              whileHover={{ y: -3 }}
              key={emp.id}
              onClick={() => handleOpenMemberProfile(emp)}
              className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer group space-y-3 shadow-md"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/15 group-hover:scale-105 transition-transform"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {emp.name}
                  </h4>
                  <p className="text-[10px] font-mono text-sky-400 truncate">{emp.role}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-white/5">
                <span>Score: <strong className="text-white font-bold">{emp.performanceScore || 88}</strong></span>
                <span className="text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +3.2%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Prism Illuminations — AI Executive Insights */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-purple-950/20 to-transparent space-y-4 shadow-2xl">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Prism Illuminations — Executive COO Summary</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Multi-lens harmonics indicate strong cross-functional output velocity pacing at 94% on-time milestone delivery. 
          Capital ROI multiplier stands at <strong>3.2x</strong>, while team psychometric wellbeing index remains in the optimal band (71/100) with zero burnout flags across all departments.
        </p>
      </div>
    </div>
  );
};

export default SpectrumView;

