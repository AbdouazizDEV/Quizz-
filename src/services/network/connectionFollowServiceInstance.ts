import { StubConnectionFollowService } from './StubConnectionFollowService';

import type { IConnectionFollowService } from './IConnectionFollowService';

let instance: IConnectionFollowService = new StubConnectionFollowService();

export function getConnectionFollowService(): IConnectionFollowService {
  return instance;
}

export function setConnectionFollowService(service: IConnectionFollowService): void {
  instance = service;
}
