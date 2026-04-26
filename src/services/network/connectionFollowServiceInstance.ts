import { ApiConnectionFollowService } from './ApiConnectionFollowService';

import type { IConnectionFollowService } from './IConnectionFollowService';

let instance: IConnectionFollowService = new ApiConnectionFollowService();

export function getConnectionFollowService(): IConnectionFollowService {
  return instance;
}

export function setConnectionFollowService(service: IConnectionFollowService): void {
  instance = service;
}
