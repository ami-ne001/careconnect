import type { UserRole } from '@/types';

interface JwtPayload {
  sub?: string;
  role?: string;
  email?: string;
  exp?: number;
}

/** Decode JWT payload and return the role claim (HS256 tokens from auth-service). */
export function getRoleFromToken(token: string): UserRole | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    const payload = JSON.parse(json) as JwtPayload;
    return normalizeRole(payload.role);
  } catch {
    return null;
  }
}

export function normalizeRole(role: string | undefined | null): UserRole | null {
  if (!role) {
    return null;
  }
  const upper = role.toUpperCase();
  const allowed: UserRole[] = [
    'ADMIN',
    'DOCTOR',
    'NURSE',
    'RECEPTIONIST',
    'PATIENT',
    'LAB_TECHNICIAN',
  ];
  return allowed.includes(upper as UserRole) ? (upper as UserRole) : null;
}
