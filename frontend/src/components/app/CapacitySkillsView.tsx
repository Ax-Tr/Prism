import React, { useState, useEffect } from 'react';
import {
  Users,
  Gauge,
  Sliders,
  Award,
  Zap,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Briefcase,
  Target,
  ChevronRight,
} from 'lucide-react';
import api from '../../lib/apiClient';

export interface UserCapacityRecord {
  userId: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  departmentName: string;
  weeklyCapacityHours: number;
  assignedTasksCount: number;
  activeWorkloadHours: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  utilizationPercentage: number;
  status: 'UNDER_ALLOCATED' | 'OPTIMAL' | 'HEAVY' | 'OVERLOADED';
  burnoutRisk: {
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    score: number;
    factors: string[];
  };
}

export interface SkillGapAnalysis {
  skillId: string;
  skillName: string;
  category: string;
  targetProficiency: number;
  averageTeamProficiency: number;
  gapScore: number;
  isSinglePointOfFailure: boolean;
  qualifiedMemberCount: number;
  coverageStatus: 'HEALTHY' | 'MODERATE_GAP' | 'CRITICAL_SPOF';
}

export interface UserSkillAssessment {
  userId: string;
  userName: string;
  userRole: string;
  departmentName: string;
  skills: {
    skillId: string;
    skillName: string;
    category: string;
    proficiency: 1 | 2 | 3 | 4 | 5;
    verifiedProofsCount: number;
    lastAssessedAt: string;
  }[];
}

export interface CareerProgressionPath {
  userId: string;
  userName: string;
  currentTitle: string;
  currentTrack: 'INDIVIDUAL_CONTRIBUTOR' | 'MANAGEMENT';
  currentLevel: {
    levelId: string;
    title: string;
    expectedScope: string;
  };
  nextLevel: {
    levelId: string;
    title: string;
    expectedScope: string;
    criteria: {
      minVerifiedProofs: number;
      minPviScore: number;
      minReviewScore: number;
      strategicDeliverablesCount: number;
    };
  } | null;
  readinessPercentage: number;
  metrics: {
    verifiedProofsCount: number;
    currentPviScore: number;
    competencyAverage: number;
    completedStrategicGoalsCount: number;
  };
  criteriaChecklist: {
    criterion: string;
    target: string | number;
    actual: string | number;
    met: boolean;
  }[];
  promotionBlockers: string[];
  recommendation: 'READY_FOR_PROMOTION' | 'ON_TRACK' | 'GROWTH_NEEDED' | 'AT_LEVEL_CEILING';
}

export const CapacitySkillsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CAPACITY' | 'SIMULATOR' | 'SKILLS' | 'CAREER'>('CAPACITY');
  const [loading, setLoading] = useState(true);

  // Capacity State
  const [roster, setRoster] = useState<UserCapacityRecord[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Simulator State
  const [simHeadcount, setSimHeadcount] = useState<number>(0);
  const [simMultiplier, setSimMultiplier] = useState<number>(1.2);
  const [simDeadlineDays, setSimDeadlineDays] = useState<number>(7);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Skills State
  const [skillMatrix, setSkillMatrix] = useState<UserSkillAssessment[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis[]>([]);
  const [squadResult, setSquadResult] = useState<any | null>(null);
  const [matchingSquad, setMatchingSquad] = useState(false);

  // Career State
  const [selectedCareerUser, setSelectedCareerUser] = useState<string>('');
  const [careerPath, setCareerPath] = useState<CareerProgressionPath | null>(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalNotes, setGoalNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [capRes, skillRes] = await Promise.all([
        api.get<any>('/workforce/capacity/roster'),
        api.get<any>('/workforce/skills/matrix'),
      ]);

      if (capRes?.roster) {
        setRoster(capRes.roster);
        setSummary(capRes.summary || []);
        if (capRes.roster.length > 0 && !selectedCareerUser) {
          setSelectedCareerUser(capRes.roster[0].userId);
        }
      }

      if (skillRes?.assessments) {
        setSkillMatrix(skillRes.assessments);
        setSkillGaps(skillRes.gaps || []);
      }
    } catch (e) {
      console.error('Failed to load workforce data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCareerUser) {
      api.get<any>(`/workforce/career/paths/${selectedCareerUser}`)
        .then((res: any) => setCareerPath(res))
        .catch((err: any) => console.error('Failed to load career path:', err));
    }
  }, [selectedCareerUser]);

  const handleRunSimulation = async () => {
    try {
      setSimLoading(true);
      const res = await api.post<any>('/workforce/capacity/simulate', {
        headcountDelta: simHeadcount,
        workloadMultiplier: simMultiplier,
        deadlineAccelerationDays: simDeadlineDays,
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleMatchSquad = async () => {
    try {
      setMatchingSquad(true);
      const res = await api.post<any>('/workforce/skills/match-team', {
        requiredSkills: [
          { skillId: 'DISTRIBUTED_SYSTEMS', minProficiency: 3 },
          { skillId: 'REACT_TYPESCRIPT', minProficiency: 3 },
          { skillId: 'AI_RAG_PIPELINES', minProficiency: 3 },
        ],
        maxTeamSize: 3,
      });
      setSquadResult(res);
    } catch (err) {
      console.error('Squad match error:', err);
    } finally {
      setMatchingSquad(false);
    }
  };

  const handleCreateCareerGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCareerUser || !goalTitle || !careerPath?.nextLevel) return;

    try {
      await api.post('/workforce/career/goals', {
        userId: selectedCareerUser,
        title: goalTitle,
        targetLevelId: careerPath.nextLevel.levelId,
        notes: goalNotes,
      });
      setGoalModalOpen(false);
      setGoalTitle('');
      setGoalNotes('');
      // Reload career path
      const res = await api.get<any>(`/workforce/career/paths/${selectedCareerUser}`);
      setCareerPath(res);
    } catch (err) {
      console.error('Failed to create career goal:', err);
    }
  };

  const filteredRoster =
    selectedDept === 'ALL'
      ? roster
      : roster.filter((r) => r.departmentName.toLowerCase().includes(selectedDept.toLowerCase()));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">WORKFORCE & TALENT INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Capacity, Skills & Career Pathways</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time team bandwidth allocation, organizational scenario modeling, competency graph, and objective promotion readiness (PRD §15)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex rounded-2xl bg-white/5 p-1 text-xs font-mono max-w-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('CAPACITY')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'CAPACITY' ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gauge className="w-4 h-4" /> Capacity & Burnout
        </button>
        <button
          onClick={() => {
            setActiveTab('SIMULATOR');
            if (!simResult) handleRunSimulation();
          }}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'SIMULATOR' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" /> Scenario Simulator
        </button>
        <button
          onClick={() => setActiveTab('SKILLS')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'SKILLS' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> Skills & Squad Builder
        </button>
        <button
          onClick={() => setActiveTab('CAREER')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'CAREER' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Career & Readiness
        </button>
      </div>

      {/* TAB 1: CAPACITY ROSTER & BURNOUT */}
      {activeTab === 'CAPACITY' && (
        <div className="space-y-6">
          {/* Top Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Workforce</span>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> {roster.length} members
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Across {summary.length} departments</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Workload</span>
              <div className="text-2xl font-bold text-sky-400 font-mono">
                {roster.reduce((sum, r) => sum + r.activeWorkloadHours, 0)} hrs
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Capacity: {roster.reduce((sum, r) => sum + r.weeklyCapacityHours, 0)} hrs/wk
              </span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Overloaded Members</span>
              <div className="text-2xl font-bold text-amber-400 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                {roster.filter((r) => r.status === 'OVERLOADED').length}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">&gt;100% weekly bandwidth</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">High Burnout Risk</span>
              <div className="text-2xl font-bold text-rose-400 font-mono flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
                {roster.filter((r) => r.burnoutRisk.level === 'HIGH' || r.burnoutRisk.level === 'CRITICAL').length}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Correlated workload & overdue tasks</span>
            </div>
          </div>

          {/* Roster Grid */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-400" />
                <span>Team Bandwidth Allocation & Burnout Heuristics</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">Department:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-[10px] font-mono uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Active Tasks</th>
                    <th className="py-3 px-4">Workload / Cap</th>
                    <th className="py-3 px-4">Utilization</th>
                    <th className="py-3 px-4">Burnout Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRoster.map((member) => (
                    <tr key={member.userId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div>{member.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 font-normal">{member.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono">
                          {member.departmentName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-white">{member.assignedTasksCount}</span>
                        {member.overdueTasksCount > 0 && (
                          <span className="ml-1.5 text-rose-400 text-[10px]">({member.overdueTasksCount} overdue)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {member.activeWorkloadHours}h / {member.weeklyCapacityHours}h
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                member.utilizationPercentage > 100
                                  ? 'bg-rose-500'
                                  : member.utilizationPercentage > 85
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.min(100, member.utilizationPercentage)}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono text-[11px] font-bold ${
                              member.utilizationPercentage > 100
                                ? 'text-rose-400'
                                : member.utilizationPercentage > 85
                                ? 'text-amber-300'
                                : 'text-emerald-400'
                            }`}
                          >
                            {member.utilizationPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border inline-flex items-center gap-1 ${
                            member.burnoutRisk.level === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : member.burnoutRisk.level === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : member.burnoutRisk.level === 'MODERATE'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {member.burnoutRisk.level === 'CRITICAL' && <Flame className="w-3 h-3 text-rose-400" />}
                          {member.burnoutRisk.level} ({member.burnoutRisk.score})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCENARIO SIMULATOR */}
      {activeTab === 'SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Scenario Parameters</span>
            </h3>

            {/* Headcount adjustment */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Staffing Adjustment</span>
                <span className="font-mono font-bold text-purple-400">
                  {simHeadcount > 0 ? `+${simHeadcount} hires` : simHeadcount < 0 ? `${simHeadcount} staff` : 'No Change'}
                </span>
              </div>
              <input
                type="range"
                min="-3"
                max="5"
                step="1"
                value={simHeadcount}
                onChange={(e) => setSimHeadcount(Number(e.target.value))}
                className="w-full accent-purple-500 bg-white/10 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-3 Headcount</span>
                <span>+5 Headcount</span>
              </div>
            </div>

            {/* Scope multiplier */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Workload / Scope Multiplier</span>
                <span className="font-mono font-bold text-sky-400">{(simMultiplier * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.0"
                step="0.1"
                value={simMultiplier}
                onChange={(e) => setSimMultiplier(Number(e.target.value))}
                className="w-full accent-sky-500 bg-white/10 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-20% Scope</span>
                <span>+100% Scope Surge</span>
              </div>
            </div>

            {/* Deadline acceleration */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Deadline Shift</span>
                <span className="font-mono font-bold text-amber-400">{simDeadlineDays} days earlier</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={simDeadlineDays}
                onChange={(e) => setSimDeadlineDays(Number(e.target.value))}
                className="w-full accent-amber-500 bg-white/10 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>On-Schedule</span>
                <span>30 Days Earlier</span>
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simLoading}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-mono text-xs font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {simLoading ? 'Simulating Neural Impact...' : 'Execute Scenario Simulation'}
            </button>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 space-y-6">
            {simResult ? (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Simulation Projection</span>
                    <h3 className="text-lg font-bold text-white">Projected Organizational Impact</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      simResult.projectedDeliveryRisk === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : simResult.projectedDeliveryRisk === 'ELEVATED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    Risk: {simResult.projectedDeliveryRisk}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400">Headcount</span>
                    <div className="text-xl font-bold text-white font-mono mt-1">
                      {simResult.currentHeadcount} $\rightarrow$ <span className="text-purple-400">{simResult.simulatedHeadcount}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400">Workload</span>
                    <div className="text-xl font-bold text-white font-mono mt-1">
                      {simResult.currentWorkloadHours}h $\rightarrow$ <span className="text-sky-400">{simResult.simulatedWorkloadHours}h</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400">Avg Utilization</span>
                    <div className="text-xl font-bold text-white font-mono mt-1">
                      {simResult.currentAverageUtilization}% $\rightarrow${' '}
                      <span className={simResult.simulatedAverageUtilization > 100 ? 'text-rose-400' : 'text-emerald-400'}>
                        {simResult.simulatedAverageUtilization}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400">Est. Variance</span>
                    <div className="text-xl font-bold text-white font-mono mt-1">
                      <span className={simResult.estimatedCompletionVarianceDays > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {simResult.estimatedCompletionVarianceDays > 0 ? `+${simResult.estimatedCompletionVarianceDays}d delay` : `${simResult.estimatedCompletionVarianceDays}d ahead`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" /> Luminary Actionable Recommendations
                  </h4>
                  <div className="space-y-2">
                    {simResult.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center text-slate-400 text-xs">
                Adjust parameters and run simulation to preview capacity impact.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SKILLS MATRIX & SQUAD BUILDER */}
      {activeTab === 'SKILLS' && (
        <div className="space-y-6">
          {/* Skill Gap & SPOF Alert Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skillGaps.map((gap) => (
              <div
                key={gap.skillId}
                className={`glass-panel p-5 rounded-2xl border space-y-2 ${
                  gap.coverageStatus === 'CRITICAL_SPOF'
                    ? 'border-rose-500/30 bg-rose-500/5'
                    : gap.coverageStatus === 'MODERATE_GAP'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{gap.skillName}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                      gap.coverageStatus === 'CRITICAL_SPOF'
                        ? 'bg-rose-500/20 text-rose-300'
                        : gap.coverageStatus === 'MODERATE_GAP'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {gap.coverageStatus}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Avg Proficiency: <strong className="text-white">{gap.averageTeamProficiency} / 5.0</strong></span>
                  <span>Qualified: <strong className="text-white">{gap.qualifiedMemberCount}</strong></span>
                </div>
                {gap.isSinglePointOfFailure && (
                  <p className="text-[10px] text-rose-400 flex items-center gap-1 font-mono pt-1">
                    <ShieldAlert className="w-3 h-3" /> Critical Single Point of Failure! Only 1 qualified engineer.
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Squad Builder Action Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-950/40 to-indigo-950/40">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Intelligent Project Team Formation (PRD §15 FR-072)</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Recommend cross-functional squad candidates matching required skill proficiencies and bandwidth availability.
              </p>
            </div>
            <button
              onClick={handleMatchSquad}
              disabled={matchingSquad}
              className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {matchingSquad ? 'Synthesizing Squad...' : 'Recommend Optimal Squad'}
            </button>
          </div>

          {/* Squad Formation Result */}
          {squadResult && (
            <div className="glass-panel p-6 rounded-3xl border border-sky-500/30 bg-sky-500/5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
                  Recommended Project Squad ({squadResult.recommendedSquad.length} members)
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Skill Coverage: <strong className="text-emerald-400">{squadResult.overallSkillCoveragePercentage}%</strong>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {squadResult.recommendedSquad.map((cand: any) => (
                  <div key={cand.userId} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-xs block">{cand.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{cand.departmentName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold">
                        {cand.suitabilityScore}% Fit
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px] font-mono">
                      {cand.matchedSkills.map((sk: any, i: number) => (
                        <div key={i} className="flex justify-between text-slate-300">
                          <span>{sk.skillName.substring(0, 16)}...</span>
                          <span className={sk.meetsRequirement ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            L{sk.proficiency} / req L{sk.required}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Skill Matrix Grid */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Full Team Competency Matrix</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-[10px] font-mono uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Distributed Systems</th>
                    <th className="py-3 px-4">React & TypeScript</th>
                    <th className="py-3 px-4">AI RAG & Gov</th>
                    <th className="py-3 px-4">Cloud SecOps</th>
                    <th className="py-3 px-4">Strategic OKRs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {skillMatrix.map((row) => (
                    <tr key={row.userId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {row.userName}
                        <div className="text-[10px] font-mono text-slate-400 font-normal">{row.departmentName}</div>
                      </td>
                      {row.skills.map((s) => (
                        <td key={s.skillId} className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                              s.proficiency >= 4
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : s.proficiency >= 3
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            Level {s.proficiency}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAREER LADDERS & PROMOTION READINESS */}
      {activeTab === 'CAREER' && (
        <div className="space-y-6">
          {/* Member Picker */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">Inspect Career Pathway:</span>
            <select
              value={selectedCareerUser}
              onChange={(e) => setSelectedCareerUser(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none"
            >
              {roster.map((r) => (
                <option key={r.userId} value={r.userId}>
                  {r.name} ({r.role})
                </option>
              ))}
            </select>
          </div>

          {careerPath && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Current & Target Level */}
              <div className="space-y-6">
                <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Current Position</span>
                  <div className="text-xl font-bold text-white">{careerPath.currentTitle}</div>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                    Track: {careerPath.currentTrack}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">{careerPath.currentLevel.expectedScope}</p>
                </div>

                {careerPath.nextLevel ? (
                  <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Target Promotion Level</span>
                    <div className="text-xl font-bold text-white">{careerPath.nextLevel.title}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{careerPath.nextLevel.expectedScope}</p>
                    <button
                      onClick={() => setGoalModalOpen(true)}
                      className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Set Career Growth Milestone
                    </button>
                  </div>
                ) : (
                  <div className="glass-panel p-6 rounded-3xl border border-white/10 text-center text-xs text-slate-400">
                    User has reached the pinnacle level for this track.
                  </div>
                )}
              </div>

              {/* Right Column: Promotion Readiness & Criteria Checklist */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Evaluation Audit</span>
                      <h3 className="text-lg font-bold text-white">Promotion Readiness Assessment</h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                        careerPath.recommendation === 'READY_FOR_PROMOTION'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : careerPath.recommendation === 'ON_TRACK'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {careerPath.recommendation.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Readiness Meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Overall Objective Readiness</span>
                      <span className="font-mono text-emerald-400 font-bold">{careerPath.readinessPercentage}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${careerPath.readinessPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider">Structured Promotion Criteria (PRD §15 FR-073)</h4>
                    <div className="space-y-2.5">
                      {careerPath.criteriaChecklist.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                            item.met ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {item.met ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                            <div>
                              <span className="font-semibold text-white block">{item.criterion}</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Required: {item.target} • Actual: {item.actual}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              item.met ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {item.met ? 'MET' : 'GAP'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Career Goal Modal */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-3xl border border-white/20 max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Set Career Growth Milestone</h3>
            <p className="text-xs text-slate-400">
              Create a structured growth milestone targeting Level Progression to {careerPath?.nextLevel?.title}.
            </p>
            <form onSubmit={handleCreateCareerGoal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Growth Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Multi-Region Sharding Architecture & Proof Verification"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-mono mb-1">Development & Coaching Notes</label>
                <textarea
                  rows={3}
                  placeholder="Key deliverables, mentorship expectations, and review targets..."
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-mono font-bold hover:bg-emerald-400"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacitySkillsView;
