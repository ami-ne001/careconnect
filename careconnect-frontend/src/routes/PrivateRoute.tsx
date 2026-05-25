import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { TOKEN_KEY } from '@/store/authStorage';

/** Requires a JWT in localStorage; otherwise redirects to login */
export function PrivateRoute() {
  const location = useLocation();
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
