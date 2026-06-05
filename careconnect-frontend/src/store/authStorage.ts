export const TOKEN_KEY = 'cc_token';
export const USER_DISPLAY_KEY = 'cc_user';

export const AUTH_STORAGE_KEYS = {
  userId: 'cc_userId',
  role: 'cc_role',
  email: 'cc_email',
  firstName: 'cc_firstName',
  lastName: 'cc_lastName',
} as const;

const ALL_AUTH_KEYS = [TOKEN_KEY, USER_DISPLAY_KEY, ...Object.values(AUTH_STORAGE_KEYS), 'cc-auth'] as const;

function clearStorageKeys(storage: Storage): void {
  ALL_AUTH_KEYS.forEach((key) => storage.removeItem(key));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

/** Returns the storage backend that holds the active session, if any. */
export function getActiveAuthStorage(): Storage | null {
  if (localStorage.getItem(TOKEN_KEY)) return localStorage;
  if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage;
  return null;
}

export function getAuthItem(key: string): string | null {
  const active = getActiveAuthStorage();
  if (active) return active.getItem(key);
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

export function getAuthStorageForWrite(remember: boolean): Storage {
  return remember ? localStorage : sessionStorage;
}

export function clearAuthStorage(): void {
  clearStorageKeys(localStorage);
  clearStorageKeys(sessionStorage);
}

export function hasStoredSession(): boolean {
  return Boolean(getToken() && getAuthItem(AUTH_STORAGE_KEYS.role));
}

export interface PersistAuthSessionInput {
  token: string;
  userId: number;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
  displayRole?: string;
  displayName?: string;
}

export function persistAuthSession(data: PersistAuthSessionInput, remember: boolean): void {
  const target = getAuthStorageForWrite(remember);
  const other = remember ? sessionStorage : localStorage;

  clearStorageKeys(other);

  target.setItem(TOKEN_KEY, data.token);
  target.setItem(AUTH_STORAGE_KEYS.userId, String(data.userId));
  target.setItem(AUTH_STORAGE_KEYS.role, data.displayRole ?? data.role);
  target.setItem(AUTH_STORAGE_KEYS.email, data.email);
  target.setItem(AUTH_STORAGE_KEYS.firstName, data.firstName);
  target.setItem(AUTH_STORAGE_KEYS.lastName, data.lastName);

  if (data.displayName) {
    target.setItem(USER_DISPLAY_KEY, data.displayName);
  }
}

export function formatDisplayRole(role: string): string {
  if (role === 'LAB_TECHNICIAN') return 'Lab Technician';
  return role.charAt(0) + role.slice(1).toLowerCase();
}
