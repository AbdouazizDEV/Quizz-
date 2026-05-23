import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';

export class ChallengeParticipationError extends Error {
  constructor(
    public readonly code: 'ALREADY_PLAYED' | 'NOT_YET_AVAILABLE' | 'NOT_CONFIGURED',
    message: string,
  ) {
    super(message);
    this.name = 'ChallengeParticipationError';
  }
}

export async function assertCanParticipateInChallengeQuiz(
  userId: string,
  challengeId: string,
  quizId: string,
  scheduledDay: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new ChallengeParticipationError('NOT_CONFIGURED', 'Supabase non configuré');
  }

  const { count } = await supabase
    .from('challenge_participations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .eq('quiz_id', quizId);

  if (count && count > 0) {
    throw new ChallengeParticipationError(
      'ALREADY_PLAYED',
      'Vous avez déjà joué ce quiz dans ce challenge.',
    );
  }

  const today = new Date().toISOString().split('T')[0];
  if (scheduledDay > today) {
    throw new ChallengeParticipationError(
      'NOT_YET_AVAILABLE',
      `Ce quiz sera disponible le ${formatFrenchDate(scheduledDay)}.`,
    );
  }
}

export async function recordChallengeParticipation(
  userId: string,
  challengeId: string,
  quizId: string,
  score: number,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new ChallengeParticipationError('NOT_CONFIGURED', 'Supabase non configuré');
  }

  const { error } = await supabase.from('challenge_participations').insert({
    user_id: userId,
    challenge_id: challengeId,
    quiz_id: quizId,
    score,
    played_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

function formatFrenchDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
