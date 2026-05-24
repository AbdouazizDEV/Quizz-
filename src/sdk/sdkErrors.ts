import type { components } from './generated/schema';
import {
  formatValidationDetails,
  humanizeApiErrorTitle,
} from '@utils/formatApiUserMessage';

type ErrorBody = components['schemas']['ErrorBody'];

/**
 * Extrait un message lisible depuis le corps d’erreur renvoyé par l’API (openapi-fetch).
 */
export function parseQuizzApiError(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const e = error as Partial<ErrorBody> & { message?: string };

  const validationMessage = formatValidationDetails(e.details);
  if (validationMessage) return validationMessage;

  const parts: string[] = [];

  if (typeof e.error === 'string' && e.error.trim()) {
    parts.push(humanizeApiErrorTitle(e.error));
  } else if (typeof e.message === 'string' && e.message.trim()) {
    parts.push(humanizeApiErrorTitle(e.message));
  }

  if (typeof e.hint === 'string' && e.hint.trim()) {
    parts.push(e.hint.trim());
  }

  if (parts.length) return parts.join('\n\n');
  return undefined;
}
