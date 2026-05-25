import { buildCacheKey } from '@services/offline/cacheKey';

export const AUTH_ME_CACHE_KEY = buildCacheKey({
  source: 'api',
  method: 'GET',
  path: '/auth/me',
});
