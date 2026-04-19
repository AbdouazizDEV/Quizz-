import type {
  CategoryDetailBundle,
  CategoryExploreItem,
  CategoryQuizListItem,
  QuizSortMode,
} from '@app-types/categoryExplore.types';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';

function aggregateQuizCountsByCategory(
  rows: { category_id: string | null }[] | null,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of rows ?? []) {
    const id = r.category_id;
    if (!id) continue;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

const MOCK_CATEGORIES: CategoryExploreItem[] = [
  {
    id: 'mock-1',
    name: 'Éducation',
    slug: 'education',
    icon: 'book',
    color: '#F5B200',
    quizCount: 12,
  },
  {
    id: 'mock-2',
    name: 'Jeux',
    slug: 'games',
    icon: 'cpu',
    color: '#FFB703',
    quizCount: 8,
  },
  {
    id: 'mock-3',
    name: 'Business',
    slug: 'business',
    icon: 'briefcase',
    color: '#4CAF50',
    quizCount: 15,
  },
];

export async function fetchCategoriesWithQuizCounts(): Promise<CategoryExploreItem[]> {
  const client = getSupabaseClient();
  if (!client) {
    return [...MOCK_CATEGORIES];
  }

  const { data: categories, error: catErr } = await client
    .from('categories')
    .select('id, name, slug, icon, color, created_at')
    .order('name', { ascending: true });

  if (catErr || !categories?.length) {
    return [...MOCK_CATEGORIES];
  }

  const { data: quizRows } = await client
    .from('quizzes')
    .select('category_id')
    .eq('is_published', true);

  const counts = aggregateQuizCountsByCategory(quizRows);

  const merged: CategoryExploreItem[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    color: c.color,
    quizCount: counts.get(c.id) ?? 0,
  }));

  merged.sort((a, b) => {
    if (b.quizCount !== a.quizCount) return b.quizCount - a.quizCount;
    return a.name.localeCompare(b.name, 'fr');
  });

  return merged;
}

function mapQuizRow(row: {
  id: string;
  title: string;
  thumbnail_url: string | null;
  total_questions: number;
  play_count: number;
  created_at: string;
  difficulty_level: string;
}): CategoryQuizListItem {
  return {
    id: row.id,
    title: row.title,
    thumbnailUrl: row.thumbnail_url,
    questionCount: row.total_questions,
    playCount: row.play_count,
    createdAt: row.created_at,
    difficultyLevel: row.difficulty_level,
  };
}

function sortQuizzes(items: CategoryQuizListItem[], mode: QuizSortMode): CategoryQuizListItem[] {
  const copy = [...items];
  if (mode === 'newest') {
    copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return copy;
  }
  copy.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  return copy;
}

export async function fetchCategoryDetailBySlug(
  slug: string,
  sort: QuizSortMode,
): Promise<CategoryDetailBundle | null> {
  const client = getSupabaseClient();
  if (!client) {
    const mock = MOCK_CATEGORIES.find((c) => c.slug === slug);
    if (!mock) return null;
    return {
      category: mock,
      quizzes: sortQuizzes(
        [
          {
            id: 'mq1',
            title: 'Quiz démo — parcours guidé',
            thumbnailUrl: null,
            questionCount: 10,
            playCount: 2600,
            createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
            difficultyLevel: 'Z1',
          },
        ],
        sort,
      ),
    };
  }

  const { data: category, error: cErr } = await client
    .from('categories')
    .select('id, name, slug, icon, color')
    .eq('slug', slug)
    .maybeSingle();

  if (cErr || !category) {
    return null;
  }

  const { data: quizRows, error: qErr } = await client
    .from('quizzes')
    .select('id, title, thumbnail_url, total_questions, play_count, created_at, difficulty_level')
    .eq('category_id', category.id)
    .eq('is_published', true);

  if (qErr) {
    const empty: CategoryExploreItem = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      color: category.color,
      quizCount: 0,
    };
    return { category: empty, quizzes: [] };
  }

  const quizzes = sortQuizzes((quizRows ?? []).map(mapQuizRow), sort);

  const header: CategoryExploreItem = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    color: category.color,
    quizCount: quizzes.length,
  };

  return {
    category: header,
    quizzes,
  };
}
