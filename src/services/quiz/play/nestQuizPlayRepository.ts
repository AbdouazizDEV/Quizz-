import type { QuizPlayMeta, QuizPlayPayload, QuizPlayQuestion } from '@app-types/quizPlay.types';
import { normalizeQuestionDifficulty } from '@domain/quiz/difficultyPoints';
import { apiClient } from '@services/api/apiClient';
import type { IQuizPlayRepository } from '@services/quiz/play/IQuizPlayRepository';
import { parseQuestionOptions } from '@services/quiz/play/parseQuestionOptions';
import { isAxiosError } from 'axios';

interface NestQuizPlayResponse {
  quiz: {
    id: string;
    title: string;
    thumbnail_url?: string | null;
    points_per_question?: number | null;
    completion_bonus?: number | null;
    difficulty_level?: string | null;
  };
  questions: Array<{
    id: string;
    quiz_id: string;
    question_text: string;
    options: unknown;
    correct_option_id: string;
    explanation: string | null;
    order_index: number;
    difficulty?: string | null;
    difficulty_label?: string | null;
  }>;
}

function mapQuestion(row: NestQuizPlayResponse['questions'][number]): QuizPlayQuestion {
  return {
    id: row.id,
    quizId: row.quiz_id,
    questionText: row.question_text,
    options: parseQuestionOptions(row.options),
    correctOptionId: row.correct_option_id,
    explanation: row.explanation,
    orderIndex: row.order_index,
    difficulty: normalizeQuestionDifficulty(row.difficulty ?? row.difficulty_label),
    imageUrl: null,
  };
}

/** Charge quiz + questions via Nest (`GET /quizzes/:id`), plus via Supabase. */
export class NestQuizPlayRepository implements IQuizPlayRepository {
  async loadPlayPayload(quizId: string): Promise<QuizPlayPayload | null> {
    try {
      const { data } = await apiClient.get<NestQuizPlayResponse>(
        `/quizzes/${encodeURIComponent(quizId)}`,
      );
      if (!data?.quiz || !Array.isArray(data.questions) || data.questions.length === 0) {
        return null;
      }

      const meta: QuizPlayMeta = {
        id: data.quiz.id,
        title: data.quiz.title,
        thumbnailUrl: data.quiz.thumbnail_url ?? null,
        pointsPerQuestion: data.quiz.points_per_question ?? 1,
        completionBonus: data.quiz.completion_bonus ?? 0,
        difficultyLevel: data.quiz.difficulty_level ?? null,
      };

      return {
        quiz: meta,
        questions: data.questions.map(mapQuestion),
      };
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      return null;
    }
  }
}
