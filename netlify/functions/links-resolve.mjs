import { linksStore } from './lib/storage.mjs';
import { checkLinkViability } from './lib/links.mjs';
import { generateFlowToken } from './lib/flow.mjs';
import { recordEvent } from './lib/analytics.mjs';
import { getSettings } from './lib/settings.mjs';
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
  getNormalizedHeaders
} from './lib/handler-helper.mjs';

export default async function handler(req) {
  const headers = getNormalizedHeaders(req);
  const url = req.url ? new URL(req.url, 'http://localhost') : new URL('http://localhost');

  let code = url.searchParams.get('code');
  if (!code && req.method === 'POST') {
    const body = await parseRequestBody(req);
    code = body.code;
  }

  if (!code) {
    return errorResponse('Short code is required', 400);
  }

  const link = await linksStore.get(`link:${code}`);
  const viability = checkLinkViability(link);

  if (!viability.viable) {
    return jsonResponse(
      {
        success: false,
        viable: false,
        reason: viability.reason,
        message: viability.message,
        code
      },
      viability.reason === 'NOT_FOUND' ? 404 : 410
    );
  }

  // Record valid Step 1 visit in concurrency-safe analytics
  await recordEvent('visit', code, headers);

  const settings = await getSettings();

  // Create signed flow token for Step 1
  const flowType = link.flowType || 'two-step';
  const totalSteps = flowType === 'two-step' ? 2 : 1;
  const countdown = link.countdownStep1 || settings.defaultCountdownStep1 || 10;

  const flowToken = generateFlowToken({
    code,
    step: 1,
    flowType,
    totalSteps,
    countdown
  });

  return jsonResponse({
    success: true,
    viable: true,
    link: {
      code,
      title: link.title || 'Protected Asset Download',
      flowType,
      currentStep: 1,
      totalSteps,
      countdown
    },
    flowToken,
    branding: {
      websiteName: settings.websiteName,
      tagline: settings.tagline,
      brandColor: settings.brandColor,
      termsContent: settings.termsContent,
      privacyContent: settings.privacyContent
    },
    ads: {
      currentSlot: settings.ads.step1.enabled ? settings.ads.step1 : null,
      bannerSlot: settings.ads.banner.enabled ? settings.ads.banner : null
    }
  });
}
