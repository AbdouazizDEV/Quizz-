import type { QuizPlayPayload } from '@app-types/quizPlay.types';

/** Charge les données nécessaires pour jouer un quiz (métadonnées + questions ordonnées). */
export interface IQuizPlayRepository {
  loadPlayPayload(quizId: string): Promise<QuizPlayPayload | null>;
}
