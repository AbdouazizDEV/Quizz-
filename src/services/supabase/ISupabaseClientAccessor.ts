import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@app-types/supabase/database.types';

/**
 * Point d’injection pour les tests ou un futur backend (remplace le client par un mock).
 */
export interface ISupabaseClientAccessor {
  getClient(): SupabaseClient<Database> | null;
}
