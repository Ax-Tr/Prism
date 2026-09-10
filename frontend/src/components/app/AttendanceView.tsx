import React from 'react';
import { Calendar, AlertTriangle, CheckCircle2, UserX } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AttendanceView: React.FC = () => {
  const { attendanceLogs } = useApp();

  const anomalyLogs = attendanceLogs.filter(a => a.anomalyFlag);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">ATTENDANCE RADAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Attendance & Anomaly Detection</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated operational risk scanning and team presence tracking
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300">
          Pattern Scanner Active
        </div>
      </div>

      {/* Anomaly Warnings */}
      {anomalyLogs.length > 0 && (
        <div className="space-y-3">
          {anomalyLogs.map(anom => (
            <div key={anom.id} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-mono text-amber-400 uppercase">Operational Risk Anomaly Flagged</strong>
                <p className="text-xs mt-1">{anom.anomalyFlag}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-mono uppercase text-[10px]">
            <tr>
              <th className="p-4">Employee</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Check-In Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {attendanceLogs.map(log => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-semibold text-white">{log.employeeName}</td>
                <td className="p-4 font-mono text-slate-400">{log.date}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                      log.status === 'Present'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : log.status === 'Remote'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="p-4 font-mono text-slate-400">{log.checkInTime || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
