import type { components } from './generated/schema';

type ErrorBody = components['schemas']['ErrorBody'];

/**
 * Extrait un message lisible depuis le corps d’erreur renvoyé par l’API (openapi-fetch).
 */
export function parseQuizzApiError(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const e = error as Partial<ErrorBody> & { message?: string };
  if (typeof e.error === 'string' && e.error.trim()) return e.error.trim();
  if (typeof e.message === 'string' && e.message.trim()) return e.message.trim();
  return undefined;
}
