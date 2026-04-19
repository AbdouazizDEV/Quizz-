import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@app-types/supabase/database.types';

/**
 * Fabrique un client Supabase adapté à React Native (session persistée via AsyncStorage).
 * À utiliser via {@link getSupabaseClient} pour ne pas multiplier les instances.
 */
export function createSupabaseClient(url: string, anonKey: string): SupabaseClient<Database> {
  return createClient<Database>(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
