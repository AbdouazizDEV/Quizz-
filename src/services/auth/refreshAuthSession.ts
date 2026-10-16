import { useAuthStore } from '@stores/authStore';

import {
  readStoredRefreshToken,
  readStoredSessionExpiresAt,
  readStoredSessionHardExpiresAt,
} from './authTokenStorage';
import { authSessionService } from './authSessionServiceInstance';
import { refreshPasskeySession } from './passkeyAuthService';

export type RefreshAuthResult =
  | { ok: true; accessToken: string }
  | {
      ok: false;
      reason:
        | 'no_refresh_token'
        | 'not_logged_in'
        | 'refresh_failed'
        | 'network_error'
        | 'session_hard_expired';
      /** Refresh token révoqué ou expiré côté serveur — déconnexion requise. */
      revoked?: boolean;
      message?: string;
    };

/** Marge avant expiration pour anticiper le refresh (évite les 401 en plein quiz). */
export const ACCESS_TOKEN_EXPIRY_SKEW_SECONDS = 120;

/** Renouvellement proactif (access token backend ≈ 2 h). */
export const PROACTIVE_REFRESH_INTERVAL_MS = 45 * 60_000;

let refreshInFlight: Promise<RefreshAuthResult> | null = null;

function decodeJwtExp(token: string): number | null {
  try {
    const segment = token.split('.')[1];
    if (!segment || typeof globalThis.atob !== 'function') return null;
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const json = globalThis.atob(padded);
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isAccessTokenLikelyExpired(token: string, storedExpiresAt?: number | null): boolean {
  const exp = storedExpiresAt ?? decodeJwtExp(token);
  if (!exp) return false;
  return Date.now() / 1000 >= exp - ACCESS_TOKEN_EXPIRY_SKEW_SECONDS;
}

function isRevokedRefreshError(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  if (status === 401 || status === 403) return true;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    message.includes('refresh_token') &&
    (message.includes('invalide') ||
      message.includes('expiré') ||
      message.includes('invalid') ||
      message.includes('expired'))
  );
}

function isNetworkRefreshError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connexion')
  );
}

async function performRefresh(): Promise<RefreshAuthResult> {
  const hardExpiresAt = await readStoredSessionHardExpiresAt();
  if (hardExpiresAt != null && Date.now() / 1000 >= hardExpiresAt) {
    return {
      ok: false,
      reason: 'session_hard_expired',
      revoked: true,
      message: 'Session expirée (24 h). Reconnectez-vous.',
    };
  }

  const accessToken = useAuthStore.getState().token?.trim();
  const refreshToken = (await readStoredRefreshToken())?.trim();
  if (!refreshToken) return { ok: false, reason: 'no_refresh_token', revoked: true };
  if (!accessToken) return { ok: false, reason: 'not_logged_in' };

  try {
    const session = await refreshPasskeySession(refreshToken);
    if (!session.access_token?.trim()) {
      return {
        ok: false,
        reason: 'refresh_failed',
        revoked: true,
        message: 'Session absente après refresh.',
      };
    }

    const merged = {
      ...session,
      session_expires_at: hardExpiresAt ?? session.session_expires_at,
    };

    await authSessionService.saveAuthenticatedSession(
      session.access_token,
      session.refresh_token ?? refreshToken,
      merged,
    );
    useAuthStore.getState().setToken(session.access_token);
    return { ok: true, accessToken: session.access_token };
  } catch (error) {
    const revoked = isRevokedRefreshError(error);
    if (!revoked && isNetworkRefreshError(error)) {
      return {
        ok: false,
        reason: 'network_error',
        message: error instanceof Error ? error.message : 'Réseau indisponible.',
      };
    }
    return {
      ok: false,
      reason: 'refresh_failed',
      revoked,
      message: error instanceof Error ? error.message : 'Refresh session impossible.',
    };
  }
}

/**
 * Rafraîchit le JWT via POST /auth/passkey/refresh.
 * Mutex global : évite deux refresh simultanés (rotation = révocation de l’ancien token).
 */
export async function refreshAuthSessionIfNeeded(options?: {
  force?: boolean;
}): Promise<RefreshAuthResult> {
  const accessToken = useAuthStore.getState().token?.trim();
  if (!accessToken) return { ok: false, reason: 'not_logged_in' };

  const storedExpiresAt = await readStoredSessionExpiresAt();
  if (!options?.force && !isAccessTokenLikelyExpired(accessToken, storedExpiresAt)) {
    return { ok: true, accessToken };
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = performRefresh();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

/** Déconnexion recommandée si le refresh a échoué et que l’access token est expiré. */
export function shouldForceLogoutAfterRefreshFailure(
  result: Extract<RefreshAuthResult, { ok: false }>,
  accessToken: string | null | undefined,
  storedExpiresAt?: number | null,
): boolean {
  if (result.reason === 'session_hard_expired') return true;
  const expired = accessToken ? isAccessTokenLikelyExpired(accessToken, storedExpiresAt) : true;
  if (!expired) return false;
  if (result.reason === 'no_refresh_token') return true;
  return result.reason === 'refresh_failed' && result.revoked === true;
}
