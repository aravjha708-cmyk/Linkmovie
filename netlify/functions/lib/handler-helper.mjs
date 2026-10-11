/**
 * Standard HTTP JSON Response helper
 */
export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...headers
    }
  });
}

/**
 * Standard HTTP Error Response helper
 */
export function errorResponse(message, status = 400, details = null) {
  return jsonResponse(
    {
      success: false,
      error: message,
      ...(details ? { details } : {})
    },
    status
  );
}

/**
 * Helper to parse JSON body safely from standard Request or Netlify event
 */
export async function parseRequestBody(requestOrEvent) {
  if (!requestOrEvent) return {};

  // Standard Web API Request
  if (typeof requestOrEvent.json === 'function') {
    try {
      const text = await requestOrEvent.text();
      return text ? JSON.parse(text) : {};
    } catch (err) {
      return {};
    }
  }

  // Netlify v1 event
  if (typeof requestOrEvent.body === 'string') {
    try {
      return JSON.parse(requestOrEvent.body);
    } catch (err) {
      return {};
    }
  }

  if (typeof requestOrEvent.body === 'object' && requestOrEvent.body !== null) {
    return requestOrEvent.body;
  }

  return {};
}

/**
 * Normalize headers to lowercase key-value map
 */
export function getNormalizedHeaders(requestOrEvent) {
  const map = {};
  if (!requestOrEvent) return map;

  if (requestOrEvent.headers) {
    if (typeof requestOrEvent.headers.forEach === 'function') {
      requestOrEvent.headers.forEach((val, key) => {
        map[key.toLowerCase()] = val;
      });
      return map;
    }
    for (const [k, v] of Object.entries(requestOrEvent.headers)) {
      map[k.toLowerCase()] = v;
    }
  }
  return map;
}

/**
 * Extract client IP from headers
 */
export function getClientIp(headers) {
  return (
    headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    headers['client-ip'] ||
    headers['x-real-ip'] ||
    '127.0.0.1'
  );
}
