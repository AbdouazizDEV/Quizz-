import { isAxiosError } from 'axios';

import {
  formatValidationDetails,
  humanizeApiErrorTitle,
  humanizeRuntimeError,
} from './formatApiUserMessage';

function humanizeTechnicalDbError(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes('row-level security') || lower.includes('violates row-level')) {
    if (lower.includes('competition_registration')) {
      return "Impossible de s'inscrire au tournoi. Reconnectez-vous puis réessayez.";
    }
    return 'Action refusée. Reconnectez-vous puis réessayez.';
  }
  if (lower.includes('jwt expired') || lower.includes('invalid claim')) {
    return 'Session expirée. Reconnectez-vous.';
  }
  if (/^new row violates/.test(lower) || lower.includes('permission denied')) {
    return 'Action refusée. Vérifiez votre connexion et réessayez.';
  }
  return null;
}

export function extractApiError(error: unknown, fallback = 'Une erreur est survenue.'): string {
  if (isAxiosError(error)) {
    const body = error.response?.data;
    if (body && typeof body === 'object') {
      const record = body as { error?: unknown; details?: unknown; hint?: unknown; message?: unknown };

      const validationMessage = formatValidationDetails(record.details);
      if (validationMessage) return validationMessage;

      if (typeof record.error === 'string' && record.error.trim()) {
        const technical = humanizeTechnicalDbError(record.error);
        if (technical) return technical;
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
    if (error.response?.status === 413) {
      return 'Image trop volumineuse. Choisissez une photo plus légère ou recadrez davantage.';
    }
    if (error.response?.status === 502) {
      return 'Stockage photo indisponible sur le serveur. Réessayez plus tard.';
    }
    if (error.response?.status === 500) {
      const serverMsg =
        body && typeof body === 'object' && typeof (body as { error?: unknown }).error === 'string'
          ? String((body as { error: string }).error)
          : '';
      if (/payload|entity too large|request entity too large/i.test(serverMsg)) {
        return 'Image trop volumineuse. Choisissez une photo plus légère ou recadrez davantage.';
      }
      if (/cloudinary/i.test(serverMsg)) {
        return 'Stockage photo indisponible sur le serveur. Réessayez plus tard.';
      }
      return 'Erreur serveur lors de l’envoi de la photo. Réessayez dans un instant.';
    }

    if (/request failed with status code/i.test(error.message)) {
      return fallback;
    }

    return error.message || fallback;
  }

  if (typeof error === 'string' && error.trim()) {
    const runtime = humanizeRuntimeError(error);
    if (runtime) return runtime;
    return humanizeApiErrorTitle(error);
  }

  if (error instanceof Error && error.message.trim()) {
    const technical = humanizeTechnicalDbError(error.message);
    if (technical) return technical;
    const runtime = humanizeRuntimeError(error.message);
    if (runtime) return runtime;
    return humanizeApiErrorTitle(error.message);
  }

  return fallback;
}
