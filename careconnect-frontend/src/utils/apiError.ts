import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (!error.response) {
      return 'Cannot reach the server. Ensure api-gateway (8088) and auth-service (8081) are running.';
    }
  }
  return fallback;
}
