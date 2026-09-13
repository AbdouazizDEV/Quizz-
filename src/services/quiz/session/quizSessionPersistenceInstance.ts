import type { IQuizSessionPersistence } from '@services/quiz/session/IQuizSessionPersistence';
import { NestQuizSessionPersistence } from '@services/quiz/session/nestQuizSessionPersistence';

let instance: IQuizSessionPersistence = new NestQuizSessionPersistence();

export function getQuizSessionPersistence(): IQuizSessionPersistence {
  return instance;
}

export function setQuizSessionPersistence(p: IQuizSessionPersistence): void {
  instance = p;
}
