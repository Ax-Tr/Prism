import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../lib/apiClient';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userOrEmail: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map backend roles to UI display roles
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
    'owner@prism.ai': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'elena@prism.ai': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    'marcus@prism.ai': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'alex@prism.ai': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    'sarah@prism.ai': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'jordan@prism.ai': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    'auditor@prism.ai': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  };
  return avatars[email.toLowerCase()] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('prism_auth_user');
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
              department: res.user.departmentName || 'General',
              title: res.user.designation || 'Team Member',
              avatar: mapAvatar(res.user.email),
            };
            setCurrentUser(u);
            localStorage.setItem('prism_auth_user', JSON.stringify(u));
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Stored token invalid, re-authenticating with default account');
        }
      }

      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch {}
      } else {
        // Automatically login as owner for seamless experience
        await login('owner@prism.ai', 'Admin@123').catch(() => {});
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (userOrEmail: string, password = 'Admin@123'): Promise<boolean> => {
    try {
      const email = userOrEmail.includes('@') ? userOrEmail : `${userOrEmail}@prism.ai`;
      const res = await api.post<{ token: string; user: any }>('/api/v1/auth/login', {
        email,
        password,
      });

      if (res?.token && res?.user) {
        api.setToken(res.token);
        const u: User = {
          id: res.user.id,
          name: `${res.user.firstName} ${res.user.lastName}`,
          email: res.user.email,
          role: mapRole(res.user.role),
          department: res.user.departmentName || 'General',
          title: res.user.designation || 'Team Member',
          avatar: mapAvatar(res.user.email),
        };
        setCurrentUser(u);
        localStorage.setItem('prism_auth_user', JSON.stringify(u));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login failed:', error.message);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    api.clearToken();
    localStorage.removeItem('prism_auth_user');
  };

  const switchDemoRole = async (email: string): Promise<boolean> => {
    return login(email, 'Admin@123');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login,
        logout,
        switchDemoRole,
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
