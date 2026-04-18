/** Contrat pour suivre / ne plus suivre (à brancher sur l’API). */
export interface IConnectionFollowService {
  setFollowing(userId: string, follow: boolean): Promise<void>;
}
