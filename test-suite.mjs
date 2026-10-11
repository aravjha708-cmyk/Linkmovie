import { verifyPassword, createSessionToken, validateSessionToken, checkRateLimit } from './netlify/functions/lib/auth.mjs';
import { validateDestinationUrl, getUniqueShortCode, formatLinkRecord, checkLinkViability } from './netlify/functions/lib/links.mjs';
import { generateFlowToken, verifyFlowToken } from './netlify/functions/lib/flow.mjs';
import { recordEvent, getAggregatedAnalytics } from './netlify/functions/lib/analytics.mjs';
import { linksStore, settingsStore } from './netlify/functions/lib/storage.mjs';
import { getSettings, saveSettings } from './netlify/functions/lib/settings.mjs';

import loginHandler from './netlify/functions/auth-login.mjs';
import createLinkHandler from './netlify/functions/links-create.mjs';
import listLinksHandler from './netlify/functions/links-list.mjs';
import updateLinkHandler from './netlify/functions/links-update.mjs';
import deleteLinkHandler from './netlify/functions/links-delete.mjs';
import resolveLinkHandler from './netlify/functions/links-resolve.mjs';
import flowContinueHandler from './netlify/functions/flow-continue.mjs';
import analyticsHandler from './netlify/functions/analytics.mjs';

console.log('=== RUNNING ASSET MONETIZER TEST SUITE ===\n');

async function runTests() {
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Password Verification
  console.log('Test 1: Authentication & Password Verification');
  assert(verifyPassword('Admin@123456'), 'Default admin password verifies correctly');
  assert(!verifyPassword('WrongPassword123'), 'Incorrect password fails verification');

  // 2. Session Token Generation & Verification
  console.log('\nTest 2: HMAC Session Token Cryptography');
  const session = createSessionToken('admin');
  assert(session.token && session.token.includes('.'), 'Session token generated with signature');
  const validated = await validateSessionToken(session.token);
  assert(validated && validated.userId === 'admin', 'Valid session token validates with correct userId');
  const tamperedToken = session.token.replace(/[a-zA-Z]/, 'X');
  const tamperedValidation = await validateSessionToken(tamperedToken);
  assert(tamperedValidation === null, 'Tampered session token is rejected');

  // 3. Destination URL Security Validation
  console.log('\nTest 3: Destination URL Security Validation');
  assert(validateDestinationUrl('https://example.com/file.zip').valid, 'Valid HTTPS URL accepted');
  assert(validateDestinationUrl('http://downloads.org/archive.tar.gz?token=abc&v=1').valid, 'HTTP URL with query params accepted');
  assert(!validateDestinationUrl('javascript:alert(1)').valid, 'javascript: scheme rejected');
  assert(!validateDestinationUrl('data:text/html,bad').valid, 'data: scheme rejected');
  assert(!validateDestinationUrl('file:///etc/passwd').valid, 'file: scheme rejected');
  assert(!validateDestinationUrl('not-a-url').valid, 'Invalid string format rejected');

  // 4. Short Code Generation & Uniqueness
  console.log('\nTest 4: Short Code Generation & Reserved Path Safety');
  const codeRes = await getUniqueShortCode();
  assert(codeRes.valid && codeRes.code.length >= 6, `Auto-generated code generated: ${codeRes.code}`);
  const customReserved = await getUniqueShortCode('admin');
  assert(!customReserved.valid, 'Reserved code "admin" is rejected');
  const customApi = await getUniqueShortCode('api');
  assert(!customApi.valid, 'Reserved code "api" is rejected');

  // 5. Link Creation API
  console.log('\nTest 5: Link Creation API');
  await linksStore.delete('link:testasset1');
  const { token: adminToken } = createSessionToken('admin');
  const authHeaders = {
    Cookie: `admin_session_token=${adminToken}`,
    'Content-Type': 'application/json'
  };

  const createReq = new Request('http://localhost/api/links-create', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      destinationUrl: 'https://example.com/downloads/asset-pack.zip',
      customCode: 'testasset1',
      title: '3D Test Model Pack',
      status: 'active',
      flowType: 'two-step',
      countdownStep1: 5,
      countdownStep2: 5
    })
  });

  const createRes = await createLinkHandler(createReq);
  assert(createRes.status === 201, 'Link creation returned 201 Created');
  const createdJson = await createRes.json();
  assert(createdJson.link.code === 'testasset1', 'Link code correctly saved as testasset1');

  // 6. Duplicate Custom Code Rejection
  console.log('\nTest 6: Duplicate Code Rejection');
  const dupReq = new Request('http://localhost/api/links-create', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      destinationUrl: 'https://example.com/downloads/other.zip',
      customCode: 'testasset1'
    })
  });
  const dupRes = await createLinkHandler(dupReq);
  assert(dupRes.status === 400, 'Duplicate custom code rejected with 400 Bad Request');

  // 7. Unauthenticated Admin API Protection
  console.log('\nTest 7: Unauthenticated Admin Request Protection');
  const unauthReq = new Request('http://localhost/api/links-create', {
    method: 'POST',
    body: JSON.stringify({ destinationUrl: 'https://example.com/asset.zip' })
  });
  const unauthRes = await createLinkHandler(unauthReq);
  assert(unauthRes.status === 401, 'Unauthenticated request correctly rejected with 401 Unauthorized');

  // 8. Public Link Resolution (Step 1 & Step 2 URLs)
  console.log('\nTest 8: Public Link Resolution & Flow Initialization');
  const resolveReq = new Request('http://localhost/api/links-resolve?code=testasset1', {
    method: 'GET'
  });
  const resolveRes = await resolveLinkHandler(resolveReq);
  assert(resolveRes.status === 200, 'Public link resolves with 200 OK');
  const resolveJson = await resolveRes.json();
  assert(resolveJson.viable === true, 'Link is marked viable');
  assert(resolveJson.link.currentStep === 1, 'Current step initialized to 1');
  assert(resolveJson.flowToken, 'Signed flow token returned');
  assert(resolveJson.destinationUrl === undefined, 'Original destination URL is NOT exposed to client in step 1');

  // Verify separate Step 2 URL resolution (?code=testasset1&step=2)
  const resolveStep2Req = new Request('http://localhost/api/links-resolve?code=testasset1&step=2', {
    method: 'GET'
  });
  const resolveStep2Res = await resolveLinkHandler(resolveStep2Req);
  assert(resolveStep2Res.status === 200, 'Step 2 URL resolves with 200 OK');
  const resolveStep2Json = await resolveStep2Res.json();
  assert(resolveStep2Json.link.currentStep === 2, 'Step 2 resolution correctly sets currentStep to 2');

  // 9. Two-Step Monetization Flow Progression
  console.log('\nTest 9: Two-Step Flow Verification');
  // Wait small tick or mock time for test verification
  const tokenPayload = {
    code: 'testasset1',
    step: 1,
    flowType: 'two-step',
    totalSteps: 2,
    countdown: 0.1 // small for instant test execution
  };
  const testFlowToken = generateFlowToken(tokenPayload);

  // Small delay to satisfy countdown elapsed requirement
  await new Promise((r) => setTimeout(r, 150));

  const contReq = new Request('http://localhost/api/flow-continue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'testasset1',
      flowToken: testFlowToken,
      step: 1
    })
  });
  const contRes = await flowContinueHandler(contReq);
  assert(contRes.status === 200, 'Step 1 continuation succeeded');
  const contJson = await contRes.json();
  assert(contJson.completed === false, 'Not marked completed yet (2-step flow)');
  assert(contJson.nextStep === 2, 'Advanced to Step 2');
  assert(contJson.flowToken, 'Step 2 signed token generated');

  // Now complete Step 2
  const step2TokenPayload = {
    code: 'testasset1',
    step: 2,
    flowType: 'two-step',
    totalSteps: 2,
    countdown: 0.1
  };
  const testStep2Token = generateFlowToken(step2TokenPayload);
  await new Promise((r) => setTimeout(r, 150));

  const cont2Req = new Request('http://localhost/api/flow-continue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'testasset1',
      flowToken: testStep2Token,
      step: 2
    })
  });
  const cont2Res = await flowContinueHandler(cont2Req);
  assert(cont2Res.status === 200, 'Step 2 continuation succeeded');
  const cont2Json = await cont2Res.json();
  assert(cont2Json.completed === true, 'Flow marked completed');
  assert(cont2Json.destinationUrl === 'https://example.com/downloads/asset-pack.zip', 'Verified destination URL released upon final step');

  // 10. Disabled Link Behavior
  console.log('\nTest 10: Disabled Link Resolution');
  await updateLinkHandler(new Request('http://localhost/api/links-update', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ code: 'testasset1', status: 'disabled' })
  }));

  const disabledRes = await resolveLinkHandler(new Request('http://localhost/api/links-resolve?code=testasset1'));
  assert(disabledRes.status === 410, 'Disabled link returns 410 Gone');
  const disabledJson = await disabledRes.json();
  assert(disabledJson.reason === 'DISABLED', 'Reason correctly identified as DISABLED');

  // 11. Concurrency-Safe Analytics
  console.log('\nTest 11: Real Analytics Calculation');
  const analyticsReq = new Request('http://localhost/api/analytics', {
    headers: authHeaders
  });
  const analyticsRes = await analyticsHandler(analyticsReq);
  assert(analyticsRes.status === 200, 'Analytics retrieved successfully');
  const analyticsJson = await analyticsRes.json();
  assert(analyticsJson.overview.totalLinks >= 1, 'Analytics reflects stored links');
  assert(analyticsJson.funnel !== undefined, 'Analytics includes funnel progression data');

  // 12. Settings Persistence
  console.log('\nTest 12: Settings Persistence');
  await saveSettings({ websiteName: 'MoviesHouse4u' });
  const settings = await getSettings();
  assert(settings.websiteName === 'MoviesHouse4u', 'Custom setting persisted in store');

  // Clean up test link
  await deleteLinkHandler(new Request('http://localhost/api/links-delete', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ code: 'testasset1' })
  }));
  const afterDeleteRes = await resolveLinkHandler(new Request('http://localhost/api/links-resolve?code=testasset1'));
  assert(afterDeleteRes.status === 404, 'Deleted link returns 404 Not Found');

  console.log(`\n=== ALL ${passed}/${total} TESTS PASSED SUCCESSFULLY! ===`);
}

runTests().catch((err) => {
  console.error('\nTest run failed with error:', err);
  process.exit(1);
});
