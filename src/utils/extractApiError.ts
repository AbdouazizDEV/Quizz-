import { isAxiosError } from 'axios';

import {
  formatValidationDetails,
  humanizeApiErrorTitle,
} from './formatApiUserMessage';

export function extractApiError(error: unknown, fallback = 'Une erreur est survenue.'): string {
  if (isAxiosError(error)) {
    const body = error.response?.data;
    if (body && typeof body === 'object') {
      const record = body as { error?: unknown; details?: unknown; hint?: unknown; message?: unknown };

      const validationMessage = formatValidationDetails(record.details);
      if (validationMessage) return validationMessage;

      if (typeof record.error === 'string' && record.error.trim()) {
        const title = humanizeApiErrorTitle(record.error);
        if (typeof record.hint === 'string' && record.hint.trim()) {
          return `${title}\n\n${record.hint.trim()}`;
        }
        return title;
      }

      if (typeof record.message === 'string' && record.message.trim()) {
        return humanizeApiErrorTitle(record.message);
      }
    }

    if (error.response?.status === 401) return 'Identifiants incorrects ou session expirée.';
    if (error.response?.status === 410) return 'Ce défi a expiré.';
    if (error.response?.status === 409) return 'Ce défi n\'est plus disponible.';
    if (error.response?.status === 403) return 'Accès refusé.';
    if (error.response?.status === 404) return 'Élément introuvable.';
    if (error.response?.status === 400) return 'Requête invalide. Vérifiez les informations saisies.';

    return error.message || fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return humanizeApiErrorTitle(error.message);
  }

  return fallback;
}
