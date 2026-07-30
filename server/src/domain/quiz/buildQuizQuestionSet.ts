import {
  normalizeQuestionDifficulty,
  quizLevelKindFromCode,
  warmupEasyCount,
  type QuestionDifficulty,
  type QuizLevelKind,
} from './difficultyPoints';
import { createSeededRandom, pickNWithSeed, seedFromString, shuffleWithSeed } from './seededRandom';

export interface QuestionSetItem {
  id: string;
  difficulty: QuestionDifficulty | string | null | undefined;
}

export interface BuildQuizQuestionSetInput<T extends QuestionSetItem> {
  /** Banque de questions candidates (catégorie / quiz). */
  pool: readonly T[];
  /** Nombre total de questions souhaité. */
  totalQuestions: number;
  /** Niveau annoncé du quiz (Z0–A3 ou easy/medium/hard). */
  quizLevel: string | null | undefined;
  /**
   * Seed optionnel : si fourni, le tirage est déterministe (tournoi).
   * Sinon, seed aléatoire à chaque appel.
   */
  seed?: string | number | null;
}

export interface BuildQuizQuestionSetResult<T extends QuestionSetItem> {
  questions: T[];
  warmupCount: number;
  quizLevelKind: QuizLevelKind;
  seedUsed: number;
}

function resolveLevelKind(quizLevel: string | null | undefined): QuizLevelKind {
  const raw = (quizLevel ?? '').trim().toLowerCase();
  if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw;
  return quizLevelKindFromCode(quizLevel);
}

/**
 * Compose un set de questions :
 * - warm-up easy en tête si quiz medium/hard (2 si ≤10, 3 si >15/ >10)
 * - reste tiré selon la difficulté cible, mélangé
 * - seed déterministe pour équité tournoi
 *
 * Pure : aucun I/O. Respecte SRP / OCP (extension via pool + seed).
 */
export function buildQuizQuestionSet<T extends QuestionSetItem>(
  input: BuildQuizQuestionSetInput<T>,
): BuildQuizQuestionSetResult<T> {
  const quizLevelKind = resolveLevelKind(input.quizLevel);
  const total = Math.max(0, Math.floor(input.totalQuestions));
  const seedUsed =
    typeof input.seed === 'number'
      ? input.seed >>> 0
      : typeof input.seed === 'string' && input.seed.trim()
        ? seedFromString(input.seed.trim())
        : (Math.floor(Math.random() * 0xffffffff) >>> 0);

  const random = createSeededRandom(seedUsed);
  const pool = [...input.pool];

  if (total === 0 || pool.length === 0) {
    return { questions: [], warmupCount: 0, quizLevelKind, seedUsed };
  }

  const warmupCount = Math.min(warmupEasyCount(total, quizLevelKind), total);
  const byDiff = (d: QuestionDifficulty) =>
    pool.filter((q) => normalizeQuestionDifficulty(q.difficulty) === d);

  const easyPool = byDiff('easy');
  const mediumPool = byDiff('medium');
  const hardPool = byDiff('hard');

  const warmup = pickNWithSeed(easyPool, warmupCount, random);
  const warmupIds = new Set(warmup.map((q) => q.id));

  const remainingNeeded = total - warmup.length;
  const targetPool =
    quizLevelKind === 'easy'
      ? easyPool.filter((q) => !warmupIds.has(q.id))
      : quizLevelKind === 'medium'
        ? mediumPool.filter((q) => !warmupIds.has(q.id))
        : hardPool.filter((q) => !warmupIds.has(q.id));

  let rest = pickNWithSeed(targetPool, remainingNeeded, random);

  // Si la banque cible est insuffisante, compléter depuis le reste du pool.
  if (rest.length < remainingNeeded) {
    const used = new Set([...warmupIds, ...rest.map((q) => q.id)]);
    const filler = pickNWithSeed(
      pool.filter((q) => !used.has(q.id)),
      remainingNeeded - rest.length,
      random,
    );
    rest = [...rest, ...filler];
  }

  rest = shuffleWithSeed(rest, random);
  const questions = [...warmup, ...rest].slice(0, total);

  return { questions, warmupCount, quizLevelKind, seedUsed };
}
