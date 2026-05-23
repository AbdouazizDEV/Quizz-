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
