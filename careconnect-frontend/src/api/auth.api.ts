import type { LoginRequest, LoginResponse } from '@/types';
import { api } from './axios';

export const authApi = {
  login: (body: LoginRequest) => api.post<LoginResponse>('/api/auth/login', body),

  forgotPassword: (email: string) =>
    api.post<void>('/api/auth/forgot-password', { email }),
};
