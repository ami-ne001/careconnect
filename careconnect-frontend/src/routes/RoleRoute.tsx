import { Navigate, Outlet } from 'react-router-dom';
import { AUTH_STORAGE_KEYS } from '@/store/authStorage';
import type { UserRole } from '@/types';
import { normalizeRole } from '@/utils/jwt';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

/** Requires the stored user role to match one of the allowed roles */
export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const role = normalizeRole(localStorage.getItem(AUTH_STORAGE_KEYS.role));

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
