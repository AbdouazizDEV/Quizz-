import type { Href } from 'expo-router';

import { Routes } from '@constants/Routes';

const ALLOWED_RETURN_PREFIXES = ['/arena', '/friend', '/friend-scan', '/network', '/premium'] as const;

export function resolvePostLoginHref(returnTo: unknown): Href {
  const raw = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  if (typeof raw !== 'string') return Routes.HOME;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.includes('(') || trimmed.includes('..')) {
    return Routes.HOME;
  }
  const allowed = ALLOWED_RETURN_PREFIXES.some(
    (prefix) => trimmed === prefix || trimmed.startsWith(`${prefix}/`) || trimmed.startsWith(`${prefix}?`),
  );
  return allowed ? (trimmed as Href) : Routes.HOME;
}
