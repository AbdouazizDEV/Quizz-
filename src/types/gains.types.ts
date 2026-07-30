import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export type GainsPeriod = 'week' | 'month' | 'year';

export interface GainsStreakTier {
  id: string;
  days: number;
  bonusPoints: number;
  label: string;
  hint: string;
}

export interface GainsCashPrize {
  id: string;
  periodLabel: string;
  amountLabel: string;
  rankLabel: string;
}

export interface GainsRewardCatalogItem {
  id: string;
  title: string;
  costPoints: number;
  category: string;
  available: boolean;
}

export interface GainsHistoryItem {
  id: string;
  title: string;
  subtitle: string;
  pointsDelta?: number;
  whenLabel: string;
}

export interface GainsHowStep {
  id: string;
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  body: string;
}

export interface GainsLeaderboardRow {
  id: string;
  rank: number;
  name: string;
  points: number;
  isMe?: boolean;
}

export interface GainsHubData {
  rank: number | null;
  totalPoints: number;
  pointsToTop3: number | null;
  rewardsOwned: number;
  offersCount: number;
  streakDays: number;
  leaderboard: GainsLeaderboardRow[];
  historyPreview: GainsHistoryItem[];
}
