import type { QuizAnswerRecord } from '@app-types/quizPlay.types';
import { AppConfig } from '@config';
import type { IQuizSessionPersistence } from '@services/quiz/session/IQuizSessionPersistence';
import { refreshAuthSessionIfNeeded } from '@services/auth/refreshAuthSession';
import { enqueueSupabaseMutation, runOnlineOrQueue } from '@services/offline/offlineMutation';
import {
  QUIZ_SESSION_COMPLETE,
  type QuizSessionMutationBody,
} from '@services/offline/quizSessionMutations';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';
import { ensureSupabaseAuthSession } from '@services/supabase/syncSupabaseAuthSession';
import { useAuthMeStore } from '@stores/authMeStore';
import { useAuthStore } from '@stores/authStore';

function mapAnswers(answers: QuizAnswerRecord[]) {
  return answers.map((a) => ({
    questionId: a.questionId,
    selected: a.selectedOptionId,
    correct: a.isCorrect,
  }));
}

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

    if (!useAuthStore.getState().token?.trim()) {
      return { ok: false, errorMessage: 'Utilisateur non connecté (session invalide).' };
    }

    const refreshed = await refreshAuthSessionIfNeeded();
    if (!refreshed.ok && refreshed.reason === 'refresh_failed') {
      try {
        await this.queueOffline(params);
        return { ok: true };
      } catch {
        return {
          ok: false,
          errorMessage: 'Session expirée. Reconnectez-vous pour enregistrer votre score.',
        };
      }
    }

    try {
      const result = await runOnlineOrQueue(
        () => this.persistOnline(params),
        () => this.queueOffline(params),
      );
      if (result.queued) return { ok: true };
      return result.data ?? { ok: false, errorMessage: 'Enregistrement impossible.' };
    } catch (error) {
      try {
        await this.queueOffline(params);
        return { ok: true };
      } catch {
        const message = error instanceof Error ? error.message : 'Enregistrement impossible.';
        return { ok: false, errorMessage: message };
      }
    }
  }

  private async resolveUserId(): Promise<string> {
    await ensureSupabaseAuthSession();
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase non configuré.');

    const token = useAuthStore.getState().token?.trim();
    const { data: userData, error: userErr } = token
      ? await client.auth.getUser(token)
      : await client.auth.getUser();
    const userId = userData.user?.id;
    if (!userErr && userId) return userId;

    const cachedUserId = useAuthMeStore.getState().data?.user?.id;
    if (cachedUserId) return cachedUserId;

    throw new Error('Utilisateur non connecté (session invalide).');
  }

  private async persistOnline(params: {
    quizId: string;
    earnedPoints: number;
    answers: QuizAnswerRecord[];
  }): Promise<{ ok: boolean; errorMessage?: string }> {
    const userId = await this.resolveUserId();
    const token = useAuthStore.getState().token?.trim();
    const supabaseUrl = AppConfig.supabase.url?.trim();
    const supabaseAnonKey = AppConfig.supabase.anonKey?.trim();
    if (!supabaseUrl || !supabaseAnonKey || !token) {
      return { ok: false, errorMessage: 'Configuration Supabase incomplète.' };
    }

    const answersJson = mapAnswers(params.answers);
    const completedAt = new Date().toISOString();

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
        is_completed: true,
        completed_at: completedAt,
      }),
    });
    if (!insertRes.ok) {
      let message = 'Insertion session impossible.';
      try {
        const body = (await insertRes.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // ignore parse error
      }
      throw new Error(message);
    }

    return { ok: true };
  }

  private async queueOffline(params: {
    quizId: string;
    earnedPoints: number;
    answers: QuizAnswerRecord[];
  }): Promise<void> {
    const userId =
      useAuthMeStore.getState().data?.user?.id ?? (await this.resolveUserId().catch(() => null));
    if (!userId) {
      throw new Error('Utilisateur inconnu pour la file offline.');
    }

    const body: QuizSessionMutationBody = {
      user_id: userId,
      quiz_id: params.quizId,
      score: params.earnedPoints,
      answers: mapAnswers(params.answers),
      is_completed: true,
      completed_at: new Date().toISOString(),
    };

    await enqueueSupabaseMutation({
      method: 'POST',
      url: QUIZ_SESSION_COMPLETE,
      body,
    });
  }
}
