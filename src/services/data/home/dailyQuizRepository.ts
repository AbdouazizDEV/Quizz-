import type { DailyQuizCard, DailyQuizzesPayload } from '@app-types/dailyQuiz.types';
import { apiClient } from '@services/api/apiClient';
import { extractApiError } from '@utils/extractApiError';

interface ApiDailyQuizItem {
  slot: 'popular' | 'profile' | 'recent';
  label: string;
  quiz: {
    id: string;
    title: string;
    thumbnail_url?: string | null;
    category_slug?: string | null;
    category_name?: string | null;
    total_questions?: number;
    play_count?: number;
    difficulty_level?: string | null;
    created_at?: string;
  };
  is_playable: boolean;
  is_completed_today: boolean;
}

interface ApiDailyQuizzesResponse {
  date: string;
  timezone: string;
  user_level?: string | null;
  items: ApiDailyQuizItem[];
}

function mapItem(row: ApiDailyQuizItem): DailyQuizCard {
  return {
    slot: row.slot,
    label: row.label,
    id: row.quiz.id,
    title: row.quiz.title,
    thumbnailUrl: row.quiz.thumbnail_url ?? null,
    categorySlug: row.quiz.category_slug ?? null,
    categoryName: row.quiz.category_name ?? null,
    questionCount: row.quiz.total_questions ?? 0,
    playCount: row.quiz.play_count ?? 0,
    difficultyLevel: row.quiz.difficulty_level ?? null,
    isPlayable: row.is_playable,
    isCompletedToday: row.is_completed_today,
  };
}

export async function fetchDailyQuizzes(): Promise<DailyQuizzesPayload> {
  try {
    const { data } = await apiClient.get<ApiDailyQuizzesResponse>('/home/daily-quizzes');
    return {
      date: data.date,
      timezone: data.timezone,
      userLevel: data.user_level ?? null,
      items: (data.items ?? []).map(mapItem),
    };
  } catch (error) {
    throw new Error(extractApiError(error, 'Impossible de charger les quiz du jour.'));
  }
}
