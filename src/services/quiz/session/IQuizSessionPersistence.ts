import type { QuizAnswerRecord } from '@app-types/quizPlay.types';

/** Persistance d’une partie terminée (session + déclenchement du trigger score). */
export interface IQuizSessionPersistence {
  recordCompletedSession(params: {
    quizId: string;
    /** Points gagnés pendant le quiz (hors bonus de fin — géré côté trigger). */
    earnedPoints: number;
    answers: QuizAnswerRecord[];
  }): Promise<{ ok: boolean; errorMessage?: string }>;
}
