import React, { useState } from 'react';
import {
  Shield, Key, Lock, Search, Filter, Download,
  CheckCircle2, AlertTriangle, FileText, Database, RefreshCw,
  Trash2, ShieldAlert, Server, HardDrive, Check, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  ip: string;
  status: 'VERIFIED' | 'IMMUTABLE';
  details: string;
}

interface PrivacyRequest {
  id: string;
  user: string;
  email: string;
  type: 'DATA_ACCESS' | 'DATA_CORRECTION' | 'DATA_ERASURE';
  status: 'SUBMITTED' | 'FULFILLED';
  date: string;
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-9021',
    timestamp: '2026-09-08 21:40:12',
    actor: 'David Vance',
    role: 'Owner / CEO',
    action: 'TENANT_INITIALIZED',
    resource: 'Tenant #a000-0001',
    ip: '192.168.1.104',
    status: 'IMMUTABLE',
    details: 'Initialized Prism multi-tenant partition with strict RLS and DPDP crypto-shredding keys.',
  },
  {
    id: 'AUD-9022',
    timestamp: '2026-09-08 21:42:05',
    actor: 'Elena Rostova',
    role: 'Dept Head',
    action: 'TASK_PROOF_APPROVED',
    resource: 'Task #t001 (RLS Schema)',
    ip: '192.168.1.112',
    status: 'VERIFIED',
    details: 'Approved PR #104 proof submission for Alex Rivera. Task marked COMPLETED.',
  },
  {
    id: 'AUD-9023',
    timestamp: '2026-09-08 21:45:30',
    actor: 'Marcus Chen',
    role: 'Dept Head',
    action: 'CONTINUITY_DELEGATION_ACTIVATED',
    resource: 'Operations Dept',
    ip: '192.168.1.115',
    status: 'VERIFIED',
    details: 'Scheduled annual leave. Temporary signing and checkpoint authority transferred to Jordan Taylor.',
  },
  {
    id: 'AUD-9024',
    timestamp: '2026-09-08 21:50:18',
    actor: 'Sarah Kim',
    role: 'Employee',
    action: 'PROOF_SUBMITTED',
    resource: 'Task #t002 (Audit Middleware)',
    ip: '192.168.1.120',
    status: 'VERIFIED',
    details: 'Submitted staging URL and test report for append-only audit middleware verification.',
  },
  {
    id: 'AUD-9025',
    timestamp: '2026-09-08 21:55:00',
    actor: 'System Engine',
    role: 'Automated Job',
    action: 'SCORING_RUN_EXECUTED',
    resource: 'All Active Users',
    ip: '127.0.0.1',
    status: 'IMMUTABLE',
    details: 'Daily performance score calculation completed with 94.2% average tenant discipline.',
  },
];

const INITIAL_PRIVACY_REQUESTS: PrivacyRequest[] = [
  {
    id: 'PR-801',
    user: 'Alex Rivera',
    email: 'alex@prism.ai',
    type: 'DATA_ACCESS',
    status: 'FULFILLED',
    date: '2026-09-07',
  },
  {
    id: 'PR-802',
    user: 'Sarah Kim',
    email: 'sarah@prism.ai',
    type: 'DATA_CORRECTION',
    status: 'SUBMITTED',
    date: '2026-09-08',
  },
];

export const AuditLogView: React.FC = () => {
  const { currentUser } = useAuth();
  const [logs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>(INITIAL_PRIVACY_REQUESTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'AUDIT_LOGS' | 'DPDP_PRIVACY' | 'DISASTER_RECOVERY'>('AUDIT_LOGS');

  // Actions
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showShredModal, setShowShredModal] = useState(false);
  const [shredConfirmCode, setShredConfirmCode] = useState('');
  const [shredSuccess, setShredSuccess] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAction === 'ALL' || log.action.includes(filterAction);
    return matchesSearch && matchesFilter;
  });

  const handleExportDPDP = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  const handleFulfillRequest = (id: string) => {
    setPrivacyRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'FULFILLED' } : r))
    );
  };

  const handleExecuteCryptoShred = (e: React.FormEvent) => {
    e.preventDefault();
    if (shredConfirmCode !== 'CONFIRM_CRYPTO_SHRED_TENANT') return;

    setShredSuccess(true);
    setShowShredModal(false);
    setTimeout(() => setShredSuccess(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 pb-32 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                DPDP Act 2023 Compliant
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                PostgreSQL Rule: APPEND ONLY
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Shield className="w-7 h-7 text-indigo-400" />
              Immutable Audit Ledger & DPDP Compliance Hub
            </h1>
            <p className="text-sm text-slate-400">
              Cryptographically verified, tamper-evident audit record, privacy request fulfillment, and disaster recovery replication.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportDPDP}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white text-xs font-semibold hover:brightness-110 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Compliance Bundle</span>
            </button>
            <button
              onClick={() => setShowShredModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Crypto-Shred</span>
            </button>
          </div>
        </div>

        {exportSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>DPDP compliance bundle exported successfully (JSON-LD encrypted with tenant key version 1).</span>
          </div>
        )}

        {shredSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-400 text-xs animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Emergency Crypto-Shredding executed: Master tenant key material permanently shredded.</span>
          </div>
        )}
      </div>

      {/* Hub Tabs */}
      <div className="flex items-center space-x-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
        {[
          { id: 'AUDIT_LOGS', label: 'Immutable Audit Log' },
          { id: 'DPDP_PRIVACY', label: 'DPDP Privacy (DSAR)' },
          { id: 'DISASTER_RECOVERY', label: 'Disaster Recovery (DR)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Compliance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Ledger Integrity</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">100%</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero Tamper Detected
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Crypto-Shredding Key</span>
            <Key className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">v1.0 Active</p>
          <p className="text-[11px] text-slate-400">AES-256-GCM Envelope</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Cross-Region DR</span>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">RPO ≤ 1h / RTO ≤ 2h</p>
          <p className="text-[11px] text-emerald-400">Mumbai ➔ Hyderabad Active</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Session Role</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white capitalize">{currentUser?.role || 'Owner'}</p>
          <p className="text-[11px] text-indigo-400">RBAC Token Guarded</p>
        </div>
      </div>

      {/* Tab 1: Audit Log Table */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search actor, action, resource..."
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              {['ALL', 'TASK', 'CONTINUITY', 'SCORING', 'TENANT'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterAction(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterAction === filter
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 font-semibold border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Event ID & Time</th>
                    <th className="px-4 py-3">Actor & Role</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Resource Target</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Verification</th>
                    <th className="px-4 py-3">Event Payload / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                        <div>{log.id}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{log.timestamp}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-sans">
                        <div className="font-semibold text-white">{log.actor}</div>
                        <div className="text-[10px] text-slate-400">{log.role}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-300 font-sans">{log.resource}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{log.ip}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center space-x-1 text-emerald-400 text-[11px] font-sans">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans text-slate-300 max-w-md">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DPDP Privacy DSAR */}
      {activeTab === 'DPDP_PRIVACY' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Data Subject Access Requests (DSAR)</h2>
              <p className="text-xs text-slate-400">
                Fulfill employee requests for Data Access, Correction, and Right to Erasure per the DPDP Act 2023.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {privacyRequests.length} Active Requests
            </span>
          </div>

          <div className="divide-y divide-white/5 pt-2">
            {privacyRequests.map((req) => (
              <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{req.user}</span>
                    <span className="text-[10px] text-slate-400">({req.email})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-purple-300 border border-white/10">
                      {req.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Request submitted on {req.date}</p>
                </div>

                <div className="flex items-center space-x-3">
                  {req.status === 'FULFILLED' ? (
                    <span className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Fulfilled (Export Ready)</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleFulfillRequest(req.id)}
                      className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
                    >
                      Fulfill & Anonymize
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Disaster Recovery */}
      {activeTab === 'DISASTER_RECOVERY' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Disaster Recovery & Hot Replication Status</h2>
            <p className="text-xs text-slate-400">
              Cross-region PostgreSQL WAL archiving, encrypted object replication, and point-in-time recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-xs font-semibold text-slate-400">Primary Region</span>
              <p className="text-base font-bold text-white">ap-south-1 (Mumbai)</p>
              <span className="text-[11px] text-emerald-400">Active Master Node</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-xs font-semibold text-slate-400">Standby DR Region</span>
              <p className="text-base font-bold text-white">ap-south-2 (Hyderabad)</p>
              <span className="text-[11px] text-sky-400">Streaming Replication Sync</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-xs font-semibold text-slate-400">Backup Retention</span>
              <p className="text-base font-bold text-white">35 Days PITR Window</p>
              <span className="text-[11px] text-slate-400">Continuous WAL Archive</span>
            </div>
          </div>
        </div>
      )}

      {/* Crypto Shredding Modal */}
      {showShredModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-red-500/40 max-w-md w-full space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 text-red-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Emergency Tenant Crypto-Shredding</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Warning:</strong> This permanently purges the master cryptographic encryption key material for this tenant. All stored tenant data, proofs, and scores will become cryptographically unrecoverable per DPDP Act Section 12 erasure requirements.
            </p>

            <form onSubmit={handleExecuteCryptoShred} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Type <span className="text-red-400 font-mono">CONFIRM_CRYPTO_SHRED_TENANT</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={shredConfirmCode}
                  onChange={(e) => setShredConfirmCode(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/60 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShredModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={shredConfirmCode !== 'CONFIRM_CRYPTO_SHRED_TENANT'}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all"
                >
                  Execute Crypto-Shred
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuditLogView;
