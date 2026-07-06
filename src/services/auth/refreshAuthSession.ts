import type { Session } from '@supabase/supabase-js';

import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';
import { syncSupabaseAuthSession } from '@services/supabase/syncSupabaseAuthSession';
import { useAuthStore } from '@stores/authStore';

import { readStoredRefreshToken } from './authTokenStorage';
import { authSessionService } from './authSessionServiceInstance';

export type RefreshAuthResult =
  | { ok: true; accessToken: string }
  | {
      ok: false;
      reason: 'no_client' | 'no_refresh_token' | 'not_logged_in' | 'refresh_failed';
      message?: string;
    };

/** Marge avant expiration pour anticiper le refresh (évite les 401 en plein quiz). */
const EXPIRY_SKEW_SECONDS = 120;

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

export function isAccessTokenLikelyExpired(token: string): boolean {
  const exp = decodeJwtExp(token);
  if (!exp) return false;
  return Date.now() / 1000 >= exp - EXPIRY_SKEW_SECONDS;
}

async function persistRefreshedSession(session: Session): Promise<void> {
  await authSessionService.saveAuthenticatedSession(session.access_token, session.refresh_token);
  useAuthStore.getState().setToken(session.access_token);
  await syncSupabaseAuthSession(session.access_token, session.refresh_token);
}

/**
 * Rafraîchit le JWT Supabase via le refresh_token stocké, puis met à jour SecureStore + Zustand.
 * À appeler au démarrage, au retour au premier plan et avant les écritures Supabase.
 */
export async function refreshAuthSessionIfNeeded(options?: {
  force?: boolean;
}): Promise<RefreshAuthResult> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, reason: 'no_client' };

  const accessToken = useAuthStore.getState().token?.trim();
  const refreshToken = (await readStoredRefreshToken())?.trim();
  if (!refreshToken) return { ok: false, reason: 'no_refresh_token' };
  if (!accessToken) return { ok: false, reason: 'not_logged_in' };

  if (!options?.force && !isAccessTokenLikelyExpired(accessToken)) {
    try {
      await syncSupabaseAuthSession(accessToken, refreshToken);
      return { ok: true, accessToken };
    } catch {
      /* token peut être invalide malgré exp future — tenter un refresh */
    }
  }

  const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session?.access_token) {
    return {
      ok: false,
      reason: 'refresh_failed',
      message: error?.message ?? 'Refresh session impossible.',
    };
  }

  await persistRefreshedSession(data.session);
  return { ok: true, accessToken: data.session.access_token };
}
