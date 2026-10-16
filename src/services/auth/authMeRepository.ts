import type { AuthMeResponse } from '@sdk';
import { apiClient } from '@services/api/apiClient';
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

function readFiniteNumber(...candidates: unknown[]): number | null {
  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function normalizeAuthMe(me: AuthMeResponse): AuthMeResponse {
  if (!me.profile) return me;
  const row = me.profile as AuthMeResponse['profile'] & Record<string, unknown>;
  const total_score =
    readFiniteNumber(row.total_score, row.totalScore) ?? row.total_score ?? 0;
  const quizzes_completed =
    readFiniteNumber(row.quizzes_completed, row.quizzesCompleted) ??
    row.quizzes_completed ??
    0;
  return {
    ...me,
    profile: {
      ...me.profile,
      total_score,
      quizzes_completed,
    },
  };
}

function unwrapAuthMePayload(raw: unknown): AuthMeResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;
  const candidate = root.user
    ? (raw as AuthMeResponse)
    : root.data && typeof root.data === 'object' && 'user' in (root.data as object)
      ? (root.data as AuthMeResponse)
      : null;
  return candidate ? normalizeAuthMe(candidate) : null;
}

async function fetchAuthMeFromApi(): Promise<AuthMeResponse | null> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) return null;

  try {
    const { data } = await apiClient.get<unknown>('/auth/me');
    return unwrapAuthMePayload(data);
  } catch {
    return null;
  }
}

function isCacheFresh(cachedAt: number, force: boolean): boolean {
  if (force) return false;
  return Date.now() - cachedAt < AUTH_ME_STALE_MS;
}

/**
 * Ne jamais diminuer total_score / quizzes_completed localement
 * (évite qu’un GET /auth/me encore stale écrase le patch post-quiz).
 */
export function mergeAuthMePreferHigherScores(
  a: AuthMeResponse | null | undefined,
  b: AuthMeResponse | null | undefined,
): AuthMeResponse | null {
  if (!a) return b ?? null;
  if (!b) return a;
  if (!a.profile) return b;
  if (!b.profile) return a;

  const total_score = Math.max(a.profile.total_score ?? 0, b.profile.total_score ?? 0);
  const quizzes_completed = Math.max(
    a.profile.quizzes_completed ?? 0,
    b.profile.quizzes_completed ?? 0,
  );

  return {
    ...b,
    profile: {
      ...b.profile,
      total_score,
      quizzes_completed,
    },
  };
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
 * Les scores locaux plus élevés sont conservés face à un GET encore stale.
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

    const memory = store.data;
    const cached = await readCachedEnvelope();
    const local = mergeAuthMePreferHigherScores(memory, cached?.data);
    if (local) {
      store.setData(local);
    }

    const online = await fetchNetworkOnline();
    if (!online) {
      store.setLoading(false);
      return local;
    }

    if (cached && isCacheFresh(cached.cachedAt, force) && !force) {
      store.setLoading(false);
      return local ?? cached.data;
    }

    if (!local) {
      store.setLoading(true);
    }
    try {
      const remote = await fetchAuthMeFromApi();
      // Relire store + cache : un GET lancé avant le patch quiz ne doit pas écraser le score.
      const latestCached = await readCachedEnvelope();
      const latestLocal = mergeAuthMePreferHigherScores(
        useAuthMeStore.getState().data,
        latestCached?.data,
      );
      if (!remote) {
        store.setLoading(false);
        return latestLocal;
      }

      const merged = mergeAuthMePreferHigherScores(latestLocal, remote) ?? remote;
      const mergedFp = getAuthMeFingerprint(merged);
      if (latestCached && mergedFp === latestCached.fingerprint) {
        await writeCachedEnvelope(latestCached.data);
        store.setData(latestCached.data);
        store.setLoading(false);
        return latestCached.data;
      }

      await writeCachedEnvelope(merged);
      store.setData(merged);
      store.setLoading(false);
      return merged;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      store.setError(err);
      store.setLoading(false);
      return mergeAuthMePreferHigherScores(useAuthMeStore.getState().data, cached?.data);
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

/** Met à jour le score affiché après POST /quizzes/:id/complete (réponse Nest). */
export async function patchAuthMeFromQuizComplete(result: {
  total_score: number;
  quizzes_completed: number;
}): Promise<void> {
  const current = useAuthMeStore.getState().data ?? (await getCachedAuthMe());
  if (!current?.user) {
    await loadAuthMe({ force: true });
    const afterLoad = useAuthMeStore.getState().data;
    if (!afterLoad?.profile) return;
    await setAuthMeCache({
      ...afterLoad,
      profile: {
        ...afterLoad.profile,
        total_score: Math.max(afterLoad.profile.total_score ?? 0, result.total_score),
        quizzes_completed: Math.max(
          afterLoad.profile.quizzes_completed ?? 0,
          result.quizzes_completed,
        ),
      },
    });
    return;
  }

  if (!current.profile) {
    await loadAuthMe({ force: true });
    const afterLoad = useAuthMeStore.getState().data;
    if (afterLoad?.profile) {
      await setAuthMeCache({
        ...afterLoad,
        profile: {
          ...afterLoad.profile,
          total_score: Math.max(afterLoad.profile.total_score ?? 0, result.total_score),
          quizzes_completed: Math.max(
            afterLoad.profile.quizzes_completed ?? 0,
            result.quizzes_completed,
          ),
        },
      });
    }
    return;
  }

  const updated: AuthMeResponse = {
    ...current,
    profile: {
      ...current.profile,
      total_score: Math.max(current.profile.total_score ?? 0, result.total_score),
      quizzes_completed: Math.max(
        current.profile.quizzes_completed ?? 0,
        result.quizzes_completed,
      ),
    },
  };
  await setAuthMeCache(updated);
}

/** Lecture synchrone depuis le store (mémoire). */
export function getAuthMeFromStore(): AuthMeResponse | null {
  return useAuthMeStore.getState().data;
}
