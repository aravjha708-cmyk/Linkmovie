import crypto from 'node:crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret_change_in_production_998877';
const FLOW_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes to complete the flow

/**
 * Generate a cryptographically signed flow token
 */
export function generateFlowToken(payload) {
  const data = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + FLOW_TOKEN_TTL_MS,
    nonce: crypto.randomBytes(8).toString('hex')
  };

  const payloadString = JSON.stringify(data);
  const base64Payload = Buffer.from(payloadString, 'utf-8').toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(base64Payload).digest('hex');

  return `${base64Payload}.${signature}`;
}

/**
 * Verify flow token and return decoded payload
 */
export function verifyFlowToken(tokenString, expectedCode, expectedStep) {
  if (!tokenString || typeof tokenString !== 'string') {
    return { valid: false, error: 'Missing flow validation token.' };
  }

  const parts = tokenString.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed flow token.' };
  }

  const [base64Payload, signature] = parts;
  try {
    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(base64Payload).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false, error: 'Invalid flow signature. Flow cannot be verified.' };
    }

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf-8'));
    const now = Date.now();

    if (now > payload.exp) {
      return { valid: false, error: 'Flow session expired. Please refresh and try again.' };
    }

    if (payload.code !== expectedCode) {
      return { valid: false, error: 'Token code mismatch.' };
    }

    if (expectedStep !== undefined && payload.step !== expectedStep) {
      return { valid: false, error: `Invalid step sequence. Expected step ${expectedStep}, got ${payload.step}.` };
    }

    // Minimum elapsed time check to prevent script bypass
    // Allow a tolerance (countdown * 0.7s) to accommodate minor network/client clock deviations
    const elapsedSeconds = (now - payload.iat) / 1000;
    const requiredMinSeconds = Math.max(0, (payload.countdown || 5) * 0.7);

    if (elapsedSeconds < requiredMinSeconds) {
      return {
        valid: false,
        error: `Please wait for the timer to finish before proceeding. (${Math.ceil(requiredMinSeconds - elapsedSeconds)}s remaining)`
      };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Failed to verify flow token.' };
  }
}
