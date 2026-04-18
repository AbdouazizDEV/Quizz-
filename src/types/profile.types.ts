export type ProfileTabId = 'quizzo' | 'collections' | 'about';

export type QuizVisibility = 'public' | 'private';

export interface ProfileUserIdentity {
  id: string;
  displayName: string;
  handle: string;
  avatarUri: string;
  coverUri: string;
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
