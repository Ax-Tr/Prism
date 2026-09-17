import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Plus,
  Star,
  X,
  CheckCircle2,
  Award,
  Heart,
  MessageSquare,
  Calendar,
  Sparkles,
  UserCheck,
  TrendingUp,
  AlertCircle,
  ListTodo,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/apiClient';

export const Review360View: React.FC = () => {
  const { reviews, addReview, employees } = useApp();
  const [activeTab, setActiveTab] = useState<'reviews' | 'recognitions' | 'one_on_one'>('reviews');

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState(employees[0]?.id || 'u0000000-0000-0000-0000-000000000004');
  const [cycleName, setCycleName] = useState('Q4 2026 Executive Review');
  const [reviewType, setReviewType] = useState<'peer' | 'manager' | 'direct_report'>('peer');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [commScore, setCommScore] = useState(90);
  const [techScore, setTechScore] = useState(95);
  const [leadScore, setLeadScore] = useState(88);
  const [collabScore, setCollabScore] = useState(92);
  const [innovScore, setInnovScore] = useState(90);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');

  // Recognitions State
  const [recognitions, setRecognitions] = useState<any[]>([]);
  const [showRecModal, setShowRecModal] = useState(false);
  const [recTargetUser, setRecTargetUser] = useState(employees[1]?.id || employees[0]?.id || '');
  const [coreValue, setCoreValue] = useState('OWNERSHIP');
  const [recMessage, setRecMessage] = useState('');
  const [recError, setRecError] = useState<string | null>(null);

  // 1:1 Prep State
  const [prepUserId, setPrepUserId] = useState(employees[0]?.id || '');
  const [prepData, setPrepData] = useState<any | null>(null);
  const [isLoadingPrep, setIsLoadingPrep] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState('');
  const [actionItemTitle, setActionItemTitle] = useState('');
  const [outcomeSuccess, setOutcomeSuccess] = useState<string | null>(null);

  // Load recognitions
  const fetchRecognitions = async () => {
    try {
      const res = await api.get<any[]>('/api/v1/advanced/recognitions');
      if (Array.isArray(res)) {
        setRecognitions(res);
      }
    } catch (e) {
      console.warn('Failed to load recognitions:', e);
    }
  };

  // Load 1:1 prep data
  const fetchOneOnOnePrep = async (uid: string) => {
    if (!uid) return;
    setIsLoadingPrep(true);
    try {
      const res = await api.get<any>(`/api/v1/advanced/one-on-one/prep/${uid}`);
      setPrepData(res);
    } catch (e) {
      console.warn('Failed to load 1:1 prep:', e);
    } finally {
      setIsLoadingPrep(false);
    }
  };

  useEffect(() => {
    fetchRecognitions();
    if (employees.length > 0) {
      fetchOneOnOnePrep(employees[0].id);
      setPrepUserId(employees[0].id);
      setTargetUserId(employees[0].id);
    }
  }, [employees]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strengths.trim()) return;

    const targetEmp = employees.find((e) => e.id === targetUserId) || employees[0];

    addReview({
      reviewer: isAnonymous ? 'Anonymous Peer' : 'Aarav Sharma (CEO)',
      reviewee: targetEmp ? targetEmp.name : 'Team Member',
      relation: reviewType === 'peer' ? 'Peer' : reviewType === 'manager' ? 'Manager' : 'Direct Report',
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      scores: {
        communication: commScore,
        technical: techScore,
        leadership: leadScore,
        collaboration: collabScore,
        innovation: innovScore,
      },
      strengths,
      improvements,
    });

    setStrengths('');
    setImprovements('');
    setShowReviewModal(false);
  };

  const handleGiveRecognition = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError(null);
    try {
      const res = await api.post<any>('/api/v1/advanced/recognitions', {
        toUserId: recTargetUser,
        coreValue,
        message: recMessage,
      });
      setRecognitions((prev) => [res, ...prev]);
      setRecMessage('');
      setShowRecModal(false);
    } catch (err: any) {
      setRecError(err.message || 'Failed to post recognition');
    }
  };

  const handleReactRecognition = async (id: string) => {
    try {
      await api.post(`/api/v1/advanced/recognitions/${id}/react`);
      setRecognitions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, reactionsCount: (r.reactionsCount || 0) + 1 } : r))
      );
    } catch (e) {}
  };

  const handleSave11Outcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingSummary.trim()) return;

    try {
      const actionItems = actionItemTitle.trim()
        ? [{ title: actionItemTitle.trim(), assignedTo: prepUserId }]
        : [];

      await api.post('/api/v1/advanced/one-on-one/outcomes', {
        targetUserId: prepUserId,
        summary: meetingSummary,
        actionItems,
      });

      setOutcomeSuccess('1:1 outcome saved and commitment task created in Orbit workflow!');
      setMeetingSummary('');
      setActionItemTitle('');
      setTimeout(() => setOutcomeSuccess(null), 4000);
    } catch (e) {
      console.warn('Failed to save 1:1 outcome:', e);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">PEOPLE & COMPETENCY INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">360° Reviews, Recognition & 1:1 Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Competency radar evaluations, core value recognitions, and AI-synthesized 1:1 meeting preparation (PRD §10 & §14)
          </p>
        </div>

        {/* Action Button depending on tab */}
        <div className="flex items-center gap-3">
          {activeTab === 'reviews' && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Write 360 Review</span>
            </button>
          )}

          {activeTab === 'recognitions' && (
            <button
              onClick={() => setShowRecModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
            >
              <Award className="w-4 h-4" />
              <span>Give Recognition</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 space-x-4">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'reviews' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>360° Review Cycles & Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('recognitions')}
          className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'recognitions' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Peer Recognitions Feed</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-mono text-amber-300">
            {recognitions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('one_on_one')}
          className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'one_on_one' ? 'border-sky-400 text-sky-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1:1 Meeting Intelligence & Agendas</span>
        </button>
      </div>

      {/* TAB 1: 360 REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">Target: {rev.reviewee}</h3>
                  <p className="text-xs text-slate-400">Reviewer: {rev.reviewer} ({rev.relation}) • {rev.date}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-indigo-300 font-bold">
                  COMPOSITE: {Math.round((rev.scores.communication + rev.scores.technical + rev.scores.leadership + rev.scores.collaboration + rev.scores.innovation) / 5)}%
                </div>
              </div>

              {/* Radar Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {Object.entries(rev.scores).map(([metric, score]) => (
                  <div key={metric} className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase">{metric}</span>
                    <span className="text-lg font-bold text-sky-400 mt-1 block">{score}%</span>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                  <strong className="block font-mono uppercase text-emerald-400 mb-1">Key Strengths</strong>
                  <p>{rev.strengths}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                  <strong className="block font-mono uppercase text-amber-400 mb-1">Growth Opportunities</strong>
                  <p>{rev.improvements}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: RECOGNITIONS FEED */}
      {activeTab === 'recognitions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recognitions.map((rec) => (
              <div key={rec.id} className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">To: {rec.toUserName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">From: {rec.fromUserName}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                      #{rec.coreValue}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-3 italic leading-relaxed">"{rec.message}"</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px]">
                  <span className="text-slate-500 font-mono">{new Date(rec.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleReactRecognition(rec.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-rose-400 font-mono transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{rec.reactionsCount || 0} Kudos</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 1:1 MEETING INTELLIGENCE */}
      {activeTab === 'one_on_one' && (
        <div className="space-y-6">
          {/* Employee Selector Bar */}
          <div className="glass-panel p-4 rounded-3xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold text-white">Select Direct Report / Peer:</span>
            </div>
            <select
              value={prepUserId}
              onChange={(e) => {
                setPrepUserId(e.target.value);
                fetchOneOnOnePrep(e.target.value);
              }}
              className="px-4 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.role} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          {isLoadingPrep ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-white/10">
              <Sparkles className="w-8 h-8 text-sky-400 animate-pulse mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-mono">Synthesizing 1:1 Intelligence Agenda from work streams & OKRs...</p>
            </div>
          ) : prepData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: AI Synthesized Agenda */}
              <div className="lg:col-span-2 space-y-4">
                <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-sky-400" /> AI 1:1 Agenda & Talking Points
                      </h3>
                      <p className="text-xs text-slate-400">Contextual talking points synthesized from live deliverables & blockers</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs font-mono text-sky-300">
                      PVI: {prepData.pviScore}/100
                    </span>
                  </div>

                  <div className="space-y-4">
                    {prepData.suggestedAgenda?.map((agenda: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{agenda.topic}</span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                            agenda.category === 'BLOCKER' ? 'bg-rose-500/20 text-rose-300' :
                            agenda.category === 'CELEBRATION' ? 'bg-emerald-500/20 text-emerald-300' :
                            'bg-sky-500/20 text-sky-300'
                          }`}>
                            {agenda.category}
                          </span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1 pl-2">
                          {agenda.talkingPoints.map((tp: string, tIdx: number) => (
                            <li key={tIdx}>• {tp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Capture Outcomes & Auto-Tasks */}
              <div className="space-y-6">
                <form onSubmit={handleSave11Outcome} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-emerald-400" />
                    <span>Capture 1:1 Commitments (PRD §10)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Agreements and action items automatically convert into live Orbit tasks.
                  </p>

                  {outcomeSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{outcomeSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">Meeting Notes & Summary</label>
                    <textarea
                      rows={3}
                      value={meetingSummary}
                      onChange={(e) => setMeetingSummary(e.target.value)}
                      placeholder="Summarize key alignment points, strategy shifts, or feedback..."
                      required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">Auto-Created Action Item Task</label>
                    <input
                      type="text"
                      value={actionItemTitle}
                      onChange={(e) => setActionItemTitle(e.target.value)}
                      placeholder="e.g. Prototype multi-region failover cluster"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Save Outcome & Create Commitments
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Write 360 Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateReview} className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/15 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Write 360° Competency Review</h3>
              <button type="button" onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Target Team Member</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Review Type</label>
                <select
                  value={reviewType}
                  onChange={(e: any) => setReviewType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="peer">Peer Evaluation</option>
                  <option value="manager">Manager Evaluation</option>
                  <option value="direct_report">Direct Report Evaluation</option>
                </select>
              </div>
            </div>

            {/* Anonymity switch */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Anonymize Reviewer Identity</span>
                <span className="text-[10px] text-slate-400">Mask reviewer name as Anonymous Peer Reviewer</span>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </div>

            {/* 5 Competencies */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-200 block">Competency Evaluation Radar</span>
              {[
                { label: 'Communication & Clarity', val: commScore, set: setCommScore },
                { label: 'Technical Execution & Quality', val: techScore, set: setTechScore },
                { label: 'Leadership & Initiative', val: leadScore, set: setLeadScore },
                { label: 'Cross-Functional Collaboration', val: collabScore, set: setCollabScore },
                { label: 'Innovation & Problem Solving', val: innovScore, set: setInnovScore },
              ].map((comp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{comp.label}</span>
                    <span className="font-mono text-sky-400 font-bold">{comp.val}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={comp.val}
                    onChange={(e) => comp.set(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Core Strengths & Impact</label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                rows={2}
                placeholder="Highlight recent technical achievements, architecture quality, or leadership..."
                required
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Growth Opportunities</label>
              <textarea
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                rows={2}
                placeholder="Suggest focus areas for next quarter..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
            >
              Submit 360 Review
            </button>
          </form>
        </div>
      )}

      {/* Give Recognition Modal */}
      {showRecModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleGiveRecognition} className="w-full max-w-md glass-panel p-6 rounded-3xl border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Give Core Value Recognition</h3>
              <button type="button" onClick={() => setShowRecModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {recError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{recError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-300 mb-1">Recognize Team Member</label>
              <select
                value={recTargetUser}
                onChange={(e) => setRecTargetUser(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Corporate Core Value</label>
              <select
                value={coreValue}
                onChange={(e) => setCoreValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              >
                <option value="OWNERSHIP">#OWNERSHIP — Extreme accountability & delivery</option>
                <option value="VELOCITY">#VELOCITY — High throughput without sacrificing quality</option>
                <option value="CUSTOMER_OBSESSION">#CUSTOMER_OBSESSION — Delivering immense user value</option>
                <option value="INNOVATION">#INNOVATION — Creative technical breakthroughs</option>
                <option value="CRAFT">#CRAFT — Impeccable architecture & polish</option>
                <option value="COLLABORATION">#COLLABORATION — Uplifting peers and teamwork</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Recognition Message</label>
              <textarea
                value={recMessage}
                onChange={(e) => setRecMessage(e.target.value)}
                rows={3}
                placeholder="Celebrate specific contributions and evidence-verified achievements..."
                required
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              Post Recognition
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
