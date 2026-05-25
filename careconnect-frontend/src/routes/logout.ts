import type { NavigateFunction } from 'react-router-dom';
import { clearAuthStorage } from '@/store/authStorage';

export const AUTH_CHANGE_EVENT = 'cc-auth-change';

/** Clears auth from localStorage and redirects to login */
export function logout(navigate: NavigateFunction): void {
  clearAuthStorage();
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  navigate('/login', { replace: true });
}
