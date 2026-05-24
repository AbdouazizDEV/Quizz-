import { buildCacheKey } from './cacheKey';

export function activeWeeklyChallengesCacheKey(): string {
  return buildCacheKey({
    source: 'supabase',
    method: 'GET',
    path: 'weekly_challenges/active',
  });
}

export function pastWeeklyChallengesCacheKey(): string {
  return buildCacheKey({
    source: 'supabase',
    method: 'GET',
    path: 'weekly_challenges/past',
  });
}

export function challengeProgressCacheKey(challengeId: string, userId: string): string {
  return buildCacheKey({
    source: 'supabase',
    method: 'GET',
    path: 'weekly_challenges/progress',
    params: { challengeId, userId },
  });
}

export function challengeLeaderboardCacheKey(challengeId: string, userId: string): string {
  return buildCacheKey({
    source: 'supabase',
    method: 'GET',
    path: 'weekly_challenges/leaderboard',
    params: { challengeId, userId },
  });
}
