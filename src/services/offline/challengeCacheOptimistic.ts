import type { ChallengeProgress } from '@app-types/challenge.types';

import { challengeProgressCacheKey } from './challengeCacheKeys';
import { offlineStore } from './OfflineStore';

export async function applyOptimisticChallengeParticipation(
  userId: string,
  challengeId: string,
  quizId: string,
  score: number,
): Promise<void> {
  const cacheKey = challengeProgressCacheKey(challengeId, userId);
  const progress = await offlineStore.getCachedResponse<ChallengeProgress>(cacheKey);
  if (!progress) return;

  const dailyQuizzes = progress.dailyQuizzes.map((quiz) => {
    if (quiz.quizId !== quizId) return quiz;
    return {
      ...quiz,
      userScore: score,
      isPlayed: true,
      canReplay: false,
    };
  });

  const userScore = dailyQuizzes.reduce((sum, quiz) => sum + (quiz.userScore ?? 0), 0);
  const quizzesPlayed = dailyQuizzes.filter((quiz) => quiz.isPlayed).length;

  await offlineStore.setCachedResponse({
    cacheKey,
    source: 'supabase',
    data: {
      ...progress,
      dailyQuizzes,
      userScore,
      quizzesPlayed,
    },
  });
}

export async function findCachedChallengeQuiz(
  userId: string,
  challengeId: string,
  quizId: string,
): Promise<ChallengeProgress['dailyQuizzes'][number] | null> {
  const progress = await offlineStore.getCachedResponse<ChallengeProgress>(
    challengeProgressCacheKey(challengeId, userId),
  );
  return progress?.dailyQuizzes.find((quiz) => quiz.quizId === quizId) ?? null;
}
