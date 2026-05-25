import type { IQuizLeaderboardPort } from '@services/quiz/leaderboard/IQuizLeaderboardPort';
import { ApiQuizLeaderboardAdapter } from '@services/quiz/leaderboard/apiQuizLeaderboardAdapter';

let instance: IQuizLeaderboardPort = new ApiQuizLeaderboardAdapter();

export function getQuizLeaderboardPort(): IQuizLeaderboardPort {
  return instance;
}

export function setQuizLeaderboardPort(p: IQuizLeaderboardPort): void {
  instance = p;
}
