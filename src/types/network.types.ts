export type ConnectionFilter = 'followers' | 'following';

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
  followers: ConnectionUser[];
  following: ConnectionUser[];
}
