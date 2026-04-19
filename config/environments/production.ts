import { getSupabaseEnvFromProcess } from '../supabaseEnv';

export const productionConfig = {
  ENV: 'production' as const,
  API_BASE_URL: 'https://api.quizzplus.com/api/v1',
  WS_URL: 'wss://api.quizzplus.com',
  TIMEOUT_MS: 30_000,
  ENABLE_LOGS: false,
  ENABLE_DEVTOOLS: false,
  supabase: getSupabaseEnvFromProcess(),
};
