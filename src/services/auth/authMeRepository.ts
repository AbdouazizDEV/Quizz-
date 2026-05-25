import type { AuthMeResponse } from '@sdk';
import { getQuizzApiClient } from '@sdk';
import { AUTH_ME_CACHE_KEY } from '@services/auth/authMeCacheKey';
import { getAuthMeFingerprint } from '@services/auth/authMeFingerprint';
import { ensureOfflineDatabaseReady, fetchNetworkOnline, offlineStore } from '@services/offline';
import { useAuthMeStore } from '@stores/authMeStore';
import { useAuthStore } from '@stores/authStore';

/** Durée pendant laquelle le cache local évite un nouvel appel GET /auth/me. */
export const AUTH_ME_STALE_MS = 10 * 60 * 1000;

interface CachedAuthMeEnvelope {
  data: AuthMeResponse;
  fingerprint: string;
  cachedAt: number;
}

let loadInFlight: Promise<AuthMeResponse | null> | null = null;

async function readCachedEnvelope(): Promise<CachedAuthMeEnvelope | null> {
  await ensureOfflineDatabaseReady();
  const entry = await offlineStore.getCachedEntry(AUTH_ME_CACHE_KEY);
  if (!entry?.responseJson) return null;
  try {
    const parsed = JSON.parse(entry.responseJson) as CachedAuthMeEnvelope | AuthMeResponse;
    if (parsed && typeof parsed === 'object' && 'data' in parsed && 'fingerprint' in parsed) {
      return parsed as CachedAuthMeEnvelope;
    }
    const legacy = parsed as AuthMeResponse;
    if (legacy?.user) {
      return {
        data: legacy,
        fingerprint: getAuthMeFingerprint(legacy),
        cachedAt: entry.cachedAt,
      };
    }
  } catch {
    return null;
  }
  return null;
}

async function writeCachedEnvelope(me: AuthMeResponse): Promise<void> {
  const envelope: CachedAuthMeEnvelope = {
    data: me,
    fingerprint: getAuthMeFingerprint(me),
    cachedAt: Date.now(),
  };
  await offlineStore.setCachedResponse({
    cacheKey: AUTH_ME_CACHE_KEY,
    source: 'api',
    data: envelope,
  });
}

async function fetchAuthMeFromApi(): Promise<AuthMeResponse | null> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) return null;

  const { data, error } = await getQuizzApiClient().GET('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error || !data?.user) return null;
  return data;
}

function isCacheFresh(cachedAt: number, force: boolean): boolean {
  if (force) return false;
  return Date.now() - cachedAt < AUTH_ME_STALE_MS;
}

export async function getCachedAuthMe(): Promise<AuthMeResponse | null> {
  const envelope = await readCachedEnvelope();
  return envelope?.data ?? null;
}

export async function setAuthMeCache(me: AuthMeResponse): Promise<void> {
  await writeCachedEnvelope(me);
  useAuthMeStore.getState().setData(me);
  useAuthMeStore.getState().setError(null);
}

export async function clearAuthMeCache(): Promise<void> {
  await ensureOfflineDatabaseReady();
  await offlineStore.removeCachedResponse(AUTH_ME_CACHE_KEY);
  useAuthMeStore.getState().clear();
}

/**
 * Charge auth/me : cache SQLite d’abord, puis réseau seulement si cache absent,
 * expiré (AUTH_ME_STALE_MS) ou `force: true`. Si le serveur renvoie la même empreinte,
 * on met à jour l’horodatage du cache sans changer les données affichées.
 */
export async function loadAuthMe(options?: { force?: boolean }): Promise<AuthMeResponse | null> {
  const force = options?.force === true;
  const token = useAuthStore.getState().token?.trim();
  if (!token) {
    await clearAuthMeCache();
    return null;
  }

  if (loadInFlight && !force) {
    return loadInFlight;
  }

  const run = async (): Promise<AuthMeResponse | null> => {
    const store = useAuthMeStore.getState();
    store.setError(null);

    const cached = await readCachedEnvelope();
    if (cached?.data) {
      store.setData(cached.data);
    }

    const online = await fetchNetworkOnline();
    if (!online) {
      store.setLoading(false);
      return cached?.data ?? null;
    }

    if (cached && isCacheFresh(cached.cachedAt, force)) {
      store.setLoading(false);
      return cached.data;
    }

    store.setLoading(true);
    try {
      const remote = await fetchAuthMeFromApi();
      if (!remote) {
        store.setLoading(false);
        return cached?.data ?? null;
      }

      const remoteFp = getAuthMeFingerprint(remote);
      if (cached && remoteFp === cached.fingerprint) {
        await writeCachedEnvelope(cached.data);
        store.setLoading(false);
        return cached.data;
      }

      await writeCachedEnvelope(remote);
      store.setData(remote);
      store.setLoading(false);
      return remote;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      store.setError(err);
      store.setLoading(false);
      return cached?.data ?? null;
    }
  };

  loadInFlight = run().finally(() => {
    loadInFlight = null;
  });
  return loadInFlight;
}

export async function invalidateAuthMeCache(): Promise<AuthMeResponse | null> {
  await ensureOfflineDatabaseReady();
  await offlineStore.removeCachedResponse(AUTH_ME_CACHE_KEY);
  return loadAuthMe({ force: true });
}

/** Lecture synchrone depuis le store (mémoire). */
export function getAuthMeFromStore(): AuthMeResponse | null {
  return useAuthMeStore.getState().data;
}
