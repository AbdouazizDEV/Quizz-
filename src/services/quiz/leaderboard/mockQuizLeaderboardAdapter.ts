import type { QuizLeaderboardEntry } from '@app-types/quizPlay.types';
import type { IQuizLeaderboardPort } from '@services/quiz/leaderboard/IQuizLeaderboardPort';

/** Données de démo — remplacer par une vue SQL / edge function quand le classement public sera disponible. */
export class MockQuizLeaderboardAdapter implements IQuizLeaderboardPort {
  async fetchLeaderboardForQuiz(_quizId: string, limit = 7): Promise<QuizLeaderboardEntry[]> {
    const demo: QuizLeaderboardEntry[] = [
      { rank: 1, userId: 'demo-1', displayName: 'Pedro', score: 3645, avatarUrl: null, isCurrentUser: false },
      { rank: 2, userId: 'demo-2', displayName: 'Andrew', score: 3496, avatarUrl: null, isCurrentUser: false },
      { rank: 3, userId: 'demo-3', displayName: 'Freida', score: 3178, avatarUrl: null, isCurrentUser: false },
      { rank: 4, userId: 'demo-4', displayName: 'Clinton', score: 2846, avatarUrl: null, isCurrentUser: false },
      { rank: 5, userId: 'demo-5', displayName: 'Theresa', score: 2600, avatarUrl: null, isCurrentUser: false },
      { rank: 6, userId: 'demo-6', displayName: 'Jamel', score: 2410, avatarUrl: null, isCurrentUser: false },
      { rank: 7, userId: 'demo-7', displayName: 'Leif', score: 2288, avatarUrl: null, isCurrentUser: false },
    ];
    return demo.slice(0, limit);
  }
}
