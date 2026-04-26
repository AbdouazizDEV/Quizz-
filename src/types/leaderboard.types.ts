export interface LeaderboardItem {
  id: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  rank: number;
}

export interface GlobalLeaderboardPayload {
  items: LeaderboardItem[];
  me: {
    userId: string;
    rank: number | null;
  } | null;
}

