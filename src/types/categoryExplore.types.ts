/** Catégorie affichée sur l’accueil / la grille « Top catégories ». */
export interface CategoryExploreItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  quizCount: number;
}

/** Quiz listé sur l’écran détail d’une catégorie. */
export interface CategoryQuizListItem {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  questionCount: number;
  playCount: number;
  createdAt: string;
  /** `null` = pas de palier (visiteurs autorisés côté app). */
  difficultyLevel: string | null;
  /** Le joueur connecté a atteint le score maximum sur ce quiz. */
  isCompletedByPlayer?: boolean;
  /** Meilleur score enregistré pour ce joueur. */
  playerBestScore?: number | null;
  /** Score maximum possible sur ce quiz. */
  maxScore?: number;
}

export type QuizSortMode = 'default' | 'newest';

export interface CategoryDetailBundle {
  category: CategoryExploreItem;
  quizzes: CategoryQuizListItem[];
}
