import { useCallback, useSyncExternalStore } from 'react';
import { authApi } from '@/api';
import { AUTH_STORAGE_KEYS, clearAuthStorage, TOKEN_KEY } from './authStorage';
import type { LoginResponse, UserRole } from '@/types';
import { AUTH_CHANGE_EVENT } from '@/routes/logout';
import { getRoleFromToken, normalizeRole } from '@/utils/jwt';

export { clearAuthStorage } from './authStorage';

export interface AuthSession {
  token: string | null;
  userId: number | null;
  role: UserRole | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

const EMPTY_SESSION: AuthSession = {
  token: null,
  userId: null,
  role: null,
  email: null,
  firstName: null,
  lastName: null,
};

/** Cached snapshot — useSyncExternalStore requires stable reference between reads */
let cachedSnapshot: AuthSession = EMPTY_SESSION;
let cachedSerialized = '';

function readSession(): AuthSession {
  const token = localStorage.getItem(TOKEN_KEY);
  const userIdRaw = localStorage.getItem(AUTH_STORAGE_KEYS.userId);
  const roleRaw = localStorage.getItem(AUTH_STORAGE_KEYS.role);

  if (!token) {
    return EMPTY_SESSION;
  }

  return {
    token,
    userId: userIdRaw ? Number(userIdRaw) : null,
    role: normalizeRole(roleRaw),
    email: localStorage.getItem(AUTH_STORAGE_KEYS.email),
    firstName: localStorage.getItem(AUTH_STORAGE_KEYS.firstName),
    lastName: localStorage.getItem(AUTH_STORAGE_KEYS.lastName),
  };
}

function getSessionSnapshot(): AuthSession {
  const next = readSession();
  const serialized = JSON.stringify(next);

  if (serialized === cachedSerialized) {
    return cachedSnapshot;
  }

  cachedSerialized = serialized;
  cachedSnapshot = next;
  return cachedSnapshot;
}

function invalidateSessionCache(): void {
  cachedSerialized = '';
  cachedSnapshot = EMPTY_SESSION;
}

function persistSession(data: LoginResponse, token: string, role: UserRole): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.userId, String(data.userId));
  localStorage.setItem(AUTH_STORAGE_KEYS.role, role);
  localStorage.setItem(AUTH_STORAGE_KEYS.email, data.email);
  localStorage.setItem(AUTH_STORAGE_KEYS.firstName, data.firstName);
  localStorage.setItem(AUTH_STORAGE_KEYS.lastName, data.lastName);
  invalidateSessionCache();
}

function notifyAuthChange(): void {
  invalidateSessionCache();
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function subscribe(listener: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, listener);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, listener);
}

export function useAuth() {
  const session = useSyncExternalStore(subscribe, getSessionSnapshot, () => EMPTY_SESSION);

  const login = useCallback(async (email: string, password: string): Promise<UserRole> => {
    clearAuthStorage();
    invalidateSessionCache();
    const { data } = await authApi.login({ email, password });
    const role = normalizeRole(data.role) ?? getRoleFromToken(data.token);

    if (!role) {
      throw new Error('Invalid email or password');
    }

    persistSession(data, data.token, role);
    notifyAuthChange();
    return role;
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    invalidateSessionCache();
    notifyAuthChange();
  }, []);

  const isAuthenticated = Boolean(session.token && session.role);

  return {
    ...session,
    isAuthenticated,
    login,
    logout,
  };
}
