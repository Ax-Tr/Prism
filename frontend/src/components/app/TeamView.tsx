import React from 'react';
import { Users, UserCheck, MessageSquare, ArrowUpRight, X, Calendar, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';

export const TeamView: React.FC = () => {
  const {
    employees,
    selectedEmployeeForPrep,
    setSelectedEmployeeForPrep,
    selectedEmployeeProfile,
    setSelectedEmployeeProfile
  } = useApp();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">PEOPLE DIRECTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Team & Capacity Roster</h1>
          <p className="text-xs text-slate-400 mt-1">
            Bandwidth load, focus areas, 1:1 prep notes, and individual digital profiles
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-300">
          8 Active Team Members
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {employees.map(emp => (
          <div
            key={emp.id}
            className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between">
                <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold">
                  {emp.bandwidthLoad}% LOAD
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-4 group-hover:text-purple-300 transition-colors">
                {emp.name}
              </h3>
              <p className="text-xs font-mono text-sky-400">{emp.role}</p>

              <p className="mt-3 text-xs text-slate-300 line-clamp-2">
                <strong className="text-slate-400">Focus:</strong> {emp.focusArea}
              </p>

              {/* Skills Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {emp.skills.slice(0, 3).map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-400">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setSelectedEmployeeForPrep(emp)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>1:1 Prep</span>
              </button>
              <button
                onClick={() => setSelectedEmployeeProfile(emp)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold flex items-center space-x-1"
              >
                <span>Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 1:1 Prep Modal */}
      {selectedEmployeeForPrep && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <img src={selectedEmployeeForPrep.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="text-base font-bold text-white">1:1 Meeting Prep — {selectedEmployeeForPrep.name}</h3>
                  <p className="text-xs text-slate-400">{selectedEmployeeForPrep.role}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployeeForPrep(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="font-mono text-purple-400 uppercase">Last Session</span>
                <p className="text-slate-300 mt-0.5">{selectedEmployeeForPrep.oneOnOneNotes?.lastMeeting || '02 Nov 2026'}</p>
              </div>

              <div>
                <span className="font-mono text-sky-400 uppercase">Talking Points</span>
                <ul className="mt-1 space-y-1 text-slate-200">
                  {(selectedEmployeeForPrep.oneOnOneNotes?.talkingPoints || ['Career progression', 'Q4 sprint bandwidth']).map((tp, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span>{tp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono text-emerald-400 uppercase">Action Items</span>
                <ul className="mt-1 space-y-1 text-slate-200">
                  {(selectedEmployeeForPrep.oneOnOneNotes?.actionItems || ['Review OAuth spec', 'Approve junior dev PRs']).map((ai, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{ai}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setSelectedEmployeeForPrep(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs"
            >
              Close Prep Notes
            </button>
          </div>
        </div>
      )}

      {/* Employee Profile Modal */}
      {selectedEmployeeProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-panel p-6 rounded-3xl border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <img src={selectedEmployeeProfile.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover border border-white/15" />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedEmployeeProfile.name}</h3>
                  <p className="text-xs font-mono text-sky-400">{selectedEmployeeProfile.role} — {selectedEmployeeProfile.department}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{selectedEmployeeProfile.location}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployeeProfile(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-200">
              <p>{selectedEmployeeProfile.bio || 'Leading core engineering and systems architecture for Prism platform.'}</p>

              <div>
                <strong className="text-slate-400 block mb-1">Bandwidth Utilization:</strong>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${selectedEmployeeProfile.bandwidthLoad}%` }} />
                  </div>
                  <span className="font-mono font-bold text-purple-400">{selectedEmployeeProfile.bandwidthLoad}%</span>
                </div>
              </div>

              <div>
                <strong className="text-slate-400 block mb-1">Skills & Specialties:</strong>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEmployeeProfile.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedEmployeeProfile(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
