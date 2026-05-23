export interface DefisDashboardData {
  activeChallengeCount: number;
  activeTournamentCount: number;
  pendingDuelCount: number;
  currentWeekChallenge: {
    id: string;
    title: string;
    endsAt: string;
  } | null;
  userStats: {
    defiPlayed: number;
    bestRank: number | null;
    duelsWon: number;
    duelsTotal: number;
  };
}

export interface DefisSummaryLine {
  id: 'challenge' | 'tournament' | 'duel';
  label: string;
  icon: 'flag' | 'award' | 'zap';
  count: number;
}
