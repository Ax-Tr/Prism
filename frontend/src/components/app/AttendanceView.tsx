import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, AlertTriangle, CheckCircle2, UserX, Clock, MapPin,
  Search, Filter, ShieldCheck, Sparkles, Check, X, Users, Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceLog } from '../../types';

export const AttendanceView: React.FC = () => {
  const { attendanceLogs, employees } = useApp();
  const [logs, setLogs] = useState<AttendanceLog[]>(attendanceLogs);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('Today, Oct 24');

  const anomalyLogs = logs.filter(a => a.anomalyFlag);

  const filteredLogs = logs.filter(l => {
    const matchesStatus = filterStatus === 'ALL' || l.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = l.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const presentCount = logs.filter(l => l.status === 'Present').length;
  const remoteCount = logs.filter(l => l.status === 'Remote').length;
  const leaveCount = logs.filter(l => l.status === 'On Leave').length;
  const attendanceRate = Math.round(((presentCount + remoteCount) / (logs.length || 1)) * 100);

  const handleMarkSelfAttendance = (status: 'Present' | 'Remote') => {
    const newLog: AttendanceLog = {
      id: 'att_' + Date.now(),
      employeeId: 'self',
      employeeName: 'Current User',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">TEMPORAL PRESENCE & ANOMALIES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Attendance Radar & Risk Scanning</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated presence telemetry, operational risk scanning, and remote/hybrid work distributions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleMarkSelfAttendance('Present')}
            className="px-4 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Check In (Office)</span>
          </button>
          <button
            onClick={() => handleMarkSelfAttendance('Remote')}
            className="px-4 py-2 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>Check In (Remote)</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Synchronous Presence Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{attendanceRate}%</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">Exemplary</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">In-Office Synchrony</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{presentCount}</span>
            <span className="text-xs font-mono text-slate-400">Headcount</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Campus nodes active</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Remote Distributed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-sky-400 font-mono">{remoteCount}</span>
            <span className="text-xs font-mono text-sky-400">Deep Work</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Verified secure connections</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Anomaly Flags</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{anomalyLogs.length}</span>
            <span className="text-xs font-mono text-amber-400">Requires Review</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Automated triage open</div>
        </div>
      </div>

      {/* Operational Anomaly Scanner Alert */}
      {anomalyLogs.length > 0 && (
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-amber-950/20 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Operational Risk Scanner Flags Detected ({anomalyLogs.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anomalyLogs.map(anom => (
              <div key={anom.id} className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/20 flex items-start space-x-3 text-amber-200">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-xs">{anom.employeeName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{anom.date}</span>
                  </div>
                  <p className="text-xs text-amber-300 mt-0.5 leading-relaxed">{anom.anomalyFlag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-2">
          {['ALL', 'Present', 'Remote', 'On Leave'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search team attendance..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-mono uppercase text-[10px]">
            <tr>
              <th className="p-4 sm:px-6">Team Member</th>
              <th className="p-4 sm:px-6">Temporal Date</th>
              <th className="p-4 sm:px-6">Presence Status</th>
              <th className="p-4 sm:px-6">Check-In Time</th>
              <th className="p-4 sm:px-6">Risk Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 sm:px-6 font-semibold text-white flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600/30 to-purple-600/30 border border-white/10 flex items-center justify-center font-mono text-xs text-white">
                    {log.employeeName[0]}
                  </div>
                  <span>{log.employeeName}</span>
                </td>
                <td className="p-4 sm:px-6 font-mono text-slate-400">{log.date}</td>
                <td className="p-4 sm:px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center space-x-1.5 ${
                      log.status === 'Present'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : log.status === 'Remote'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Present' ? 'bg-emerald-400' : log.status === 'Remote' ? 'bg-sky-400' : 'bg-amber-400'}`} />
                    <span>{log.status}</span>
                  </span>
                </td>
                <td className="p-4 sm:px-6 font-mono text-slate-300">{log.checkInTime || '09:00 AM'}</td>
                <td className="p-4 sm:px-6">
                  {log.anomalyFlag ? (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
                      Anomaly Flagged
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceView;
