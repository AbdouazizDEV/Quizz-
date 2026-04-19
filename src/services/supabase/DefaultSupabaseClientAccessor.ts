import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@app-types/supabase/database.types';

import type { ISupabaseClientAccessor } from './ISupabaseClientAccessor';
import { getSupabaseClient } from './supabaseClientSingleton';

export class DefaultSupabaseClientAccessor implements ISupabaseClientAccessor {
  getClient(): SupabaseClient<Database> | null {
    return getSupabaseClient();
  }
}
