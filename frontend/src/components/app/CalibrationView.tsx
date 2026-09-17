import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Shield,
  Award,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/apiClient';

export interface NineBoxMember {
  userId: string;
  name: string;
  role: string;
  departmentId: string | null;
  departmentName: string;
  performanceScore: number;
  potentialScore: number;
  quadrant: string;
  quadrantTitle: string;
  retentionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  normalizedReviewScore: number;
}

export interface CompensationRecommendation {
  userId: string;
  name: string;
  role: string;
  departmentName: string;
  currentSalaryBand: string;
  pviScore: number;
  quadrant: string;
  recommendedMeritIncreasePercent: number;
  recommendedBonusMultiplier: number;
  equityRefreshGrantShares: number;
  justification: string;
  governanceNotice: string;
  status: 'PROPOSED' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
}

const QUADRANTS_GRID = [
  { id: 'DIAMOND_IN_ROUGH', title: 'Diamond in the Rough', row: 0, col: 0, desc: 'High Potential / Low Performance' },
  { id: 'EMERGING_LEADER', title: 'Emerging Leader', row: 0, col: 1, desc: 'High Potential / Medium Performance' },
  { id: 'STAR_TALENT', title: 'Star Talent', row: 0, col: 2, desc: 'High Potential / High Performance' },
  { id: 'INCONSISTENT_PERFORMER', title: 'Inconsistent Performer', row: 1, col: 0, desc: 'Medium Potential / Low Performance' },
  { id: 'CORE_CONTRIBUTOR', title: 'Core Contributor', row: 1, col: 1, desc: 'Medium Potential / Medium Performance' },
  { id: 'HIGH_PERFORMER', title: 'High Performer', row: 1, col: 2, desc: 'Medium Potential / High Performance' },
  { id: 'TALENT_RISK', title: 'Talent Risk', row: 2, col: 0, desc: 'Low Potential / Low Performance' },
  { id: 'EFFECTIVE_SPECIALIST', title: 'Effective Specialist', row: 2, col: 1, desc: 'Low Potential / Medium Performance' },
  { id: 'SOLID_PROFESSIONAL', title: 'Solid Professional', row: 2, col: 2, desc: 'Low Potential / High Performance' },
];

export const CalibrationView: React.FC = () => {
  const { genesisConfig, updateGenesisConfig } = useApp();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'9BOX' | 'COMPENSATION' | 'CONFIG'>('9BOX');
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<NineBoxMember[]>([]);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [compensation, setCompensation] = useState<CompensationRecommendation[]>([]);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);

  const fetchCalibrationData = async () => {
    try {
      setLoading(true);
      const [gridRes, compRes] = await Promise.all([
        api.get<any>('/governance/calibration/9box'),
        api.get<any>('/governance/compensation/recommendations'),
      ]);

      if (gridRes?.members) {
        setMembers(gridRes.members);
        setDistribution(gridRes.distribution || {});
      }

      if (Array.isArray(compRes)) {
        setCompensation(compRes);
      }
    } catch (err) {
      console.error('Failed to load calibration data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalibrationData();
  }, []);

  const handleApproveComp = (userId: string) => {
    setCompensation((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, status: 'APPROVED' } : c))
    );
  };

  const handleRejectComp = (userId: string) => {
    setCompensation((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, status: 'REJECTED' } : c))
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">TALENT CALIBRATION & GOVERNANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">9-Box Calibration & Compensation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Performance vs Potential calibration matrix, peer review normalization, and governed compensation recommendations (PRD §13, §24)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCalibrationData}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all"
            title="Refresh Grid"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs font-mono"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl bg-white/5 p-1 text-xs font-mono max-w-xl border border-white/10">
        <button
          onClick={() => setActiveTab('9BOX')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === '9BOX' ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> 9-Box Talent Matrix
        </button>
        <button
          onClick={() => setActiveTab('COMPENSATION')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'COMPENSATION' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Governed Merit & Grants
        </button>
        <button
          onClick={() => setActiveTab('CONFIG')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'CONFIG' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Session & Tenant
        </button>
      </div>

      {/* TAB 1: 9-BOX TALENT MATRIX */}
      {activeTab === '9BOX' && (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Star Talent</span>
              <div className="text-xl font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> {distribution.STAR_TALENT || 0}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">High Perf + High Pot</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">High Performers</span>
              <div className="text-xl font-bold text-sky-400 font-mono">
                {distribution.HIGH_PERFORMER || 0}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">High Perf + Med Pot</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Emerging Leaders</span>
              <div className="text-xl font-bold text-purple-400 font-mono">
                {distribution.EMERGING_LEADER || 0}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Med Perf + High Pot</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Talent Risks</span>
              <div className="text-xl font-bold text-rose-400 font-mono">
                {distribution.TALENT_RISK || 0}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Requires Coaching</span>
            </div>
          </div>

          {/* 9-Box Visual Grid */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Calibrated 9-Box Grid</h3>
                <span className="text-[11px] text-slate-400">Y-Axis: Potential Score (Competencies & Growth) • X-Axis: Performance Score (PVI & Output)</span>
              </div>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
                Normalized Review Score Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {QUADRANTS_GRID.map((q) => {
                const quadMembers = members.filter((m) => m.quadrant === q.id);
                const isSelected = selectedQuadrant === q.id;

                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuadrant(isSelected ? null : q.id)}
                    className={`p-4 rounded-2xl border min-h-[140px] flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-500/60 shadow-lg shadow-indigo-500/20'
                        : q.id === 'STAR_TALENT'
                        ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                        : q.id === 'TALENT_RISK'
                        ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{q.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                          {quadMembers.length}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{q.desc}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {quadMembers.map((m) => (
                        <span
                          key={m.userId}
                          className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-semibold text-slate-200 flex items-center gap-1 shadow-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          {m.name}
                        </span>
                      ))}
                      {quadMembers.length === 0 && (
                        <span className="text-[10px] font-mono text-slate-500 italic">No members in quadrant</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOVERNED COMPENSATION RECOMMENDATIONS */}
      {activeTab === 'COMPENSATION' && (
        <div className="space-y-6">
          {/* Safeguard Alert Banner (PRD §3.2) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-amber-300">PRD §3.2 Explicit Human Governance Boundary:</strong>
              AI produces merit increase percentages, equity refresh grants, and bonus multiplier proposals derived from calibrated 9-box performance.
              Final execution requires authorized Executive / HR human approval.
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Merit Increase & Equity Grant Recommendations</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Total Recommended Pool: <strong className="text-emerald-400">$145,000 / yr</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-[10px] font-mono uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Quadrant</th>
                    <th className="py-3 px-4">PVI Score</th>
                    <th className="py-3 px-4">Merit Increase</th>
                    <th className="py-3 px-4">Bonus Mult</th>
                    <th className="py-3 px-4">Equity Refresh</th>
                    <th className="py-3 px-4">Governance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {compensation.map((c) => (
                    <tr key={c.userId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div>{c.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 font-normal">{c.departmentName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-200">
                          {c.quadrant}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-400">{c.pviScore}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">+{c.recommendedMeritIncreasePercent}%</td>
                      <td className="py-3.5 px-4 font-mono">{c.recommendedBonusMultiplier}x</td>
                      <td className="py-3.5 px-4 font-mono">+{c.equityRefreshGrantShares} shs</td>
                      <td className="py-3.5 px-4">
                        {c.status === 'APPROVED' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        ) : c.status === 'REJECTED' ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center gap-1 w-fit">
                            <X className="w-3 h-3" /> Rejected
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveComp(c.userId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectComp(c.userId)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-[10px] font-mono"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIG & SESSION */}
      {activeTab === 'CONFIG' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>Active Authenticated Session</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block">User Name</span>
                <span className="text-white font-bold">{currentUser?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Role</span>
                <span className="text-sky-400 font-bold">{currentUser?.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Department</span>
                <span className="text-purple-400 font-bold">{currentUser?.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Security Scoping</span>
                <span className="text-emerald-400 font-bold">JWT OAuth 2.1</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Organization Identity Calibration</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Organization Title</label>
                <input
                  type="text"
                  value={genesisConfig.companyName}
                  onChange={(e) => updateGenesisConfig({ companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-mono mb-1">Operational Mission Statement</label>
                <textarea
                  value={genesisConfig.mission}
                  onChange={(e) => updateGenesisConfig({ mission: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalibrationView;
