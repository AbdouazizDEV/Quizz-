import { DefaultSupabaseClientAccessor } from './DefaultSupabaseClientAccessor';
import type { ISupabaseClientAccessor } from './ISupabaseClientAccessor';

export const supabaseClientAccessor: ISupabaseClientAccessor = new DefaultSupabaseClientAccessor();
