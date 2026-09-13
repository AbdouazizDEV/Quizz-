import axios from 'axios';

import type {
  CategoryDetailBundle,
  CategoryExploreItem,
  CategoryQuizListItem,
  QuizSortMode,
} from '@app-types/categoryExplore.types';
import {
  aggregateMainCategories,
  canonicalCategoryForSlug,
  sourceSlugsForCategory,
} from '@constants/mainCategories';
import { apiClient } from '@services/api/apiClient';
import { buildReplayStatus } from '@services/quiz/replay/quizReplayService';

/**
 * Contrat Nest (catalogue) :
 * GET /categories → { items: [{ id, name, slug, icon, color, quiz_count }] }
 * GET /categories/:slug?sort=default|newest → { category, quizzes }
 */
export const NEST_CATEGORIES_CONTRACT =
  'GET /categories et GET /categories/:slug doivent renvoyer le contrat JSON Nest.';

interface NestCategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  quiz_count?: number;
}

interface NestQuizItem {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  total_questions?: number;
  question_count?: number;
  play_count?: number;
  created_at?: string;
  difficulty_level?: string | null;
  points_per_question?: number | null;
  max_score?: number | null;
  player_best_score?: number | null;
  is_completed_by_player?: boolean;
}

function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

function contractError(detail: string): Error {
  return new Error(`Impossible de charger le catalogue. ${NEST_CATEGORIES_CONTRACT} (${detail})`);
}

function mapNestCategory(row: NestCategoryItem): CategoryExploreItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon ?? null,
    color: row.color ?? null,
    quizCount: Number.isFinite(row.quiz_count) ? Number(row.quiz_count) : 0,
  };
}

function mapNestQuiz(row: NestQuizItem): CategoryQuizListItem {
  const questionCount = row.question_count ?? row.total_questions ?? 0;
  const points = row.points_per_question ?? 1;
  const maxScore = row.max_score ?? Math.max(0, questionCount * points);
  const playerBest = row.player_best_score ?? null;
  const completedFlag = row.is_completed_by_player;
  const derived =
    playerBest != null ? buildReplayStatus(playerBest, maxScore).isComplete : false;

  return {
    id: row.id,
    title: row.title,
    thumbnailUrl: row.thumbnail_url ?? null,
    questionCount,
    playCount: row.play_count ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    difficultyLevel: row.difficulty_level ?? null,
    maxScore,
    playerBestScore: playerBest,
    isCompletedByPlayer: completedFlag ?? derived,
  };
}

export function sortQuizzes(items: CategoryQuizListItem[], mode: QuizSortMode): CategoryQuizListItem[] {
  const copy = [...items];
  if (mode === 'newest') {
    copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    copy.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  }
  const available = copy.filter((item) => !item.isCompletedByPlayer);
  const completed = copy.filter((item) => item.isCompletedByPlayer);
  return [...available, ...completed];
}

export async function fetchNestCategories(): Promise<CategoryExploreItem[]> {
  try {
    const { data } = await apiClient.get<{ items?: NestCategoryItem[] }>('/categories');
    const items = (data.items ?? []).map(mapNestCategory);
    return aggregateMainCategories(items);
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const detail = status
      ? `GET /categories ${status}`
      : error instanceof Error
        ? error.message
        : String(error);
    throw contractError(detail);
  }
}

async function fetchCategoryOptionA(
  slug: string,
  sort: QuizSortMode,
): Promise<{ category: CategoryExploreItem; quizzes: CategoryQuizListItem[] } | null> {
  const { data } = await apiClient.get<{
    item?: NestCategoryItem;
    category?: NestCategoryItem;
    quizzes?: NestQuizItem[];
  }>(`/categories/${encodeURIComponent(slug)}`, { params: { sort } });

  const raw = data.category ?? data.item;
  const quizzes = Array.isArray(data.quizzes) ? data.quizzes.map(mapNestQuiz) : [];
  if (!raw && quizzes.length === 0) return null;
  const category = raw
    ? mapNestCategory(raw)
    : {
        id: slug,
        name: slug,
        slug,
        icon: null,
        color: null,
        quizCount: quizzes.length,
      };
  return { category, quizzes };
}

async function fetchQuizzesOptionB(slug: string, sort: QuizSortMode): Promise<CategoryQuizListItem[]> {
  try {
    const { data } = await apiClient.get<{ items?: NestQuizItem[]; quizzes?: NestQuizItem[] }>(
      `/categories/${encodeURIComponent(slug)}/quizzes`,
      { params: { sort } },
    );
    const rows = data.items ?? data.quizzes ?? [];
    if (rows.length) return rows.map(mapNestQuiz);
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  const { data } = await apiClient.get<{ items?: NestQuizItem[]; quizzes?: NestQuizItem[] }>('/quizzes', {
    params: { category_slug: slug, category: slug, sort, published: true },
  });
  const rows = data.items ?? data.quizzes ?? [];
  return rows.map(mapNestQuiz);
}

function toDisplayCategory(
  slug: string,
  found: CategoryExploreItem | null,
  quizCount: number,
): CategoryExploreItem {
  const canonical = canonicalCategoryForSlug(slug);
  if (canonical) {
    return {
      id: canonical.id,
      name: canonical.name,
      slug: canonical.slug,
      icon: canonical.icon,
      color: canonical.color,
      quizCount,
    };
  }
  if (found) return { ...found, quizCount };
  return {
    id: slug,
    name: slug,
    slug,
    icon: null,
    color: null,
    quizCount,
  };
}

export async function fetchNestCategoryDetail(
  slug: string,
  sort: QuizSortMode = 'default',
): Promise<CategoryDetailBundle> {
  const slugs = sourceSlugsForCategory(slug);
  const quizzesById = new Map<string, CategoryQuizListItem>();
  let foundCategory: CategoryExploreItem | null = null;
  const failures: string[] = [];

  for (const candidate of slugs) {
    try {
      const bundle = await fetchCategoryOptionA(candidate, sort);
      if (!bundle) continue;
      foundCategory ??= bundle.category;
      for (const quiz of bundle.quizzes) quizzesById.set(quiz.id, quiz);
      if (candidate === slug && bundle.quizzes.length > 0) break;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      failures.push(`GET /categories/${candidate}${status ? ` ${status}` : ''}`);
      if (!isNotFound(error) && status !== undefined && status >= 500) {
        throw contractError(failures.join(', '));
      }
    }
  }

  if (quizzesById.size === 0) {
    for (const candidate of slugs) {
      try {
        const quizzes = await fetchQuizzesOptionB(candidate, sort);
        for (const quiz of quizzes) quizzesById.set(quiz.id, quiz);
      } catch (error) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        failures.push(`GET quizzes ${candidate}${status ? ` ${status}` : ''}`);
      }
    }
  }

  if (quizzesById.size === 0 && !foundCategory) {
    throw contractError(failures.join(', ') || `GET /categories/${slug} sans quiz`);
  }

  const mapped = [...quizzesById.values()];
  const quizzes = sortQuizzes(mapped, sort);
  const category = toDisplayCategory(slug, foundCategory, quizzes.length);

  return { category, quizzes };
}
