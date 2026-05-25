import { playQuizSoundForSlot } from '@services/quiz/play/playQuizSoundForSlot';

import type { QuizSoundSlot } from '@app-types/quizSoundPreferences.types';

export type QuizCongratsOutcome = 'perfect' | 'partial' | 'defeat';

export function resolveQuizCongratsOutcome(correctCount: number, total: number): QuizCongratsOutcome {
  if (total > 0 && correctCount >= total) return 'perfect';
  if (total > 0 && correctCount > total / 2) return 'partial';
  return 'defeat';
}

function outcomeToSlot(outcome: QuizCongratsOutcome): QuizSoundSlot {
  switch (outcome) {
    case 'perfect':
      return 'victoryPerfect';
    case 'partial':
      return 'victoryPartial';
    default:
      return 'defeat';
  }
}

/** Son de fin de quiz selon le résultat (toutes bonnes / moyenne / échec). */
export async function triggerQuizCongratsSound(correctCount: number, total: number): Promise<void> {
  const outcome = resolveQuizCongratsOutcome(correctCount, total);
  await playQuizSoundForSlot(outcomeToSlot(outcome));
}
