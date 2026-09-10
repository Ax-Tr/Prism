import React from 'react';
import { X, AlertTriangle, Info, Bell, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsDrawer: React.FC = () => {
  const { notificationsOpen, setNotificationsOpen, notifications, markNotificationAsRead, setActiveTab } = useApp();

  if (!notificationsOpen) return null;

  return (
    <div className="fixed top-16 right-4 md:right-8 z-50 w-80 md:w-96 glass-panel rounded-2xl border border-white/15 shadow-2xl p-4 animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-sky-400" />
          <h3 className="font-semibold text-sm text-slate-100">Operational Signals & Alerts</h3>
        </div>
        <button
          onClick={() => setNotificationsOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => {
              markNotificationAsRead(n.id);
              if (n.title.includes('Checkpoint')) setActiveTab('checkpoint');
              if (n.title.includes('Meridian')) setActiveTab('meridian');
              if (n.title.includes('Synthesis')) setActiveTab('synthesis');
            }}
            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
              n.read ? 'bg-white/5 border-white/5 opacity-70' : 'bg-sky-500/10 border-sky-500/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                {n.type === 'urgent' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                {n.type === 'info' && <Info className="w-3.5 h-3.5 text-sky-400" />}
                <span>{n.title}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
            </div>
            <p className="mt-1 text-slate-300 line-clamp-2">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
