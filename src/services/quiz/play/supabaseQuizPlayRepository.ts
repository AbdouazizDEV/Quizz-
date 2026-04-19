import type { QuizPlayMeta, QuizPlayPayload, QuizPlayQuestion } from '@app-types/quizPlay.types';
import type { IQuizPlayRepository } from '@services/quiz/play/IQuizPlayRepository';
import { parseQuestionOptions } from '@services/quiz/play/parseQuestionOptions';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';

function mapQuestion(row: {
  id: string;
  quiz_id: string;
  question_text: string;
  options: unknown;
  correct_option_id: string;
  explanation: string | null;
  order_index: number;
}): QuizPlayQuestion {
  return {
    id: row.id,
    quizId: row.quiz_id,
    questionText: row.question_text,
    options: parseQuestionOptions(row.options),
    correctOptionId: row.correct_option_id,
    explanation: row.explanation,
    orderIndex: row.order_index,
  };
}

export class SupabaseQuizPlayRepository implements IQuizPlayRepository {
  async loadPlayPayload(quizId: string): Promise<QuizPlayPayload | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data: quiz, error: qErr } = await client
      .from('quizzes')
      .select('id, title, thumbnail_url, points_per_question, completion_bonus, is_published')
      .eq('id', quizId)
      .maybeSingle();

    if (qErr || !quiz || !quiz.is_published) return null;

    const { data: rows, error: pErr } = await client
      .from('questions')
      .select('id, quiz_id, question_text, options, correct_option_id, explanation, order_index')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (pErr || !rows?.length) return null;

    const meta: QuizPlayMeta = {
      id: quiz.id,
      title: quiz.title,
      thumbnailUrl: quiz.thumbnail_url,
      pointsPerQuestion: quiz.points_per_question ?? 1,
      completionBonus: quiz.completion_bonus ?? 0,
    };

    return {
      quiz: meta,
      questions: rows.map(mapQuestion),
    };
  }
}
