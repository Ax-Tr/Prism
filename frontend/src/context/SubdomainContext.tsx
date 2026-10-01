import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { detectSubdomain, SubdomainInfo, AppMode } from '../lib/subdomain';
import api from '../lib/apiClient';

export interface ResolvedTenant {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  tier: string;
  branding: {
    logo: string | null;
    primaryColor: string;
    timezone: string;
  };
}

interface SubdomainContextType {
  /** Current subdomain detection result */
  subdomainInfo: SubdomainInfo;
  /** Application mode derived from the subdomain */
  appMode: AppMode;
  /** Resolved tenant data (null if platform/superadmin mode, or if not yet resolved) */
  resolvedTenant: ResolvedTenant | null;
  /** Whether tenant resolution is in progress */
  isResolving: boolean;
  /** Error during tenant resolution */
  resolutionError: string | null;
  /** Whether we're on the SuperAdmin domain */
  isSuperAdmin: boolean;
  /** Whether we're on a tenant domain */
  isTenantDomain: boolean;
  /** Whether we're on the platform root domain */
  isPlatformRoot: boolean;
  /** Force re-detect the subdomain */
  redetect: () => void;
}

const SubdomainContext = createContext<SubdomainContextType | undefined>(undefined);

export const SubdomainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subdomainInfo, setSubdomainInfo] = useState<SubdomainInfo>(() => detectSubdomain());
  const [resolvedTenant, setResolvedTenant] = useState<ResolvedTenant | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionError, setResolutionError] = useState<string | null>(null);

  const resolveTenant = useCallback(async (subdomain: string) => {
    setIsResolving(true);
    setResolutionError(null);

    try {
      const data = await api.get<ResolvedTenant>(`/api/v1/tenants/resolve/${subdomain}`);
      setResolvedTenant(data);
    } catch (error: any) {
      console.error('[SubdomainContext] Tenant resolution failed:', error.message);
      setResolutionError(error.message || 'Failed to resolve organization');
      setResolvedTenant(null);
    } finally {
      setIsResolving(false);
    }
  }, []);

  useEffect(() => {
    const info = detectSubdomain();
    setSubdomainInfo(info);

    if (info.mode === 'TENANT' && info.subdomain) {
      resolveTenant(info.subdomain);
    }
  }, [resolveTenant]);

  // Listen for URL changes (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const info = detectSubdomain();
      setSubdomainInfo(info);
      if (info.mode === 'TENANT' && info.subdomain) {
        resolveTenant(info.subdomain);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [resolveTenant]);

  const redetect = useCallback(() => {
    const info = detectSubdomain();
    setSubdomainInfo(info);
    if (info.mode === 'TENANT' && info.subdomain) {
      resolveTenant(info.subdomain);
    }
  }, [resolveTenant]);

  const value: SubdomainContextType = {
    subdomainInfo,
    appMode: subdomainInfo.mode,
    resolvedTenant,
    isResolving,
    resolutionError,
    isSuperAdmin: subdomainInfo.mode === 'SUPER_ADMIN',
    isTenantDomain: subdomainInfo.mode === 'TENANT',
    isPlatformRoot: subdomainInfo.mode === 'PLATFORM',
    redetect,
  };

  return (
    <SubdomainContext.Provider value={value}>
      {children}
    </SubdomainContext.Provider>
  );
};

export const useSubdomain = (): SubdomainContextType => {
  const ctx = useContext(SubdomainContext);
  if (!ctx) {
    throw new Error('useSubdomain must be used within SubdomainProvider');
  }
  return ctx;
};
