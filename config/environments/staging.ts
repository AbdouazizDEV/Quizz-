import { getSupabaseEnvFromProcess } from '../supabaseEnv';
import { inviteWebBaseFromApiUrl } from '../inviteWebBase';

const API_BASE_URL = 'https://quizzplus-api.onrender.com/api/v1';

export const stagingConfig = {
  ENV: 'staging' as const,
  /** Pas d’hébergement staging dédié pour l’instant : même API que la prod (Render). */
  API_BASE_URL,
  INVITE_WEB_BASE_URL: inviteWebBaseFromApiUrl(API_BASE_URL),
  WS_URL: 'wss://quizzplus-api.onrender.com',
  TIMEOUT_MS: 30_000,
  ENABLE_LOGS: true,
  ENABLE_DEVTOOLS: false,
  supabase: getSupabaseEnvFromProcess(),
};
