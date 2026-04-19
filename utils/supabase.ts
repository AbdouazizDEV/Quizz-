/**
 * Client Supabase unique (aligné doc Supabase / Expo).
 * L’initialisation est **paresseuse** : si `createClient` est appelé tout de suite avec une URL vide,
 * `@supabase/supabase-js` lève `supabaseUrl is required` et fait planter le bundle (écran blanc sur le web).
 *
 * @example
 * import { supabase } from '../utils/supabase';
 * const { data } = await supabase.from('profiles').select('*');
 */
import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseClient } from '../src/services/supabase/createSupabaseClient';
import { getSupabaseEnvFromProcess } from '../config/supabaseEnv';
import type { Database } from '../src/types/supabase/database.types';

let client: SupabaseClient<Database> | null = null;

export function getSupabaseSingleton(): SupabaseClient<Database> {
  if (!client) {
    const { url, anonKey } = getSupabaseEnvFromProcess();
    if (!url?.trim() || !anonKey?.trim()) {
      throw new Error(
        '[Supabase] Définir EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_KEY puis redémarrer Metro (npx expo start --clear).',
      );
    }
    client = createSupabaseClient(url.trim(), anonKey.trim());
  }
  return client;
}

export function resetSupabaseSingletonForTests(): void {
  client = null;
}

/** Délègue au singleton au premier accès (import du module sans effet destructeur). */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const c = getSupabaseSingleton();
    const value = Reflect.get(c as object, prop, receiver);
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(c) : value;
  },
});
