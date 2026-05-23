/** Codes difficulté Supabase (Z0–Z3). */
export type QuizDifficultyCode = 'Z0' | 'Z1' | 'Z2' | 'Z3';

/** Durée du chrono par question (secondes). */
export const TIMER_SECONDS_BY_DIFFICULTY: Record<QuizDifficultyCode, number> = {
  Z0: 15,
  Z1: 12,
  Z2: 10,
  Z3: 10,
} as const;

const DEFAULT_TIMER_SECONDS = 15;

export function normalizeDifficultyCode(level: string | null | undefined): QuizDifficultyCode | null {
  const code = level?.trim().toUpperCase();
  if (code === 'Z0' || code === 'Z1' || code === 'Z2' || code === 'Z3') return code;
  return null;
}

export function getTimerSecondsForDifficulty(level: string | null | undefined): number {
  const code = normalizeDifficultyCode(level);
  if (!code) return DEFAULT_TIMER_SECONDS;
  return TIMER_SECONDS_BY_DIFFICULTY[code];
}
