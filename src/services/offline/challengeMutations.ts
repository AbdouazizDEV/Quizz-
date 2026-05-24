export const CHALLENGE_PARTICIPATION_INSERT = 'supabase://challenge_participations/insert';

export interface ChallengeParticipationMutationBody {
  user_id: string;
  challenge_id: string;
  quiz_id: string;
  score: number;
  played_at: string;
}
