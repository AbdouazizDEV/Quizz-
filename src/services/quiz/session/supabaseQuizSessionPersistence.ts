import type { QuizAnswerRecord } from '@app-types/quizPlay.types';
import { AppConfig } from '@config';
import type { IQuizSessionPersistence } from '@services/quiz/session/IQuizSessionPersistence';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';
import { useAuthStore } from '@stores/authStore';

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

    const token = useAuthStore.getState().token?.trim();
    const { data: userData, error: userErr } = token
      ? await client.auth.getUser(token)
      : await client.auth.getUser();
    const userId = userData.user?.id;
    if (userErr || !userId) {
      return { ok: false, errorMessage: 'Utilisateur non connecté (session invalide).' };
    }
    const supabaseUrl = AppConfig.supabase.url?.trim();
    const supabaseAnonKey = AppConfig.supabase.anonKey?.trim();
    if (!supabaseUrl || !supabaseAnonKey || !token) {
      return { ok: false, errorMessage: 'Configuration Supabase incomplète.' };
    }

    const answersJson = params.answers.map((a) => ({
      questionId: a.questionId,
      selected: a.selectedOptionId,
      correct: a.isCorrect,
    }));

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/quiz_sessions?select=id`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        quiz_id: params.quizId,
        score: params.earnedPoints,
        answers: answersJson,
        is_completed: false,
      }),
    });
    if (!insertRes.ok) {
      let message = 'Insertion session impossible.';
      try {
        const body = (await insertRes.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // ignore parse error and keep default message
      }
      return { ok: false, errorMessage: message };
    }
    const insertedRows = (await insertRes.json()) as Array<{ id: string }>;
    const insertedId = insertedRows[0]?.id;
    if (!insertedId) {
      return { ok: false, errorMessage: 'Session créée sans identifiant.' };
    }

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/quiz_sessions?id=eq.${insertedId}`, {
      method: 'PATCH',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_completed: true,
        completed_at: new Date().toISOString(),
      }),
    });
    if (!updateRes.ok) {
      let message = 'Finalisation de session impossible.';
      try {
        const body = (await updateRes.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // ignore parse error and keep default message
      }
      return { ok: false, errorMessage: message };
    }

    return { ok: true };
  }
}
