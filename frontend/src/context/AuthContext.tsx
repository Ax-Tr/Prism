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

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string, otp?: string) => Promise<LoginResult>;
  verifyMfa: (email: string, otp: string) => Promise<LoginResult>;
  sendEmailOtp: (email: string) => Promise<{ sent: boolean; message: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (email: string) => Promise<LoginResult>;
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

const mapAvatar = (email: string): string => {
  const avatars: Record<string, string> = {
    'owner@prism.ai': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    'elena@prism.ai': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    'marcus@prism.ai': 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=150&q=80',
    'alex@prism.ai': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    'sarah@prism.ai': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'jordan@prism.ai': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'auditor@prism.ai': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  };
  return avatars[email.toLowerCase()] || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('prism_auth_token');

      if (token) {
        try {
          const res = await api.get<{ user: any }>('/api/v1/auth/me');
          if (res?.user) {
            const u: User = {
              id: res.user.id,
              name: `${res.user.firstName} ${res.user.lastName}`,
              email: res.user.email,
              role: mapRole(res.user.role),
              department: res.user.departmentName || 'Executive Leadership',
              title: res.user.designation || 'Leader',
              avatar: mapAvatar(res.user.email),
            };
            setCurrentUser(u);
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
    try {
      const cleanEmail = email.includes('@') ? email.trim().toLowerCase() : `${email.trim().toLowerCase()}@prism.ai`;

      const res = await api.post<{ token?: string; sessionId?: string; user?: any; mfaRequired?: boolean; message?: string }>(
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
        };
        setCurrentUser(mappedUser);
        localStorage.setItem('prism_auth_user', JSON.stringify(mappedUser));
        return { success: true };
      }

      return { success: false, error: 'Authentication failed.' };
    } catch (error: any) {
      console.warn('Login request error:', error.message);
      return {
        success: false,
        error: error.message || 'Invalid email or password.',
      };
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

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login,
        verifyMfa,
        sendEmailOtp,
        logout,
        switchDemoRole,
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
