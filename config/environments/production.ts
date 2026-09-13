import { resolveApiBaseUrl, resolveWsBaseUrl } from '../apiBaseUrl';
import { getSupabaseEnvFromProcess } from '../supabaseEnv';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim()?.replace(/\/$/, '') ??
  'https://api.quizzp.com/api/v1';

const INVITE_WEB_BASE_URL =
  process.env.EXPO_PUBLIC_INVITE_WEB_BASE_URL?.trim()?.replace(/\/$/, '') ??
  'https://quizzp.com';

export const productionConfig = {
  ENV: 'production' as const,
  /** API backend déployée (repo séparé). */
  API_BASE_URL,
  /** Liens d’invitation ami (front Quizzweb, pas le sous-domaine API). */
  INVITE_WEB_BASE_URL,
  WS_URL: resolveWsBaseUrl(API_BASE_URL),
  TIMEOUT_MS: 30_000,
  ENABLE_LOGS: false,
  ENABLE_DEVTOOLS: false,
  supabase: getSupabaseEnvFromProcess(),
};
