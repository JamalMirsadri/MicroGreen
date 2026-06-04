const API_BASE = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'grow_verdant_token';
const GUEST_KEY = 'grow_verdant_guest_id';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('base44_access_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('base44_access_token', token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('base44_access_token');
  }
}

export function getGuestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!token) headers['X-Guest-Id'] = getGuestId();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  auth: {
    register: (body) => request('/api/auth/register', { method: 'POST', body }),
    login: (body) => request('/api/auth/login', { method: 'POST', body }),
    me: () => request('/api/auth/me'),
    logout: () => {
      setToken(null);
      return request('/api/auth/logout', { method: 'POST' });
    },
  },
  publicSettings: (appId) =>
    request(`/api/apps/public/prod/public-settings/by-id/${appId}`, {
      headers: { 'X-App-Id': appId },
    }),
  entities: {
    list: (name, query = {}) => {
      const params = new URLSearchParams(query).toString();
      const slug = name.toLowerCase();
      return request(`/api/entities/${slug}${params ? `?${params}` : ''}`);
    },
    filter: (name, body) =>
      request(`/api/entities/${name.toLowerCase()}/filter`, { method: 'POST', body }),
    create: (name, body) =>
      request(`/api/entities/${name.toLowerCase()}`, { method: 'POST', body }),
    update: (name, id, body) =>
      request(`/api/entities/${name.toLowerCase()}/${id}`, { method: 'PATCH', body }),
    delete: (name, id) =>
      request(`/api/entities/${name.toLowerCase()}/${id}`, { method: 'DELETE' }),
  },
  garden: {
    get: () => request('/api/garden'),
    update: (body) => request('/api/garden', { method: 'PATCH', body }),
  },
  recommendations: (body) =>
    request('/api/recommendations', { method: 'POST', body }),
  admin: {
    stats: () => request('/api/admin/stats'),
    me: () => request('/api/admin/me'),
    overview: () => request('/api/admin/overview'),
    collection: (name) => request(`/api/admin/collections/${name}`),
    saveCollection: (name, body) =>
      request(`/api/admin/collections/${name}`, { method: 'PUT', body }),
    createRecord: (name, body) =>
      request(`/api/admin/collections/${name}`, { method: 'POST', body }),
    updateRecord: (name, id, body) =>
      request(`/api/admin/collections/${name}/${id}`, { method: 'PATCH', body }),
    deleteRecord: (name, id) =>
      request(`/api/admin/collections/${name}/${id}`, { method: 'DELETE' }),
    testAi: (body) => request('/api/admin/ai/test', { method: 'POST', body }),
    testPayments: (body) => request('/api/admin/payments/test', { method: 'POST', body }),
  },
};
