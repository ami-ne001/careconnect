import type {
  AdminUser,
  Department,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  UserCreateRequest,
  UserRole,
  UserUpdateRequest,
} from '@/types';
import { api } from './axios';

export const adminApi = {
  getUsers: (role?: UserRole) =>
    api.get<AdminUser[]>('/api/admin/users', { params: role ? { role } : undefined }),

  getUser: (id: number) => api.get<AdminUser>(`/api/admin/users/${id}`),

  createUser: (body: UserCreateRequest) => api.post<AdminUser>('/api/admin/users', body),

  updateUser: (id: number, body: UserUpdateRequest) =>
    api.put<AdminUser>(`/api/admin/users/${id}`, body),

  deactivateUser: (id: number) => api.patch<AdminUser>(`/api/admin/users/${id}/deactivate`),

  getDepartments: () => api.get<Department[]>('/api/admin/departments'),

  createDepartment: (body: DepartmentCreateRequest) =>
    api.post<Department>('/api/admin/departments', body),

  updateDepartment: (id: number, body: DepartmentUpdateRequest) =>
    api.put<Department>(`/api/admin/departments/${id}`, body),

  deleteDepartment: (id: number) => api.delete(`/api/admin/departments/${id}`),

  getStaffByDepartmentReport: () =>
    api.get<StaffByDepartmentReport>('/api/admin/reports/staff-by-department'),
};

export interface StaffDepartmentMetric {
  departmentName: string;
  activeCount: number;
  totalCount: number;
  activeRate: number;
}

export interface StaffByDepartmentReport {
  departments: StaffDepartmentMetric[];
}
