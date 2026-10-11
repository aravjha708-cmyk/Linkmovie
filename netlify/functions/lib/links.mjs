import crypto from 'node:crypto';
import { linksStore } from './storage.mjs';

const RESERVED_CODES = new Set([
  'admin', 'api', 'login', 'logout', 'settings', 'analytics',
  'assets', 'favicon', 'favicon.ico', 'index', 'robots', 'robots.txt',
  'sitemap', 'sitemap.xml', 'public', 'step', 'download', 'preview',
  'terms', 'privacy', 'about', 'contact', 'dashboard', 'links', 'create'
]);

const CODE_CHARS = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a cryptographically random, URL-safe short code
 */
export function generateShortCode(length = 6) {
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return code;
}

/**
 * Validate and sanitize a destination URL
 */
export function validateDestinationUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, error: 'Destination URL is required.' };
  }

  const trimmed = urlString.trim();
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    return { valid: false, error: 'Invalid URL format. Please include http:// or https://' };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are permitted.' };
  }

  // Reject dangerous schemes or localhost in non-dev if needed
  if (parsed.hostname.toLowerCase() === 'javascript' || parsed.username || parsed.password) {
    return { valid: false, error: 'Unsafe URL format.' };
  }

  return { valid: true, url: parsed.toString() };
}

/**
 * Validate custom short code
 */
export function validateCustomCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Custom code cannot be empty.' };
  }

  const trimmed = code.trim();
  if (trimmed.length < 3 || trimmed.length > 30) {
    return { valid: false, error: 'Short code must be between 3 and 30 characters.' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Short code can only contain letters, numbers, hyphens, and underscores.' };
  }

  if (RESERVED_CODES.has(trimmed.toLowerCase())) {
    return { valid: false, error: `The code "${trimmed}" is reserved for system use.` };
  }

  return { valid: true, code: trimmed };
}

/**
 * Check if a short code is already taken in the store
 */
export async function isCodeAvailable(code) {
  const existing = await linksStore.get(`link:${code}`);
  return !existing;
}

/**
 * Generate a guaranteed unique short code
 */
export async function getUniqueShortCode(customCode = null) {
  if (customCode) {
    const val = validateCustomCode(customCode);
    if (!val.valid) return val;
    const available = await isCodeAvailable(val.code);
    if (!available) {
      return { valid: false, error: `The custom code "${val.code}" is already in use.` };
    }
    return { valid: true, code: val.code };
  }

  // Auto-generate code
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateShortCode(6);
    if (!RESERVED_CODES.has(candidate.toLowerCase())) {
      const available = await isCodeAvailable(candidate);
      if (available) {
        return { valid: true, code: candidate };
      }
    }
  }

  // Fallback to 7 characters if collisions happen
  const candidate7 = generateShortCode(7);
  return { valid: true, code: candidate7 };
}

/**
 * Format link record with defaults and safety checks
 */
export function formatLinkRecord(raw) {
  return {
    code: raw.code,
    destinationUrl: raw.destinationUrl,
    title: raw.title || 'Protected Asset Download',
    status: raw.status === 'disabled' ? 'disabled' : 'active',
    flowType: raw.flowType === 'two-step' ? 'two-step' : 'one-step',
    countdownStep1: Math.max(3, Math.min(60, parseInt(raw.countdownStep1, 10) || 10)),
    countdownStep2: Math.max(3, Math.min(60, parseInt(raw.countdownStep2, 10) || 8)),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: raw.expiresAt ? new Date(raw.expiresAt).toISOString() : null,
    totalVisits: raw.totalVisits || 0,
    todayVisits: raw.todayVisits || 0,
    step2Visits: raw.step2Visits || 0,
    redirects: raw.redirects || 0,
    lastVisitedAt: raw.lastVisitedAt || null
  };
}

/**
 * Check if a link is active and valid to resolve
 */
export function checkLinkViability(link) {
  if (!link) {
    return { viable: false, reason: 'NOT_FOUND', message: 'This short link does not exist.' };
  }

  if (link.status === 'disabled') {
    return { viable: false, reason: 'DISABLED', message: 'This link has been disabled by the administrator.' };
  }

  if (link.expiresAt) {
    const exp = new Date(link.expiresAt).getTime();
    if (Date.now() > exp) {
      return { viable: false, reason: 'EXPIRED', message: 'This link has expired.' };
    }
  }

  return { viable: true };
}
