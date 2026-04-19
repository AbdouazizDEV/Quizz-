import { getSupabaseEnvFromProcess } from '../supabaseEnv';

export const localConfig = {
  ENV: 'local' as const,
  API_BASE_URL: 'http://localhost:3000/api/v1',
  WS_URL: 'ws://localhost:3000',
  /** Axios (register, login, etc.) — aligné avec les appels Supabase côté API qui peuvent être lents. */
  TIMEOUT_MS: 30_000,
  ENABLE_LOGS: true,
  ENABLE_DEVTOOLS: true,
  supabase: getSupabaseEnvFromProcess(),
};
