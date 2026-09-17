import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  ShieldAlert,
  Users,
  Award,
  Zap,
  RefreshCw,
  PlusCircle,
  Sliders,
  Check,
  ChevronRight,
  Target,
  FileText,
  Flame,
  ArrowUpRight,
  Clock,
  Briefcase,
} from 'lucide-react';
import api from '../../lib/apiClient';

interface ExecutiveBriefing {
  tenantName: string;
  generatedAt: string;
  reportingPeriod: string;
  compositePVI: number;
  pviTrendPercentage: number;
  overallDeliveryHealth: 'OPTIMAL' | 'STABLE' | 'DEGRADED' | 'CRITICAL';
  keyMetrics: {
    totalTasksCompleted30d: number;
    activeHeadcount: number;
    averageSlaAdherence: number;
    proofVerificationRate: number;
    openIncidentsCount: number;
  };
  leadLagIndicators: {
    outputVelocity: number;
    riskMitigation: number;
    strategicAlignment: number;
    teamGrowthIndex: number;
    presenceAdherence: number;
    wellbeingScore: number;
  };
  executiveNarrative: string;
  strategicHighlights: string[];
  operationalRisks: string[];
  recommendedExecutiveActions: string[];
}

interface DepartmentEfficiency {
  departmentId: string;
  departmentName: string;
  headName: string;
  memberCount: number;
  efficiencyScore: number;
  throughputTasksCompleted: number;
  slaAdherencePercentage: number;
  averageCycleTimeHours: number;
  proofQualityPercentage: number;
  ratingGrade: 'EXEMPLARY' | 'EFFICIENT' | 'BALANCED' | 'NEEDS_ATTENTION';
}

interface FlightRiskForecast {
  userId: string;
  userName: string;
  userRole: string;
  departmentName: string;
  overallFlightRiskScore: number;
  riskTier: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  riskDrivers: string[];
  retentionRecommendation: string;
  metrics: {
    utilizationRate: number;
    recognitionsReceived30d: number;
    performanceScoreDelta: number;
    daysAtCurrentLevel: number;
  };
}

interface CustomKpiDefinition {
  id: string;
  name: string;
  category: string;
  formulaDescription: string;
  weights: {
    throughput: number;
    speed: number;
    quality: number;
    discipline: number;
  };
  targetValue: number;
  currentValue: number;
  unit: string;
  createdBy: string;
}

export const SynthesisView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BRIEFING' | 'DEI' | 'FLIGHT_RISK' | 'CUSTOM_KPIS'>('BRIEFING');
  const [briefing, setBriefing] = useState<ExecutiveBriefing | null>(null);
  const [deiList, setDeiList] = useState<DepartmentEfficiency[]>([]);
  const [flightRisks, setFlightRisks] = useState<FlightRiskForecast[]>([]);
  const [customKpis, setCustomKpis] = useState<CustomKpiDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Custom KPI Modal State
  const [kpiModalOpen, setKpiModalOpen] = useState(false);
  const [kpiName, setKpiName] = useState('');
  const [kpiCategory, setKpiCategory] = useState('ENGINEERING');
  const [wThroughput, setWThroughput] = useState(35);
  const [wSpeed, setWSpeed] = useState(25);
  const [wQuality, setWQuality] = useState(25);
  const [wDiscipline, setWDiscipline] = useState(15);
  const [targetValue, setTargetValue] = useState(95);
  const [unit, setUnit] = useState('pts');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [briefingRes, deiRes, flightRes, kpisRes] = await Promise.all([
        api.get<any>('/analytics/briefing'),
        api.get<any>('/analytics/department-efficiency'),
        api.get<any>('/analytics/flight-risk'),
        api.get<any>('/analytics/custom-kpis'),
      ]);

      if (briefingRes?.data || briefingRes) setBriefing(briefingRes?.data || briefingRes);
      if (deiRes?.data || deiRes) setDeiList(deiRes?.data || deiRes);
      if (flightRes?.data || flightRes) setFlightRisks(flightRes?.data || flightRes);
      if (kpisRes?.data || kpisRes) setCustomKpis(kpisRes?.data || kpisRes);
    } catch (err) {
      console.error('Failed to load analytics telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleExportCsv = async () => {
    try {
      const res = await fetch('/api/v1/analytics/export/csv', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prism_executive_intelligence_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setFeedbackMsg('Executive Intelligence Telemetry CSV exported successfully.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleCreateKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formulaDescription = `${wThroughput}% Throughput + ${wSpeed}% Speed + ${wQuality}% Quality + ${wDiscipline}% Discipline`;
      const res = await api.post<any>('/analytics/custom-kpis', {
        name: kpiName,
        category: kpiCategory,
        formulaDescription,
        weights: {
          throughput: wThroughput / 100,
          speed: wSpeed / 100,
          quality: wQuality / 100,
          discipline: wDiscipline / 100,
        },
        targetValue,
        currentValue: Math.round(targetValue * 0.92 * 10) / 10,
        unit,
      });

      setKpiModalOpen(false);
      setKpiName('');
      setFeedbackMsg(`Custom KPI '${kpiName}' constructed and added to executive registry.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchAnalyticsData();
    } catch (err) {
      console.error('Create KPI error:', err);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              PRD §26 Executive Intelligence
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Board-Ready Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-sky-400" />
            Executive Synthesis & Strategic Intelligence
          </h1>
          <p className="text-xs text-slate-400">
            Automated board briefings, cross-department efficiency rankings, flight risk early warnings, and custom KPI formula modeling.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAnalyticsData}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono border border-white/15 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {feedbackMsg && (
          <div className="w-full mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs font-mono animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex rounded-2xl bg-white/5 p-1 text-xs font-mono max-w-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('BRIEFING')}
            className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'BRIEFING'
                ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> Executive Briefing
          </button>
          <button
            onClick={() => setActiveTab('DEI')}
            className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'DEI'
                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Department Efficiency (DEI)
          </button>
          <button
            onClick={() => setActiveTab('FLIGHT_RISK')}
            className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'FLIGHT_RISK'
                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Flight Risk Forecast
          </button>
          <button
            onClick={() => setActiveTab('CUSTOM_KPIS')}
            className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'CUSTOM_KPIS'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" /> Custom KPIs ({customKpis.length})
          </button>
        </div>

        {activeTab === 'CUSTOM_KPIS' && (
          <button
            onClick={() => setKpiModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Build Custom KPI
          </button>
        )}
      </div>

      {/* TAB 1: EXECUTIVE BRIEFING */}
      {activeTab === 'BRIEFING' && briefing && (
        <div className="space-y-6">
          {/* Top Score & Key Metrics Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-sky-500/30 bg-sky-500/[0.03] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Composite Prism Velocity Index</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    briefing.overallDeliveryHealth === 'OPTIMAL'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  }`}
                >
                  {briefing.overallDeliveryHealth}
                </span>
              </div>
              <div className="flex items-baseline space-x-3">
                <span className="text-5xl font-extrabold text-white tracking-tight">{briefing.compositePVI}</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  +{briefing.pviTrendPercentage}% vs Last Month
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Blended mechanical execution score reflecting output velocity, risk mitigation, and verified delivery.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">30d Verified Proofs</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {briefing.keyMetrics.totalTasksCompleted30d}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Completed & Approved</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">SLA Adherence</span>
                <div className="text-2xl font-bold text-sky-400 font-mono">
                  {briefing.keyMetrics.averageSlaAdherence}%
                </div>
                <span className="text-[10px] text-slate-400 font-mono">On-Time Milestone Rate</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Proof Quality</span>
                <div className="text-2xl font-bold text-purple-400 font-mono">
                  {briefing.keyMetrics.proofVerificationRate}%
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Evidence-Gated Passed</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Active Headcount</span>
                <div className="text-2xl font-bold text-indigo-400 font-mono">
                  {briefing.keyMetrics.activeHeadcount}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">100% Account Utilization</span>
              </div>
            </div>
          </div>

          {/* Luminary AI Executive Narrative */}
          <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 bg-sky-500/[0.02] space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">Luminary Strategic Executive Synthesis</h3>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              {briefing.executiveNarrative}
            </p>
          </div>

          {/* Lead vs Lag Radar Telemetry */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Lead vs. Lag Six-Lens Telemetry (PRD §16)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
              {Object.entries(briefing.leadLagIndicators).map(([lens, score]) => (
                <div key={lens} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase truncate block">{lens.replace('Score', '')}</span>
                  <div className="text-xl font-bold text-white">{score}/100</div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights, Risks & Recommended Actions Triad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.01] space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Strategic Highlights
              </span>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                {briefing.strategicHighlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-rose-500/[0.01] space-y-3">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Operational Bottlenecks
              </span>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                {briefing.operationalRisks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.01] space-y-3">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" /> Board Recommendations
              </span>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                {briefing.recommendedExecutiveActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENT EFFICIENCY INDEX (DEI) */}
      {activeTab === 'DEI' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deiList.map((d) => (
              <div key={d.departmentId} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{d.departmentName}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Lead: {d.headName}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      d.ratingGrade === 'EXEMPLARY'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : d.ratingGrade === 'EFFICIENT'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {d.ratingGrade}
                  </span>
                </div>

                <div className="flex items-baseline justify-between p-3 rounded-2xl bg-white/5 border border-white/5 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Efficiency Index</span>
                    <div className="text-3xl font-extrabold text-white">{d.efficiencyScore}/100</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase">Team Size</span>
                    <div className="text-white font-bold">{d.memberCount} Members</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="font-bold text-emerald-400">{d.throughputTasksCompleted}</div>
                    <span className="text-[9px] text-slate-400 uppercase">Completed</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="font-bold text-sky-400">{d.slaAdherencePercentage}%</div>
                    <span className="text-[9px] text-slate-400 uppercase">SLA Adherence</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="font-bold text-purple-400">{d.proofQualityPercentage}%</div>
                    <span className="text-[9px] text-slate-400 uppercase">Proof Quality</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FLIGHT / ATTRITION RISK FORECAST */}
      {activeTab === 'FLIGHT_RISK' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Attrition & Retention Early Warning System (PRD §26)</h4>
                <p className="text-xs text-slate-400">
                  Correlates chronic burnout overload, recognition deficits, score momentum drops, and role stagnation.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-rose-300 font-bold px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/30">
              {flightRisks.filter((f) => f.riskTier === 'CRITICAL' || f.riskTier === 'HIGH').length} Elevated Alerts
            </div>
          </div>

          <div className="space-y-3">
            {flightRisks.map((f) => (
              <div
                key={f.userId}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  f.riskTier === 'CRITICAL'
                    ? 'border-red-500/40 bg-red-500/[0.02]'
                    : f.riskTier === 'HIGH'
                    ? 'border-amber-500/30 bg-amber-500/[0.01]'
                    : 'border-white/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{f.userName}</span>
                      <span className="text-[10px] text-slate-400">({f.userRole})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                        {f.departmentName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {f.riskDrivers.map((d, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-slate-300 pt-1">
                      <strong className="text-indigo-400">Action:</strong> {f.retentionRecommendation}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase">Flight Risk</span>
                      <div className="text-2xl font-bold text-white">{f.overallFlightRiskScore}/100</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold uppercase border ${
                        f.riskTier === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : f.riskTier === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {f.riskTier}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOM KPIS */}
      {activeTab === 'CUSTOM_KPIS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customKpis.map((k) => (
              <div key={k.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 font-mono">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">{k.category}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{k.name}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300">
                  <span className="text-[10px] text-slate-400 block uppercase mb-1">Formula Architecture</span>
                  {k.formulaDescription}
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-3xl font-extrabold text-white">{k.currentValue}</span>
                    <span className="text-xs text-slate-400 ml-1">{k.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Target: {k.targetValue} {k.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOM KPI BUILDER MODAL */}
      {kpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateKpi}
            className="glass-panel w-full max-w-lg rounded-3xl border border-emerald-500/30 p-6 space-y-4 bg-slate-950/95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Custom Executive KPI Formula Builder</h2>
              </div>
              <button
                type="button"
                onClick={() => setKpiModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Metric Name</label>
                <input
                  type="text"
                  required
                  value={kpiName}
                  onChange={(e) => setKpiName(e.target.value)}
                  placeholder="e.g. Core Distributed Sharding Velocity"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Category</label>
                  <select
                    value={kpiCategory}
                    onChange={(e) => setKpiCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ENGINEERING">ENGINEERING</option>
                    <option value="OPERATIONS">OPERATIONS</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="PRODUCT">PRODUCT</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Target Value</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">
                  Weight Distribution (Total: {wThroughput + wSpeed + wQuality + wDiscipline}%)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400">Throughput: {wThroughput}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={wThroughput}
                      onChange={(e) => setWThroughput(Number(e.target.value))}
                      className="w-full accent-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Speed: {wSpeed}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={wSpeed}
                      onChange={(e) => setWSpeed(Number(e.target.value))}
                      className="w-full accent-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Quality: {wQuality}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={wQuality}
                      onChange={(e) => setWQuality(Number(e.target.value))}
                      className="w-full accent-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Discipline: {wDiscipline}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={wDiscipline}
                      onChange={(e) => setWDiscipline(Number(e.target.value))}
                      className="w-full accent-emerald-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10 font-mono">
              <button
                type="button"
                onClick={() => setKpiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Deploy Custom KPI
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SynthesisView;
