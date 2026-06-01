import type { LoginRequest, LoginResponse, AdminUser } from '@/types';
import { api } from './axios';

export const authApi = {
  login: (body: LoginRequest) => api.post<LoginResponse>('/api/auth/login', body),

  forgotPassword: (email: string) =>
    api.post<void>('/api/auth/forgot-password', { email }),

  /** Returns the calling user's own full record (phone, gender, dateOfBirth, address, etc.) */
  getMe: () => api.get<AdminUser>('/api/auth/me'),

  /** Updates the calling user's own profile fields (firstName, lastName, phone, gender, dateOfBirth, address) */
  updateMe: (body: Partial<AdminUser>) => api.put<AdminUser>('/api/auth/me', body),
};
