import { authenticateRequest } from './lib/auth.mjs';
import { linksStore } from './lib/storage.mjs';
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
  getNormalizedHeaders
} from './lib/handler-helper.mjs';

export default async function handler(req) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return errorResponse('Method Not Allowed', 405);
  }

  const headers = getNormalizedHeaders(req);
  const auth = await authenticateRequest({ headers });
  if (!auth.authenticated) {
    return errorResponse(auth.error, 401);
  }

  const body = await parseRequestBody(req);
  const url = req.url ? new URL(req.url, 'http://localhost') : new URL('http://localhost');
  const code = body.code || url.searchParams.get('code');

  if (!code) {
    return errorResponse('Missing link code', 400);
  }

  const existing = await linksStore.get(`link:${code}`);
  if (!existing) {
    return errorResponse('Link not found', 404);
  }

  await linksStore.delete(`link:${code}`);

  return jsonResponse({
    success: true,
    message: `Link "${code}" deleted successfully.`
  });
}
