import crypto from 'node:crypto';
import * as cookieModule from 'cookie';
import { sessionsStore } from './storage.mjs';

// Environment variables or development defaults
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret_change_in_production_998877';
const SESSION_COOKIE_NAME = 'admin_session_token';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting in-memory map: IP -> { attempts: number, lockUntil: number }
const loginAttempts = new Map();

/**
 * Hash password with PBKDF2
 */
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored password or hash
 */
export function verifyPassword(inputPassword) {
  if (process.env.ADMIN_PASSWORD_HASH) {
    const [salt, expectedHash] = process.env.ADMIN_PASSWORD_HASH.split(':');
    if (!salt || !expectedHash) return false;
    const computedHash = crypto.pbkdf2Sync(inputPassword, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedHash));
  }

  // Plain ADMIN_PASSWORD environment variable or dev default with timingSafeEqual
  const expectedBuf = Buffer.from(ADMIN_PASSWORD);
  const inputBuf = Buffer.from(inputPassword);
  if (expectedBuf.length !== inputBuf.length) {
    // Constant time dummy comparison
    crypto.timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, inputBuf);
}

/**
 * Rate limiting check
 */
export function checkRateLimit(clientIp) {
  const ip = clientIp || 'unknown';
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    if (record.lockUntil && now < record.lockUntil) {
      const waitSeconds = Math.ceil((record.lockUntil - now) / 1000);
      return { allowed: false, message: `Too many login attempts. Please try again in ${waitSeconds} seconds.` };
    }
    if (record.lockUntil && now >= record.lockUntil) {
      loginAttempts.delete(ip);
    }
  }

  return { allowed: true };
}

export function recordFailedLogin(clientIp) {
  const ip = clientIp || 'unknown';
  const now = Date.now();
  const record = loginAttempts.get(ip) || { attempts: 0, lockUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= 5) {
    record.lockUntil = now + 15 * 60 * 1000; // 15 minutes lockout
  }
  loginAttempts.set(ip, record);
}

export function recordSuccessfulLogin(clientIp) {
  const ip = clientIp || 'unknown';
  loginAttempts.delete(ip);
}

/**
 * Create a cryptographically signed session token
 */
export function createSessionToken(userId = 'admin') {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${userId}:${expiresAt}:${nonce}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const token = Buffer.from(payload).toString('base64url') + '.' + hmac;
  return { token, expiresAt };
}

/**
 * Validate session token
 */
export async function validateSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, receivedHmac] = parts;
  try {
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))) {
      return null;
    }

    const [userId, expiresAtStr, nonce] = payload.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return null;
    }

    // Check if session was explicitly revoked in sessions store
    const sessionRecord = await sessionsStore.get(`session:${nonce}`);
    if (sessionRecord && sessionRecord.revoked) {
      return null;
    }

    return { userId, expiresAt, nonce };
  } catch (err) {
    return null;
  }
}

/**
 * Parse cookies from request headers
 */
export function parseCookies(headers) {
  const cookieHeader = headers.cookie || headers.Cookie || '';
  return cookieModule.parse ? cookieModule.parse(cookieHeader) : {};
}

/**
 * Create Set-Cookie header string for session
 */
export function serializeSessionCookie(token, maxAgeSeconds = 86400) {
  const isProd = process.env.NODE_ENV === 'production' || process.env.CONTEXT === 'production';
  return cookieModule.serialize(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: maxAgeSeconds
  });
}

/**
 * Create Set-Cookie header string to clear session
 */
export function serializeClearCookie() {
  const isProd = process.env.NODE_ENV === 'production' || process.env.CONTEXT === 'production';
  return cookieModule.serialize(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });
}

/**
 * Middleware helper for authenticating Netlify Functions
 */
export async function authenticateRequest(req) {
  const headers = req.headers || {};
  const cookies = parseCookies(headers);
  const token = cookies[SESSION_COOKIE_NAME] || (headers.authorization ? headers.authorization.replace(/^Bearer\s+/i, '') : null);

  if (!token) {
    return { authenticated: false, error: 'Unauthorized: Missing session token.' };
  }

  const session = await validateSessionToken(token);
  if (!session) {
    return { authenticated: false, error: 'Unauthorized: Session invalid or expired.' };
  }

  return { authenticated: true, session };
}
