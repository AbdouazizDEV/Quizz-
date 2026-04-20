import createClient from 'openapi-fetch';

import { AppConfig } from '@config';

import type { paths } from './generated/schema';

let client: ReturnType<typeof createClient<paths>> | null = null;

/**
 * Client HTTP typé (OpenAPI) pour `/api/v1`. Préférer ce module aux chaînes en dur pour l’auth.
 * Les autres routes (ex. `/user/profile`) restent sur `apiClient` axios jusqu’à intégration OpenAPI.
 */
export function getQuizzApiClient(): ReturnType<typeof createClient<paths>> {
  if (!client) {
    client = createClient<paths>({ baseUrl: AppConfig.API_BASE_URL });
  }
  return client;
}

/** Réinitialise le client (tests / changement d’environnement rare). */
export function resetQuizzApiClientForTests(): void {
  client = null;
}
