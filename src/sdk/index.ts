import type { components } from './generated/schema';

export { getQuizzApiClient, resetQuizzApiClientForTests } from './quizzApiClient';
export { parseQuizzApiError } from './sdkErrors';
export type { components, operations, paths } from './types';

/** Réponse `GET /auth/me` (générée depuis OpenAPI). */
export type AuthMeResponse = components['schemas']['AuthMeResponse'];
