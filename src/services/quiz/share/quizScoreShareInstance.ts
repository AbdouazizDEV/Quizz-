import { AlertQuizScoreShareAdapter } from '@services/quiz/share/alertQuizScoreShareAdapter';
import type { IQuizScoreSharePort } from '@services/quiz/share/IQuizScoreSharePort';

let instance: IQuizScoreSharePort = new AlertQuizScoreShareAdapter();

export function getQuizScoreSharePort(): IQuizScoreSharePort {
  return instance;
}

export function setQuizScoreSharePort(p: IQuizScoreSharePort): void {
  instance = p;
}
