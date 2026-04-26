export type ProfileTabId = 'quizzo' | 'collections' | 'about';

export type QuizVisibility = 'public' | 'private';
export type ViewerRelationship = 'self' | 'none' | 'pending' | 'friends';
export type ProfileGender = 'female' | 'male' | 'unknown';

export interface ProfileUserIdentity {
  id: string;
  displayName: string;
  handle: string;
  avatarUri: string;
  coverUri: string;
  gender: ProfileGender;
  viewerRelationship: ViewerRelationship;
}

export interface ProfileStatItem {
  id: string;
  valueLabel: string;
  caption: string;
}

export interface ProfileQuizListItem {
  id: string;
  title: string;
  thumbnailUri: string;
  questionCount: number;
  relativeTimeLabel: string;
  playCount: number;
  visibility: QuizVisibility;
}

export interface ProfileScreenData {
  identity: ProfileUserIdentity;
  stats: ProfileStatItem[];
  quizzes: ProfileQuizListItem[];
  quizTotalCount: number;
}
