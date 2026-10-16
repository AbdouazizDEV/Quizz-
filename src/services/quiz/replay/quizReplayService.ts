export interface QuizReplayStatus {
  canReplay: boolean;
  bestScore: number;
  maxScore: number;
  missingPoints: number;
  progressPercent: number;
  isComplete: boolean;
  hasPlayedBefore: boolean;
}

export function buildReplayStatus(bestScore: number, maxScore: number): QuizReplayStatus {
  const safeMax = Math.max(0, maxScore);
  const safeBest = Math.max(0, Math.min(bestScore, safeMax));
  const missingPoints = Math.max(0, safeMax - safeBest);
  const progressPercent = safeMax > 0 ? Math.round((safeBest / safeMax) * 100) : 0;

  return {
    canReplay: safeMax === 0 || safeBest < safeMax,
    bestScore: safeBest,
    maxScore: safeMax,
    missingPoints,
    progressPercent,
    isComplete: safeMax > 0 && safeBest >= safeMax,
    hasPlayedBefore: safeBest > 0,
  };
}

/**
 * Statut rejeu pour un quiz.
 * Les scores joueur viennent de Nest (catalogue / complete) — pas de PostgREST Supabase.
 * Sans endpoint dédié scores-par-quiz, on laisse rejouer ; le catalogue Nest marque déjà
 * `is_completed_by_player` quand le JWT est présent.
 */
export async function fetchQuizReplayStatus(
  _userId: string,
  _quizId: string,
  maxScore: number,
): Promise<QuizReplayStatus> {
  return buildReplayStatus(0, maxScore);
}

/** Quiz dont le joueur a déjà atteint le score maximum (mode libre). */
export async function isQuizFullyCompletedByPlayer(
  _userId: string,
  _quizId: string,
): Promise<boolean> {
  return false;
}

/** IDs des quiz déjà terminés au score max par le joueur (fournis par Nest côté catalogue). */
export async function fetchFullyCompletedQuizIdSet(
  _userId: string,
  _quizIds?: string[],
): Promise<Set<string>> {
  return new Set();
}
