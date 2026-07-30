/** Option telle que stockée dans `questions.options` (JSON). */
export interface QuizPlayOption {
  id: string;
  label: string;
}

export interface QuizPlayQuestion {
  id: string;
  quizId: string;
  questionText: string;
  options: QuizPlayOption[];
  correctOptionId: string;
  explanation: string | null;
  orderIndex: number;
  /** easy | medium | hard — barre de points variable. */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Illustration dédiée à la question (colonne Supabase à brancher plus tard). */
  imageUrl?: string | null;
}

export interface QuizPlayMeta {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  /** @deprecated Préférer pointsForDifficulty(question.difficulty). Conservé pour compat. */
  pointsPerQuestion: number;
  completionBonus: number;
  difficultyLevel: string | null;
}

export interface QuizPlayPayload {
  quiz: QuizPlayMeta;
  questions: QuizPlayQuestion[];
}

export interface QuizAnswerRecord {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
}

export interface QuizLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  avatarUrl: string | null;
  isCurrentUser: boolean;
}
