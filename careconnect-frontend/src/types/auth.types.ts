export type UserRole =
  | 'ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'PATIENT'
  | 'LAB_TECHNICIAN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  role: UserRole | string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthUser {
  userId: number;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
}
