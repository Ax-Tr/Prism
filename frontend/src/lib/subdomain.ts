/**
 * PRISM Subdomain Detection Utility
 * 
 * Detects the current subdomain from the browser URL and determines
 * the application mode:
 * 
 *   - No subdomain (prism.com / localhost:3000)  →  PLATFORM mode (landing + SuperAdmin)
 *   - "admin" subdomain (admin.prism.com)         →  SUPER_ADMIN mode  
 *   - Org subdomain (axiora.prism.com)            →  TENANT mode (org login + workspace)
 *
 * For local development:
 *   - localhost:3000          → PLATFORM (with ?org=axiora query param override)
 *   - axiora.lvh.me:3000     → TENANT
 *   - lvh.me:3000            → PLATFORM
 */

export type AppMode = 'PLATFORM' | 'SUPER_ADMIN' | 'TENANT';

export interface SubdomainInfo {
  /** The detected subdomain (e.g., "axiora"), or null if root domain */
  subdomain: string | null;
  /** The application mode derived from subdomain */
  mode: AppMode;
  /** Whether this is a local development environment */
  isLocal: boolean;
  /** The full host string */
  host: string;
  /** The root domain (e.g., "prism.com", "lvh.me") */
  rootDomain: string;
}

// Root domains that indicate "platform" level (no tenant)
const ROOT_DOMAINS = ['prism.com', 'prism.ai', 'lvh.me', 'localhost', '127.0.0.1'];

// Reserved subdomains
const ADMIN_SUBDOMAINS = ['admin', 'superadmin', 'root'];
const RESERVED_SUBDOMAINS = [...ADMIN_SUBDOMAINS, 'api', 'www', 'mail', 'ftp', 'status', 'docs', 'help', 'support', 'billing'];

/**
 * Detects the current subdomain from window.location.
 * Also supports a ?org= query parameter override for local dev without DNS.
 */
export function detectSubdomain(): SubdomainInfo {
  const host = window.location.hostname.toLowerCase();
  const port = window.location.port;
  const search = new URLSearchParams(window.location.search);
  
  // Query param override: ?org=axiora enables tenant mode on localhost
  const orgOverride = search.get('org') || search.get('tenant');
  
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.lvh.me') || host === 'lvh.me';
  
  // Check URL path for SuperAdmin route: /admin/login
  const pathname = window.location.pathname.toLowerCase();
  if (pathname.startsWith('/admin')) {
    return {
      subdomain: 'admin',
      mode: 'SUPER_ADMIN',
      isLocal,
      host: `${host}${port ? ':' + port : ''}`,
      rootDomain: host,
    };
  }
  
  // Handle query param override for local dev
  if (orgOverride && isLocal) {
    return {
      subdomain: orgOverride.toLowerCase().trim(),
      mode: 'TENANT',
      isLocal: true,
      host: `${host}${port ? ':' + port : ''}`,
      rootDomain: host,
    };
  }
  
  // Check if we're on a root domain (no subdomain)
  for (const root of ROOT_DOMAINS) {
    if (host === root) {
      return {
        subdomain: null,
        mode: 'PLATFORM',
        isLocal,
        host: `${host}${port ? ':' + port : ''}`,
        rootDomain: root,
      };
    }
  }
  
  // Extract subdomain from host
  for (const root of ROOT_DOMAINS) {
    if (host.endsWith(`.${root}`)) {
      const subdomain = host.replace(`.${root}`, '');
      const parts = subdomain.split('.');
      const deepestSub = parts[parts.length - 1];
      
      if (ADMIN_SUBDOMAINS.includes(deepestSub)) {
        return {
          subdomain: 'admin',
          mode: 'SUPER_ADMIN',
          isLocal,
          host: `${host}${port ? ':' + port : ''}`,
          rootDomain: root,
        };
      }
      
      return {
        subdomain: deepestSub,
        mode: RESERVED_SUBDOMAINS.includes(deepestSub) ? 'PLATFORM' : 'TENANT',
        isLocal,
        host: `${host}${port ? ':' + port : ''}`,
        rootDomain: root,
      };
    }
  }
  
  // Fallback: treat as platform
  return {
    subdomain: null,
    mode: 'PLATFORM',
    isLocal,
    host: `${host}${port ? ':' + port : ''}`,
    rootDomain: host,
  };
}

/**
 * Gets the tenant login URL for a given subdomain.
 */
export function getTenantUrl(subdomain: string, rootDomain?: string): string {
  const root = rootDomain || 'prism.com';
  const isLocal = root === 'localhost' || root === '127.0.0.1';
  
  if (isLocal) {
    const port = window.location.port;
    return `http://${subdomain}.lvh.me${port ? ':' + port : ''}/login`;
  }
  
  return `https://${subdomain}.${root}/login`;
}

/**
 * Gets the SuperAdmin URL.
 */
export function getSuperAdminUrl(rootDomain?: string): string {
  const root = rootDomain || 'prism.com';
  const isLocal = root === 'localhost' || root === '127.0.0.1';
  
  if (isLocal) {
    const port = window.location.port;
    return `http://localhost${port ? ':' + port : ''}/admin/login`;
  }
  
  return `https://${root}/admin/login`;
}
