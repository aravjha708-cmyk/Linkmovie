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

  const stepParam = url.searchParams.get('step');
  const isStep2 = stepParam === '2';

  // Only record top-of-funnel raw visit if not an explicit step 2 resolve
  if (!isStep2) {
    await recordEvent('visit', code, headers);
  }

  const settings = await getSettings();

  const flowType = link.flowType || 'two-step';
  const totalSteps = flowType === 'two-step' ? 2 : 1;
  const currentStep = isStep2 && totalSteps > 1 ? 2 : 1;
  const countdown = currentStep === 2
    ? (link.countdownStep2 || settings.defaultCountdownStep2 || 8)
    : (link.countdownStep1 || settings.defaultCountdownStep1 || 10);

  const flowToken = generateFlowToken({
    code,
    step: currentStep,
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
      currentStep,
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
      currentSlot: currentStep === 2 ? (settings.ads?.step2 || {
        enabled: true,
        title: '⚡ High Speed 10 Gbps Direct Download Mirror',
        type: 'banner',
        targetUrl: 'https://www.profitableratecpmnetwork.com/ifb7beykcq?key=f0b9f9ff2e842f19400e1dc3b9da33e8'
      }) : (settings.ads?.step1 || {
        enabled: true,
        title: '⚡ Fast Server 4K Streaming & Cloud Mirror',
        type: 'banner',
        targetUrl: 'https://www.profitableratecpmnetwork.com/ifb7beykcq?key=f0b9f9ff2e842f19400e1dc3b9da33e8'
      }),
      bannerSlot: settings.ads?.banner || {
        enabled: true,
        title: 'Verified 4K High Speed Cloud Sponsor',
        type: 'banner',
        targetUrl: 'https://www.profitableratecpmnetwork.com/ifb7beykcq?key=f0b9f9ff2e842f19400e1dc3b9da33e8'
      }
    }
  });
}
