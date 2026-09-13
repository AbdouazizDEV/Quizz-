import type { IQuizPlayRepository } from '@services/quiz/play/IQuizPlayRepository';
import { NestQuizPlayRepository } from '@services/quiz/play/nestQuizPlayRepository';

let instance: IQuizPlayRepository = new NestQuizPlayRepository();

export function getQuizPlayRepository(): IQuizPlayRepository {
  return instance;
}

export function setQuizPlayRepository(repo: IQuizPlayRepository): void {
  instance = repo;
}
