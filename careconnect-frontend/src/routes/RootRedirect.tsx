import { Navigate } from 'react-router-dom';
import { AUTH_STORAGE_KEYS, TOKEN_KEY } from '@/store/authStorage';
import { getHomePathForRole } from './roleRoutes';
import { normalizeRole } from '@/utils/jwt';

/** Sends / to login or the role dashboard based on localStorage session */
export function RootRedirect() {
  const token = localStorage.getItem(TOKEN_KEY);
  const role = normalizeRole(localStorage.getItem(AUTH_STORAGE_KEYS.role));

  if (token && role) {
    return <Navigate to={getHomePathForRole(role)} replace />;
  }

  return <Navigate to="/login" replace />;
}
