import { authenticateRequest } from './lib/auth.mjs';
import {
  validateDestinationUrl,
  getUniqueShortCode,
  formatLinkRecord
} from './lib/links.mjs';
import { linksStore } from './lib/storage.mjs';
import { getSettings } from './lib/settings.mjs';
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
  getNormalizedHeaders
} from './lib/handler-helper.mjs';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return errorResponse('Method Not Allowed', 405);
  }

  const headers = getNormalizedHeaders(req);
  const auth = await authenticateRequest({ headers });
  if (!auth.authenticated) {
    return errorResponse(auth.error, 401);
  }

  const body = await parseRequestBody(req);
  const {
    destinationUrl,
    customCode,
    title,
    status,
    flowType,
    countdownStep1,
    countdownStep2,
    expiresAt
  } = body;

  // Validate destination URL
  const urlVal = validateDestinationUrl(destinationUrl);
  if (!urlVal.valid) {
    return errorResponse(urlVal.error, 400);
  }

  // Validate or generate short code
  const codeVal = await getUniqueShortCode(customCode);
  if (!codeVal.valid) {
    return errorResponse(codeVal.error, 400);
  }

  const settings = await getSettings();

  const newLink = formatLinkRecord({
    code: codeVal.code,
    destinationUrl: urlVal.url,
    title: title?.trim() || 'Download Asset',
    status: status === 'disabled' ? 'disabled' : 'active',
    flowType: flowType === 'one-step' ? 'one-step' : (flowType === 'two-step' ? 'two-step' : settings.defaultFlowType),
    countdownStep1: countdownStep1 || settings.defaultCountdownStep1,
    countdownStep2: countdownStep2 || settings.defaultCountdownStep2,
    expiresAt: expiresAt || null
  });

  await linksStore.set(`link:${newLink.code}`, newLink);

  return jsonResponse(
    {
      success: true,
      message: 'Short link created successfully',
      link: newLink
    },
    201
  );
}
