import { AppConfig } from '@config';
import { parseQuizzApiError } from '@sdk';
import type {
  AuthSessionPayload,
  PasskeyAuthResult,
  PasskeyRegisterOptionsPayload,
} from '@app-types/authSession.types';

type ApiErrorBody = {
  error?: string;
  hint?: string;
  message?: string;
  code?: string;
  details?: unknown;
};

type PasskeyModule = typeof import('react-native-passkeys');

const EXPO_GO_PASSKEY_MESSAGE =
  'Les passkeys ne fonctionnent pas dans Expo Go. Lancez un build natif : npx expo run:android';

/** Traduit les erreurs WebAuthn / API (souvent en anglais) pour l’écran utilisateur. */
export function toFrenchPasskeyError(raw: unknown): string {
  const message = raw instanceof Error ? raw.message : String(raw ?? '').trim();
  const lower = message.toLowerCase();

  if (!message) {
    return 'Une erreur est survenue. Réessayez.';
  }

  if (
    lower.includes('registrable domain suffix') ||
    lower.includes('well-known/webauthn') ||
    lower.includes('current domain')
  ) {
    return 'La passkey ne peut pas être utilisée depuis ce navigateur (localhost). Installez l’APK de production et connectez-vous depuis l’application, pas depuis localhost.';
  }

  if (lower.includes('rp id cannot be validated') || lower.includes('domerror')) {
    return 'La passkey ne peut pas être validée sur cet appareil (domaine ou certificat APK). Utilisez « E-mail et mot de passe », ou demandez la mise à jour du serveur (assetlinks Android).';
  }

  if (lower.includes('apk-key-hash') && lower.includes('expected')) {
    return 'Le serveur n’accepte pas encore l’origine Android. Redéployez le backend (correctif passkey Android), puis réessayez.';
  }

  if (lower.includes('notallowederror') || lower.includes('not allowed')) {
    return 'Passkey refusée ou annulée.';
  }

  if (lower.includes('timed out') || lower.includes('timeout')) {
    return 'Délai dépassé. Réessayez la passkey.';
  }

  if (lower.includes('cancelled') || lower.includes('canceled') || lower.includes('annulée')) {
    return 'Opération passkey annulée.';
  }

  if (lower.includes('user verification')) {
    return 'Vérification biométrique requise. Réessayez avec Face ID ou empreinte.';
  }

  if (lower.includes('already') || lower.includes('409')) {
    return 'Pseudo, e-mail ou téléphone déjà utilisé.';
  }

  if (/[éèêàùçœ]/.test(message) || /^(impossible|aucun|saisissez|connexion|inscription|profil|compte)/i.test(message)) {
    return message;
  }

  if (
    /error:/i.test(message) ||
    lower.includes('unexpected') ||
    lower.includes('relying party') ||
    lower.includes('webauthn')
  ) {
    return 'Connexion passkey impossible. Vérifiez votre connexion et réessayez.';
  }

  return message;
}

async function loadPasskeyModule(): Promise<PasskeyModule> {
  try {
    const Constants = await import('expo-constants');
    if (Constants.default.appOwnership === 'expo') {
      throw new Error(EXPO_GO_PASSKEY_MESSAGE);
    }
  } catch (error) {
    if (error instanceof Error && error.message === EXPO_GO_PASSKEY_MESSAGE) {
      throw error;
    }
  }

  try {
    return await import('react-native-passkeys');
  } catch {
    throw new Error(EXPO_GO_PASSKEY_MESSAGE);
  }
}

async function apiPost<T>(path: string, body?: unknown, accessToken?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken?.trim()) {
    headers.Authorization = `Bearer ${accessToken.trim()}`;
  }

  const res = await fetch(`${AppConfig.API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const errBody = (json ?? {}) as ApiErrorBody;
    const message =
      parseQuizzApiError(errBody) ??
      errBody.error ??
      errBody.message ??
      `Requête échouée (${res.status}).`;
    const error = new Error(message) as Error & { status?: number; code?: string };
    error.status = res.status;
    error.code = errBody.code;
    throw error;
  }

  return json as T;
}

/** Inscription : options → biométrie → verify → { user, session }. */
export async function registerWithPasskey(
  payload: PasskeyRegisterOptionsPayload,
): Promise<PasskeyAuthResult> {
  const passkeys = await loadPasskeyModule();
  const step1 = await apiPost<{ options: unknown; user_id: string }>(
    '/auth/passkey/register/options',
    payload,
  );

  let credential;
  try {
    credential = await passkeys.create(step1.options as Parameters<PasskeyModule['create']>[0]);
  } catch (error) {
    throw new Error(toFrenchPasskeyError(error));
  }
  if (!credential) {
    throw new Error('Inscription passkey annulée.');
  }

  try {
    return await apiPost<PasskeyAuthResult>('/auth/passkey/register/verify', {
      user_id: step1.user_id,
      response: credential,
    });
  } catch (error) {
    throw new Error(toFrenchPasskeyError(error));
  }
}

/** Connexion : options (email ou username) → biométrie → verify. */
export async function loginWithPasskey(params?: {
  email?: string;
  username?: string;
}): Promise<PasskeyAuthResult> {
  const passkeys = await loadPasskeyModule();
  const body =
    params?.email?.trim()
      ? { email: params.email.trim() }
      : params?.username?.trim()
        ? { username: params.username.trim() }
        : undefined;

  const step1 = await apiPost<{ options: unknown }>('/auth/passkey/login/options', body);

  let credential;
  try {
    credential = await passkeys.get(step1.options as Parameters<PasskeyModule['get']>[0]);
  } catch (error) {
    throw new Error(toFrenchPasskeyError(error));
  }
  if (!credential) {
    throw new Error('Connexion passkey annulée.');
  }

  try {
    return await apiPost<PasskeyAuthResult>('/auth/passkey/login/verify', { response: credential });
  } catch (error) {
    throw new Error(toFrenchPasskeyError(error));
  }
}

/** Renouvelle l’access token via POST /auth/passkey/refresh. */
export async function refreshPasskeySession(
  refreshToken: string,
): Promise<AuthSessionPayload> {
  return apiPost<AuthSessionPayload>('/auth/passkey/refresh', {
    refresh_token: refreshToken,
  });
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const base = AppConfig.API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    const res = await fetch(`${base}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
