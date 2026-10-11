import { authenticateRequest } from './lib/auth.mjs';
import { getSettings, saveSettings } from './lib/settings.mjs';
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
  getNormalizedHeaders
} from './lib/handler-helper.mjs';

export default async function handler(req) {
  const headers = getNormalizedHeaders(req);
  const auth = await authenticateRequest({ headers });
  if (!auth.authenticated) {
    return errorResponse(auth.error, 401);
  }

  if (req.method === 'GET') {
    const settings = await getSettings();
    return jsonResponse({
      success: true,
      settings
    });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const body = await parseRequestBody(req);
    const updated = await saveSettings(body);
    return jsonResponse({
      success: true,
      message: 'Settings saved successfully',
      settings: updated
    });
  }

  return errorResponse('Method Not Allowed', 405);
}
