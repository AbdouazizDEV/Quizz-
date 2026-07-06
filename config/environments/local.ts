import { getSupabaseEnvFromProcess } from '../supabaseEnv';
import { inviteWebBaseFromApiUrl } from '../inviteWebBase';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export const localConfig = {
  ENV: 'local' as const,
  API_BASE_URL,
  INVITE_WEB_BASE_URL: inviteWebBaseFromApiUrl(API_BASE_URL),
  WS_URL: 'ws://localhost:3000',
  /** Axios (register, login, etc.) — aligné avec les appels Supabase côté API qui peuvent être lents. */
  TIMEOUT_MS: 30_000,
  ENABLE_LOGS: true,
  ENABLE_DEVTOOLS: true,
  supabase: getSupabaseEnvFromProcess(),
};
