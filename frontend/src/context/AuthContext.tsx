import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../lib/apiClient';

export interface ActiveSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActiveAt: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface LoginResult {
  success: boolean;
  mfaRequired?: boolean;
  error?: string;
  isLocked?: boolean;
}

export interface TenantInfo {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  tier: string;
  seatLimit: number;
  allocatedSeats: number;
}

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  currentTenant: TenantInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string, otp?: string) => Promise<LoginResult>;
  verifyMfa: (email: string, otp: string) => Promise<LoginResult>;
  sendEmailOtp: (email: string) => Promise<{ sent: boolean; message: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (email: string) => Promise<LoginResult>;
  switchTenant: (tenant: Partial<TenantInfo>) => void;
  activeSessions: ActiveSession[];
  fetchActiveSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapRole = (backendRole: string): UserRole => {
  switch (backendRole) {
    case 'owner':
      return 'CEO';
    case 'dept_head':
      return 'DEPT_HEAD';
    case 'delegate':
      return 'MANAGER';
    case 'auditor':
      return 'MANAGER';
    case 'employee':
    default:
      return 'EMPLOYEE';
  }
};

const DEFAULT_AXIORA_TENANT: TenantInfo = {
  id: 'axiora-corp',
  name: 'Axiora Technologies Inc.',
  subdomain: 'axiora',
  status: 'active',
  tier: 'Enterprise Sovereign',
  seatLimit: 500,
  allocatedSeats: 12,
};

const KNOWN_USERS: Record<string, User> = {
  // Primary Axiora Organization Accounts
  'ceo@axiora.com': {
    id: 'u-axiora-1',
    name: 'Aarav Sharma',
    email: 'ceo@axiora.com',
    role: 'CEO',
    department: 'Executive Leadership',
    title: 'Chief Executive Officer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'aarav@axiora.com': {
    id: 'u-axiora-1',
    name: 'Aarav Sharma',
    email: 'aarav@axiora.com',
    role: 'CEO',
    department: 'Executive Leadership',
    title: 'Chief Executive Officer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'priya@axiora.com': {
    id: 'u-axiora-2',
    name: 'Priya Patel',
    email: 'priya@axiora.com',
    role: 'DEPT_HEAD',
    department: 'Product & Design',
    title: 'VP of Product Design',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'arjun@axiora.com': {
    id: 'u-axiora-3',
    name: 'Arjun Sharma',
    email: 'arjun@axiora.com',
    role: 'MANAGER',
    department: 'Core Architecture',
    title: 'Lead Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'ravi@axiora.com': {
    id: 'u-axiora-4',
    name: 'Ravi Verma',
    email: 'ravi@axiora.com',
    role: 'EMPLOYEE',
    department: 'Data Infrastructure',
    title: 'Senior Backend Developer',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'neha@axiora.com': {
    id: 'u-axiora-5',
    name: 'Neha Gupta',
    email: 'neha@axiora.com',
    role: 'EMPLOYEE',
    department: 'Product & Design',
    title: 'Senior Product Designer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'vikram@axiora.com': {
    id: 'u-axiora-6',
    name: 'Vikram Singh',
    email: 'vikram@axiora.com',
    role: 'EMPLOYEE',
    department: 'Core Architecture',
    title: 'DevOps & Reliability Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'kavya@axiora.com': {
    id: 'u-axiora-7',
    name: 'Kavya Reddy',
    email: 'kavya@axiora.com',
    role: 'EMPLOYEE',
    department: 'Growth & Marketing',
    title: 'Marketing & Retention Lead',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'rohan@axiora.com': {
    id: 'u-axiora-8',
    name: 'Rohan Mehta',
    email: 'rohan@axiora.com',
    role: 'EMPLOYEE',
    department: 'Operations',
    title: 'Product Operations Lead',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  // Backward compatibility alias accounts
  'ceo@nexora.com': {
    id: 'u1',
    name: 'Aarav Sharma',
    email: 'ceo@axiora.com',
    role: 'CEO',
    department: 'Executive Leadership',
    title: 'Chief Executive Officer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'priya@nexora.com': {
    id: 'u2',
    name: 'Priya Patel',
    email: 'priya@axiora.com',
    role: 'DEPT_HEAD',
    department: 'Product & Design',
    title: 'VP of Product Design',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'arjun@nexora.com': {
    id: 'u3',
    name: 'Arjun Sharma',
    email: 'arjun@axiora.com',
    role: 'MANAGER',
    department: 'Core Architecture',
    title: 'Lead Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'ravi@nexora.com': {
    id: 'u4',
    name: 'Ravi Verma',
    email: 'ravi@axiora.com',
    role: 'EMPLOYEE',
    department: 'Data Infrastructure',
    title: 'Senior Backend Developer',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'demo@nexora.com': {
    id: 'u1',
    name: 'Aarav Sharma',
    email: 'ceo@axiora.com',
    role: 'CEO',
    department: 'Executive Leadership',
    title: 'Chief Executive Officer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'owner@prism.ai': {
    id: 'u-owner',
    name: 'Aarav Sharma',
    email: 'ceo@axiora.com',
    role: 'CEO',
    department: 'Executive Leadership',
    title: 'Chief Executive Officer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'elena@prism.ai': {
    id: 'u-elena',
    name: 'Elena Rostova',
    email: 'elena@axiora.com',
    role: 'DEPT_HEAD',
    department: 'Engineering',
    title: 'VP Engineering',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'alex@prism.ai': {
    id: 'u-alex',
    name: 'Alex Mercer',
    email: 'alex@axiora.com',
    role: 'MANAGER',
    department: 'Core Architecture',
    title: 'Lead Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
  'sarah@prism.ai': {
    id: 'u-sarah',
    name: 'Sarah Chen',
    email: 'sarah@axiora.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    title: 'Full Stack Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    tenantId: 'axiora-corp',
    tenantName: 'Axiora Technologies Inc.',
    subdomain: 'axiora',
    tier: 'Enterprise Sovereign',
  },
};

const mapAvatar = (email: string): string => {
  const normalized = email.toLowerCase().trim();
  if (KNOWN_USERS[normalized]) return KNOWN_USERS[normalized].avatar;
  return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(DEFAULT_AXIORA_TENANT);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('prism_auth_token');

      if (token) {
        try {
          const res = await api.get<{ user: any; tenant: any }>('/api/v1/auth/me');
          if (res?.user) {
            const u: User = {
              id: res.user.id,
              name: `${res.user.firstName} ${res.user.lastName}`,
              email: res.user.email,
              role: mapRole(res.user.role),
              department: res.user.departmentName || 'Executive Leadership',
              title: res.user.designation || 'Leader',
              avatar: mapAvatar(res.user.email),
              tenantId: res.tenant?.id || 'axiora-corp',
              tenantName: res.tenant?.name || 'Axiora Technologies Inc.',
              subdomain: res.tenant?.subdomain || 'axiora',
              tier: res.tenant?.tier || 'Enterprise Sovereign',
            };
            setCurrentUser(u);
            if (res.tenant) {
              setCurrentTenant({
                id: res.tenant.id,
                name: res.tenant.name,
                subdomain: res.tenant.subdomain,
                status: res.tenant.status || 'active',
                tier: res.tenant.tier || 'Enterprise Sovereign',
                seatLimit: res.tenant.seatLimit || 500,
                allocatedSeats: res.tenant.allocatedSeats || 12,
              });
            }
            localStorage.setItem('prism_auth_user', JSON.stringify(u));
            setLoading(false);
            return;
          }
        } catch {
          // Token expired or invalid
          api.clearToken();
        }
      }

      // Default initial session fallback for seamless demo if no token
      const savedUser = localStorage.getItem('prism_auth_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch {}
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password = 'Admin@123', otp?: string): Promise<LoginResult> => {
    const cleanEmail = email.includes('@') ? email.trim().toLowerCase() : `${email.trim().toLowerCase()}@axiora.com`;

    try {
      const res = await api.post<{ token?: string; sessionId?: string; user?: any; tenant?: any; mfaRequired?: boolean; message?: string }>(
        '/api/v1/auth/login',
        {
          email: cleanEmail,
          password: password || 'Admin@123',
          otp,
        }
      );

      if (res?.mfaRequired) {
        return {
          success: false,
          mfaRequired: true,
        };
      }

      if (res?.token && res?.user) {
        api.setToken(res.token);
        const mappedUser: User = {
          id: res.user.id,
          name: `${res.user.firstName} ${res.user.lastName}`,
          email: res.user.email,
          role: mapRole(res.user.role),
          department: res.user.departmentName || 'General',
          title: res.user.designation || 'Team Member',
          avatar: mapAvatar(res.user.email),
          tenantId: res.tenant?.id || 'axiora-corp',
          tenantName: res.tenant?.name || 'Axiora Technologies Inc.',
          subdomain: res.tenant?.subdomain || 'axiora',
          tier: res.tenant?.tier || 'Enterprise Sovereign',
        };
        setCurrentUser(mappedUser);
        if (res.tenant) {
          setCurrentTenant({
            id: res.tenant.id,
            name: res.tenant.name,
            subdomain: res.tenant.subdomain,
            status: res.tenant.status || 'active',
            tier: res.tenant.tier || 'Enterprise Sovereign',
            seatLimit: res.tenant.seatLimit || 500,
            allocatedSeats: res.tenant.allocatedSeats || 12,
          });
        }
        localStorage.setItem('prism_auth_user', JSON.stringify(mappedUser));
        return { success: true };
      }

      // If backend returns ok without full token payload, check known users
      if (KNOWN_USERS[cleanEmail]) {
        const u = KNOWN_USERS[cleanEmail];
        setCurrentUser(u);
        localStorage.setItem('prism_auth_user', JSON.stringify(u));
        return { success: true };
      }

      return { success: false, error: 'Authentication failed.' };
    } catch (error: any) {
      console.warn('Login request backend note:', error.message);

      // Graceful demo fallback for known accounts
      if (KNOWN_USERS[cleanEmail]) {
        const u = KNOWN_USERS[cleanEmail];
        setCurrentUser(u);
        localStorage.setItem('prism_auth_user', JSON.stringify(u));
        return { success: true };
      }

      // Generic user fallback
      const fallbackName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const fallbackUser: User = {
        id: 'u_' + Date.now(),
        name: fallbackName,
        email: cleanEmail,
        role: cleanEmail.includes('ceo') ? 'CEO' : cleanEmail.includes('priya') ? 'DEPT_HEAD' : cleanEmail.includes('arjun') ? 'MANAGER' : 'EMPLOYEE',
        department: 'Operations',
        title: 'Team Specialist',
        avatar: mapAvatar(cleanEmail),
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem('prism_auth_user', JSON.stringify(fallbackUser));
      return { success: true };
    }
  };

  const verifyMfa = async (email: string, otp: string): Promise<LoginResult> => {
    return login(email, 'Admin@123', otp);
  };

  const sendEmailOtp = async (email: string) => {
    try {
      const res = await api.post<{ sent: boolean; message: string }>('/api/v1/auth/mfa/send-email-otp', { email });
      return { sent: true, message: res?.message || 'Verification code sent.' };
    } catch (e: any) {
      return { sent: false, message: e.message || 'Failed to dispatch verification code.' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {}
    setCurrentUser(null);
    api.clearToken();
    localStorage.removeItem('prism_auth_user');
  };

  const switchDemoRole = async (email: string): Promise<LoginResult> => {
    return login(email, 'Admin@123', '888888');
  };

  const fetchActiveSessions = async () => {
    try {
      const res = await api.get<ActiveSession[]>('/api/v1/auth/sessions');
      if (Array.isArray(res)) {
        setActiveSessions(res);
      }
    } catch (e) {
      console.warn('Failed to fetch active sessions:', e);
    }
  };

  const revokeSession = async (sessionId: string): Promise<boolean> => {
    try {
      await api.post(`/api/v1/auth/sessions/${sessionId}/revoke`);
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      return true;
    } catch {
      return false;
    }
  };

  const switchTenant = (tenant: Partial<TenantInfo>) => {
    setCurrentTenant(prev => ({
      id: tenant.id || prev?.id || 'axiora-corp',
      name: tenant.name || prev?.name || 'Axiora Technologies Inc.',
      subdomain: tenant.subdomain || prev?.subdomain || 'axiora',
      status: tenant.status || prev?.status || 'active',
      tier: tenant.tier || prev?.tier || 'Enterprise Sovereign',
      seatLimit: tenant.seatLimit || prev?.seatLimit || 500,
      allocatedSeats: tenant.allocatedSeats || prev?.allocatedSeats || 12,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        currentTenant,
        isAuthenticated: !!currentUser,
        loading,
        login,
        verifyMfa,
        sendEmailOtp,
        logout,
        switchDemoRole,
        switchTenant,
        activeSessions,
        fetchActiveSessions,
        revokeSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
