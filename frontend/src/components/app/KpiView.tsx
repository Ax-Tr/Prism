import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, TrendingUp, AlertTriangle, CheckCircle2, Plus, Filter,
  Search, Sliders, ArrowUpRight, Sparkles, X, Check, BarChart2, Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KPI } from '../../types';

export const KpiView: React.FC = () => {
  const { kpis } = useApp();
  const [localKpis, setLocalKpis] = useState<KPI[]>(kpis);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);

  // New KPI Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Product');
  const [newTarget, setNewTarget] = useState('100');
  const [newCurrent, setNewCurrent] = useState('45');
  const [newUnit, setNewUnit] = useState('%');
  const [newWeight, setNewWeight] = useState('25');

  const categories = ['ALL', 'Strategic Goals', 'Product', 'Engineering', 'Quality', 'Operations', 'Revenue'];

  const filteredKpis = localKpis.filter(k => {
    const matchesCat = selectedCategory === 'ALL' || k.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = k.name.toLowerCase().includes(searchQuery.toLowerCase()) || k.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalKpis = localKpis.length;
  const onTrackCount = localKpis.filter(k => k.status === 'on_track').length;
  const avgCompletion = Math.round(
    localKpis.reduce((acc, k) => acc + Math.min(100, (k.current / k.target) * 100), 0) / (totalKpis || 1)
  );

  const handleCreateKpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: KPI = {
      id: 'kpi_' + Date.now(),
      name: newTitle.trim(),
      category: newCategory,
      target: parseFloat(newTarget) || 100,
      current: parseFloat(newCurrent) || 0,
      unit: newUnit || '%',
      weight: parseFloat(newWeight) || 20,
      trend: 'up',
      status: (parseFloat(newCurrent) / (parseFloat(newTarget) || 1)) >= 0.8 ? 'on_track' : 'at_risk',
    };

    setLocalKpis(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
  };

  const handleUpdateCurrent = (id: string, newVal: number) => {
    setLocalKpis(prev =>
      prev.map(k => {
        if (k.id !== id) return k;
        const updatedCurrent = Math.max(0, newVal);
        const status = (updatedCurrent / k.target) >= 0.75 ? 'on_track' : 'at_risk';
        return { ...k, current: updatedCurrent, status };
      })
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">STRATEGIC GOALS & OBJECTIVES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">KPI & OKR Variance Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time metric telemetry, target variance tracking, and department priority weights
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Q4 Sprint Cycle Active</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New KPI Target</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Average Target Completion</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{avgCompletion}%</span>
            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +4.8%
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${avgCompletion}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Tracked Objectives</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{totalKpis}</span>
            <span className="text-xs font-mono text-slate-400">Total Active</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">100% telemetry coverage</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">On-Track Health</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {onTrackCount} / {totalKpis}
            </span>
            <span className="text-xs font-mono text-emerald-400">
              {Math.round((onTrackCount / (totalKpis || 1)) * 100)}%
            </span>
          </div>
          <div className="text-[11px] text-emerald-300 font-mono">Within confidence bounds</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Variance Status</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {totalKpis - onTrackCount}
            </span>
            <span className="text-xs font-mono text-amber-400">Elevated Variance</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Attention requested</div>
        </div>
      </div>

      {/* Luminary AI Strategic Analysis Pill */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 flex items-start space-x-3 text-xs text-emerald-200">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-mono text-[11px] text-emerald-300 font-bold uppercase tracking-wider mb-0.5">
            Luminary COO Strategic Optimization
          </div>
          <p className="text-slate-300 leading-relaxed">
            Engineering Code Review turnaround is currently pacing at 18.0 hrs vs 24.0 hr SLA target (Exceeding target by +25%). Recommend shifting 15% surplus capacity to high-variance Data Pipeline throughput.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        {/* Categories */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search objectives..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKpis.map(k => {
          const pct = Math.min(100, Math.round((k.current / k.target) * 100));
          return (
            <motion.div
              layout
              key={k.id}
              className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-emerald-500/40 transition-all space-y-4 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider font-semibold">
                      {k.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5 group-hover:text-emerald-300 transition-colors">
                      {k.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                      k.status === 'on_track'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {k.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-2">
                  <div>
                    <span className="text-3xl font-extrabold text-white font-mono">{k.current}</span>
                    <span className="text-xs text-slate-400 ml-1 font-mono">{k.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-400">Target: {k.target} {k.unit}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">Weight: {k.weight}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Variance Progress</span>
                    <span className="font-bold text-white">{pct}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        k.status === 'on_track' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Update Slider / Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <input
                  type="range"
                  min="0"
                  max={Math.max(k.target * 1.5, 100)}
                  value={k.current}
                  onChange={e => handleUpdateCurrent(k.id, parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                  title="Adjust Current Progress"
                />
                <button
                  onClick={() => setEditingKpi(k)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 shrink-0 transition-colors"
                >
                  Edit
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add New KPI Target Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 max-w-md w-full shadow-2xl bg-[#0b0c10] space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">New KPI Target</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateKpi} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Objective Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Code Review SLA, Sprint Velocity"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                    >
                      <option value="Product">Product</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Quality">Quality</option>
                      <option value="Operations">Operations</option>
                      <option value="Revenue">Revenue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      placeholder="%, hrs, pts, $"
                      value={newUnit}
                      onChange={e => setNewUnit(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Target
                    </label>
                    <input
                      type="number"
                      required
                      value={newTarget}
                      onChange={e => setNewTarget(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Current
                    </label>
                    <input
                      type="number"
                      required
                      value={newCurrent}
                      onChange={e => setNewCurrent(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Weight %
                    </label>
                    <input
                      type="number"
                      required
                      value={newWeight}
                      onChange={e => setNewWeight(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all mt-4 cursor-pointer"
                >
                  Create Objective
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KpiView;
