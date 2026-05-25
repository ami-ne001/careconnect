import type { UserRole } from './auth.types';

export type Gender = 'MALE' | 'FEMALE';

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  departmentId: number | null;
  departmentName: string | null;
  phone: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId?: number | null;
  phone?: string;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: string;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId?: number | null;
  phone?: string;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: string;
}

export interface Department {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface DepartmentCreateRequest {
  name: string;
  description?: string;
}

export interface DepartmentUpdateRequest {
  name: string;
  description?: string;
}
