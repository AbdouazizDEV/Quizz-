import {
  applyOptimisticChallengeParticipation,
  findCachedChallengeQuiz,
} from '@services/offline/challengeCacheOptimistic';
import { CHALLENGE_PARTICIPATION_INSERT } from '@services/offline/challengeMutations';
import { enqueueSupabaseMutation, runOnlineOrQueue } from '@services/offline/offlineMutation';
import { fetchNetworkOnline } from '@services/offline/networkStatus';
import { offlineStore } from '@services/offline/OfflineStore';
import type { OfflineMutationResult } from '@services/offline/types';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';
import { ensureSupabaseAuthSession } from '@services/supabase/syncSupabaseAuthSession';
import { useAuthStore } from '@stores/authStore';

export class ChallengeParticipationError extends Error {
  constructor(
    public readonly code: 'ALREADY_PLAYED' | 'NOT_YET_AVAILABLE' | 'NOT_CONFIGURED' | 'OFFLINE_NO_CACHE',
    message: string,
  ) {
    super(message);
    this.name = 'ChallengeParticipationError';
  }
}

async function assertCanParticipateOnline(
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

async function assertCanParticipateFromCache(
  userId: string,
  challengeId: string,
  quizId: string,
  scheduledDay: string,
): Promise<void> {
  const cachedQuiz = await findCachedChallengeQuiz(userId, challengeId, quizId);
  if (!cachedQuiz) {
    throw new ChallengeParticipationError(
      'OFFLINE_NO_CACHE',
      'Challenge indisponible hors ligne. Ouvrez-le une fois en ligne.',
    );
  }

  if (cachedQuiz.isPlayed) {
    throw new ChallengeParticipationError(
      'ALREADY_PLAYED',
      'Vous avez déjà joué ce quiz dans ce challenge.',
    );
  }

  const today = new Date().toISOString().split('T')[0];
  if (scheduledDay > today || !cachedQuiz.isAvailable) {
    throw new ChallengeParticipationError(
      'NOT_YET_AVAILABLE',
      `Ce quiz sera disponible le ${formatFrenchDate(scheduledDay)}.`,
    );
  }
}

export async function assertCanParticipateInChallengeQuiz(
  userId: string,
  challengeId: string,
  quizId: string,
  scheduledDay: string,
): Promise<void> {
  if (await fetchNetworkOnline()) {
    await assertCanParticipateOnline(userId, challengeId, quizId, scheduledDay);
    return;
  }
  await assertCanParticipateFromCache(userId, challengeId, quizId, scheduledDay);
}

async function recordChallengeParticipationOnline(
  userId: string,
  challengeId: string,
  quizId: string,
  score: number,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new ChallengeParticipationError('NOT_CONFIGURED', 'Supabase non configuré');
  }

  await ensureSupabaseAuthSession(useAuthStore.getState().token);

  const { error } = await supabase.from('challenge_participations').insert({
    user_id: userId,
    challenge_id: challengeId,
    quiz_id: quizId,
    score,
    played_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

export async function recordChallengeParticipation(
  userId: string,
  challengeId: string,
  quizId: string,
  score: number,
): Promise<OfflineMutationResult> {
  const playedAt = new Date().toISOString();

  return runOnlineOrQueue(
    () => recordChallengeParticipationOnline(userId, challengeId, quizId, score),
    async () => {
      const alreadyQueued = await offlineStore.hasPendingMutation(CHALLENGE_PARTICIPATION_INSERT, {
        user_id: userId,
        challenge_id: challengeId,
        quiz_id: quizId,
      });
      if (alreadyQueued) {
        throw new Error('Score déjà en attente de synchronisation.');
      }

      await enqueueSupabaseMutation({
        method: 'POST',
        url: CHALLENGE_PARTICIPATION_INSERT,
        body: {
          user_id: userId,
          challenge_id: challengeId,
          quiz_id: quizId,
          score,
          played_at: playedAt,
        },
      });
      await applyOptimisticChallengeParticipation(userId, challengeId, quizId, score);
    },
  );
}

function formatFrenchDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
