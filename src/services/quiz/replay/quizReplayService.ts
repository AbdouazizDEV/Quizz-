import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';

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

export async function fetchQuizReplayStatus(
  userId: string,
  quizId: string,
  maxScore: number,
): Promise<QuizReplayStatus> {
  const client = getSupabaseClient();
  if (!client) {
    return buildReplayStatus(0, maxScore);
  }

  const { data: row } = await client
    .from('user_quiz_scores')
    .select('best_score, max_score')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .maybeSingle();

  if (row) {
    const resolvedMax = Math.max(maxScore, row.max_score ?? 0);
    return buildReplayStatus(row.best_score ?? 0, resolvedMax);
  }

  const { data: sessionRows } = await client
    .from('quiz_sessions')
    .select('score')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .eq('is_completed', true)
    .order('score', { ascending: false })
    .limit(1);

  const bestFromSessions = sessionRows?.[0]?.score ?? 0;
  return buildReplayStatus(bestFromSessions, maxScore);
}

/** Quiz dont le joueur a déjà atteint le score maximum (mode libre). */
export async function isQuizFullyCompletedByPlayer(
  userId: string,
  quizId: string,
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !userId.trim() || !quizId.trim()) return false;

  const { data: quiz } = await client
    .from('quizzes')
    .select('total_questions, points_per_question')
    .eq('id', quizId)
    .maybeSingle();

  const maxScore = Math.max(0, (quiz?.total_questions ?? 0) * (quiz?.points_per_question ?? 1));
  const status = await fetchQuizReplayStatus(userId, quizId, maxScore);
  return status.isComplete;
}

/** IDs des quiz déjà terminés au score max par le joueur. */
export async function fetchFullyCompletedQuizIdSet(
  userId: string,
  quizIds?: string[],
): Promise<Set<string>> {
  const client = getSupabaseClient();
  if (!client || !userId.trim()) return new Set();

  let query = client
    .from('user_quiz_scores')
    .select('quiz_id, best_score, max_score')
    .eq('user_id', userId);

  if (quizIds?.length) {
    query = query.in('quiz_id', quizIds);
  }

  const { data: rows } = await query;
  const completed = new Set<string>();
  for (const row of rows ?? []) {
    if (!row.quiz_id) continue;
    const max = row.max_score ?? 0;
    const best = row.best_score ?? 0;
    if (max > 0 && best >= max) {
      completed.add(row.quiz_id);
    }
  }
  return completed;
}
