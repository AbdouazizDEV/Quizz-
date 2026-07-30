/** Origine web pour les liens d’invitation ami (pont HTTPS → deep link app). */
export function inviteWebBaseFromApiUrl(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/api\/v1\/?$/, '');
}
