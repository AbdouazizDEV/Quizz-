export type { ISupabaseClientAccessor } from './ISupabaseClientAccessor';
export { DefaultSupabaseClientAccessor } from './DefaultSupabaseClientAccessor';
export { supabaseClientAccessor } from './supabaseClientAccessorInstance';
export { createSupabaseClient } from './createSupabaseClient';
export { getSupabaseClient, resetSupabaseClientForTests } from './supabaseClientSingleton';
export { isSupabaseConfigured } from './supabaseConfig';
