import React, { useState, useEffect } from 'react';
import {
  Compass, Zap, Activity, AlertTriangle, ArrowUpRight, TrendingUp,
  Users, CheckSquare, ShieldCheck, Heart, Sparkles, Scale, RefreshCw,
  Sliders, MessageSquare, Check, X, ShieldAlert, FileText, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/apiClient';

interface LensMetric {
  score: number;
  weight: number;
  status: 'EXEMPLARY' | 'OPTIMAL' | 'ELEVATED_RISK' | 'CRITICAL';
  formulaVersion: string;
  contributingFactors: string[];
  metrics: Record<string, any>;
}

interface SixLensTelemetry {
  output: LensMetric;
  risk: LensMetric;
  return: LensMetric;
  growth: LensMetric;
  presence: LensMetric;
  wellbeing: LensMetric;
  velocityIndex: number;
  calculatedAt: string;
}

interface DailyScoreItem {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  designation?: string;
  departmentName: string;
  departmentCode: string;
  scoreDate: string;
  totalScore: number;
  taskCompletionScore: number;
  speedScore: number;
  disciplineScore: number;
  attendanceScore: number;
  tasksAssigned: number;
  tasksCompleted: number;
  proofsApproved: number;
  disputeStatus?: string;
  activeDispute?: any;
}

interface ScoreDisputeItem {
  id: string;
  scoreId: string;
  userId: string;
  userName: string;
  userRole: string;
  designation?: string;
  scoreDate: string;
  originalScore: number;
  reason: string;
  status: string;
  adjustedScore?: number;
  reviewedBy?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export const SpectrumView: React.FC = () => {
  const { currentUser } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'SIX_LENSES' | 'SCORE_ROSTER' | 'DISPUTES_QUEUE'>('SIX_LENSES');

  // State
  const [lensesData, setLensesData] = useState<SixLensTelemetry | null>(null);
  const [dailyScores, setDailyScores] = useState<DailyScoreItem[]>([]);
  const [disputes, setDisputes] = useState<ScoreDisputeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  // Modals
  const [selectedScoreForDispute, setSelectedScoreForDispute] = useState<DailyScoreItem | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  const [selectedDisputeForResolve, setSelectedDisputeForResolve] = useState<ScoreDisputeItem | null>(null);
  const [resolveDecision, setResolveDecision] = useState<'CORRECTED' | 'UPHELD'>('CORRECTED');
  const [resolveAdjustedScore, setResolveAdjustedScore] = useState<number>(95);
  const [resolveNotes, setResolveNotes] = useState('');

  // Feedback Notification
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // 1. Fetch Scoring & Six-Lens Telemetry
  const fetchScoringData = async () => {
    try {
      setLoading(true);
      const [lensesRes, scoresRes, disputesRes] = await Promise.all([
        api.get<{ lenses: SixLensTelemetry }>('/api/v1/scoring/six-lenses'),
        api.get<{ items: DailyScoreItem[] }>('/api/v1/scoring/daily'),
        api.get<ScoreDisputeItem[]>('/api/v1/scoring/disputes?status=ALL'),
      ]);

      if (lensesRes?.lenses) setLensesData(lensesRes.lenses);
      if (scoresRes?.items) setDailyScores(scoresRes.items);
      if (disputesRes) setDisputes(disputesRes);
    } catch (err) {
      console.warn('Error fetching scoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoringData();
  }, []);

  // 2. Trigger Manual Recalculation
  const handleRecalculateScores = async () => {
    try {
      setRecalculating(true);
      const res = await api.post<any>('/api/v1/scoring/calculate-now', {});
      if (res) {
        setFeedbackMsg(`Recalculated & snapshotted scores for ${res.computedCount} active members.`);
        setTimeout(() => setFeedbackMsg(null), 3500);
        fetchScoringData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to recalculate scores');
    } finally {
      setRecalculating(false);
    }
  };

  // 3. File Dispute Submit
  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScoreForDispute || disputeReason.trim().length < 5) return;

    try {
      const res = await api.post<any>('/api/v1/scoring/disputes', {
        scoreId: selectedScoreForDispute.id,
        reason: disputeReason.trim(),
      });

      if (res) {
        setFeedbackMsg('Score dispute filed successfully and routed to department leadership.');
        setTimeout(() => setFeedbackMsg(null), 3500);
        setSelectedScoreForDispute(null);
        setDisputeReason('');
        fetchScoringData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to file dispute');
    }
  };

  // 4. Resolve Dispute Submit
  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisputeForResolve) return;

    try {
      const res = await api.post<any>(`/api/v1/scoring/disputes/${selectedDisputeForResolve.id}/resolve`, {
        decision: resolveDecision,
        adjustedScore: resolveDecision === 'CORRECTED' ? Number(resolveAdjustedScore) : undefined,
        notes: resolveNotes.trim(),
      });

      if (res) {
        setFeedbackMsg(`Dispute marked as ${resolveDecision} and updated in audit ledger.`);
        setTimeout(() => setFeedbackMsg(null), 3500);
        setSelectedDisputeForResolve(null);
        setResolveNotes('');
        fetchScoringData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to resolve dispute');
    }
  };

  const openDisputesCount = disputes.filter((d) => d.status === 'OPEN').length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-32 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">SIX-LENS INTELLIGENCE & SCORING (PRD §16)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Spectrum Intelligence Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time mechanical refraction of Output, Risk, Return, Growth, Presence, and Wellbeing anchored to cryptographic proofs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Velocity Index Badge */}
          <div className="px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-center">
            <span className="block text-[10px] font-mono text-slate-400">PRISM VELOCITY INDEX (PVI)</span>
            <span className="text-2xl font-bold text-sky-400">{lensesData?.velocityIndex || 88.5} / 100</span>
          </div>

          <button
            onClick={handleRecalculateScores}
            disabled={recalculating}
            className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-sky-500/20 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Calculating...' : 'Recalculate Now'}</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center space-x-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('SIX_LENSES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SIX_LENSES'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Six Lenses Breakdown
        </button>
        <button
          onClick={() => setActiveTab('SCORE_ROSTER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SCORE_ROSTER'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Daily Score Roster ({dailyScores.length})
        </button>
        <button
          onClick={() => setActiveTab('DISPUTES_QUEUE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
            activeTab === 'DISPUTES_QUEUE'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Dispute Resolution</span>
          {openDisputesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {openDisputesCount}
            </span>
          )}
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs font-medium animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 1: SIX-LENS INTELLIGENCE GRID (PRD §16)          */}
      {/* ==================================================== */}
      {activeTab === 'SIX_LENSES' && lensesData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Output Lens */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-sky-500/30 transition-all space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">1. Output Lens</h3>
                    <span className="text-[10px] font-mono text-slate-400">Weight: 25%</span>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-sky-400 font-mono">{lensesData.output.score}</span>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: `${lensesData.output.score}%` }} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {lensesData.output.contributingFactors.map((f, i) => (
                  <p key={i} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span>{f}</span>
                  </p>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{lensesData.output.formulaVersion}</span>
                <span className="text-sky-300 font-bold">{lensesData.output.status}</span>
              </div>
            </div>

            {/* 2. Risk Lens */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-amber-500/30 transition-all space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">2. Risk Lens</h3>
                    <span className="text-[10px] font-mono text-slate-400">Weight: 20%</span>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-amber-400 font-mono">{lensesData.risk.score}</span>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${lensesData.risk.score}%` }} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {lensesData.risk.contributingFactors.map((f, i) => (
                  <p key={i} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{f}</span>
                  </p>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{lensesData.risk.formulaVersion}</span>
                <span className="text-amber-300 font-bold">{lensesData.risk.status}</span>
              </div>
            </div>

            {/* 3. Return Lens */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">3. Return Lens</h3>
                    <span className="text-[10px] font-mono text-slate-400">Weight: 20%</span>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">{lensesData.return.score}</span>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${lensesData.return.score}%` }} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {lensesData.return.contributingFactors.map((f, i) => (
                  <p key={i} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </p>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{lensesData.return.formulaVersion}</span>
                <span className="text-emerald-300 font-bold">{lensesData.return.status}</span>
              </div>
            </div>

            {/* 4. Growth Lens */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-all space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">4. Growth Lens</h3>
                    <span className="text-[10px] font-mono text-slate-400">Weight: 15%</span>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-purple-400 font-mono">{lensesData.growth.score}</span>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full transition-all duration-500" style={{ width: `${lensesData.growth.score}%` }} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {lensesData.growth.contributingFactors.map((f, i) => (
                  <p key={i} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span>{f}</span>
                  </p>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{lensesData.growth.formulaVersion}</span>
                <span className="text-purple-300 font-bold">{lensesData.growth.status}</span>
              </div>
            </div>

            {/* 5. Presence Lens */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-all space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">5. Presence Lens</h3>
                    <span className="text-[10px] font-mono text-slate-400">Weight: 10%</span>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-indigo-400 font-mono">{lensesData.presence.score}</span>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${lensesData.presence.score}%` }} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {lensesData.presence.contributingFactors.map((f, i) => (
                  <p key={i} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>{f}</span>
                  </p>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{lensesData.presence.formulaVersion}</span>
                <span className="text-indigo-300 font-bold">{lensesData.presence.status}</span>
              </div>
            </div>

            {/* 6. Wellbeing Lens */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-rose-500/30 transition-all space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">6. Wellbeing Lens</h3>
                    <span className="text-[10px] font-mono text-slate-400">Weight: 10%</span>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-rose-400 font-mono">{lensesData.wellbeing.score}</span>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full rounded-full transition-all duration-500" style={{ width: `${lensesData.wellbeing.score}%` }} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {lensesData.wellbeing.contributingFactors.map((f, i) => (
                  <p key={i} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{f}</span>
                  </p>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{lensesData.wellbeing.formulaVersion}</span>
                <span className="text-rose-300 font-bold">{lensesData.wellbeing.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: DAILY SCORE ROSTER (PRD §16 S8-11)            */}
      {/* ==================================================== */}
      {activeTab === 'SCORE_ROSTER' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Daily Performance Score Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mechanical scoring computed daily across Task Completion (40%), Speed (20%), Discipline (20%), and Attendance (20%).
              </p>
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5 text-xs">
            {dailyScores.map((sc) => (
              <div key={sc.id} className="p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{sc.userName}</span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                      {sc.departmentCode}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">{sc.scoreDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {sc.tasksCompleted}/{sc.tasksAssigned} tasks completed · {sc.proofsApproved} proofs approved
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="grid grid-cols-4 gap-3 text-center text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block">COMPLETION</span>
                      <span className="font-bold text-sky-400">{sc.taskCompletionScore}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">SPEED</span>
                      <span className="font-bold text-purple-400">{sc.speedScore}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">DISCIPLINE</span>
                      <span className="font-bold text-emerald-400">{sc.disciplineScore}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ATTENDANCE</span>
                      <span className="font-bold text-indigo-400">{sc.attendanceScore}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">TOTAL SCORE</span>
                      <span className="text-lg font-bold text-white font-mono">{sc.totalScore}</span>
                    </div>

                    <button
                      onClick={() => setSelectedScoreForDispute(sc)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-semibold"
                    >
                      Dispute
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: DISPUTE RESOLUTION QUEUE (PRD §16 S8-08, S8-12) */}
      {/* ==================================================== */}
      {activeTab === 'DISPUTES_QUEUE' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Scale className="w-5 h-5 text-purple-400" />
                <span>Score Dispute Resolution Queue</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Employee-initiated scoring dispute workflow with immutable audit log recording (PRD §16 S8-08).
              </p>
            </div>
          </div>

          {disputes.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Score Disputes</h4>
              <p className="text-xs text-slate-400">Zero active dispute submissions requiring review.</p>
            </div>
          ) : (
            <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5 text-xs">
              {disputes.map((d) => (
                <div key={d.id} className="p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                        d.status === 'OPEN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : d.status === 'CORRECTED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}>
                        {d.status}
                      </span>
                      <span className="font-bold text-white">{d.userName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{d.scoreDate} (Original: {d.originalScore})</span>
                    </div>
                    <p className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      "{d.reason}"
                    </p>
                    {d.resolutionNotes && (
                      <p className="text-[11px] text-purple-300 italic">
                        Resolution Notes: {d.resolutionNotes} {d.adjustedScore && `(Adjusted: ${d.adjustedScore})`}
                      </p>
                    )}
                  </div>

                  {d.status === 'OPEN' && (
                    <button
                      onClick={() => {
                        setSelectedDisputeForResolve(d);
                        setResolveAdjustedScore(d.originalScore + 5);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all"
                    >
                      Resolve Dispute
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 1: FILE SCORE DISPUTE MODAL         */}
      {/* ========================================== */}
      {selectedScoreForDispute && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">File Score Dispute</h3>
              </div>
              <button onClick={() => setSelectedScoreForDispute(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Disputing score for <strong className="text-white">{selectedScoreForDispute.userName}</strong> on {selectedScoreForDispute.scoreDate} (Original: {selectedScoreForDispute.totalScore}).
            </p>

            <form onSubmit={handleFileDispute} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Justification Reason * (min 5 chars)</label>
                <textarea
                  required
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain why this score requires revision (e.g. proof verified after SLA timestamp, external blocker)..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedScoreForDispute(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disputeReason.trim().length < 5}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-bold"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: RESOLVE SCORE DISPUTE MODAL      */}
      {/* ========================================== */}
      {selectedDisputeForResolve && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Resolve Score Dispute</h3>
              </div>
              <button onClick={() => setSelectedDisputeForResolve(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Dispute by <strong className="text-white">{selectedDisputeForResolve.userName}</strong> on {selectedDisputeForResolve.scoreDate} (Original: {selectedDisputeForResolve.originalScore}).
            </p>

            <form onSubmit={handleResolveDispute} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolveDecision('CORRECTED')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      resolveDecision === 'CORRECTED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    Correct Score
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolveDecision('UPHELD')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      resolveDecision === 'UPHELD'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    Uphold Original
                  </button>
                </div>
              </div>

              {resolveDecision === 'CORRECTED' && (
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">New Adjusted Score (0 - 100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    required
                    value={resolveAdjustedScore}
                    onChange={(e) => setResolveAdjustedScore(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Resolution Explanation / Notes</label>
                <textarea
                  rows={2}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Reasoning for decision recorded into immutable audit trail..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDisputeForResolve(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold"
                >
                  Apply Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SpectrumView;
