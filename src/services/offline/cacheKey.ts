import type { OfflineSource } from './types';

export function buildCacheKey(input: {
  source: OfflineSource;
  method: string;
  path: string;
  params?: Record<string, string | number | boolean | null | undefined>;
}): string {
  const method = input.method.toUpperCase();
  const params = input.params ?? {};
  const query = Object.keys(params)
    .sort()
    .map((key) => `${key}=${String(params[key] ?? '')}`)
    .join('&');
  return `${input.source}:${method}:${input.path}${query ? `?${query}` : ''}`;
}
