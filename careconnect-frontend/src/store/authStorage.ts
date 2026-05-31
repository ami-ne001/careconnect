export const TOKEN_KEY = 'cc_token';

export const AUTH_STORAGE_KEYS = {
  userId: 'cc_userId',
  role: 'cc_role',
  email: 'cc_email',
  firstName: 'cc_firstName',
  lastName: 'cc_lastName',
} as const;

export function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_KEY);
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem('cc-auth');
  localStorage.removeItem('cc_user');
}

export function hasStoredSession(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY) && localStorage.getItem(AUTH_STORAGE_KEYS.role));
}
