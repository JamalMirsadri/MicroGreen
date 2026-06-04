import { api, getToken, setToken } from './apiClient';
import { appParams } from '@/lib/app-params';

// Local API client (Base44-compatible surface for auth)
export const base44 = {
  auth: {
    me: () => {
      if (!getToken()) {
        const err = new Error('Not authenticated');
        err.status = 401;
        return Promise.reject(err);
      }
      return api.auth.me();
    },
    logout: (redirectUrl) => {
      setToken(null);
      if (redirectUrl) {
        window.location.href = '/';
      }
    },
    redirectToLogin: () => {
      window.location.href = '/login';
    },
    login: api.auth.login,
    register: api.auth.register,
  },
  entities: {
    Product: {
      list: (query) => api.entities.list('Product', query),
      filter: (body) => api.entities.filter('Product', body),
      create: (body) => api.entities.create('Product', body),
      update: (id, body) => api.entities.update('Product', id, body),
      delete: (id) => api.entities.delete('Product', id),
    },
    Order: {
      list: (query) => api.entities.list('Order', query),
      create: (body) => api.entities.create('Order', body),
      update: (id, body) => api.entities.update('Order', id, body),
    },
    UserGarden: {
      list: (query) => api.entities.list('UserGarden', query),
      create: (body) => api.entities.create('UserGarden', body),
      update: (id, body) => api.entities.update('UserGarden', id, body),
    },
    QuizResult: {
      list: (query) => api.entities.list('QuizResult', query),
      create: (body) => api.entities.create('QuizResult', body),
    },
  },
  appParams,
};

export { api };
