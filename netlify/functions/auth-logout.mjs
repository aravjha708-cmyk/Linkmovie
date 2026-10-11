import {
  authenticateRequest,
  serializeClearCookie
} from './lib/auth.mjs';
import { sessionsStore } from './lib/storage.mjs';
import {
  jsonResponse,
  getNormalizedHeaders
} from './lib/handler-helper.mjs';

export default async function handler(req) {
  const headers = getNormalizedHeaders(req);
  const auth = await authenticateRequest({ headers });

  if (auth.authenticated && auth.session?.nonce) {
    // Revoke session token in sessions store
    await sessionsStore.set(`session:${auth.session.nonce}`, {
      revoked: true,
      revokedAt: new Date().toISOString()
    }).catch(() => {});
  }

  const clearCookieHeader = serializeClearCookie();

  return jsonResponse(
    {
      success: true,
      message: 'Logged out successfully'
    },
    200,
    {
      'Set-Cookie': clearCookieHeader
    }
  );
}
