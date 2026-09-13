/** Client ID OAuth web (Google Cloud Console — aussi utilisé comme webClientId Android). */
export function getGoogleClientId(): string {
  return process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? '';
}

export function isGoogleSignInConfigured(): boolean {
  return getGoogleClientId().length > 0;
}

/** Schéma URL iOS requis par le plugin Expo Google Sign-In. */
export function getGoogleIosUrlScheme(): string | undefined {
  const clientId = getGoogleClientId();
  const prefix = clientId.replace(/\.apps\.googleusercontent\.com$/i, '');
  if (!prefix.includes('-')) return undefined;
  return `com.googleusercontent.apps.${prefix}`;
}
