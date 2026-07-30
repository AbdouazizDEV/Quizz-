/**
 * Barème centralisé difficulté → points.
 * Source unique pour quiz, duel, challenge et tournoi (client + serveur).
 */
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_POINTS = {
  easy: 1,
  medium: 2,
  hard: 3,
} as const satisfies Record<QuestionDifficulty, number>;

/** Niveaux quiz « moyens / difficiles » qui déclenchent le warm-up easy. */
export type QuizLevelKind = 'easy' | 'medium' | 'hard';

export function normalizeQuestionDifficulty(
  raw: string | null | undefined,
): QuestionDifficulty {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'easy' || v === 'facile' || v === 'e' || v === '1') return 'easy';
  if (v === 'hard' || v === 'difficile' || v === 'h' || v === '3') return 'hard';
  if (v === 'medium' || v === 'moyen' || v === 'm' || v === '2') return 'medium';
  // Fallback Z-codes (quiz-level labels sometimes reused on questions)
  if (v === 'z0' || v === 'a1') return 'easy';
  if (v === 'z2' || v === 'z3' || v === 'a2' || v === 'a3') return 'hard';
  return 'medium';
}

export function pointsForDifficulty(raw: string | null | undefined): number {
  return DIFFICULTY_POINTS[normalizeQuestionDifficulty(raw)];
}

/**
 * Mappe le `difficulty_level` d’un quiz (Z0–A3) vers easy/medium/hard
 * pour la règle de warm-up.
 */
export function quizLevelKindFromCode(level: string | null | undefined): QuizLevelKind {
  const code = (level ?? '').trim().toUpperCase();
  if (!code || code === 'Z0') return 'easy';
  if (code === 'Z1') return 'medium';
  return 'hard';
}

/** Nombre de questions faciles d’ouverture pour un quiz medium/hard. */
export function warmupEasyCount(totalQuestions: number, quizLevel: QuizLevelKind): number {
  if (quizLevel === 'easy') return 0;
  if (totalQuestions <= 0) return 0;
  return totalQuestions <= 10 ? 2 : 3;
}
