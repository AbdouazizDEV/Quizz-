import type { ChallengeProgress } from '@app-types/challenge.types';
import { estimateMaxScoreFromQuestionCount } from '@domain/quiz/estimateMaxScore';
import {
  activeWeeklyChallengesCacheKey,
  challengeLeaderboardCacheKey,
  challengeProgressCacheKey,
  pastWeeklyChallengesCacheKey,
  readWithOfflineCache,
} from '@services/offline';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';
import { fetchFullyCompletedQuizIdSet } from '@services/quiz/replay/quizReplayService';

import type {
  ChallengeLeaderboard,
  DailyQuiz,
  WeeklyChallenge,
} from '@app-types/challenge.types';

interface WeeklyChallengeRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: 'draft' | 'actif' | 'termine';
  starts_at: string;
  ends_at: string;
  reward_text: string | null;
}

interface WeeklyChallengeQuizRow {
  quiz_id: string;
  scheduled_day: string;
  day_order: number;
  quizzes: {
    title: string;
    difficulty_level: string;
    total_questions: number;
  } | null;
}

function mapChallenge(row: WeeklyChallengeRow): WeeklyChallenge {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    rewardText: row.reward_text,
  };
}

function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

async function loadActiveWeeklyChallengesFromSupabase(): Promise<WeeklyChallenge[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase non configuré');

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('weekly_challenges')
    .select('id, title, description, type, status, starts_at, ends_at, reward_text')
    .eq('status', 'actif')
    .eq('type', 'hebdomadaire')
    .lte('starts_at', nowIso)
    .gte('ends_at', nowIso)
    .order('starts_at', { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as WeeklyChallengeRow[]).map(mapChallenge);
}

async function loadPastWeeklyChallengesFromSupabase(): Promise<WeeklyChallenge[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase non configuré');

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('weekly_challenges')
    .select('id, title, description, type, status, starts_at, ends_at, reward_text')
    .in('status', ['termine', 'actif'])
    .eq('type', 'hebdomadaire')
    .lt('ends_at', nowIso)
    .order('ends_at', { ascending: false })
    .limit(12);

  if (error) throw new Error(error.message);
  return ((data ?? []) as WeeklyChallengeRow[]).map(mapChallenge);
}

function userSemanticScore(participationByQuiz: Map<string, number>): number {
  let total = 0;
  for (const score of participationByQuiz.values()) {
    total += score;
  }
  return total;
}

async function computeUserRank(
  supabase: NonNullable<ReturnType<typeof getSupabaseClient>>,
  challengeId: string,
  userId: string,
  userScore: number,
): Promise<number | null> {
  if (userScore <= 0) return null;

  const { totalsByUser } = await aggregateChallengeScoresByUser(supabase, challengeId);

  const sorted = [...totalsByUser.entries()].sort((a, b) => b[1] - a[1]);
  const index = sorted.findIndex(([uid]) => uid === userId);
  return index >= 0 ? index + 1 : null;
}

async function loadChallengeProgressFromSupabase(
  challengeId: string,
  userId: string,
): Promise<ChallengeProgress> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase non configuré');

  const { data: challengeRow, error: challengeError } = await supabase
    .from('weekly_challenges')
    .select('id, title, description, type, status, starts_at, ends_at, reward_text')
    .eq('id', challengeId)
    .single();

  if (challengeError || !challengeRow) {
    throw new Error('Challenge introuvable');
  }

  const { data: quizRows } = await supabase
    .from('weekly_challenge_quizzes')
    .select('quiz_id, scheduled_day, day_order, quizzes(title, difficulty_level, total_questions)')
    .eq('challenge_id', challengeId)
    .order('day_order', { ascending: true });

  const { data: participationRows } = await supabase
    .from('challenge_participations')
    .select('quiz_id, score')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId);

  const participationByQuiz = new Map(
    (participationRows ?? []).map((row) => [row.quiz_id, row.score ?? 0]),
  );

  const today = todayDateString();
  const quizIds = ((quizRows ?? []) as WeeklyChallengeQuizRow[]).map((row) => row.quiz_id);
  const globallyCompletedIds = await fetchFullyCompletedQuizIdSet(userId, quizIds);

  const dailyQuizzes: DailyQuiz[] = ((quizRows ?? []) as WeeklyChallengeQuizRow[]).map((row) => {
    const userScore = participationByQuiz.get(row.quiz_id) ?? null;
    const isPlayed = userScore !== null;
    const globallyCompleted = globallyCompletedIds.has(row.quiz_id);
    const isAvailable = row.scheduled_day <= today && !globallyCompleted;
    const maxScore = estimateMaxScoreFromQuestionCount(row.quizzes?.total_questions ?? 10);

    return {
      quizId: row.quiz_id,
      title: row.quizzes?.title ?? 'Quiz',
      difficulty: row.quizzes?.difficulty_level ?? 'Z1',
      scheduledDay: row.scheduled_day,
      dayOrder: row.day_order,
      userScore,
      maxScore,
      isAvailable,
      isPlayed,
      canReplay: false,
      globallyCompleted,
    };
  });

  const userScore = userSemanticScore(participationByQuiz);
  const quizzesPlayed = dailyQuizzes.filter((q) => q.isPlayed).length;
  const totalQuizzes = dailyQuizzes.length;
  const userRank = await computeUserRank(supabase, challengeId, userId, userScore);

  return {
    challenge: mapChallenge(challengeRow as WeeklyChallengeRow),
    userScore,
    userRank,
    quizzesPlayed,
    totalQuizzes,
    dailyQuizzes,
  };
}

async function loadProfileDisplayNames(
  supabase: NonNullable<ReturnType<typeof getSupabaseClient>>,
  userIds: string[],
): Promise<Map<string, string>> {
  const namesByUser = new Map<string, string>();
  if (userIds.length === 0) return namesByUser;

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, username')
    .in('id', userIds);

  if (error) throw new Error(error.message);

  for (const profile of profiles ?? []) {
    const name = profile.full_name?.trim() || profile.username?.trim() || 'Joueur';
    namesByUser.set(profile.id, name);
  }
  return namesByUser;
}

async function aggregateChallengeScoresByUser(
  supabase: NonNullable<ReturnType<typeof getSupabaseClient>>,
  challengeId: string,
): Promise<{ totalsByUser: Map<string, number>; namesByUser: Map<string, string> }> {
  const { data: participations, error } = await supabase
    .from('challenge_participations')
    .select('user_id, score')
    .eq('challenge_id', challengeId);

  if (error) throw new Error(error.message);

  const totalsByUser = new Map<string, number>();
  for (const row of participations ?? []) {
    const prev = totalsByUser.get(row.user_id) ?? 0;
    totalsByUser.set(row.user_id, prev + (row.score ?? 0));
  }

  const namesByUser = await loadProfileDisplayNames(supabase, [...totalsByUser.keys()]);
  return { totalsByUser, namesByUser };
}

async function loadChallengeLeaderboardFromSupabase(
  challengeId: string,
  userId: string,
): Promise<ChallengeLeaderboard> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase non configuré');

  const { data: challengeRow, error: challengeError } = await supabase
    .from('weekly_challenges')
    .select('title, ends_at, reward_text')
    .eq('id', challengeId)
    .single();

  if (challengeError) throw new Error(challengeError.message);

  const { totalsByUser, namesByUser } = await aggregateChallengeScoresByUser(supabase, challengeId);

  const sorted = [...totalsByUser.entries()].sort((a, b) => b[1] - a[1]);
  const entries = sorted.map(([uid, totalScore], index) => ({
    userId: uid,
    displayName: namesByUser.get(uid) ?? 'Joueur',
    totalScore,
    rank: index + 1,
    isCurrentUser: uid === userId,
  }));

  const currentEntry = entries.find((e) => e.isCurrentUser) ?? null;
  let pointsToNextRank: number | null = null;
  if (currentEntry && currentEntry.rank > 1) {
    const above = entries.find((e) => e.rank === currentEntry.rank - 1);
    if (above) pointsToNextRank = Math.max(0, above.totalScore - currentEntry.totalScore + 1);
  }

  return {
    challengeTitle: (challengeRow as { title: string } | null)?.title ?? 'Challenge',
    endsAt: (challengeRow as { ends_at: string } | null)?.ends_at ?? new Date().toISOString(),
    rewardText: (challengeRow as { reward_text: string | null } | null)?.reward_text ?? null,
    currentUser: currentEntry
      ? {
          rank: currentEntry.rank,
          totalScore: currentEntry.totalScore,
          pointsToNextRank,
        }
      : null,
    entries,
  };
}

export async function fetchActiveWeeklyChallenges(): Promise<WeeklyChallenge[]> {
  return readWithOfflineCache({
    cacheKey: activeWeeklyChallengesCacheKey(),
    source: 'supabase',
    fetchOnline: loadActiveWeeklyChallengesFromSupabase,
  });
}

export async function fetchPastWeeklyChallenges(): Promise<WeeklyChallenge[]> {
  return readWithOfflineCache({
    cacheKey: pastWeeklyChallengesCacheKey(),
    source: 'supabase',
    fetchOnline: loadPastWeeklyChallengesFromSupabase,
  });
}

export async function fetchChallengeProgress(
  challengeId: string,
  userId: string,
): Promise<ChallengeProgress> {
  return readWithOfflineCache({
    cacheKey: challengeProgressCacheKey(challengeId, userId),
    source: 'supabase',
    fetchOnline: () => loadChallengeProgressFromSupabase(challengeId, userId),
  });
}

export async function fetchChallengeLeaderboard(
  challengeId: string,
  userId: string,
): Promise<ChallengeLeaderboard> {
  return readWithOfflineCache({
    cacheKey: challengeLeaderboardCacheKey(challengeId, userId),
    source: 'supabase',
    fetchOnline: () => loadChallengeLeaderboardFromSupabase(challengeId, userId),
  });
}
