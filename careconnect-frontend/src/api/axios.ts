import axios from 'axios';
import { AUTH_CHANGE_EVENT } from '@/routes/logout';
import { clearAuthStorage, getToken } from '@/store/authStorage';

/** Empty baseURL in dev → Vite proxies /api to localhost:8088 (see vite.config.ts) */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
});

const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password'];

api.interceptors.request.use((config) => {
  const url = config.url ?? '';
  const isPublic = PUBLIC_PATHS.some((path) => url.includes(path));

  if (!isPublic) {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else if (config.headers) {
    delete config.headers.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    }
    return Promise.reject(error);
  },
);
