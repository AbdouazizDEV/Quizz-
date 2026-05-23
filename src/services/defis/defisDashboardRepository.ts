import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';

import type { DefisDashboardData } from '@app-types/defisDashboard.types';

interface WeeklyChallengeRow {
  id: string;
  title: string;
  ends_at: string;
}

function monthStartIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export async function fetchDefisDashboard(userId: string): Promise<DefisDashboardData> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase non configuré');
  }

  const nowIso = new Date().toISOString();

  const { data: challengeRows } = await supabase
    .from('weekly_challenges')
    .select('id, title, ends_at')
    .eq('status', 'actif')
    .eq('type', 'hebdomadaire')
    .lte('starts_at', nowIso)
    .gte('ends_at', nowIso)
    .limit(1);

  const challenge = (challengeRows?.[0] as WeeklyChallengeRow | undefined) ?? null;

  const { count: tournamentCount } = await supabase
    .from('competitions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'live');

  const { count: duelCount } = await supabase
    .from('challenges')
    .select('id', { count: 'exact', head: true })
    .eq('challenged_id', userId)
    .eq('status', 'pending');

  const monthStart = monthStartIso();

  const { count: defiPlayed } = await supabase
    .from('challenge_participations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('played_at', monthStart);

  const { count: duelsTotal } = await supabase
    .from('challenges')
    .select('id', { count: 'exact', head: true })
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
    .eq('status', 'completed');

  const { count: duelsWon } = await supabase
    .from('challenges')
    .select('id', { count: 'exact', head: true })
    .eq('winner_id', userId)
    .eq('status', 'completed');

  let bestRank: number | null = null;
  if (challenge) {
    const { data: myParticipations } = await supabase
      .from('challenge_participations')
      .select('score')
      .eq('user_id', userId)
      .eq('challenge_id', challenge.id);

    const myTotal = (myParticipations ?? []).reduce((sum, row) => sum + (row.score ?? 0), 0);
    if (myTotal > 0) {
      const { data: allParticipations } = await supabase
        .from('challenge_participations')
        .select('user_id, score')
        .eq('challenge_id', challenge.id);

      const totalsByUser = new Map<string, number>();
      for (const row of allParticipations ?? []) {
        const prev = totalsByUser.get(row.user_id) ?? 0;
        totalsByUser.set(row.user_id, prev + (row.score ?? 0));
      }
      const sorted = [...totalsByUser.entries()].sort((a, b) => b[1] - a[1]);
      const index = sorted.findIndex(([uid]) => uid === userId);
      bestRank = index >= 0 ? index + 1 : null;
    }
  }

  return {
    activeChallengeCount: challenge ? 1 : 0,
    activeTournamentCount: tournamentCount ?? 0,
    pendingDuelCount: duelCount ?? 0,
    currentWeekChallenge: challenge
      ? { id: challenge.id, title: challenge.title, endsAt: challenge.ends_at }
      : null,
    userStats: {
      defiPlayed: defiPlayed ?? 0,
      bestRank,
      duelsWon: duelsWon ?? 0,
      duelsTotal: duelsTotal ?? 0,
    },
  };
}
