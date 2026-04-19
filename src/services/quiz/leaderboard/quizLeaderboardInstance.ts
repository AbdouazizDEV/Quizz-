import type { IQuizLeaderboardPort } from '@services/quiz/leaderboard/IQuizLeaderboardPort';
import { MockQuizLeaderboardAdapter } from '@services/quiz/leaderboard/mockQuizLeaderboardAdapter';

let instance: IQuizLeaderboardPort = new MockQuizLeaderboardAdapter();

export function getQuizLeaderboardPort(): IQuizLeaderboardPort {
  return instance;
}

export function setQuizLeaderboardPort(p: IQuizLeaderboardPort): void {
  instance = p;
}
