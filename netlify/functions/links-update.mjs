import { authenticateRequest } from './lib/auth.mjs';
import { validateDestinationUrl } from './lib/links.mjs';
import { linksStore } from './lib/storage.mjs';
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
  getNormalizedHeaders
} from './lib/handler-helper.mjs';

export default async function handler(req) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return errorResponse('Method Not Allowed', 405);
  }

  const headers = getNormalizedHeaders(req);
  const auth = await authenticateRequest({ headers });
  if (!auth.authenticated) {
    return errorResponse(auth.error, 401);
  }

  const body = await parseRequestBody(req);
  const { code, destinationUrl, title, status, flowType, countdownStep1, countdownStep2, expiresAt } = body;

  if (!code) {
    return errorResponse('Missing link code', 400);
  }

  const existing = await linksStore.get(`link:${code}`);
  if (!existing) {
    return errorResponse('Link not found', 404);
  }

  if (destinationUrl) {
    const urlVal = validateDestinationUrl(destinationUrl);
    if (!urlVal.valid) {
      return errorResponse(urlVal.error, 400);
    }
    existing.destinationUrl = urlVal.url;
  }

  if (title !== undefined) existing.title = title.trim();
  if (status !== undefined) existing.status = status === 'disabled' ? 'disabled' : 'active';
  if (flowType !== undefined) existing.flowType = flowType === 'one-step' ? 'one-step' : 'two-step';
  if (countdownStep1 !== undefined) existing.countdownStep1 = Math.max(3, Math.min(60, parseInt(countdownStep1, 10) || 10));
  if (countdownStep2 !== undefined) existing.countdownStep2 = Math.max(3, Math.min(60, parseInt(countdownStep2, 10) || 8));
  if (expiresAt !== undefined) existing.expiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;

  existing.updatedAt = new Date().toISOString();

  await linksStore.set(`link:${code}`, existing);

  return jsonResponse({
    success: true,
    message: 'Link updated successfully',
    link: existing
  });
}
