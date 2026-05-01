import type { components } from './generated/schema';

type ErrorBody = components['schemas']['ErrorBody'];

/**
 * Extrait un message lisible depuis le corps d’erreur renvoyé par l’API (openapi-fetch).
 */
export function parseQuizzApiError(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const e = error as Partial<ErrorBody> & { message?: string };
  const parts: string[] = [];
  if (typeof e.error === 'string' && e.error.trim()) parts.push(e.error.trim());
  else if (typeof e.message === 'string' && e.message.trim()) parts.push(e.message.trim());

  if (typeof e.hint === 'string' && e.hint.trim()) {
    parts.push(e.hint.trim());
  }
  if (e.details != null) {
    const d =
      typeof e.details === 'string'
        ? e.details
        : typeof e.details === 'object'
          ? JSON.stringify(e.details)
          : String(e.details);
    if (d) parts.push(d);
  }

  if (parts.length) return parts.join('\n\n');
  return undefined;
}
