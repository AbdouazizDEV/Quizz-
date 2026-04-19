import type { IQuizPlayRepository } from '@services/quiz/play/IQuizPlayRepository';
import { SupabaseQuizPlayRepository } from '@services/quiz/play/supabaseQuizPlayRepository';

let instance: IQuizPlayRepository = new SupabaseQuizPlayRepository();

export function getQuizPlayRepository(): IQuizPlayRepository {
  return instance;
}

export function setQuizPlayRepository(repo: IQuizPlayRepository): void {
  instance = repo;
}
