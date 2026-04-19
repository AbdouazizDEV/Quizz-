import type { QuizLeaderboardEntry } from '@app-types/quizPlay.types';

/** Classement pour un quiz (impl mock tant que la lecture cross-user n’est pas exposée en RLS). */
export interface IQuizLeaderboardPort {
  fetchLeaderboardForQuiz(quizId: string, limit?: number): Promise<QuizLeaderboardEntry[]>;
}
