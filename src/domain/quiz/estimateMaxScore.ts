import { DIFFICULTY_POINTS } from '@domain/quiz/difficultyPoints';

/** Score max approximatif d’un quiz (moyenne medium si détail inconnu). */
export function estimateMaxScoreFromQuestionCount(questionCount: number): number {
  const n = Math.max(0, Math.floor(questionCount));
  return n * DIFFICULTY_POINTS.medium;
}
