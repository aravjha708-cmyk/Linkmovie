import { authenticateRequest } from './lib/auth.mjs';
import {
  jsonResponse,
  errorResponse,
  getNormalizedHeaders
} from './lib/handler-helper.mjs';

export default async function handler(req) {
  const headers = getNormalizedHeaders(req);
  const auth = await authenticateRequest({ headers });

  if (!auth.authenticated) {
    return errorResponse('Unauthenticated', 401);
  }

  const isDevAuth = !process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH;

  return jsonResponse({
    success: true,
    authenticated: true,
    user: {
      id: auth.session.userId,
      role: 'admin'
    },
    expiresAt: auth.session.expiresAt,
    isDevAuth
  });
}
