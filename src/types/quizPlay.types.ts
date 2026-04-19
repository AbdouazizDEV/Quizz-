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
}

export interface QuizPlayMeta {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  pointsPerQuestion: number;
  completionBonus: number;
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
  displayName: string;
  score: number;
  avatarUrl: string | null;
}
