import { linksStore } from './lib/storage.mjs';
import { checkLinkViability } from './lib/links.mjs';
import { verifyFlowToken, generateFlowToken } from './lib/flow.mjs';
import { recordEvent } from './lib/analytics.mjs';
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
  const body = await parseRequestBody(req);
  const { code, flowToken, step } = body;

  if (!code || !flowToken || !step) {
    return errorResponse('Missing required flow parameters.', 400);
  }

  const link = await linksStore.get(`link:${code}`);
  const viability = checkLinkViability(link);
  if (!viability.viable) {
    return jsonResponse(
      {
        success: false,
        viable: false,
        reason: viability.reason,
        message: viability.message
      },
      410
    );
  }

  // Verify the submitted flow token
  const stepInt = parseInt(step, 10);
  const tokenVal = verifyFlowToken(flowToken, code, stepInt);
  if (!tokenVal.valid) {
    return errorResponse(tokenVal.error, 403);
  }

  const settings = await getSettings();
  const flowType = link.flowType || 'two-step';

  // If two-step flow and visitor just completed Step 1
  if (flowType === 'two-step' && stepInt === 1) {
    // Record step 2 progression in analytics
    await recordEvent('step2', code, headers);

    const countdown = link.countdownStep2 || settings.defaultCountdownStep2 || 8;
    const nextFlowToken = generateFlowToken({
      code,
      step: 2,
      flowType: 'two-step',
      totalSteps: 2,
      countdown
    });

    return jsonResponse({
      success: true,
      completed: false,
      nextStep: 2,
      totalSteps: 2,
      countdown,
      flowToken: nextFlowToken,
      ads: {
        currentSlot: settings.ads?.step2 || {
          enabled: true,
          title: '⚡ High Speed 10 Gbps Direct Download Mirror',
          type: 'banner',
          targetUrl: 'https://www.profitableratecpmnetwork.com/ifb7beykcq?key=f0b9f9ff2e842f19400e1dc3b9da33e8'
        },
        bannerSlot: settings.ads?.banner || {
          enabled: true,
          title: 'Verified 4K High Speed Cloud Sponsor',
          type: 'banner',
          targetUrl: 'https://www.profitableratecpmnetwork.com/ifb7beykcq?key=f0b9f9ff2e842f19400e1dc3b9da33e8'
        }
      }
    });
  }

  // Final step completed: Record redirect and return verified destination URL
  await recordEvent('redirect', code, headers);

  return jsonResponse({
    success: true,
    completed: true,
    destinationUrl: link.destinationUrl,
    message: 'Monetization flow completed. Redirecting to destination asset.'
  });
}
