const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}/${endpoint.replace(/^\//, '')}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers || {})
    },
    credentials: 'include' // Send and receive cookies
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `HTTP error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (password) => request('auth-login', { method: 'POST', body: { password } }),
  logout: () => request('auth-logout', { method: 'POST' }),
  checkSession: () => request('auth-session', { method: 'GET' }),

  // Links
  createLink: (linkData) => request('links-create', { method: 'POST', body: linkData }),
  getLinks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`links-list${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },
  updateLink: (linkData) => request('links-update', { method: 'POST', body: linkData }),
  deleteLink: (code) => request('links-delete', { method: 'POST', body: { code } }),

  // Flow & Resolver
  resolveLink: (code) => request(`links-resolve?code=${encodeURIComponent(code)}`, { method: 'GET' }),
  continueFlow: (flowData) => request('flow-continue', { method: 'POST', body: flowData }),

  // Analytics & Settings
  getAnalytics: () => request('analytics', { method: 'GET' }),
  getSettings: () => request('settings', { method: 'GET' }),
  saveSettings: (settingsData) => request('settings', { method: 'POST', body: settingsData })
};
