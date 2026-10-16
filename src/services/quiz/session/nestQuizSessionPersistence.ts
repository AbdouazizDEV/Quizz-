import type { QuizAnswerRecord } from '@app-types/quizPlay.types';
import { parseQuizzApiError } from '@sdk';
import { humanizeRuntimeError } from '@utils/formatApiUserMessage';
import { apiClient } from '@services/api/apiClient';
import { loadAuthMe, patchAuthMeFromQuizComplete } from '@services/auth/authMeRepository';
import { refreshAuthSessionIfNeeded } from '@services/auth/refreshAuthSession';
import type { IQuizSessionPersistence } from '@services/quiz/session/IQuizSessionPersistence';
import { enqueueApiMutation } from '@services/offline/offlineMutation';
import { updateOfflinePendingCount } from '@services/offline/offlineSyncEngine';
import { fetchNetworkOnline } from '@services/offline/networkStatus';
import {
  parseQuizSessionCompleteResponse,
  quizCompleteApiPath,
  type QuizSessionCompleteBody,
} from '@services/offline/quizSessionMutations';
import { useAuthStore } from '@stores/authStore';
import { isAxiosError } from 'axios';

function mapAnswers(answers: QuizAnswerRecord[]) {
  return answers.map((a) => ({
    questionId: a.questionId,
    selected: a.selectedOptionId,
    correct: a.isCorrect,
  }));
}

export class NestQuizSessionPersistence implements IQuizSessionPersistence {
  async recordCompletedSession(params: {
    quizId: string;
    earnedPoints: number;
    answers: QuizAnswerRecord[];
  }): Promise<{ ok: boolean; errorMessage?: string }> {
    if (!useAuthStore.getState().token?.trim()) {
      return { ok: false, errorMessage: 'Utilisateur non connecté (session invalide).' };
    }

    const online = await fetchNetworkOnline();

    const refreshed = await refreshAuthSessionIfNeeded();
    if (!refreshed.ok && refreshed.reason === 'refresh_failed') {
      if (!online) {
        return this.enqueueWhenOffline(params);
      }
      return {
        ok: false,
        errorMessage: 'Session expirée. Reconnectez-vous pour enregistrer votre score.',
      };
    }

    // Hors ligne réel uniquement → file offline.
    if (!online) {
      return this.enqueueWhenOffline(params);
    }

    // En ligne : le POST Nest doit réussir, sinon on remonte l’erreur (pas de faux ok + banner).
    try {
      return await this.persistOnline(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Enregistrement impossible.';
      return { ok: false, errorMessage: message };
    }
  }

  private async enqueueWhenOffline(params: {
    quizId: string;
    earnedPoints: number;
    answers: QuizAnswerRecord[];
  }): Promise<{ ok: boolean; errorMessage?: string }> {
    try {
      await this.queueOffline(params);
      await updateOfflinePendingCount();
      return { ok: true };
    } catch {
      return {
        ok: false,
        errorMessage: 'Hors ligne : impossible de mettre le score en file d’attente.',
      };
    }
  }

  private buildBody(params: {
    earnedPoints: number;
    answers: QuizAnswerRecord[];
  }): QuizSessionCompleteBody {
    const answers = mapAnswers(params.answers);
    return answers.length > 0
      ? { score: params.earnedPoints, answers }
      : { score: params.earnedPoints };
  }

  private async persistOnline(params: {
    quizId: string;
    earnedPoints: number;
    answers: QuizAnswerRecord[];
  }): Promise<{ ok: boolean; errorMessage?: string }> {
    const path = quizCompleteApiPath(params.quizId);
    const body = this.buildBody(params);

    try {
      const { data } = await apiClient.post<unknown>(path, body);
      try {
        const parsed = parseQuizSessionCompleteResponse(data);
        if (parsed) {
          await patchAuthMeFromQuizComplete({
            total_score: parsed.total_score,
            quizzes_completed: parsed.quizzes_completed,
          });
        }
      } catch {
        // POST réussi : on rafraîchit le profil même si le parsing local échoue.
      }
      await loadAuthMe({ force: true });
      await updateOfflinePendingCount();
      return { ok: true };
    } catch (error) {
      throw new Error(this.formatApiError(error));
    }
  }

  private formatApiError(error: unknown): string {
    if (isAxiosError(error)) {
      const body = error.response?.data;
      const raw =
        parseQuizzApiError(body) ??
        (typeof body === 'object' && body && 'message' in body
          ? String((body as { message?: unknown }).message)
          : null) ??
        error.message ??
        'Enregistrement impossible.';
      return humanizeRuntimeError(raw) ?? raw;
    }
    if (error instanceof Error) {
      return humanizeRuntimeError(error.message) ?? error.message;
    }
    return 'Enregistrement impossible.';
  }

  private async queueOffline(params: {
    quizId: string;
    earnedPoints: number;
    answers: QuizAnswerRecord[];
  }): Promise<void> {
    await enqueueApiMutation({
      method: 'POST',
      path: quizCompleteApiPath(params.quizId),
      body: this.buildBody(params),
    });
  }
}
