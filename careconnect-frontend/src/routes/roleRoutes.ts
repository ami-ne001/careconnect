import type { UserRole } from '@/types';

/** Default dashboard path per role after login */
export const ROLE_HOME_PATH: Record<UserRole, string> = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  NURSE: '/nurse/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  PATIENT: '/patient/dashboard',
  LAB_TECHNICIAN: '/lab/dashboard',
};

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  PATIENT: 'Patient',
  LAB_TECHNICIAN: 'Lab Technician',
};

export function getHomePathForRole(role: UserRole | string): string {
  return ROLE_HOME_PATH[role as UserRole] ?? '/login';
}
