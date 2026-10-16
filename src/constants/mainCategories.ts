import type { CategoryExploreItem } from '@app-types/categoryExplore.types';

export interface MainCategoryDefinition {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sourceSlugs: string[];
}

export const MAIN_CATEGORY_DEFINITIONS: MainCategoryDefinition[] = [
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

const CANONICAL_SLUGS = new Set(MAIN_CATEGORY_DEFINITIONS.map((d) => d.slug));

export function normalizeCategoryKey(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function resolveMainCategoryDefinition(row: {
  slug: string;
  name: string;
}): MainCategoryDefinition | null {
  const slug = normalizeCategoryKey(row.slug);
  const name = normalizeCategoryKey(row.name).replace(/\s*&\s*/g, ' ').replace(/\s+/g, ' ');
  for (const def of MAIN_CATEGORY_DEFINITIONS) {
    if (def.sourceSlugs.some((source) => slug === source || slug.includes(source))) {
      return def;
    }
  }
  if (name.includes('histoire') || name.includes('societe') || name.includes('politique')) {
    return MAIN_CATEGORY_DEFINITIONS[1]!;
  }
  if (name.includes('geographie')) return MAIN_CATEGORY_DEFINITIONS[2]!;
  if (name.includes('science') || name.includes('technologie')) return MAIN_CATEGORY_DEFINITIONS[3]!;
  if (name.includes('sport')) return MAIN_CATEGORY_DEFINITIONS[4]!;
  if (name.includes('divertissement') || name.includes('musique') || name.includes('art')) {
    return MAIN_CATEGORY_DEFINITIONS[5]!;
  }
  if (name.includes('business') || name.includes('economie') || name.includes('vie')) {
    return MAIN_CATEGORY_DEFINITIONS[6]!;
  }
  if (name.includes('culture')) return MAIN_CATEGORY_DEFINITIONS[0]!;
  return null;
}

export function looksAlreadyAggregated(items: Array<{ slug: string }>): boolean {
  if (items.length === 0) return false;
  return items.every((item) => CANONICAL_SLUGS.has(normalizeCategoryKey(item.slug)));
}

export function sourceSlugsForCategory(slug: string): string[] {
  const key = normalizeCategoryKey(slug);
  const def =
    MAIN_CATEGORY_DEFINITIONS.find((d) => d.slug === key) ??
    MAIN_CATEGORY_DEFINITIONS.find((d) => d.sourceSlugs.includes(key));
  if (!def) return [slug];
  return Array.from(new Set([def.slug, ...def.sourceSlugs]));
}

export function canonicalCategoryForSlug(slug: string): MainCategoryDefinition | null {
  const key = normalizeCategoryKey(slug);
  return (
    MAIN_CATEGORY_DEFINITIONS.find((d) => d.slug === key) ??
    MAIN_CATEGORY_DEFINITIONS.find((d) => d.sourceSlugs.includes(key)) ??
    null
  );
}

export function sortCategoryItems(items: CategoryExploreItem[]): CategoryExploreItem[] {
  return [...items].sort((a, b) => {
    if (b.quizCount !== a.quizCount) return b.quizCount - a.quizCount;
    return a.name.localeCompare(b.name, 'fr');
  });
}

/** Regroupe les slugs fins Nest vers les 7 catégories principales. */
export function aggregateMainCategories(raw: CategoryExploreItem[]): CategoryExploreItem[] {
  if (looksAlreadyAggregated(raw)) {
    return sortCategoryItems(raw);
  }

  const byMainSlug = new Map<string, CategoryExploreItem>();
  for (const row of raw) {
    const def = resolveMainCategoryDefinition(row);
    if (!def) continue;
    const existing = byMainSlug.get(def.slug);
    if (!existing) {
      byMainSlug.set(def.slug, {
        id: def.id,
        name: def.name,
        slug: def.slug,
        icon: def.icon,
        color: def.color,
        quizCount: row.quizCount,
      });
    } else {
      existing.quizCount += row.quizCount;
    }
  }

  const items: CategoryExploreItem[] = [];
  for (const def of MAIN_CATEGORY_DEFINITIONS) {
    const fromApi = byMainSlug.get(def.slug);
    if (fromApi) items.push(fromApi);
  }

  return sortCategoryItems(items);
}
