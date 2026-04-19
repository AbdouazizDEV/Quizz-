import type { SupabaseClient } from '@supabase/supabase-js';

import { AppConfig } from '@config';
import type { Database } from '@app-types/supabase/database.types';

import { getSupabaseSingleton, resetSupabaseSingletonForTests } from '../../../utils/supabase';
import { isSupabaseConfigured } from './supabaseConfig';

/**
 * Client Supabase partagé, ou `null` si l’URL / la clé ne sont pas configurées.
 * Ne déclenche pas la création du client tant que la config est absente.
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  const { supabase: cfg } = AppConfig;
  if (!isSupabaseConfigured(cfg)) {
    return null;
  }
  return getSupabaseSingleton();
}

/** @deprecated Préférer `resetSupabaseSingletonForTests` depuis `utils/supabase`. */
export function resetSupabaseClientForTests(): void {
  resetSupabaseSingletonForTests();
}
