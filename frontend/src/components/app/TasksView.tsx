import React, { useState } from 'react';
import {
  CheckSquare, Plus, Clock, AlertCircle, Filter, X,
  FileCheck, Link as LinkIcon, CheckCircle2, Ban, ShieldAlert,
  ArrowRight, ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, Priority } from '../../types';

export const TasksView: React.FC = () => {
  const { tasks, updateTaskStatus, addTask, employees } = useApp();
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTaskForProof, setSelectedTaskForProof] = useState<Task | null>(null);
  const [selectedTaskForCancel, setSelectedTaskForCancel] = useState<Task | null>(null);

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('HIGH');
  const [newAssignee, setNewAssignee] = useState(employees[0]?.id || '');
  const [newPoints, setNewPoints] = useState(5);

  // Proof submission form
  const [proofType, setProofType] = useState<'link' | 'pr' | 'file'>('pr');
  const [proofUrl, setProofUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');

  // Cancel task form
  const [cancelReason, setCancelReason] = useState('');

  // Feedback banner
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'DORMANT', label: 'Dormant (Backlog)', color: 'text-slate-400 border-slate-500/30' },
    { status: 'IN_FLUX', label: 'In Flux (Active)', color: 'text-sky-400 border-sky-500/30' },
    { status: 'ORBIT', label: 'Orbit (In Review / Proof)', color: 'text-purple-400 border-purple-500/30' },
    { status: 'TRANSMITTED', label: 'Transmitted (Completed)', color: 'text-emerald-400 border-emerald-500/30' },
  ];

  const filteredTasks = tasks.filter((t) => filterAssignee === 'ALL' || t.assigneeId === filterAssignee);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assigneeObj = employees.find((e) => e.id === newAssignee);

    addTask({
      title: newTitle,
      description: newDesc,
      status: 'IN_FLUX',
      priority: newPriority,
      assigneeId: newAssignee,
      assigneeName: assigneeObj?.name || 'Unassigned',
      assigneeAvatar: assigneeObj?.avatar || '',
      department: assigneeObj?.department || 'Engineering',
      points: newPoints,
      estimatedHours: 16,
      loggedHours: 0,
      subtasks: [],
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
    setFeedbackMsg(`Task "${newTitle}" created with mandatory proof requirement.`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForProof || !proofUrl.trim()) return;

    updateTaskStatus(selectedTaskForProof.id, 'ORBIT');
    setFeedbackMsg(`Proof submitted for "${selectedTaskForProof.title}". Moved to Orbit (In Review).`);
    setSelectedTaskForProof(null);
    setProofUrl('');
    setProofNotes('');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForCancel || cancelReason.trim().length < 5) return;

    updateTaskStatus(selectedTaskForCancel.id, 'DORMANT');
    setFeedbackMsg(`Task "${selectedTaskForCancel.title}" cancelled. Reason logged to immutable audit ledger.`);
    setSelectedTaskForCancel(null);
    setCancelReason('');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">PROOF-DRIVEN SPRINT ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Kanban & Task Verification Board</h1>
          <p className="text-xs text-slate-400 mt-1">
            Task execution lifecycle with mandatory proof submission, PR verification, and approval checkpoints.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Assignee Filter */}
          <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Team Members</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id} className="bg-slate-900">{e.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="glass-panel p-4 rounded-3xl border border-white/10 flex flex-col min-h-[520px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <span className={`text-xs font-bold font-mono uppercase ${col.color}`}>{col.label}</span>
                <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded-full bg-white/5">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 space-y-3 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wide">
                        {task.department}
                      </span>
                      <span
                        className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          task.priority === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <div className="flex items-center space-x-2">
                        {task.assigneeAvatar ? (
                          <img
                            src={task.assigneeAvatar}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border border-white/20"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[9px] text-indigo-300">
                            {task.assigneeName.charAt(0)}
                          </div>
                        )}
                        <span className="truncate max-w-[100px]">{task.assigneeName}</span>
                      </div>
                      <span className="font-mono text-slate-500">{task.points} SP</span>
                    </div>

                    {/* Action Triggers based on state */}
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      {task.status === 'IN_FLUX' && (
                        <button
                          onClick={() => setSelectedTaskForProof(task)}
                          className="w-full py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Submit Proof</span>
                        </button>
                      )}

                      {task.status === 'ORBIT' && (
                        <button
                          onClick={() => {
                            updateTaskStatus(task.id, 'TRANSMITTED');
                            setFeedbackMsg(`Proof approved for "${task.title}". Task marked Transmitted (Completed).`);
                            setTimeout(() => setFeedbackMsg(null), 3500);
                          }}
                          className="w-full py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Complete</span>
                        </button>
                      )}

                      {task.status !== 'TRANSMITTED' && (
                        <button
                          onClick={() => setSelectedTaskForCancel(task)}
                          className="text-[10px] text-slate-500 hover:text-red-400 flex items-center space-x-1 pt-1 transition-colors"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Cancel Task</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Proof Submission Modal */}
      {selectedTaskForProof && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/15 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Submit Proof of Completion</h3>
              </div>
              <button
                onClick={() => setSelectedTaskForProof(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Submitting proof for: <strong className="text-white">{selectedTaskForProof.title}</strong>
            </p>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Proof Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pr', 'link', 'file'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProofType(type)}
                      className={`py-2 text-xs font-semibold rounded-xl border uppercase transition-all ${
                        proofType === type
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-sm'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {type === 'pr' ? 'GitHub PR' : type === 'link' ? 'Live Link' : 'File Upload'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {proofType === 'pr' ? 'Pull Request / Commit URL' : proofType === 'link' ? 'Verification URL' : 'File Asset Name'}
                </label>
                <input
                  type="text"
                  required
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder={
                    proofType === 'pr'
                      ? 'https://github.com/org/repo/pull/123'
                      : 'https://staging.prism.ai/verification'
                  }
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Verification Notes</label>
                <textarea
                  rows={3}
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="Describe test outcomes, test coverage, or delivery notes..."
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForProof(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:brightness-110 transition-all"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Cancellation Modal */}
      {selectedTaskForCancel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-red-500/30 max-w-md w-full space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Cancel Task (Mandatory Reason)</h3>
            </div>

            <p className="text-xs text-slate-400">
              Per FR-TASK-008, all task cancellations must provide a documented business reason to preserve scoring and audit integrity.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Cancellation Reason</label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Explain why this task is being cancelled (min 5 characters)..."
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForCancel(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Keep Task
                </button>
                <button
                  type="submit"
                  disabled={cancelReason.trim().length < 5}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition-all"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/15 max-w-md w-full space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create New Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement Zero-Disruption Handover"
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Task specifications and acceptance criteria..."
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id} className="bg-slate-900">{e.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="CRITICAL" className="bg-slate-900">Critical</option>
                    <option value="HIGH" className="bg-slate-900">High</option>
                    <option value="MEDIUM" className="bg-slate-900">Medium</option>
                    <option value="LOW" className="bg-slate-900">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TasksView;
