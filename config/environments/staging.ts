import { getSupabaseEnvFromProcess } from '../supabaseEnv';

export const stagingConfig = {
  ENV: 'staging' as const,
  /** Pas d’hébergement staging dédié pour l’instant : même API que la prod (Render). */
  API_BASE_URL: 'https://quizzplus-api.onrender.com/api/v1',
  WS_URL: 'wss://quizzplus-api.onrender.com',
  TIMEOUT_MS: 30_000,
  ENABLE_LOGS: true,
  ENABLE_DEVTOOLS: false,
  supabase: getSupabaseEnvFromProcess(),
};
