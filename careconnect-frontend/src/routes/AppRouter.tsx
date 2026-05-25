import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Login } from '@/pages/auth/Login';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { Dashboard } from '@/pages/admin/Dashboard';
import { Departments } from '@/pages/admin/Departments';
import { OperatingRooms } from '@/pages/admin/OperatingRooms';
import { UsersManagement } from '@/pages/admin/UsersManagement';
import { DoctorDashboardPage } from '@/pages/doctor/DoctorDashboardPage';
import { NurseDashboardPage } from '@/pages/nurse/NurseDashboardPage';
import { ReceptionistDashboardPage } from '@/pages/receptionist/ReceptionistDashboardPage';
import { PatientDashboardPage } from '@/pages/patient/PatientDashboardPage';
import { LabDashboardPage } from '@/pages/lab/LabDashboardPage';
import type { UserRole } from '@/types';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { RoleRoute } from './RoleRoute';
import { RootRedirect } from './RootRedirect';

function roleRoutes(basePath: string, allowedRoles: UserRole[], dashboard: ReactNode) {
  return {
    path: `${basePath}/*`,
    element: <RoleRoute allowedRoles={allowedRoles} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: dashboard },
          { path: '*', element: <Navigate to="dashboard" replace /> },
        ],
      },
    ],
  };
}

export const appRouter = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },

  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
    ],
  },

  {
    element: <PrivateRoute />,
    children: [
      { path: '/unauthorized', element: <UnauthorizedPage /> },
      {
        path: '/admin/*',
        element: <RoleRoute allowedRoles={['ADMIN']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <Dashboard /> },
              { path: 'users', element: <UsersManagement /> },
              { path: 'departments', element: <Departments /> },
              { path: 'operating-rooms', element: <OperatingRooms /> },
              { path: '*', element: <Navigate to="dashboard" replace /> },
            ],
          },
        ],
      },
      roleRoutes('/doctor', ['DOCTOR'], <DoctorDashboardPage />),
      roleRoutes('/nurse', ['NURSE'], <NurseDashboardPage />),
      roleRoutes('/receptionist', ['RECEPTIONIST'], <ReceptionistDashboardPage />),
      roleRoutes('/patient', ['PATIENT'], <PatientDashboardPage />),
      roleRoutes('/lab', ['LAB_TECHNICIAN'], <LabDashboardPage />),
    ],
  },

  { path: '*', element: <Navigate to="/login" replace /> },
]);
