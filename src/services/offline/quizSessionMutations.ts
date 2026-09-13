/** POST Nest : /quizzes/:quizId/complete */
export function quizCompleteApiPath(quizId: string): string {
  let id = quizId.trim();
  try {
    id = decodeURIComponent(id);
  } catch {
    /* garder l’id tel quel */
  }
  return `/quizzes/${encodeURIComponent(id)}/complete`;
}

export function isQuizCompleteApiPath(path: string): boolean {
  return /^\/quizzes\/[^/]+\/complete\/?$/.test(path.trim());
}

export interface QuizSessionCompleteBody {
  score: number;
  answers?: { questionId: string; selected: string; correct: boolean }[];
}

export interface QuizSessionCompleteResponse {
  session_id: string | null;
  score: number;
  total_score: number;
  quizzes_completed: number;
}

function readFiniteNumber(...candidates: unknown[]): number | null {
  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

/**
 * Accepte snake_case / camelCase et un éventuel unwrap `{ data: ... }`.
 * Retourne null si aucun score de profil n’est exploitable.
 */
export function parseQuizSessionCompleteResponse(
  raw: unknown,
): QuizSessionCompleteResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;

  const score = readFiniteNumber(nested.score, nested.session_score, nested.sessionScore) ?? 0;
  const total_score = readFiniteNumber(nested.total_score, nested.totalScore);
  const quizzes_completed = readFiniteNumber(
    nested.quizzes_completed,
    nested.quizzesCompleted,
  );
  if (total_score === null && quizzes_completed === null && score === 0) return null;

  const sessionRaw = nested.session_id ?? nested.sessionId;
  const session_id =
    sessionRaw == null || sessionRaw === '' ? null : String(sessionRaw);

  return {
    session_id,
    score,
    total_score: total_score ?? 0,
    quizzes_completed: quizzes_completed ?? 0,
  };
}
