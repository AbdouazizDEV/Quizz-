import { offlineStore } from './OfflineStore';
import { fetchNetworkOnline } from './networkStatus';
import type { OfflineSource } from './types';

export class OfflineCacheMissError extends Error {
  constructor(message = 'Données indisponibles hors ligne. Ouvrez cette page une fois en ligne pour les mettre en cache.') {
    super(message);
    this.name = 'OfflineCacheMissError';
  }
}

export function isOfflineCacheMissError(error: unknown): error is OfflineCacheMissError {
  return error instanceof OfflineCacheMissError;
}

interface ReadWithOfflineCacheOptions<T> {
  cacheKey: string;
  source: OfflineSource;
  fetchOnline: () => Promise<T>;
  /** Si false, tente le cache même quand le réseau semble disponible (erreur API). */
  fallbackToCacheOnError?: boolean;
}

/**
 * En ligne : fetch réseau puis mise en cache SQLite.
 * Hors ligne (ou échec réseau) : retourne le cache local si disponible.
 */
export async function readWithOfflineCache<T>({
  cacheKey,
  source,
  fetchOnline,
  fallbackToCacheOnError = true,
}: ReadWithOfflineCacheOptions<T>): Promise<T> {
  const online = await fetchNetworkOnline();

  if (online) {
    try {
      const data = await fetchOnline();
      await offlineStore.setCachedResponse({ cacheKey, source, data });
      return data;
    } catch (error) {
      if (!fallbackToCacheOnError) throw error;
      const cached = await offlineStore.getCachedResponse<T>(cacheKey);
      if (cached !== null) return cached;
      throw error;
    }
  }

  const cached = await offlineStore.getCachedResponse<T>(cacheKey);
  if (cached !== null) return cached;

  throw new OfflineCacheMissError();
}
