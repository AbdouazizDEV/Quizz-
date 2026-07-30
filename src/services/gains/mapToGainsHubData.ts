import type { GainsHubData, GainsLeaderboardRow } from '@app-types/gains.types';
import { GAINS_HISTORY_DEMO } from '@constants/gainsContent';
import type { AuthMeResponse } from '@services/auth/fetchAuthMe';
import type { LeaderboardItem } from '@app-types/leaderboard.types';

const formatName = (raw: string) => raw.trim() || 'Joueur';

export function mapToGainsHubData(input: {
  me: AuthMeResponse | null;
  leaderboard: LeaderboardItem[];
  myRank: number | null;
}): GainsHubData {
  const profile = input.me?.profile;
  const totalPoints = profile?.total_score ?? 0;
  const streakDays = profile?.streak_days ?? 0;
  const rank = input.myRank;

  const top3 = input.leaderboard.slice(0, 3);
  const thirdScore = top3[2]?.score ?? top3[top3.length - 1]?.score ?? totalPoints + 120;
  const pointsToTop3 =
    rank != null && rank <= 3 ? 0 : Math.max(0, thirdScore - totalPoints + 1);

  const rows: GainsLeaderboardRow[] = input.leaderboard.slice(0, 3).map((row) => ({
    id: row.id,
    rank: row.rank,
    name: formatName(row.displayName),
    points: row.score,
    isMe: input.me?.user?.id === row.id,
  }));

  const meId = input.me?.user?.id;
  const alreadyInTop = rows.some((r) => r.isMe);
  if (!alreadyInTop && meId && rank != null) {
    rows.push({
      id: meId,
      rank,
      name: 'Toi',
      points: totalPoints,
      isMe: true,
    });
  }

  return {
    rank,
    totalPoints,
    pointsToTop3: pointsToTop3 > 0 ? pointsToTop3 : null,
    rewardsOwned: 2,
    offersCount: 3,
    streakDays,
    leaderboard: rows,
    historyPreview: GAINS_HISTORY_DEMO,
  };
}
