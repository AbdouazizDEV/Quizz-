/** Identifiants de mutations Supabase (file offline). */
export const COMPETITION_REGISTER_MUTATION = 'supabase://competition_registrations/register';
export const COMPETITION_UNREGISTER_MUTATION = 'supabase://competition_registrations/unregister';

export interface CompetitionRegistrationMutationBody {
  user_id: string;
  competition_id: string;
}
