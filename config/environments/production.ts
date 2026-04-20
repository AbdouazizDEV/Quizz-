import { getSupabaseEnvFromProcess } from '../supabaseEnv';

export const productionConfig = {
  ENV: 'production' as const,
  /** API Node déployée sur Render (`server/`). */
  API_BASE_URL: 'https://quizzplus-api.onrender.com/api/v1',
  WS_URL: 'wss://quizzplus-api.onrender.com',
  TIMEOUT_MS: 30_000,
  ENABLE_LOGS: false,
  ENABLE_DEVTOOLS: false,
  supabase: getSupabaseEnvFromProcess(),
};
