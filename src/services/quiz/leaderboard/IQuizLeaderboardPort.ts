import type { QuizLeaderboardEntry } from '@app-types/quizPlay.types';

/** Meilleurs scores par quiz (API `/quizzes/:id/leaderboard`). */
export interface IQuizLeaderboardPort {
  fetchLeaderboardForQuiz(quizId: string, limit?: number): Promise<QuizLeaderboardEntry[]>;
}
