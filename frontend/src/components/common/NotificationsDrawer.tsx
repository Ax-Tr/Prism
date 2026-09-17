import React, { useState } from 'react';
import { X, AlertTriangle, Info, Bell, CheckCircle2, ShieldAlert, ArrowRight, Activity, Radio, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface OperationalAlertItem {
  id: string;
  title: string;
  description: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stage: 'DETECTED' | 'TRIAGED' | 'ACKNOWLEDGED' | 'ACTIONED' | 'RESOLVED' | 'VALIDATED';
  escalationDueAt: string;
}

const INITIAL_ALERTS: OperationalAlertItem[] = [
  {
    id: 'alert-1',
    title: 'High Critical Path Task Latency',
    description: 'PostgreSQL multi-region replica deployment delayed by pending security validation proof.',
    source: 'OrbitEngine',
    severity: 'high',
    stage: 'DETECTED',
    escalationDueAt: '2h remaining',
  },
  {
    id: 'alert-2',
    title: 'API Gateway Rate Anomaly',
    description: 'WhatsApp delivery webhook endpoint spiked above 95th percentile latency threshold.',
    source: 'TelemetryHub',
    severity: 'critical',
    stage: 'TRIAGED',
    escalationDueAt: '45m remaining',
  },
];

const NEXT_STAGES: Record<string, 'TRIAGED' | 'ACKNOWLEDGED' | 'ACTIONED' | 'RESOLVED' | 'VALIDATED' | null> = {
  DETECTED: 'TRIAGED',
  TRIAGED: 'ACKNOWLEDGED',
  ACKNOWLEDGED: 'ACTIONED',
  ACTIONED: 'RESOLVED',
  RESOLVED: 'VALIDATED',
  VALIDATED: null,
};

export const NotificationsDrawer: React.FC = () => {
  const { notificationsOpen, setNotificationsOpen, notifications, markNotificationAsRead, setActiveTab } = useApp();
  const [viewTab, setViewTab] = useState<'SIGNALS' | 'ALERTS' | 'CONNECTORS'>('SIGNALS');
  const [alerts, setAlerts] = useState<OperationalAlertItem[]>(INITIAL_ALERTS);
  const [syncingConnector, setSyncingConnector] = useState<string | null>(null);

  const [connectors, setConnectors] = useState([
    { id: 'JIRA_LINEAR', name: 'Jira & Linear Sync', status: 'CONNECTED', latency: '35ms', lastSync: '10m ago' },
    { id: 'SLACK_TEAMS', name: 'Slack Alerts Hub', status: 'CONNECTED', latency: '28ms', lastSync: '2m ago' },
    { id: 'GOOGLE_CALENDAR', name: 'Google Calendar 1:1', status: 'CONNECTED', latency: '65ms', lastSync: '45m ago' },
    { id: 'WHATSAPP_BUSINESS', name: 'WhatsApp API Gateway', status: 'CONNECTED', latency: '88ms', lastSync: '15m ago' },
  ]);

  if (!notificationsOpen) return null;

  const handleAdvanceAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const next = NEXT_STAGES[a.stage];
          if (next) return { ...a, stage: next };
        }
        return a;
      })
    );
  };

  const handleTestConnector = (id: string) => {
    setSyncingConnector(id);
    setTimeout(() => {
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, latency: `${Math.floor(Math.random() * 30 + 20)}ms`, lastSync: 'Just now' } : c
        )
      );
      setSyncingConnector(null);
    }, 600);
  };

  return (
    <div className="fixed top-16 right-4 md:right-8 z-50 w-80 sm:w-96 glass-panel rounded-3xl border border-white/15 shadow-2xl p-4 animate-in fade-in slide-in-from-top-3 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-sky-400" />
          <h3 className="font-semibold text-sm text-slate-100">Signals & Alert Grid</h3>
        </div>
        <button
          onClick={() => setNotificationsOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-white/5 p-1 mt-3 text-[11px] font-mono">
        <button
          onClick={() => setViewTab('SIGNALS')}
          className={`flex-1 py-1 rounded-lg transition-all ${
            viewTab === 'SIGNALS' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Signals ({notifications.length})
        </button>
        <button
          onClick={() => setViewTab('ALERTS')}
          className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
            viewTab === 'ALERTS' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3 h-3" /> Alerts ({alerts.filter((a) => a.stage !== 'VALIDATED').length})
        </button>
        <button
          onClick={() => setViewTab('CONNECTORS')}
          className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
            viewTab === 'CONNECTORS' ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3 h-3" /> Connectors
        </button>
      </div>

      {/* Signals Feed */}
      {viewTab === 'SIGNALS' && (
        <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationAsRead(n.id);
                if (n.title.includes('Checkpoint')) setActiveTab('checkpoint');
                if (n.title.includes('Meridian')) setActiveTab('meridian');
                if (n.title.includes('Synthesis')) setActiveTab('synthesis');
              }}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                n.read ? 'bg-white/5 border-white/5 opacity-70' : 'bg-sky-500/10 border-sky-500/30 shadow-md shadow-sky-500/5'
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
      )}

      {/* 6-Stage Operational Alerts State Machine */}
      {viewTab === 'ALERTS' && (
        <div className="mt-3 space-y-3 max-h-80 overflow-y-auto pr-1">
          {alerts.map((a) => {
            const nextStage = NEXT_STAGES[a.stage];
            return (
              <div
                key={a.id}
                className="p-3.5 rounded-2xl border bg-white/5 border-white/10 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        a.severity === 'critical'
                          ? 'bg-rose-500 animate-ping'
                          : a.severity === 'high'
                          ? 'bg-amber-400'
                          : 'bg-sky-400'
                      }`}
                    />
                    {a.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {a.stage}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{a.description}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400 border-t border-white/5">
                  <span>Source: {a.source}</span>
                  <span>SLA: {a.escalationDueAt}</span>
                </div>
                {nextStage ? (
                  <button
                    onClick={() => handleAdvanceAlert(a.id)}
                    className="w-full mt-2 py-1.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-mono text-[10px] flex items-center justify-center gap-1 transition-all"
                  >
                    <span>Advance to {nextStage}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <div className="w-full py-1 text-center font-mono text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Stage Validated & Archived
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Enterprise Connectors Health & Sync */}
      {viewTab === 'CONNECTORS' && (
        <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {connectors.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-2xl border bg-white/5 border-white/10 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" /> {c.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {c.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Latency: <strong className="text-sky-300">{c.latency}</strong></span>
                <span>Last sync: {c.lastSync}</span>
              </div>
              <button
                onClick={() => handleTestConnector(c.id)}
                disabled={syncingConnector === c.id}
                className="w-full py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-[10px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${syncingConnector === c.id ? 'animate-spin text-sky-400' : ''}`} />
                {syncingConnector === c.id ? 'Pinging & Syncing...' : 'Ping & Sync Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
