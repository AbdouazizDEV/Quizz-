const VISITOR_ALLOWED_CATEGORY_SLUGS = new Set([
  'culture-generale',
  'culture-generale-fr',
  'general-knowledge',
  'geographie',
  'geography',
  'histoire',
  'history',
]);

const VISITOR_ALLOWED_CATEGORY_NAMES = new Set(['culture generale', 'geographie', 'histoire']);

function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function canVisitorAccessCategory(category: { slug?: string | null; name?: string | null }): boolean {
  const slug = category.slug ? normalize(category.slug) : '';
  if (slug && VISITOR_ALLOWED_CATEGORY_SLUGS.has(slug)) {
    return true;
  }
  const name = category.name ? normalize(category.name) : '';
  return name ? VISITOR_ALLOWED_CATEGORY_NAMES.has(name) : false;
}

export function isVisitorSession(input: {
  token: string | null | undefined;
  hasRegisteredAccount: boolean;
}): boolean {
  return !input.token?.trim() && !input.hasRegisteredAccount;
}

export const VISITOR_ACCESS_MESSAGE =
  "Connectez-vous pour acceder a toutes les categories et debloquer l'experience complete.";
