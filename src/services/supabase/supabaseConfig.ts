/** Indique si l’URL et la clé anon Supabase sont renseignées (build Expo). */
export function isSupabaseConfigured(config: { url: string; anonKey: string }): boolean {
  return config.url.trim().length > 0 && config.anonKey.trim().length > 0;
}
