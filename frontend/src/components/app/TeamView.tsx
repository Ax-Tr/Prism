import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, MessageSquare, ArrowUpRight, X, Calendar, CheckCircle2,
  Search, Filter, Plus, Shield, Network, Building2, UserPlus, Award,
  Activity, Star, Sparkles, AlertCircle, RefreshCw, Send, Lock, FileText,
  ChevronRight, Briefcase, Mail, Phone, Check, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/apiClient';

interface UserDirectoryItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  designation: string;
  status: string;
  departmentId?: string;
  departmentName: string;
  departmentCode: string;
  isDepartmentHead: boolean;
  isDepartmentDelegate: boolean;
  activeTasksCount: number;
  bandwidthLoad: number;
  lastLoginAt?: string;
}

interface DepartmentNode {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  parentName?: string | null;
  headUserId: string | null;
  headName: string | null;
  headDesignation?: string | null;
  delegateUserId: string | null;
  delegateName: string | null;
  memberCount: number;
  members?: any[];
  children?: DepartmentNode[];
}

interface DigitalProfile {
  identity: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    designation: string;
    status: string;
    lastLoginAt?: string;
    joinedAt: string;
  };
  department: {
    id: string | null;
    name: string;
    code: string;
    isHead: boolean;
    isDelegate: boolean;
  };
  workMetrics: {
    totalAssignedTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    proofCount: number;
    completionRate: number;
    recentTasks: any[];
  };
  performance: {
    averageScore: number;
    scoreHistory: any[];
    reliabilityRating: number;
    speedRating: number;
    qualityRating: number;
  };
  okrs: any[];
  recognitions: any[];
  reviewsSummary: {
    totalReviews: number;
    averageCompetency: number;
  };
  continuity: any[];
}

export const TeamView: React.FC = () => {
  const { currentUser } = useAuth();

  // State Management
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ORG_GRAPH' | 'TRANSPARENCY'>('DIRECTORY');
  const [users, setUsers] = useState<UserDirectoryItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Modals
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserDirectoryItem | null>(null);
  const [profileData, setProfileData] = useState<DigitalProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<'OVERVIEW' | 'WORK' | 'PERFORMANCE' | 'OKRS' | 'RECOGNITIONS'>('OVERVIEW');

  const [selectedUserForPrep, setSelectedUserForPrep] = useState<UserDirectoryItem | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);

  // Invite Form State
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee',
    departmentId: '',
    designation: '',
    phone: '',
  });
  const [inviteSuccess, setInviteSuccess] = useState<any>(null);
  const [inviteError, setInviteError] = useState('');

  // Department Form State
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    headUserId: '',
    delegateUserId: '',
    parentId: '',
  });
  const [deptSuccess, setDeptSuccess] = useState('');

  // Transparency State
  const [transparencyData, setTransparencyData] = useState<any>(null);
  const [transparencyLoading, setTransparencyLoading] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    fieldToCorrect: 'Phone Number',
    currentValue: '',
    requestedValue: '',
    reason: '',
  });
  const [correctionSuccess, setCorrectionSuccess] = useState('');

  // 1. Fetch Users & Departments
  const fetchDirectoryData = async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        api.get<{ total: number; users: UserDirectoryItem[] }>('/api/v1/users'),
        api.get<DepartmentNode[]>('/api/v1/departments'),
      ]);

      if (usersRes?.users) {
        setUsers(usersRes.users);
      }
      if (deptsRes) {
        setDepartments(deptsRes);
      }
    } catch (err) {
      console.warn('Error fetching people directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectoryData();
  }, []);

  // 2. Fetch Digital Profile
  const handleOpenProfile = async (user: UserDirectoryItem) => {
    setSelectedProfileUser(user);
    setProfileLoading(true);
    setProfileActiveTab('OVERVIEW');
    try {
      const res = await api.get<DigitalProfile>(`/api/v1/users/${user.id}/profile`);
      if (res) {
        setProfileData(res);
      }
    } catch (err) {
      console.warn('Error loading profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // 3. Fetch Transparency Data
  const fetchTransparencyData = async () => {
    if (!currentUser?.id) return;
    try {
      setTransparencyLoading(true);
      const res = await api.get<any>(`/api/v1/users/${currentUser.id}/transparency`);
      if (res) {
        setTransparencyData(res);
      }
    } catch (err) {
      console.warn('Error loading transparency center:', err);
    } finally {
      setTransparencyLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'TRANSPARENCY') {
      fetchTransparencyData();
    }
  }, [activeTab]);

  // 4. Handle Invite User Submit
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess(null);
    try {
      const res = await api.post<any>('/api/v1/users/invite', inviteForm);
      if (res) {
        setInviteSuccess(res);
        setInviteForm({
          firstName: '',
          lastName: '',
          email: '',
          role: 'employee',
          departmentId: '',
          designation: '',
          phone: '',
        });
        fetchDirectoryData();
      }
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invitation');
    }
  };

  // 5. Handle Department Creation Submit
  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptSuccess('');
    try {
      const res = await api.post<any>('/api/v1/departments', deptForm);
      if (res) {
        setDeptSuccess(`Department '${deptForm.name}' (${deptForm.code}) created successfully.`);
        setDeptForm({ name: '', code: '', headUserId: '', delegateUserId: '', parentId: '' });
        fetchDirectoryData();
        setTimeout(() => {
          setDeptSuccess('');
          setShowDeptModal(false);
        }, 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create department');
    }
  };

  // 6. Handle Data Correction Submit
  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    try {
      const res = await api.post<any>(`/api/v1/users/${currentUser.id}/transparency/correction`, correctionForm);
      if (res) {
        setCorrectionSuccess(`Request #${res.requestId} submitted successfully to Compliance.`);
        setTimeout(() => {
          setCorrectionSuccess('');
          setShowCorrectionModal(false);
        }, 2500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit correction');
    }
  };

  // Filtered Directory
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDeptFilter === 'ALL' || u.departmentId === selectedDeptFilter;
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  const isPrivileged = currentUser?.role === 'owner' || currentUser?.role === 'super_admin' || currentUser?.role === 'dept_head' || currentUser?.role === 'hr';

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Header & View Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">ENTERPRISE TALENT & STRUCTURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">People, Departments & Org Graph</h1>
          <p className="text-xs text-slate-400 mt-1">
            Searchable team roster, 9-role hierarchy graph, digital profiles, and employee transparency center (PRD §9)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {isPrivileged && (
            <>
              <button
                onClick={() => setShowDeptModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center space-x-2 transition-all"
              >
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>New Department</span>
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center space-x-2 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Member</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'DIRECTORY'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>People Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ORG_GRAPH')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'ORG_GRAPH'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Departments & Org Graph ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TRANSPARENCY')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'TRANSPARENCY'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Employee Transparency Center</span>
        </button>
      </div>

      {/* TAB 1: PEOPLE DIRECTORY */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, role, email, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-mono">DEPT:</span>
              </div>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900">{d.name} ({d.code})</option>
                ))}
              </select>

              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">All Roles</option>
                <option value="owner" className="bg-slate-900">Owner / CEO</option>
                <option value="dept_head" className="bg-slate-900">Dept Head</option>
                <option value="delegate" className="bg-slate-900">Delegate</option>
                <option value="manager" className="bg-slate-900">Manager</option>
                <option value="employee" className="bg-slate-900">Employee</option>
                <option value="auditor" className="bg-slate-900">Auditor</option>
              </select>
            </div>
          </div>

          {/* Directory Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
              <span className="text-xs font-mono">Synchronizing people directory...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 text-slate-400">
              <p className="text-sm font-semibold">No team members match your filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    {/* Card Top */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600/40 to-indigo-600/40 border border-white/15 flex items-center justify-center text-white font-bold text-base shadow-inner">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold">
                          {u.bandwidthLoad}% LOAD
                        </span>
                        {u.isDepartmentHead && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono text-amber-300 font-bold">
                            HEAD
                          </span>
                        )}
                        {u.isDepartmentDelegate && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-[9px] font-mono text-sky-300 font-bold">
                            DELEGATE
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mt-4 group-hover:text-purple-300 transition-colors">
                      {u.fullName}
                    </h3>
                    <p className="text-xs font-mono text-sky-400">{u.designation}</p>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{u.departmentName} ({u.departmentCode || 'N/A'})</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                    </div>

                    {/* Workload Progress */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400 font-mono">Active Tasks:</span>
                        <span className="font-bold text-white font-mono">{u.activeTasksCount}</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            u.bandwidthLoad > 80 ? 'bg-rose-500' : u.bandwidthLoad > 50 ? 'bg-amber-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${u.bandwidthLoad}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedUserForPrep(u)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center space-x-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      <span>1:1 Prep</span>
                    </button>
                    <button
                      onClick={() => handleOpenProfile(u)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold flex items-center space-x-1 border border-purple-500/30 transition-all"
                    >
                      <span>Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEPARTMENTS & ORG GRAPH */}
      {activeTab === 'ORG_GRAPH' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold">
                      {dept.code}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{dept.name}</h3>
                    {dept.parentName && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Parent: <span className="text-purple-300">{dept.parentName}</span>
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 font-bold">
                    {dept.memberCount} Members
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono text-[11px]">Department Head:</span>
                    <span className="font-bold text-amber-300">{dept.headName || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono text-[11px]">Continuity Delegate:</span>
                    <span className="font-bold text-sky-300">{dept.delegateName || 'Unassigned'}</span>
                  </div>
                </div>

                {/* Assigned Members Mini Avatars */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">Team Roster</span>
                  {dept.members && dept.members.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {dept.members.map((m: any) => (
                        <span
                          key={m.id}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300"
                        >
                          {m.firstName} {m.lastName} ({m.role})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No assigned members</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EMPLOYEE TRANSPARENCY CENTER */}
      {activeTab === 'TRANSPARENCY' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">Employee Transparency & Data Rights (PRD §9 FR-012)</h2>
                  <p className="text-xs text-slate-400">
                    Full disclosure of collected telemetry, performance signals, security classifications, and DPDP 2023 rights.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCorrectionModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center space-x-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Submit Data Correction</span>
              </button>
            </div>
          </div>

          {transparencyLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
              <span className="text-xs font-mono">Loading data transparency ledger...</span>
            </div>
          ) : transparencyData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {transparencyData.dataCategories?.map((cat: any, idx: number) => (
                <div key={idx} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{cat.category}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{cat.purpose}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 font-bold">
                      {cat.recordsCount} Records
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Items Collected</span>
                    <div className="flex flex-wrap gap-1">
                      {cat.items?.map((it: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-300">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5 text-xs text-slate-300">
                    <div>
                      <strong className="text-slate-400 font-mono text-[11px] block">Storage Location:</strong>
                      <span className="text-sky-300">{cat.storageLocation}</span>
                    </div>
                    <div className="pt-1">
                      <strong className="text-slate-400 font-mono text-[11px] block">Retention Policy:</strong>
                      <span className="text-purple-300">{cat.retentionPeriod}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 1: DIGITAL EMPLOYEE PROFILE MODAL   */}
      {/* ========================================== */}
      {selectedProfileUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-6 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-white/20 flex items-center justify-center text-white font-extrabold text-xl shadow-xl">
                  {selectedProfileUser.firstName[0]}{selectedProfileUser.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white">{selectedProfileUser.fullName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold uppercase">
                      {selectedProfileUser.role}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-sky-400 mt-0.5">{selectedProfileUser.designation} — {selectedProfileUser.departmentName}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedProfileUser.email}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedProfileUser(null); setProfileData(null); }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Sub-tabs */}
            <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setProfileActiveTab('OVERVIEW')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                  profileActiveTab === 'OVERVIEW' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setProfileActiveTab('WORK')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                  profileActiveTab === 'WORK' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Work & Proofs
              </button>
              <button
                onClick={() => setProfileActiveTab('PERFORMANCE')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                  profileActiveTab === 'PERFORMANCE' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Performance
              </button>
              <button
                onClick={() => setProfileActiveTab('OKRS')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                  profileActiveTab === 'OKRS' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                OKRs & Goals
              </button>
            </div>

            {/* Modal Body */}
            {profileLoading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center space-x-3">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                <span className="text-xs font-mono">Aggregating digital profile telemetry...</span>
              </div>
            ) : profileData ? (
              <div className="space-y-6">
                {profileActiveTab === 'OVERVIEW' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Daily Score</span>
                        <p className="text-xl font-extrabold text-purple-400 mt-1">{profileData.performance?.averageScore || 88.5}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Tasks Completed</span>
                        <p className="text-xl font-extrabold text-emerald-400 mt-1">{profileData.workMetrics?.completedTasks || 0}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Proofs Submitted</span>
                        <p className="text-xl font-extrabold text-sky-400 mt-1">{profileData.workMetrics?.proofCount || 0}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Bandwidth Load</span>
                        <p className="text-xl font-extrabold text-amber-400 mt-1">{selectedProfileUser.bandwidthLoad}%</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                      <strong className="text-slate-300 block">Department & Authority Scope:</strong>
                      <p className="text-slate-400">
                        Assigned to <strong>{profileData.department?.name}</strong>.
                        {profileData.department?.isHead && ' Holds Department Head signature and approval permissions.'}
                        {profileData.department?.isDelegate && ' Holds Operational Continuity Delegate signature rights.'}
                      </p>
                    </div>
                  </div>
                )}

                {profileActiveTab === 'WORK' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono text-slate-400 uppercase">Recent Assigned Tasks & Proofs</h4>
                    <div className="space-y-2">
                      {profileData.workMetrics?.recentTasks?.map((task: any) => (
                        <div key={task.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-white">{task.title}</p>
                            <span className="text-[10px] font-mono text-slate-400">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                            task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {task.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileActiveTab === 'PERFORMANCE' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono text-slate-400 uppercase">30-Day Daily Score Telemetry</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-slate-400 font-mono">Reliability</span>
                        <p className="text-base font-bold text-emerald-400">{profileData.performance?.reliabilityRating}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-slate-400 font-mono">Speed Score</span>
                        <p className="text-base font-bold text-sky-400">{profileData.performance?.speedRating}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-slate-400 font-mono">Quality Score</span>
                        <p className="text-base font-bold text-purple-400">{profileData.performance?.qualityRating}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {profileActiveTab === 'OKRS' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-slate-400 uppercase">Department Priorities & OKRs</h4>
                    {profileData.okrs?.map((okr: any) => (
                      <div key={okr.priorityId} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="text-white">{okr.title}</strong>
                          <span className="font-mono font-bold text-purple-400">{okr.progressPercent}%</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{okr.goalTitle}</p>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: `${okr.progressPercent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <button
              onClick={() => { setSelectedProfileUser(null); setProfileData(null); }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: 1:1 MEETING PREP MODAL           */}
      {/* ========================================== */}
      {selectedUserForPrep && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/40 border border-white/10 flex items-center justify-center text-white font-bold">
                  {selectedUserForPrep.firstName[0]}{selectedUserForPrep.lastName[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">1:1 Meeting Prep — {selectedUserForPrep.fullName}</h3>
                  <p className="text-xs text-slate-400">{selectedUserForPrep.designation}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserForPrep(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="font-mono text-purple-400 uppercase">Workload Bandwidth</span>
                <p className="text-slate-300 mt-0.5">{selectedUserForPrep.bandwidthLoad}% capacity utilized across {selectedUserForPrep.activeTasksCount} active tasks.</p>
              </div>

              <div>
                <span className="font-mono text-sky-400 uppercase">Suggested Talking Points</span>
                <ul className="mt-1 space-y-1 text-slate-200">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>Quarterly goals alignment in {selectedUserForPrep.departmentName}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>Task blockers and cross-functional dependencies</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setSelectedUserForPrep(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs"
            >
              Close Prep Notes
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: USER INVITATION MODAL (PRD §9 S4-05) */}
      {/* ========================================== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Invite Team Member</h3>
              </div>
              <button onClick={() => { setShowInviteModal(false); setInviteSuccess(null); }} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="mt-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Invitation Dispatched!</h4>
                <p className="text-xs text-slate-300">
                  An invitation has been generated for <strong>{inviteSuccess.email}</strong> with role <strong>{inviteSuccess.role}</strong>.
                </p>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left font-mono text-[11px] text-purple-300 break-all">
                  Invite Link: {inviteSuccess.inviteUrl}
                </div>
                <button
                  onClick={() => { setShowInviteModal(false); setInviteSuccess(null); }}
                  className="w-full py-2.5 rounded-xl bg-purple-500 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="mt-6 space-y-4 text-xs">
                {inviteError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300">
                    {inviteError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-mono block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={inviteForm.firstName}
                      onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-mono block mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={inviteForm.lastName}
                      onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@prism.ai"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-mono block mb-1">RBAC Role *</label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                    >
                      <option value="employee" className="bg-slate-900">Employee</option>
                      <option value="dept_head" className="bg-slate-900">Department Head</option>
                      <option value="delegate" className="bg-slate-900">Delegate</option>
                      <option value="manager" className="bg-slate-900">Manager</option>
                      <option value="hr" className="bg-slate-900">HR Officer</option>
                      <option value="auditor" className="bg-slate-900">Auditor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 font-mono block mb-1">Department</label>
                    <select
                      value={inviteForm.departmentId}
                      onChange={(e) => setInviteForm({ ...inviteForm, departmentId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                    >
                      <option value="" className="bg-slate-900">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Job Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Backend Engineer"
                    value={inviteForm.designation}
                    onChange={(e) => setInviteForm({ ...inviteForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/25"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 4: DEPARTMENT CREATION MODAL        */}
      {/* ========================================== */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Create Department</h3>
              </div>
              <button onClick={() => setShowDeptModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {deptSuccess ? (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center text-xs">
                {deptSuccess}
              </div>
            ) : (
              <form onSubmit={handleDeptSubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Research & Sanctum"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AIR"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Department Head</label>
                  <select
                    value={deptForm.headUserId}
                    onChange={(e) => setDeptForm({ ...deptForm, headUserId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="" className="bg-slate-900">Select Department Head</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id} className="bg-slate-900">{u.fullName} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeptModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                  >
                    Create Department
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 5: DATA CORRECTION REQUEST MODAL    */}
      {/* ========================================== */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Data Correction Request</h3>
              </div>
              <button onClick={() => setShowCorrectionModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {correctionSuccess ? (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center text-xs">
                {correctionSuccess}
              </div>
            ) : (
              <form onSubmit={handleCorrectionSubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Field to Correct</label>
                  <select
                    value={correctionForm.fieldToCorrect}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, fieldToCorrect: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="Phone Number" className="bg-slate-900">Phone Number</option>
                    <option value="Designation" className="bg-slate-900">Designation / Title</option>
                    <option value="Legal Name" className="bg-slate-900">Legal Name</option>
                    <option value="Department Attribution" className="bg-slate-900">Department Attribution</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Requested Corrected Value *</label>
                  <input
                    type="text"
                    required
                    value={correctionForm.requestedValue}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, requestedValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Reason / Supporting Justification *</label>
                  <textarea
                    required
                    rows={3}
                    value={correctionForm.reason}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                  >
                    Submit to Compliance
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
