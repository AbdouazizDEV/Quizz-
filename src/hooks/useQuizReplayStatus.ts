import { useQuery } from '@tanstack/react-query';

import {
  fetchQuizReplayStatus,
  type QuizReplayStatus,
} from '@services/quiz/replay/quizReplayService';

export function useQuizReplayStatus(
  userId: string | undefined,
  quizId: string | undefined,
  maxScore: number,
) {
  return useQuery<QuizReplayStatus>({
    queryKey: ['quiz-replay-status', userId, quizId, maxScore],
    enabled: Boolean(userId && quizId && maxScore > 0),
    queryFn: async () => {
      if (!userId || !quizId) {
        return fetchQuizReplayStatus('', quizId ?? '', maxScore);
      }
      return fetchQuizReplayStatus(userId, quizId, maxScore);
    },
  });
}
