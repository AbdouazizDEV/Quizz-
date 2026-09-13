import type {
  CategoryDetailBundle,
  CategoryExploreItem,
  QuizSortMode,
} from '@app-types/categoryExplore.types';
import {
  fetchNestCategories,
  fetchNestCategoryDetail,
} from '@services/data/categories/nestCategoriesClient';

/** Catalogue catégories / quiz : Nest uniquement (mêmes IDs UUID que le play). */
export async function fetchCategoriesWithQuizCounts(): Promise<CategoryExploreItem[]> {
  return fetchNestCategories();
}

export async function fetchCategoryDetailBySlug(
  slug: string,
  sort: QuizSortMode,
): Promise<CategoryDetailBundle | null> {
  try {
    return await fetchNestCategoryDetail(slug, sort);
  } catch {
    return null;
  }
}
