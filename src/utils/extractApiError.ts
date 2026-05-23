import { isAxiosError } from 'axios';

export function extractApiError(error: unknown, fallback = 'Une erreur est survenue.'): string {
  if (isAxiosError(error)) {
    const body = error.response?.data;
    if (body && typeof body === 'object' && 'error' in body) {
      const message = (body as { error?: unknown }).error;
      if (typeof message === 'string' && message.trim()) return message.trim();
    }
    if (error.response?.status === 410) return 'Ce défi a expiré.';
    if (error.response?.status === 409) return 'Ce défi n\'est plus disponible.';
    if (error.response?.status === 403) return 'Accès refusé.';
    if (error.response?.status === 404) return 'Duel introuvable.';
    return error.message || fallback;
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return fallback;
}
