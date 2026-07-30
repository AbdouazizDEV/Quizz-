import { pointsForDifficulty, type QuestionDifficulty } from './difficultyPoints.js';

export interface ScoreAnswerInput {
  questionId: string;
  isCorrect: boolean;
  difficulty?: QuestionDifficulty | string | null;
}

/**
 * Calcule le score à partir des réponses et de la difficulté réelle de chaque question.
 * À utiliser côté serveur (autorité) ; le client peut l’utiliser en affichage optimiste.
 */
export function computeSessionScore(
  answers: readonly ScoreAnswerInput[],
  difficultyByQuestionId?: ReadonlyMap<string, string | null | undefined>,
): number {
  let total = 0;
  for (const a of answers) {
    if (!a.isCorrect) continue;
    const diff =
      a.difficulty ??
      difficultyByQuestionId?.get(a.questionId) ??
      'medium';
    total += pointsForDifficulty(diff);
  }
  return total;
}
