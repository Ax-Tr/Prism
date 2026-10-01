/**
 * PRISM Subdomain Tenant Resolution Middleware
 * 
 * Extracts the subdomain from the Host header and resolves the corresponding
 * tenant from the database. This enforces the SaaS URL isolation strategy:
 * 
 *   - prism.com/admin/login          → SuperAdmin (no subdomain / root domain)
 *   - axiora.prism.com/login         → Axiora Technologies tenant
 *   - acme.prism.com/login           → Acme Corp tenant
 * 
 * In local development, we use lvh.me (which resolves to 127.0.0.1):
 *   - lvh.me:3000                    → Root domain (SuperAdmin)
 *   - axiora.lvh.me:3000             → Axiora tenant
 *
 * The middleware attaches `req.tenantContext` with resolved tenant info.
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';

export interface TenantContext {
  subdomain: string | null;
  tenantId: string | null;
  tenantName: string | null;
  tier: string | null;
  status: string | null;
  isSuperAdminDomain: boolean;
}

export interface SubdomainRequest extends Request {
  tenantContext?: TenantContext;
}

// Root domains where SuperAdmin lives (no subdomain)
const ROOT_DOMAINS = [
  'prism.com',
  'prism.ai',
  'lvh.me',       // local dev wildcard domain (resolves to 127.0.0.1)
  'localhost',
  '127.0.0.1',
];

/**
 * Extract subdomain from the Host header.
 * 
 * Examples:
 *   "axiora.prism.com"    → "axiora"
 *   "axiora.lvh.me:3000"  → "axiora"
 *   "prism.com"           → null (root domain)
 *   "localhost:3000"       → null (root domain)
 *   "admin.prism.com"     → "admin" (reserved for SuperAdmin)
 */
function extractSubdomain(host: string): string | null {
  if (!host) return null;
  
  // Strip port
  const hostWithoutPort = host.split(':')[0].toLowerCase().trim();
  
  // Check if it's a direct root domain hit (no subdomain)
  for (const root of ROOT_DOMAINS) {
    if (hostWithoutPort === root) {
      return null; // Root domain → SuperAdmin or public landing
    }
  }
  
  // Check for subdomain patterns: subdomain.rootdomain
  for (const root of ROOT_DOMAINS) {
    if (hostWithoutPort.endsWith(`.${root}`)) {
      const subdomain = hostWithoutPort.replace(`.${root}`, '');
      // Multi-level subdomains (e.g., "app.axiora.prism.com") - take first part
      const parts = subdomain.split('.');
      return parts[parts.length - 1]; // deepest subdomain
    }
  }
  
  // IP-based access or unknown domain → no subdomain resolution
  return null;
}

// Reserved subdomains that cannot be used by tenants
const RESERVED_SUBDOMAINS = ['admin', 'api', 'www', 'mail', 'ftp', 'status', 'docs', 'help', 'support', 'billing'];

/**
 * Subdomain Tenant Resolution Middleware
 * 
 * Runs on every request. Extracts subdomain from Host header,
 * resolves tenant from DB, and attaches context to the request.
 */
export const subdomainMiddleware = async (
  req: SubdomainRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const host = req.headers.host || req.headers['x-forwarded-host'] as string || '';
  const subdomain = extractSubdomain(host);
  
  // Default context: root domain (SuperAdmin territory)
  const context: TenantContext = {
    subdomain: null,
    tenantId: null,
    tenantName: null,
    tier: null,
    status: null,
    isSuperAdminDomain: true,
  };

  if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
    // Attempt to resolve tenant by subdomain
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain },
        select: {
          id: true,
          name: true,
          subdomain: true,
          status: true,
          settings: true,
        },
      });

      if (tenant) {
        // Parse tier from settings
        let tier = 'Enterprise Sovereign';
        try {
          const settings = JSON.parse(tenant.settings || '{}');
          tier = settings.tier || 'Enterprise Sovereign';
        } catch {}

        context.subdomain = tenant.subdomain;
        context.tenantId = tenant.id;
        context.tenantName = tenant.name;
        context.tier = tier;
        context.status = tenant.status;
        context.isSuperAdminDomain = false;

        logger.debug({ subdomain, tenantId: tenant.id, tenantName: tenant.name }, 
          'Subdomain resolved to tenant');
      } else {
        // Subdomain provided but no matching tenant found
        context.subdomain = subdomain;
        context.isSuperAdminDomain = false;
        logger.warn({ subdomain, host }, 'Subdomain does not match any registered tenant');
      }
    } catch (error) {
      logger.error({ error, subdomain }, 'Failed to resolve tenant from subdomain');
    }
  } else if (subdomain === 'admin') {
    // Explicit admin subdomain → SuperAdmin
    context.subdomain = 'admin';
    context.isSuperAdminDomain = true;
  }

  req.tenantContext = context;
  next();
};

/**
 * Middleware to require a valid tenant context.
 * Rejects requests that don't have a resolved tenant.
 */
export const requireTenantContext = (
  req: SubdomainRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.tenantContext?.tenantId) {
    res.status(404).json({
      success: false,
      error: 'Organization not found. Please verify your subdomain URL.',
      hint: 'Access your organization at: https://your-org.prism.com',
    });
    return;
  }

  if (req.tenantContext.status === 'suspended') {
    res.status(403).json({
      success: false,
      error: 'This organization has been suspended. Contact your administrator.',
    });
    return;
  }

  if (req.tenantContext.status === 'shredded_suspended') {
    res.status(410).json({
      success: false,
      error: 'This organization has been permanently deleted under DPDP compliance.',
    });
    return;
  }

  next();
};
