import React, { useState } from 'react';
import { RotateCcw, Plus, Star, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Review360View: React.FC = () => {
  const { reviews, addReview, employees } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [reviewee, setReviewee] = useState(employees[0]?.name || 'Arjun Sharma');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strengths.trim()) return;

    addReview({
      reviewer: 'Aarav Sharma (CEO)',
      reviewee,
      relation: 'Manager',
      date: 'Nov 2026',
      scores: {
        communication: 92,
        technical: 95,
        leadership: 88,
        collaboration: 90,
        innovation: 94
      },
      strengths,
      improvements
    });

    setStrengths('');
    setImprovements('');
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">PEER EVALUATIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">360° Skill Composite & Reviews</h1>
          <p className="text-xs text-slate-400 mt-1">
            Communication, Technical, Leadership, Collaboration, and Innovation skill radar breakdowns
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Write 360 Review</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map(rev => (
          <div key={rev.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Target: {rev.reviewee}</h3>
                <p className="text-xs text-slate-400">Reviewer: {rev.reviewer} ({rev.relation}) • {rev.date}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-indigo-300 font-bold">
                COMPOSITE: 93%
              </div>
            </div>

            {/* Radar Metrics Grid */}
            <div className="grid grid-cols-5 gap-3 text-center">
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

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateReview} className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Write Peer Performance Review</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Target Team Member</label>
              <select
                value={reviewee}
                onChange={e => setReviewee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Core Strengths</label>
              <textarea
                value={strengths}
                onChange={e => setStrengths(e.target.value)}
                rows={3}
                placeholder="Highlight recent technical achievements, collaboration, or leadership..."
                required
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Growth Recommendations</label>
              <textarea
                value={improvements}
                onChange={e => setImprovements(e.target.value)}
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
    </div>
  );
};
