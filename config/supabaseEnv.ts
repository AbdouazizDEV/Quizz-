/**
 * Variables Expo (préfixe EXPO_PUBLIC_) injectées au build.
 * Définir dans `.env`, `.env.local`, ou les scripts npm (voir `.env.example`).
 */
export function getSupabaseEnvFromProcess(): { url: string; anonKey: string } {
  return {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    /** Dashboard Supabase (clé publishable) ; repli sur l’ancien nom `EXPO_PUBLIC_SUPABASE_ANON_KEY`. */
    anonKey:
      process.env.EXPO_PUBLIC_SUPABASE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  };
}
