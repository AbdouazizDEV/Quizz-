export type WeeklyChallengeStatus = 'draft' | 'actif' | 'termine';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: WeeklyChallengeStatus;
  startsAt: string;
  endsAt: string;
  rewardText: string | null;
}

export type Difficulty = 'Z0' | 'Z1' | 'Z2' | 'Z3' | string;

export interface DailyQuiz {
  quizId: string;
  title: string;
  difficulty: Difficulty;
  scheduledDay: string;
  dayOrder: number;
  userScore: number | null;
  maxScore: number;
  isAvailable: boolean;
  isPlayed: boolean;
  canReplay: boolean;
}

export interface ChallengeProgress {
  challenge: WeeklyChallenge;
  userScore: number;
  userRank: number | null;
  quizzesPlayed: number;
  totalQuizzes: number;
  dailyQuizzes: DailyQuiz[];
}

export interface ChallengeLeaderboardEntry {
  userId: string;
  displayName: string;
  totalScore: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface ChallengeLeaderboard {
  challengeTitle: string;
  endsAt: string;
  rewardText: string | null;
  currentUser: {
    rank: number;
    totalScore: number;
    pointsToNextRank: number | null;
  } | null;
  entries: ChallengeLeaderboardEntry[];
}

export interface CompetitionSummary {
  id: string;
  title: string;
  description: string | null;
  categoryName: string | null;
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  startsAt: string | null;
  endsAt: string | null;
  rewardText: string | null;
  registeredCount: number;
  maxParticipants: number;
  isRegistered: boolean;
}

export type DuelPhase =
  | 'needs_your_acceptance'
  | 'waiting_opponent_acceptance'
  | 'your_turn'
  | 'waiting_opponent_play'
  | 'expired'
  | 'finished';

export interface DuelSummary {
  id: string;
  challengerId: string;
  challengedId: string;
  challengerName: string;
  challengedName: string;
  challengerAvatarUrl: string | null;
  challengedAvatarUrl: string | null;
  challengerTotalScore: number;
  challengedTotalScore: number;
  challengerScore: number | null;
  challengedScore: number | null;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'expired';
  winnerId: string | null;
  expiresAt: string;
  questionsCount: number;
  quizId: string;
  phase: DuelPhase;
  isExpired: boolean;
}
