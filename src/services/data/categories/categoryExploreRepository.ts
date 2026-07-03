import type {
  CategoryDetailBundle,
  CategoryExploreItem,
  CategoryQuizListItem,
  QuizSortMode,
} from '@app-types/categoryExplore.types';
import { buildReplayStatus } from '@services/quiz/replay/quizReplayService';
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
    id: 'main-culture-generale',
    name: 'Culture générale',
    slug: 'culture-generale',
    icon: 'book',
    color: '#F5B200',
    quizCount: 12,
  },
  {
    id: 'main-histoire-societe',
    name: 'Histoire & Société',
    slug: 'histoire-societe',
    icon: 'globe',
    color: '#4CAF50',
    quizCount: 10,
  },
  {
    id: 'main-geographie',
    name: 'Géographie',
    slug: 'geography',
    icon: 'map',
    color: '#E91E63',
    quizCount: 9,
  },
  {
    id: 'main-sciences-technologie',
    name: 'Sciences & Technologie',
    slug: 'sciences-technologie',
    icon: 'cpu',
    color: '#4CAF50',
    quizCount: 14,
  },
  {
    id: 'main-sport',
    name: 'Sport',
    slug: 'sports',
    icon: 'football',
    color: '#F5B200',
    quizCount: 11,
  },
  {
    id: 'main-divertissement',
    name: 'Divertissement',
    slug: 'entertainment',
    icon: 'music',
    color: '#E91E63',
    quizCount: 8,
  },
  {
    id: 'main-business-vie-pratique',
    name: 'Business & Vie pratique',
    slug: 'business-vie-pratique',
    icon: 'briefcase',
    color: '#4CAF50',
    quizCount: 15,
  },
];

type RawCategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
};

type MainCategoryDefinition = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sourceSlugs: string[];
};

const MAIN_CATEGORY_DEFINITIONS: MainCategoryDefinition[] = [
  {
    id: 'main-culture-generale',
    name: 'Culture générale',
    slug: 'culture-generale',
    icon: 'book-open',
    color: '#F5B200',
    sourceSlugs: ['culture-generale', 'culture-generale-fr', 'general-knowledge', 'education', 'games'],
  },
  {
    id: 'main-histoire-societe',
    name: 'Histoire & Société',
    slug: 'histoire-societe',
    icon: 'globe',
    color: '#4CAF50',
    sourceSlugs: ['history', 'histoire', 'politics', 'politique', 'societe', 'society'],
  },
  {
    id: 'main-geographie',
    name: 'Géographie',
    slug: 'geography',
    icon: 'map',
    color: '#E91E63',
    sourceSlugs: ['geography', 'geographie'],
  },
  {
    id: 'main-sciences-technologie',
    name: 'Sciences & Technologie',
    slug: 'sciences-technologie',
    icon: 'cpu',
    color: '#4CAF50',
    sourceSlugs: ['sciences', 'science', 'technology', 'technologie'],
  },
  {
    id: 'main-sport',
    name: 'Sport',
    slug: 'sports',
    icon: 'football',
    color: '#F5B200',
    sourceSlugs: ['sports', 'sport'],
  },
  {
    id: 'main-divertissement',
    name: 'Divertissement',
    slug: 'entertainment',
    icon: 'music',
    color: '#E91E63',
    sourceSlugs: ['entertainment', 'music', 'musique', 'arts', 'art'],
  },
  {
    id: 'main-business-vie-pratique',
    name: 'Business & Vie pratique',
    slug: 'business-vie-pratique',
    icon: 'briefcase',
    color: '#4CAF50',
    sourceSlugs: ['business', 'daily-life', 'vie-quotidienne', 'lifestyle'],
  },
];

function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function resolveMainCategoryDefinition(row: RawCategoryRow): MainCategoryDefinition | null {
  const slug = normalize(row.slug);
  const name = normalize(row.name).replace(/\s*&\s*/g, ' ').replace(/\s+/g, ' ');
  for (const def of MAIN_CATEGORY_DEFINITIONS) {
    if (def.sourceSlugs.some((source) => slug === source || slug.includes(source))) {
      return def;
    }
  }
  if (name.includes('histoire') || name.includes('societe') || name.includes('politique')) {
    return MAIN_CATEGORY_DEFINITIONS[1];
  }
  if (name.includes('geographie')) {
    return MAIN_CATEGORY_DEFINITIONS[2];
  }
  if (name.includes('science') || name.includes('technologie')) {
    return MAIN_CATEGORY_DEFINITIONS[3];
  }
  if (name.includes('sport')) {
    return MAIN_CATEGORY_DEFINITIONS[4];
  }
  if (name.includes('divertissement') || name.includes('musique') || name.includes('art')) {
    return MAIN_CATEGORY_DEFINITIONS[5];
  }
  if (name.includes('business') || name.includes('economie') || name.includes('vie') || name.includes('education')) {
    return MAIN_CATEGORY_DEFINITIONS[6];
  }
  if (name.includes('culture')) {
    return MAIN_CATEGORY_DEFINITIONS[0];
  }
  return null;
}

function buildMainCategoryItems(
  rawCategories: RawCategoryRow[],
  countsByRawCategoryId: Map<string, number>,
): { items: CategoryExploreItem[]; rawCategoryIdsByMainSlug: Map<string, string[]> } {
  const byMainSlug = new Map<string, CategoryExploreItem>();
  const rawCategoryIdsByMainSlug = new Map<string, string[]>();
  for (const row of rawCategories) {
    const def = resolveMainCategoryDefinition(row);
    if (!def) continue;
    const existing = byMainSlug.get(def.slug);
    const currentCount = countsByRawCategoryId.get(row.id) ?? 0;
    if (!existing) {
      byMainSlug.set(def.slug, {
        id: def.id,
        name: def.name,
        slug: def.slug,
        icon: def.icon,
        color: def.color,
        quizCount: currentCount,
      });
    } else {
      existing.quizCount += currentCount;
    }
    const ids = rawCategoryIdsByMainSlug.get(def.slug) ?? [];
    ids.push(row.id);
    rawCategoryIdsByMainSlug.set(def.slug, ids);
  }
  const items: CategoryExploreItem[] = MAIN_CATEGORY_DEFINITIONS.map((def) => {
    const fromDb = byMainSlug.get(def.slug);
    return (
      fromDb ?? {
        id: def.id,
        name: def.name,
        slug: def.slug,
        icon: def.icon,
        color: def.color,
        quizCount: 0,
      }
    );
  });
  items.sort((a, b) => {
    if (b.quizCount !== a.quizCount) return b.quizCount - a.quizCount;
    return a.name.localeCompare(b.name, 'fr');
  });
  return { items, rawCategoryIdsByMainSlug };
}

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

  const { items } = buildMainCategoryItems(categories, counts);
  return items;
}

function mapQuizRow(row: {
  id: string;
  title: string;
  thumbnail_url: string | null;
  total_questions: number;
  play_count: number;
  created_at: string;
  difficulty_level: string | null;
  points_per_question?: number | null;
  questions?: { count: number }[] | null;
}): CategoryQuizListItem {
  const fromRelation =
    Array.isArray(row.questions) && row.questions.length > 0 && typeof row.questions[0]?.count === 'number'
      ? row.questions[0].count
      : null;
  const questionCount = fromRelation ?? row.total_questions;
  const pointsPerQuestion = row.points_per_question ?? 1;
  return {
    id: row.id,
    title: row.title,
    thumbnailUrl: row.thumbnail_url,
    questionCount,
    playCount: row.play_count,
    createdAt: row.created_at,
    difficultyLevel: row.difficulty_level ?? null,
    maxScore: Math.max(0, questionCount * pointsPerQuestion),
  };
}

function sortQuizzes(items: CategoryQuizListItem[], mode: QuizSortMode): CategoryQuizListItem[] {
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

interface PlayerQuizProgress {
  bestScore: number;
  maxScore: number;
}

async function fetchPlayerQuizProgress(
  client: NonNullable<ReturnType<typeof getSupabaseClient>>,
  quizzes: CategoryQuizListItem[],
): Promise<Map<string, PlayerQuizProgress>> {
  const quizIds = quizzes.map((q) => q.id);
  if (quizIds.length === 0) return new Map();

  const { data: authData } = await client.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return new Map();

  const maxScoreByQuizId = new Map(quizzes.map((q) => [q.id, q.maxScore ?? 0]));
  const progress = new Map<string, PlayerQuizProgress>();

  const { data: scoreRows } = await client
    .from('user_quiz_scores')
    .select('quiz_id, best_score, max_score')
    .eq('user_id', userId)
    .in('quiz_id', quizIds);

  for (const row of scoreRows ?? []) {
    if (!row.quiz_id) continue;
    const quizMax = maxScoreByQuizId.get(row.quiz_id) ?? 0;
    progress.set(row.quiz_id, {
      bestScore: row.best_score ?? 0,
      maxScore: Math.max(quizMax, row.max_score ?? 0),
    });
  }

  const missingIds = quizIds.filter((id) => !progress.has(id));
  if (missingIds.length === 0) return progress;

  const { data: sessionRows } = await client
    .from('quiz_sessions')
    .select('quiz_id, score')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .in('quiz_id', missingIds);

  for (const row of sessionRows ?? []) {
    if (!row.quiz_id || progress.has(row.quiz_id)) continue;
    progress.set(row.quiz_id, {
      bestScore: row.score ?? 0,
      maxScore: maxScoreByQuizId.get(row.quiz_id) ?? 0,
    });
  }

  return progress;
}

function enrichQuizzesWithPlayerProgress(
  items: CategoryQuizListItem[],
  playerProgress: Map<string, PlayerQuizProgress>,
): CategoryQuizListItem[] {
  if (playerProgress.size === 0) return items;
  return items.map((item) => {
    const entry = playerProgress.get(item.id);
    if (!entry) return item;

    const maxScore = Math.max(item.maxScore ?? 0, entry.maxScore);
    const status = buildReplayStatus(entry.bestScore, maxScore);

    return {
      ...item,
      maxScore,
      playerBestScore: entry.bestScore,
      isCompletedByPlayer: status.isComplete,
    };
  });
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

  const { data: categories, error: cErr } = await client
    .from('categories')
    .select('id, name, slug, icon, color');

  if (cErr || !categories?.length) {
    return null;
  }

  const { items, rawCategoryIdsByMainSlug } = buildMainCategoryItems(categories, new Map());
  const mainCategory = items.find((item) => item.slug === slug);
  if (!mainCategory) {
    return null;
  }
  const categoryIds = rawCategoryIdsByMainSlug.get(slug) ?? [];
  if (categoryIds.length === 0) {
    return {
      category: { ...mainCategory, quizCount: 0 },
      quizzes: [],
    };
  }

  const { data: quizRows, error: qErr } = await client
    .from('quizzes')
    .select('id, title, thumbnail_url, total_questions, play_count, created_at, difficulty_level, points_per_question, questions(count)')
    .in('category_id', categoryIds)
    .eq('is_published', true);

  if (qErr) {
    return { category: { ...mainCategory, quizCount: 0 }, quizzes: [] };
  }

  const mapped = (quizRows ?? []).map(mapQuizRow);
  const playerProgress = await fetchPlayerQuizProgress(client, mapped);
  const enriched = enrichQuizzesWithPlayerProgress(mapped, playerProgress);
  const quizzes = sortQuizzes(enriched, sort);

  const header: CategoryExploreItem = { ...mainCategory, quizCount: quizzes.length };

  return {
    category: header,
    quizzes,
  };
}
