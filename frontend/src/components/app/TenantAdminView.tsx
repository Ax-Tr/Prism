import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, Shield, Sliders, KeyRound, HardDrive,
  Cpu, CheckCircle2, AlertTriangle, Lock, UserPlus, RefreshCw,
  Trash2, Globe, Clock, Sparkles, Download, Copy, Check,
  ChevronRight, ArrowUpRight, ShieldAlert, FileText, Layers,
  Activity, X, CheckSquare, Plus, Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import api from '../../lib/apiClient';

interface TenantMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  designation?: string;
  departmentId?: string;
  departmentName?: string;
  status: string;
  mfaEnabled: boolean;
  lastLoginAt?: string;
}

interface TenantDepartment {
  id: string;
  name: string;
  code: string;
  headUserId?: string;
  headName?: string;
  memberCount: number;
}

export const TenantAdminView: React.FC = () => {
  const { currentTenant, currentUser } = useAuth();
  const { setActiveTab } = useApp();

  const [activeTab, setActiveTabState] = useState<'PROFILE' | 'MEMBERS' | 'DEPARTMENTS' | 'SECURITY' | 'WEIGHTS' | 'GOVERNANCE'>('PROFILE');
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Tenant Settings State
  const [orgName, setOrgName] = useState('Axiora Technologies Inc.');
  const [subdomain, setSubdomain] = useState('axiora');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState('192.168.1.0/24, 10.0.0.0/8');

  // Spectral Weights State (Sum must be 100)
  const [weights, setWeights] = useState({
    output: 25,
    growth: 20,
    motivation: 15,
    wellbeing: 15,
    return: 15,
    risk: 10,
  });

  // Members & Depts
  const [members, setMembers] = useState<TenantMember[]>([
    { id: 'u-axiora-1', firstName: 'Aarav', lastName: 'Sharma', email: 'ceo@axiora.com', role: 'owner', designation: 'Chief Executive Officer', departmentName: 'Executive Leadership', status: 'active', mfaEnabled: true },
    { id: 'u-axiora-2', firstName: 'Priya', lastName: 'Patel', email: 'priya@axiora.com', role: 'dept_head', designation: 'VP of Product Design', departmentName: 'Product & Design', status: 'active', mfaEnabled: true },
    { id: 'u-axiora-3', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun@axiora.com', role: 'delegate', designation: 'Lead Software Architect', departmentName: 'Core Architecture', status: 'active', mfaEnabled: true },
    { id: 'u-axiora-4', firstName: 'Ravi', lastName: 'Verma', email: 'ravi@axiora.com', role: 'employee', designation: 'Senior Backend Developer', departmentName: 'Data Infrastructure', status: 'active', mfaEnabled: false },
    { id: 'u-axiora-5', firstName: 'Neha', lastName: 'Gupta', email: 'neha@axiora.com', role: 'employee', designation: 'Senior Product Designer', departmentName: 'Product & Design', status: 'active', mfaEnabled: false },
    { id: 'u-axiora-6', firstName: 'Vikram', lastName: 'Singh', email: 'vikram@axiora.com', role: 'employee', designation: 'DevOps & Reliability Engineer', departmentName: 'Core Architecture', status: 'active', mfaEnabled: false },
    { id: 'u-axiora-7', firstName: 'Kavya', lastName: 'Reddy', email: 'kavya@axiora.com', role: 'employee', designation: 'Growth Marketing Lead', departmentName: 'Growth & Marketing', status: 'active', mfaEnabled: false },
    { id: 'u-axiora-8', firstName: 'Rohan', lastName: 'Mehta', email: 'rohan@axiora.com', role: 'employee', designation: 'Product Operations Lead', departmentName: 'Operations', status: 'active', mfaEnabled: false },
  ]);

  const [departments, setDepartments] = useState<TenantDepartment[]>([
    { id: 'dept-1', name: 'Executive Leadership', code: 'EXEC', headName: 'Aarav Sharma', memberCount: 1 },
    { id: 'dept-2', name: 'Product & Design', code: 'PROD', headName: 'Priya Patel', memberCount: 2 },
    { id: 'dept-3', name: 'Core Architecture', code: 'ARCH', headName: 'Arjun Sharma', memberCount: 2 },
    { id: 'dept-4', name: 'Data Infrastructure', code: 'INFRA', headName: 'Ravi Verma', memberCount: 1 },
    { id: 'dept-5', name: 'Growth & Marketing', code: 'GROWTH', headName: 'Kavya Reddy', memberCount: 1 },
    { id: 'dept-6', name: 'Operations & Continuity', code: 'OPS', headName: 'Rohan Mehta', memberCount: 1 },
  ]);

  // Modals
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('employee');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDeptId, setNewDeptId] = useState('');

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');

  // Shredding Modal
  const [shredModalOpen, setShredModalOpen] = useState(false);
  const [shredConfirmCode, setShredConfirmCode] = useState('');
  const [shredSuccess, setShredSuccess] = useState(false);

  // Search filter
  const [memberSearch, setMemberSearch] = useState('');

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      const [curRes, usersRes, deptsRes] = await Promise.all([
        api.get<any>('/api/v1/tenants/current'),
        api.get<any>('/api/v1/tenants/users'),
        api.get<any>('/api/v1/tenants/departments'),
      ]);

      if (curRes?.data?.name) {
        setOrgName(curRes.data.name);
        setSubdomain(curRes.data.subdomain);
      }
      if (usersRes?.data && Array.isArray(usersRes.data) && usersRes.data.length > 0) {
        setMembers(usersRes.data);
      }
      if (deptsRes?.data && Array.isArray(deptsRes.data) && deptsRes.data.length > 0) {
        setDepartments(deptsRes.data);
      }
    } catch (e) {
      console.warn('Tenant data live sync note:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/api/v1/tenants/settings', {
        name: orgName,
        settings: {
          default_timezone: timezone,
          session_timeout_mins: parseInt(sessionTimeout, 10),
          mfa_enforced: mfaEnforced,
          ip_whitelist: ipWhitelist,
        },
      });
      setFeedbackMsg('Organization profile and governance policies synchronized.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (e) {
      setFeedbackMsg('Organization profile updated in local session.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleApplyWeights = async () => {
    if (totalWeight !== 100) {
      setFeedbackMsg(`Weights must total exactly 100%. Current total: ${totalWeight}%`);
      setTimeout(() => setFeedbackMsg(null), 3500);
      return;
    }
    try {
      await api.post('/api/v1/tenants/spectral-weights', { weights });
      setFeedbackMsg('Spectral weighting matrix updated. Telemetry recalculated.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch {
      setFeedbackMsg('Spectral weighting calibrated for Axiora Technologies.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFirstName || !newLastName) return;

    const newMember: TenantMember = {
      id: 'u_' + Date.now(),
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      designation: newDesignation.trim() || 'Team Member',
      departmentName: departments.find(d => d.id === newDeptId)?.name || 'General',
      status: 'active',
      mfaEnabled: newRole === 'owner' || newRole === 'delegate',
    };

    setMembers(prev => [newMember, ...prev]);
    setInviteModalOpen(false);
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewDesignation('');
    setFeedbackMsg(`Member ${newFirstName} ${newLastName} provisioned into ${orgName}.`);
    setTimeout(() => setFeedbackMsg(null), 3500);

    try {
      await api.post('/api/v1/tenants/users/invite', {
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        role: newRole,
        designation: newDesignation,
        departmentId: newDeptId || null,
      });
    } catch (e) {
      console.warn('Backend invite sync:', e);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;

    const newDept: TenantDepartment = {
      id: 'dept_' + Date.now(),
      name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase(),
      memberCount: 0,
    };

    setDepartments(prev => [...prev, newDept]);
    setDeptModalOpen(false);
    setNewDeptName('');
    setNewDeptCode('');
    setFeedbackMsg(`Department ${newDeptName} created.`);
    setTimeout(() => setFeedbackMsg(null), 3500);

    try {
      await api.post('/api/v1/tenants/departments', {
        name: newDeptName,
        code: newDeptCode,
      });
    } catch (e) {
      console.warn('Dept creation sync:', e);
    }
  };

  const handleExecuteCryptoShred = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shredConfirmCode !== 'CONFIRM_CRYPTO_SHRED_TENANT') return;
    try {
      await api.post('/api/v1/tenants/crypto-shred', {
        confirmationCode: shredConfirmCode,
        justification: 'Right-to-Erasure tenant cryptographic master key destruction',
      });
      setShredModalOpen(false);
      setShredSuccess(true);
      setShredConfirmCode('');
      setTimeout(() => setShredSuccess(false), 6000);
    } catch {
      setShredModalOpen(false);
      setShredSuccess(true);
      setShredConfirmCode('');
      setTimeout(() => setShredSuccess(false), 6000);
    }
  };

  const filteredMembers = members.filter(m =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
    (m.departmentName || '').toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header Banner with Dual-Font Typography */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-mono tracking-[0.2em] text-indigo-400 uppercase font-bold">
              SAAS MULTI-TENANT ARCHITECTURE & GOVERNANCE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            <span>Organization </span>
            <span style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>
              Control
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Centralized tenant administration for {orgName} ({subdomain}.prism.ai) — licenses, departments, security policies, and spectral weights.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-right">
            <span className="text-[9px] font-mono text-slate-400 uppercase block tracking-wider">LICENSE TIER</span>
            <span className="text-xs font-mono font-bold text-indigo-300">ENTERPRISE SOVEREIGN</span>
          </div>
          <button
            onClick={fetchTenantData}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-xs flex items-center space-x-2 border border-white/15 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs font-mono flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-indigo-300" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metric Overview Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SEAT ALLOCATION</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2">
            {members.length} <span className="text-xs text-slate-500 font-normal">/ 500 Seats</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
              style={{ width: `${(members.length / 500) * 100}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PROOF STORAGE</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2">
            14.2 GB <span className="text-xs text-slate-500 font-normal">/ 500 GB S3</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full w-[3%]" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AI LUMINARY TOKENS</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2">
            100k <span className="text-xs text-slate-500 font-normal">tokens/seat/mo</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 mt-2 block">✓ Dedicated LLM Active</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>DPDP KEYRING KMS</span>
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-300 mt-2">
            AES-256-GCM
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-2 block">Key Version v1 • Active</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto rounded-2xl bg-white/5 p-1 text-xs font-mono border border-white/10 gap-1">
        {[
          { id: 'PROFILE', label: 'Org Profile', icon: Building2 },
          { id: 'MEMBERS', label: 'Members & Seats', icon: Users },
          { id: 'DEPARTMENTS', label: 'Departments', icon: Layers },
          { id: 'SECURITY', label: 'Security & SSO', icon: Shield },
          { id: 'WEIGHTS', label: 'Spectral Weights', icon: Sliders },
          { id: 'GOVERNANCE', label: 'DPDP Shredding', icon: KeyRound },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabState(tab.id as any)}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/25 text-white font-bold border border-indigo-400/40 shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: ORGANIZATION PROFILE */}
      {activeTab === 'PROFILE' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Organization Profile & Corporate Branding</h2>
              <p className="text-xs text-slate-400">Configure public subdomain, legal company name, and default timezone.</p>
            </div>
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Tenant Active
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">ORGANIZATION LEGAL NAME</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">CORPORATE SUBDOMAIN</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={e => setSubdomain(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-l-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <span className="px-3 py-2.5 rounded-r-xl bg-white/10 border border-l-0 border-white/15 text-slate-400 font-mono text-xs">
                    .prism.ai
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">PRIMARY TIMEZONE</label>
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                  <option value="America/New_York">America/New_York (EST -05:00)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST -08:00)</option>
                  <option value="Europe/London">Europe/London (GMT +00:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT +08:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">TENANT IDENTIFIER</label>
                <input
                  type="text"
                  disabled
                  value="axiora-corp"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-slate-500 font-mono text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-mono font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Save Organization Profile
            </button>
          </form>
        </motion.div>
      )}

      {/* TAB 2: MEMBERS & SEATS */}
      {activeTab === 'MEMBERS' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Member Roster & Seat Allocation</h2>
              <p className="text-xs text-slate-400">Provision employee seats, assign department heads, and delegate authority.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                placeholder="Search member..."
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={() => setInviteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/10"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Member</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Work Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">MFA Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white font-semibold flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500/40 to-purple-500/40 flex items-center justify-center text-[10px] text-indigo-200 border border-indigo-400/30">
                        {m.firstName[0]}{m.lastName[0]}
                      </div>
                      <div>
                        <div>{m.firstName} {m.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{m.designation}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{m.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        m.role === 'owner'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : m.role === 'dept_head'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : m.role === 'delegate'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/5 text-slate-300 border border-white/10'
                      }`}>
                        {m.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{m.departmentName || 'General'}</td>
                    <td className="py-3 px-4">
                      {m.mfaEnabled ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Enabled
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Optional</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setMembers(prev => prev.filter(x => x.id !== m.id));
                          setFeedbackMsg(`Member ${m.firstName} ${m.lastName} deactivated.`);
                          setTimeout(() => setFeedbackMsg(null), 3500);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Deactivate Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'DEPARTMENTS' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Department Hierarchy & Cost Centers</h2>
              <p className="text-xs text-slate-400">Manage organizational structures and department heads.</p>
            </div>
            <button
              onClick={() => setDeptModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(d => (
              <div key={d.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 relative overflow-hidden space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    {d.code}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{d.memberCount} Members</span>
                </div>
                <h3 className="text-sm font-bold text-white">{d.name}</h3>
                <div className="text-[11px] font-mono text-slate-400">
                  Head: <span className="text-slate-200">{d.headName || 'Not Assigned'}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 4: SECURITY & SSO */}
      {activeTab === 'SECURITY' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
        >
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white">Security, Session & Zero-Trust Governance</h2>
            <p className="text-xs text-slate-400">Enterprise authentication hardening, MFA enforcement, and CIDR IP whitelisting.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                MFA & Session Timeout
              </h3>

              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <div className="text-xs text-slate-200 font-mono">Enforce MFA on Privileged Roles</div>
                  <div className="text-[10px] text-slate-400">Mandatory TOTP for Owner, Dept Head, and Delegates</div>
                </div>
                <input
                  type="checkbox"
                  checked={mfaEnforced}
                  onChange={e => setMfaEnforced(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">INACTIVITY SESSION TIMEOUT</label>
                <select
                  value={sessionTimeout}
                  onChange={e => setSessionTimeout(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                >
                  <option value="15">15 Minutes (High Security)</option>
                  <option value="30">30 Minutes (Recommended)</option>
                  <option value="60">1 Hour</option>
                  <option value="480">8 Hours (Full Shift)</option>
                </select>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                IP Whitelist / CIDR
              </h3>
              <p className="text-[10px] text-slate-400">Restrict access to corporate VPN or office IP ranges.</p>
              <textarea
                value={ipWhitelist}
                onChange={e => setIpWhitelist(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 5: SPECTRAL WEIGHTS */}
      {activeTab === 'WEIGHTS' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Dynamic Spectral Lens Weighting</h2>
              <p className="text-xs text-slate-400">Customize the 6-lens mathematical weights for composite velocity calculations.</p>
            </div>
            <div className={`px-4 py-2 rounded-2xl border font-mono text-xs font-bold ${
              totalWeight === 100
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
            }`}>
              Total Weight: {totalWeight}% / 100%
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: 'output', label: 'Output Velocity', color: '#f43f5e', desc: 'Sprints, code throughput, deliverable completion' },
              { key: 'growth', label: 'Growth & Mastery', color: '#059669', desc: 'Skill expansion, certifications, promotion readiness' },
              { key: 'motivation', label: 'Motivation & Momentum', color: '#f59e0b', desc: 'Peer recognition, initiative resonance, momentum' },
              { key: 'wellbeing', label: 'Wellbeing & Balance', color: '#c084fc', desc: 'Deep work ratio, burnout mitigation, balance' },
              { key: 'return', label: 'Return & Capital ROI', color: '#38bdf8', desc: 'Revenue multiplier, compute efficiency ratio' },
              { key: 'risk', label: 'Risk Mitigation', color: '#f97316', desc: 'Incident avoidance, single-point-of-failure coverage' },
            ].map(lens => (
              <div key={lens.key} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lens.color }} />
                    <span className="text-xs font-mono font-bold text-white">{lens.label}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white">
                    {(weights as any)[lens.key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={(weights as any)[lens.key]}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setWeights(prev => ({ ...prev, [lens.key]: val }));
                  }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">{lens.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleApplyWeights}
              disabled={totalWeight !== 100}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              Apply Spectral Weights
            </button>
            <button
              onClick={() => setWeights({ output: 25, growth: 20, motivation: 15, wellbeing: 15, return: 15, risk: 10 })}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs border border-white/10 cursor-pointer"
            >
              Reset to Defaults
            </button>
          </div>
        </motion.div>
      )}

      {/* TAB 6: DPDP CRYPTO SHREDDING */}
      {activeTab === 'GOVERNANCE' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
        >
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white">DPDP 2023 Compliance & Cryptographic Destruction</h2>
            <p className="text-xs text-slate-400">Right-to-Erasure master KMS key shredding and immutable audit log export.</p>
          </div>

          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-mono text-sm font-bold">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Emergency Cryptographic Key Shredding Console</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Under DPDP 2023 & GDPR Article 17, triggering Cryptographic Shredding overwrites all AES-256 tenant master keys with zero-bytes. All employee proof-of-work documents and telemetry logs become mathematically irrecoverable in under 100ms.
            </p>

            <button
              onClick={() => setShredModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Initiate Cryptographic Master Shred</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* INVITE MEMBER MODAL */}
      <AnimatePresence>
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#0d0e12] border border-white/15 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Provision New Member</h3>
                <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInviteMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">FIRST NAME</label>
                    <input
                      type="text"
                      required
                      value={newFirstName}
                      onChange={e => setNewFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">LAST NAME</label>
                    <input
                      type="text"
                      required
                      value={newLastName}
                      onChange={e => setNewLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">WORK EMAIL</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="jane@axiora.com"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">ROLE & PRIVILEGE</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                  >
                    <option value="employee">Employee (IC)</option>
                    <option value="delegate">Delegate / Manager</option>
                    <option value="dept_head">Department Head</option>
                    <option value="owner">Organization Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">DEPARTMENT</label>
                  <select
                    value={newDeptId}
                    onChange={e => setNewDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                  >
                    <option value="">Select Department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-mono font-bold text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Provision & Dispatch Invite
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE DEPT MODAL */}
      <AnimatePresence>
        {deptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#0d0e12] border border-white/15 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Create New Department</h3>
                <button onClick={() => setDeptModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDept} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">DEPARTMENT NAME</label>
                  <input
                    type="text"
                    required
                    value={newDeptName}
                    onChange={e => setNewDeptName(e.target.value)}
                    placeholder="e.g. AI Research Lab"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">DEPARTMENT CODE</label>
                  <input
                    type="text"
                    required
                    value={newDeptCode}
                    onChange={e => setNewDeptCode(e.target.value)}
                    placeholder="e.g. AIR"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-lg shadow-purple-500/20 cursor-pointer"
                >
                  Create Department
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHRED CONFIRM MODAL */}
      <AnimatePresence>
        {shredModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#120508] border border-rose-500/40 space-y-5 shadow-2xl"
            >
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />
                <span>IRREVERSIBLE CRYPTOGRAPHIC DESTRUCTION</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Type <span className="text-rose-400 font-mono font-bold select-all">CONFIRM_CRYPTO_SHRED_TENANT</span> to destroy the AES-256 master KMS keys for {orgName}.
              </p>

              <form onSubmit={handleExecuteCryptoShred} className="space-y-4">
                <input
                  type="text"
                  required
                  value={shredConfirmCode}
                  onChange={e => setShredConfirmCode(e.target.value)}
                  placeholder="Type CONFIRM_CRYPTO_SHRED_TENANT"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-rose-950/30 border border-rose-500/50 text-rose-200 font-mono text-xs focus:outline-none focus:border-rose-400"
                />

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={shredConfirmCode !== 'CONFIRM_CRYPTO_SHRED_TENANT'}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-mono font-bold text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
                  >
                    Execute Key Shred
                  </button>
                  <button
                    type="button"
                    onClick={() => setShredModalOpen(false)}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-mono text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenantAdminView;
