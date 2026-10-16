export type DailyQuizSlot = 'popular' | 'profile' | 'recent';

export interface DailyQuizCard {
  slot: DailyQuizSlot;
  label: string;
  id: string;
  title: string;
  thumbnailUrl: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  questionCount: number;
  playCount: number;
  difficultyLevel: string | null;
  isPlayable: boolean;
  isCompletedToday: boolean;
}

export interface DailyQuizzesPayload {
  date: string;
  timezone: string;
  userLevel: string | null;
  items: DailyQuizCard[];
}
