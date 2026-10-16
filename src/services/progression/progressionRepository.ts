import { apiClient } from '@services/api/apiClient';

export type NotebookMistake = {
  question_id: string;
  question_text: string;
  your_answer: string | null;
  correct_answer: string | null;
  explanation: string | null;
  wrong_count: number;
};

export type Notebook = {
  open_count: number;
  categories: {
    category_name: string;
    open_count: number;
    mistakes: NotebookMistake[];
  }[];
};

export type ReviewQuestion = {
  question_id: string;
  question_text: string;
  options: unknown;
};

export type PlayerBadge = {
  code: string;
  name: string;
  motif: string;
  how: string;
  premiumOnly: boolean;
  earned: boolean;
};

export type StyleItem = {
  code: string;
  name: string;
  kind: 'frame' | 'theme' | 'avatar';
  locked: boolean;
  premium: boolean;
};

export type WeeklyGoal = {
  label: string;
  progress: number;
  target: number;
  reminder_enabled: boolean;
};

export type CategoryStat = {
  category_name: string;
  plays: number;
  open_mistakes: number;
};

export function optionChoices(raw: unknown): { id: string; label: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    if (typeof item === 'string') return { id: item, label: item };
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const id = String(record.id ?? record.key ?? index);
      const label = String(record.label ?? record.text ?? record.value ?? id);
      return { id, label };
    }
    return { id: String(index), label: String(item) };
  });
}

export const progressionApi = {
  notebook: () => apiClient.get<Notebook>('/progression/notebook').then((res) => res.data),
  badges: () => apiClient.get<{ badges: PlayerBadge[] }>('/progression/badges').then((res) => res.data),
  style: () => apiClient.get<{ catalog: StyleItem[] }>('/progression/style').then((res) => res.data),
  goal: () => apiClient.get<WeeklyGoal>('/progression/goal').then((res) => res.data),
  stats: () => apiClient.get<{ categories: CategoryStat[] }>('/progression/stats').then((res) => res.data),
  review: () => apiClient.get<{ questions: ReviewQuestion[] }>('/progression/review').then((res) => res.data),
  submitReview: (answers: { questionId: string; selected?: string }[]) =>
    apiClient.post<{ resolved: number; points_awarded: number }>('/progression/review', { answers }).then((res) => res.data),
  equip: (body: { frame_code?: string; theme_code?: string; avatar_code?: string }) =>
    apiClient.patch('/progression/style', body),
  reminder: (enabled: boolean) => apiClient.patch('/progression/reminder', { enabled }),
  freeze: () => apiClient.post('/progression/streak-freeze'),
};
