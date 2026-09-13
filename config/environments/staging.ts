import { resolveApiBaseUrl, resolveWsBaseUrl } from '../apiBaseUrl';
import { getSupabaseEnvFromProcess } from '../supabaseEnv';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim()?.replace(/\/$/, '') ??
  'https://api.quizzp.com/api/v1';

const INVITE_WEB_BASE_URL =
  process.env.EXPO_PUBLIC_INVITE_WEB_BASE_URL?.trim()?.replace(/\/$/, '') ??
  'https://quizzp.com';

export const stagingConfig = {
  ENV: 'staging' as const,
  /** Pas d’hébergement staging dédié pour l’instant : même API que la prod. */
  API_BASE_URL,
  INVITE_WEB_BASE_URL,
  WS_URL: resolveWsBaseUrl(API_BASE_URL),
  TIMEOUT_MS: 30_000,
  ENABLE_LOGS: true,
  ENABLE_DEVTOOLS: false,
  supabase: getSupabaseEnvFromProcess(),
};
