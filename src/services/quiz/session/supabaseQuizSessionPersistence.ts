import type { QuizAnswerRecord } from '@app-types/quizPlay.types';
import type { IQuizSessionPersistence } from '@services/quiz/session/IQuizSessionPersistence';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';

export class SupabaseQuizSessionPersistence implements IQuizSessionPersistence {
  async recordCompletedSession(params: {
    quizId: string;
    earnedPoints: number;
    answers: QuizAnswerRecord[];
  }): Promise<{ ok: boolean; errorMessage?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, errorMessage: 'Supabase non configuré.' };
    }

    const { data: userData, error: userErr } = await client.auth.getUser();
    const userId = userData.user?.id;
    if (userErr || !userId) {
      return { ok: false, errorMessage: 'Utilisateur non connecté.' };
    }

    const answersJson = params.answers.map((a) => ({
      questionId: a.questionId,
      selected: a.selectedOptionId,
      correct: a.isCorrect,
    }));

    const { data: inserted, error: insErr } = await client
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        quiz_id: params.quizId,
        score: params.earnedPoints,
        answers: answersJson,
        is_completed: false,
      })
      .select('id')
      .maybeSingle();

    if (insErr || !inserted?.id) {
      return { ok: false, errorMessage: insErr?.message ?? 'Insertion session impossible.' };
    }

    const { error: updErr } = await client
      .from('quiz_sessions')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', inserted.id);

    if (updErr) {
      return { ok: false, errorMessage: updErr.message };
    }

    return { ok: true };
  }
}
