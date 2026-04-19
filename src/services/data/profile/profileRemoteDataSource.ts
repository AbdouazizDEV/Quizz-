import type { Database } from '@app-types/supabase/database.types';
import type { ISupabaseClientAccessor } from '@services/supabase/ISupabaseClientAccessor';
import { supabaseClientAccessor } from '@services/supabase/supabaseClientAccessorInstance';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/**
 * Contrat lecture profil côté backend distant (remplaçable par l’API REST plus tard).
 */
export interface IProfileRemoteDataSource {
  getById(userId: string): Promise<ProfileRow | null>;
}

export class SupabaseProfileRemoteDataSource implements IProfileRemoteDataSource {
  constructor(private readonly clientAccessor: ISupabaseClientAccessor) {}

  async getById(userId: string): Promise<ProfileRow | null> {
    const client = this.clientAccessor.getClient();
    if (!client) {
      return null;
    }
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return data;
  }
}

export function createProfileRemoteDataSource(
  accessor: ISupabaseClientAccessor = supabaseClientAccessor,
): IProfileRemoteDataSource {
  return new SupabaseProfileRemoteDataSource(accessor);
}

/** Instance par défaut (injecter un mock d’`ISupabaseClientAccessor` dans les tests). */
export const profileRemoteDataSource: IProfileRemoteDataSource = createProfileRemoteDataSource();
