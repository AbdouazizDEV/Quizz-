const VISITOR_ALLOWED_CATEGORY_SLUGS = new Set([
  'culture-generale',
  'culture-generale-fr',
  'general-knowledge',
  'geographie',
  'geography',
  'histoire',
  'history',
  'histoire-societe',
]);

const VISITOR_ALLOWED_CATEGORY_NAMES = new Set([
  'culture generale',
  'geographie',
  'histoire',
  'histoire societe',
]);

/** Codes de difficulté persistés (alignés sur `quizzes.difficulty_level`). */
const QUIZ_DIFFICULTY_LEVEL_CODES = new Set(['Z0', 'Z1', 'Z2', 'Z3', 'A1', 'A2', 'A3']);

/**
 * Difficulté « définie » au sens produit : quiz verrouillé pour les visiteurs.
 * `NULL` / vide = parcours ouvert aux visiteurs.
 */
export function isQuizDifficultyDefined(level: string | null | undefined): boolean {
  const s = level?.trim();
  if (!s) return false;
  const key = s.toUpperCase();
  return QUIZ_DIFFICULTY_LEVEL_CODES.has(key);
}

export function canVisitorPlayQuiz(difficultyLevel: string | null | undefined): boolean {
  return !isQuizDifficultyDefined(difficultyLevel);
}

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

/**
 * Pas de session authentifiée (aucun jeton), y compris après déconnexion d’un compte existant.
 * À utiliser pour le filigran / blocage des quiz à difficulté définie.
 */
export function lacksAuthToken(token: string | null | undefined): boolean {
  return !token?.trim();
}

export const VISITOR_ACCESS_MESSAGE =
  "Connectez-vous pour acceder a toutes les categories et debloquer l'experience complete.";
