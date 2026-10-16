import { isAxiosError } from 'axios';

import { AppConfig } from '@config';
import type {
  ArenaEdition,
  ArenaMeResponse,
  ArenaRegisterResponse,
  ArenaRegistration,
} from '@app-types/arena.types';
import { apiClient } from '@services/api/apiClient';

const ARENA_PUBLIC_TIMEOUT_MS = 12_000;

function readApiErrorField(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const body = error.response?.data;
    if (body && typeof body === 'object') {
      const message = (body as { error?: unknown }).error;
      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }
    }
  }
  return fallback;
}

/**
 * Édition publique : fetch natif pour ne pas attendre le refresh JWT (axios interceptors).
 */
export async function fetchArenaEdition(): Promise<ArenaEdition> {
  const base = AppConfig.API_BASE_URL.replace(/\/$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ARENA_PUBLIC_TIMEOUT_MS);
  try {
    const response = await fetch(`${base}/arena/edition`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as ArenaEdition;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchArenaMe(): Promise<ArenaMeResponse> {
  const { data } = await apiClient.get<ArenaMeResponse>('/arena/me');
  return data;
}

export async function registerArenaCampus(campusId: string): Promise<ArenaRegisterResponse> {
  try {
    const { data } = await apiClient.post<ArenaRegisterResponse>('/arena/register', {
      campus_id: campusId,
    });
    return data;
  } catch (error) {
    throw new Error(readApiErrorField(error, 'Inscription Arena impossible pour le moment.'));
  }
}

export async function patchArenaCampus(campusId: string): Promise<ArenaRegistration> {
  try {
    const { data } = await apiClient.patch<{ registration?: ArenaRegistration } & ArenaRegistration>(
      '/arena/campus',
      { campus_id: campusId },
    );
    if (data && typeof data === 'object' && data.registration) {
      return data.registration;
    }
    return data as ArenaRegistration;
  } catch (error) {
    throw new Error(readApiErrorField(error, 'Changement de campus impossible pour le moment.'));
  }
}
