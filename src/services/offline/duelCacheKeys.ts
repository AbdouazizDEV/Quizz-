import { buildCacheKey } from './cacheKey';

export function pendingDuelsCacheKey(page: number, limit: number): string {
  return buildCacheKey({
    source: 'api',
    method: 'GET',
    path: '/defis/duels/pending',
    params: { page, limit },
  });
}

export function recentDuelsCacheKey(page: number, limit: number): string {
  return buildCacheKey({
    source: 'api',
    method: 'GET',
    path: '/defis/duels/recent',
    params: { page, limit },
  });
}

export function duelDetailCacheKey(duelId: string): string {
  return buildCacheKey({
    source: 'api',
    method: 'GET',
    path: `/defis/duels/${duelId}`,
  });
}

export function profileScreenCacheKey(userId: string): string {
  return buildCacheKey({
    source: 'api',
    method: 'GET',
    path: '/users/profile',
    params: { userId },
  });
}
