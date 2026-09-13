import axios from 'axios';

import { useAuthStore } from '@stores/authStore';

export const NEST_DEFIS_CONTRACT =
  'GET /api/v1/defis/dashboard, /defis/challenges, /defis/competitions, /defis/duels + Bearer JWT.';

export class NestDefisRouteUnavailableError extends Error {
  readonly skipOfflineCache = true;
  constructor(public readonly route: string) {
    super(
      `Cette fonction n’est pas encore disponible côté serveur (${route}). Réessayez plus tard.`,
    );
    this.name = 'NestDefisRouteUnavailableError';
  }
}

export function isNestDefisRouteUnavailable(error: unknown): error is NestDefisRouteUnavailableError {
  return error instanceof NestDefisRouteUnavailableError;
}

export function authHeaders(): { Authorization: string } {
  const token = useAuthStore.getState().token?.trim();
  if (!token) throw new Error('Utilisateur non connecté. Reconnectez-vous.');
  return { Authorization: `Bearer ${token}` };
}

export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function isConflict(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409;
}

export function throwIfNestRouteMissing(error: unknown, route: string): never | void {
  if (isNotFound(error)) {
    throw new NestDefisRouteUnavailableError(route);
  }
}

export function readFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function unwrapItems(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter((row): row is Record<string, unknown> => Boolean(asRecord(row)));
  }
  const record = asRecord(raw);
  if (!record) return [];
  for (const key of ['items', 'challenges', 'competitions', 'duels', 'data', 'results', 'entries']) {
    const nested = record[key];
    if (Array.isArray(nested)) {
      return nested.filter((row): row is Record<string, unknown> => Boolean(asRecord(row)));
    }
  }
  return [];
}

export function unwrapObject(
  raw: unknown,
  nestedKeys: string[] = ['item', 'data', 'competition'],
): Record<string, unknown> | null {
  const record = asRecord(raw);
  if (!record) return null;
  for (const key of nestedKeys) {
    const nested = asRecord(record[key]);
    if (nested) return nested;
  }
  return record;
}
