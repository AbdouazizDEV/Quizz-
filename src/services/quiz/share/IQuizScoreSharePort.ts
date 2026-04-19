/** Partage du score (notification, réseaux sociaux, etc.). */
export interface IQuizScoreSharePort {
  shareScore(params: { quizTitle: string; score: number; correctCount: number; total: number }): Promise<void>;
}
