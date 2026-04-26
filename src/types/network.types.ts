export type ConnectionFilter = 'friends' | 'suggestions';

export interface ConnectionUser {
  id: string;
  displayName: string;
  handle: string;
  avatarUri: string;
  /** true = bouton style « Following » (contour jaune), false = « Follow » (plein). */
  relationshipIsActive: boolean;
}

export interface ConnectionsScreenData {
  /** Titre navbar (ex. nom du profil consulté). */
  viewerDisplayName: string;
  items: ConnectionUser[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
