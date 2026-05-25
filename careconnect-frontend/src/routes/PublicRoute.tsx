import { Navigate, Outlet } from 'react-router-dom';
import { AUTH_STORAGE_KEYS, TOKEN_KEY } from '@/store/authStorage';
import { getHomePathForRole } from './roleRoutes';
import { normalizeRole } from '@/utils/jwt';

/** Redirects authenticated users away from login / forgot-password */
export function PublicRoute() {
  const token = localStorage.getItem(TOKEN_KEY);
  const role = normalizeRole(localStorage.getItem(AUTH_STORAGE_KEYS.role));

  if (token && role) {
    return <Navigate to={getHomePathForRole(role)} replace />;
  }

  return <Outlet />;
}
