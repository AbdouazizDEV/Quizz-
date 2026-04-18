import type { IConnectionFollowService } from './IConnectionFollowService';

export class StubConnectionFollowService implements IConnectionFollowService {
  async setFollowing(_userId: string, _follow: boolean): Promise<void> {
    /* no-op : remplacer par un appel API */
  }
}
