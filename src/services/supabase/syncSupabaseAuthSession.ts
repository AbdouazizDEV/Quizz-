import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';
import { readStoredRefreshToken } from '@services/auth/authTokenStorage';

/**
 * Aligne le client Supabase JS avec le JWT Quizz+ (stocké après login API).
 * Sans cela, les requêtes directes Supabase partent en anon et auth.uid() est null → RLS refuse les INSERT.
 */
export async function syncSupabaseAuthSession(
  accessToken: string | null | undefined,
  refreshToken?: string | null,
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const token = accessToken?.trim();
  if (!token) {
    await client.auth.signOut();
    return;
  }

  const { data: current } = await client.auth.getSession();
  if (current.session?.access_token === token) return;

  const refresh = refreshToken?.trim() ?? (await readStoredRefreshToken());
  if (!refresh) {
    const { error: userErr } = await client.auth.getUser(token);
    if (userErr) {
      throw new Error('Session expirée. Reconnectez-vous.');
    }
    throw new Error('Session Supabase incomplète. Reconnectez-vous.');
  }

  const { error } = await client.auth.setSession({
    access_token: token,
    refresh_token: refresh,
  });
  if (error) {
    throw new Error('Impossible de synchroniser la session. Reconnectez-vous.');
  }
}

/** À appeler avant tout INSERT/DELETE Supabase côté app. */
export async function ensureSupabaseAuthSession(accessToken?: string | null): Promise<void> {
  const token = accessToken?.trim() ?? undefined;
  if (!token) {
    const client = getSupabaseClient();
    if (client) await client.auth.signOut();
    throw new Error('Utilisateur non connecté.');
  }
  await syncSupabaseAuthSession(token);
}
