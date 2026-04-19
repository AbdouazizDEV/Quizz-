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
  difficultyLevel: string;
}

export type QuizSortMode = 'default' | 'newest';

export interface CategoryDetailBundle {
  category: CategoryExploreItem;
  quizzes: CategoryQuizListItem[];
}
