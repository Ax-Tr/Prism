import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../lib/apiClient';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userOrEmail: string, passwordOrName?: string) => Promise<boolean>;
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
    'ceo@nexora.com': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    'priya@nexora.com': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    'arjun@nexora.com': 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=150&q=80',
    'ravi@nexora.com': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80',
    'demo@nexora.com': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    'owner@prism.ai': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
  };
  return avatars[email.toLowerCase()] || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'e1',
    name: 'Arjun Sharma',
    email: 'arjun@nexora.com',
    role: 'CEO',
    department: 'Core Architecture',
    title: 'Senior Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1080&auto=format&fit=crop',
  });
  const [loading, setLoading] = useState<boolean>(false);

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
            return;
          }
        } catch (e) {
          console.warn('Stored token invalid, using local demo user');
        }
      }

      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch {}
      }
    };

    initializeAuth();
  }, []);

  const login = async (userOrEmail: string, passwordOrName?: string): Promise<boolean> => {
    try {
      const email = userOrEmail.includes('@') ? userOrEmail : `${userOrEmail}@nexora.com`;
      const displayName = passwordOrName && !passwordOrName.includes('@') && passwordOrName !== 'prism' && passwordOrName !== 'Admin@123'
        ? passwordOrName
        : email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      const localUser: User = {
        id: 'u_' + Date.now(),
        name: displayName,
        email: email,
        role: 'CEO',
        department: 'Core Architecture',
        title: 'Executive Leader',
        avatar: mapAvatar(email),
      };

      try {
        const res = await api.post<{ token: string; user: any }>('/api/v1/auth/login', {
          email,
          password: 'Admin@123',
        });
        if (res?.token && res?.user) {
          api.setToken(res.token);
          localUser.id = res.user.id;
          localUser.name = `${res.user.firstName} ${res.user.lastName}`;
        }
      } catch {}

      setCurrentUser(localUser);
      localStorage.setItem('prism_auth_user', JSON.stringify(localUser));
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    api.clearToken();
    localStorage.removeItem('prism_auth_user');
  };

  const switchDemoRole = async (email: string): Promise<boolean> => {
    return login(email);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
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
