import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Check,
  X,
  FileCheck2,
  Lock,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  History,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import api from '../../lib/apiClient';

export interface CheckpointItem {
  id: string;
  title: string;
  category: string;
  description: string;
  requesterName: string;
  departmentName: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  evidenceAttachments: Array<{ name: string; url: string; verified: boolean }>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EVIDENCE_REQUESTED';
  decidedByName?: string;
  decidedAt?: string;
  decisionNotes?: string;
}

export interface DecisionRoomRecord {
  id: string;
  title: string;
  context: string;
  selectedAlternative: string;
  alternativesConsidered: string[];
  assumptions: string[];
  evidenceCitations: string[];
  approverName: string;
  expectedOutcome: string;
  outcomeReviewDueDate: string;
  status: 'FINALIZED' | 'REVIEWED' | 'SUPERSEDED';
  finalizedAt: string;
}

export const CheckpointView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CHECKPOINTS' | 'DECISION_ROOM'>('CHECKPOINTS');
  const [loading, setLoading] = useState(true);

  const [checkpoints, setCheckpoints] = useState<CheckpointItem[]>([]);
  const [decisions, setDecisions] = useState<DecisionRoomRecord[]>([]);

  // Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [dTitle, setDTitle] = useState('');
  const [dContext, setDContext] = useState('');
  const [dSelected, setDSelected] = useState('');
  const [dAlternatives, setDAlternatives] = useState('');
  const [dAssumptions, setDAssumptions] = useState('');
  const [dExpectedOutcome, setDExpectedOutcome] = useState('');

  const fetchGovernanceData = async () => {
    try {
      setLoading(true);
      const [chkRes, decRes] = await Promise.all([
        api.get<any>('/governance/checkpoints'),
        api.get<any>('/governance/decisions'),
      ]);

      if (Array.isArray(chkRes)) setCheckpoints(chkRes);
      if (Array.isArray(decRes)) setDecisions(decRes);
    } catch (err) {
      console.error('Failed to load checkpoint data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const handleDecide = async (id: string, decision: 'APPROVED' | 'REJECTED' | 'EVIDENCE_REQUESTED') => {
    try {
      await api.post(`/governance/checkpoints/${id}/decide`, {
        decision,
        decisionNotes: `Executive ${decision.toLowerCase()} logged via Command Portal.`,
      });
      setCheckpoints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: decision } : c))
      );
    } catch (err) {
      console.error('Failed to record decision:', err);
    }
  };

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/governance/decisions', {
        title: dTitle,
        context: dContext,
        selectedAlternative: dSelected,
        alternativesConsidered: dAlternatives.split('\n').filter((a) => a.trim().length > 0),
        assumptions: dAssumptions.split('\n').filter((a) => a.trim().length > 0),
        expectedOutcome: dExpectedOutcome,
      });
      setDecisionModalOpen(false);
      setDTitle('');
      setDContext('');
      setDSelected('');
      setDAlternatives('');
      setDAssumptions('');
      setDExpectedOutcome('');
      fetchGovernanceData();
    } catch (err) {
      console.error('Failed to record decision:', err);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-mono text-rose-400 uppercase tracking-widest">EXECUTIVE DECISION ROOM & CHECKPOINTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Checkpoints & Decision Memory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized approval queue for high-impact sign-offs with AI risk scoring and immutable decision memory (PRD §13)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGovernanceData}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs & New Decision CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex rounded-2xl bg-white/5 p-1 text-xs font-mono max-w-md border border-white/10">
          <button
            onClick={() => setActiveTab('CHECKPOINTS')}
            className={`flex-1 py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'CHECKPOINTS'
                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Checkpoint Approvals ({checkpoints.filter((c) => c.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('DECISION_ROOM')}
            className={`flex-1 py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'DECISION_ROOM'
                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" /> Decision Room & Memory ({decisions.length})
          </button>
        </div>

        {activeTab === 'DECISION_ROOM' && (
          <button
            onClick={() => setDecisionModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-mono text-xs font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Record New Decision
          </button>
        )}
      </div>

      {/* TAB 1: CHECKPOINT APPROVALS */}
      {activeTab === 'CHECKPOINTS' && (
        <div className="space-y-4">
          {checkpoints.map((cp) => (
            <div key={cp.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        cp.riskLevel === 'HIGH' || cp.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      AI Risk: {cp.riskScore} / 100 ({cp.riskLevel})
                    </span>
                    <span className="text-xs font-mono text-slate-400">{cp.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1.5">{cp.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Requested by <strong className="text-slate-200">{cp.requesterName}</strong> • {cp.departmentName}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                    cp.status === 'APPROVED'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : cp.status === 'REJECTED'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : cp.status === 'EVIDENCE_REQUESTED'
                      ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {cp.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{cp.description}</p>

              {/* Risk Factors & Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                {/* Contributing Risk Factors */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Assessed Risk Factors
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {cp.riskFactors.map((rf, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{rf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evidence Attachments */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Supporting Evidence Artifacts
                  </span>
                  <div className="space-y-1.5">
                    {cp.evidenceAttachments.map((ea, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-mono text-slate-200">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-sky-400" /> {ea.name}
                        </span>
                        <span className="text-emerald-400 text-[10px]">Verified Proof</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {cp.status === 'PENDING' && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleDecide(cp.id, 'APPROVED')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Check className="w-4 h-4" /> Grant Executive Sign-off
                  </button>
                  <button
                    onClick={() => handleDecide(cp.id, 'EVIDENCE_REQUESTED')}
                    className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-bold text-xs font-mono flex items-center gap-1.5 transition-all"
                  >
                    <HelpCircle className="w-4 h-4" /> Request Further Evidence
                  </button>
                  <button
                    onClick={() => handleDecide(cp.id, 'REJECTED')}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs font-mono flex items-center gap-1.5 transition-all"
                  >
                    <X className="w-4 h-4" /> Reject Sign-off
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: DECISION ROOM & MEMORY */}
      {activeTab === 'DECISION_ROOM' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex items-start gap-3">
            <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-purple-300">PRD §13 FR-052 Immutable Decision Memory:</strong>
              All captured decisions, assumptions, and evaluated alternatives are immutable upon finalization with structured outcome review dates.
            </div>
          </div>

          <div className="space-y-4">
            {decisions.map((dec) => (
              <div key={dec.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Governed Decision</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{dec.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Decided by {dec.approverName} • Finalized on {new Date(dec.finalizedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
                    {dec.status}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-200">
                  <strong className="text-purple-300 block font-mono text-[10px] uppercase mb-1">Context:</strong>
                  {dec.context}
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                  <strong className="text-emerald-400 block font-mono text-[10px] uppercase mb-1">Selected Alternative:</strong>
                  {dec.selectedAlternative}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Alternatives */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Alternatives Considered</span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {dec.alternativesConsidered.map((alt, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          <span>{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Assumptions & Outcome Review */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Core Assumptions</span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {dec.assumptions.map((asmp, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          <span>{asmp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono text-slate-400">
                  <span>Expected Outcome: <strong className="text-white">{dec.expectedOutcome}</strong></span>
                  <span>Review Due: <strong className="text-sky-400">{new Date(dec.outcomeReviewDueDate).toLocaleDateString()}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Recording Modal */}
      {decisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-3xl border border-white/20 max-w-xl w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Record Finalized Decision in Decision Room</h3>
            <p className="text-xs text-slate-400">
              Captures immutable strategic context, evaluated alternatives, and outcome review commitments (PRD §13 FR-052).
            </p>

            <form onSubmit={handleRecordDecision} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Decision Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q2 Primary LLM Provider & Autonomy Boundary Shift"
                  value={dTitle}
                  onChange={(e) => setDTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Context & Problem Statement</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Why is this decision being made now..."
                  value={dContext}
                  onChange={(e) => setDContext(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Selected Alternative</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Multi-Model Hybrid with Local Small Models for Sanitization"
                  value={dSelected}
                  onChange={(e) => setDSelected(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Alternatives Considered (1 per line)</label>
                <textarea
                  rows={2}
                  placeholder="Alternative 1&#10;Alternative 2"
                  value={dAlternatives}
                  onChange={(e) => setDAlternatives(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Core Assumptions (1 per line)</label>
                <textarea
                  rows={2}
                  placeholder="Assumption 1&#10;Assumption 2"
                  value={dAssumptions}
                  onChange={(e) => setDAssumptions(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Expected Measurable Outcome</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 40% latency reduction with zero PII leakage"
                  value={dExpectedOutcome}
                  onChange={(e) => setDExpectedOutcome(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-500 text-white font-mono font-bold hover:bg-purple-400"
                >
                  Finalize & Persist Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckpointView;
