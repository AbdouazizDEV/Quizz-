/** Origine web pour les liens d’invitation ami (pont HTTPS → deep link app). */
export function inviteWebBaseFromApiUrl(apiBaseUrl: string): string {
  const withoutApiPath = apiBaseUrl.replace(/\/api\/v1\/?$/, '');
  try {
    const url = new URL(withoutApiPath);
    if (url.hostname.startsWith('api.')) {
      url.hostname = url.hostname.replace(/^api\./, '');
    }
    return url.origin;
  } catch {
    return withoutApiPath;
  }
}
