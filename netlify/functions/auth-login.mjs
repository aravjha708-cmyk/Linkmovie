import {
  verifyPassword,
  checkRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
  createSessionToken,
  serializeSessionCookie
} from './lib/auth.mjs';
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
  getNormalizedHeaders,
  getClientIp
} from './lib/handler-helper.mjs';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return errorResponse('Method Not Allowed', 405);
  }

  const headers = getNormalizedHeaders(req);
  const clientIp = getClientIp(headers);

  // Rate limiting check
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return errorResponse(rateLimit.message, 429);
  }

  const body = await parseRequestBody(req);
  const { password } = body;

  if (!password) {
    return errorResponse('Password is required', 400);
  }

  const isValid = verifyPassword(password);
  if (!isValid) {
    recordFailedLogin(clientIp);
    return errorResponse('Invalid administrator credentials.', 401);
  }

  recordSuccessfulLogin(clientIp);
  const { token, expiresAt } = createSessionToken('admin');
  const cookieHeader = serializeSessionCookie(token);

  return jsonResponse(
    {
      success: true,
      message: 'Login successful',
      expiresAt
    },
    200,
    {
      'Set-Cookie': cookieHeader
    }
  );
}
