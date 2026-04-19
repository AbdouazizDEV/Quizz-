import type { IQuizSessionPersistence } from '@services/quiz/session/IQuizSessionPersistence';
import { SupabaseQuizSessionPersistence } from '@services/quiz/session/supabaseQuizSessionPersistence';

let instance: IQuizSessionPersistence = new SupabaseQuizSessionPersistence();

export function getQuizSessionPersistence(): IQuizSessionPersistence {
  return instance;
}

export function setQuizSessionPersistence(p: IQuizSessionPersistence): void {
  instance = p;
}
