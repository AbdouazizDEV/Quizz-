export const QUIZ_SESSION_COMPLETE = 'supabase://quiz_sessions/complete';

export interface QuizSessionMutationBody {
  user_id: string;
  quiz_id: string;
  score: number;
  answers: { questionId: string; selected: string; correct: boolean }[];
  is_completed: boolean;
  completed_at: string;
}
