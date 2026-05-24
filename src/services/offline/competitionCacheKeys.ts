import { buildCacheKey } from './cacheKey';

export function competitionsListCacheKey(tab: string, userId: string): string {
  return buildCacheKey({
    source: 'supabase',
    method: 'GET',
    path: 'competitions/list',
    params: { tab, userId },
  });
}

export function competitionDetailCacheKey(competitionId: string, userId: string): string {
  return buildCacheKey({
    source: 'supabase',
    method: 'GET',
    path: 'competitions/detail',
    params: { competitionId, userId },
  });
}
