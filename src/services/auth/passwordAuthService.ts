import { AppConfig } from '@config';
import { parseQuizzApiError } from '@sdk';
import type { AuthSessionPayload, AuthUser } from '@app-types/authSession.types';
import { toFrenchPasskeyError } from './passkeyAuthService';

type ApiErrorBody = {
  error?: string;
  hint?: string;
  message?: string;
  code?: string;
};

export interface PasswordAuthResult {
  user: AuthUser;
  session: AuthSessionPayload;
}

export interface PasswordRegisterPayload {
  email: string;
  username: string;
  password: string;
  account_type?: string;
  workplace?: string;
  full_name?: string;
  birth_date?: string;
  country_code?: string;
  phone?: string;
  gender?: 'male' | 'female';
}

export function toFrenchPasswordAuthError(raw: unknown): string {
  const status =
    typeof raw === 'object' && raw !== null && 'status' in raw
      ? Number((raw as { status?: number }).status)
      : undefined;
  const message = raw instanceof Error ? raw.message : String(raw ?? '').trim();
  const lower = message.toLowerCase();

  if (status === 401 || lower.includes('identifiants invalides') || lower.includes('invalid login')) {
    return 'Identifiants invalides.';
  }

  if (status === 409 || lower.includes('already') || lower.includes('déjà')) {
    if (lower.includes('email') || lower.includes('e-mail') || lower.includes('mail')) {
      return 'Cet e-mail est déjà pris.';
    }
    if (lower.includes('username') || lower.includes('pseudo') || lower.includes('utilisateur')) {
      return 'Ce pseudo est déjà pris.';
    }
    return 'Ce pseudo ou e-mail est déjà pris.';
  }

  if (!message) {
    return 'Une erreur est survenue. Réessayez.';
  }

  if (
    /[éèêàùçœ]/.test(message) ||
    /^(impossible|aucun|saisissez|connexion|inscription|profil|compte|identifiants|ce )/i.test(message)
  ) {
    return message;
  }

  return message;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${AppConfig.API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
    throw new Error(toFrenchPasskeyError(message));
  }

  return json as T;
}

/** Inscription Nest email + mot de passe (session max 24 h côté serveur). */
export async function registerWithPassword(
  payload: PasswordRegisterPayload,
): Promise<PasswordAuthResult> {
  return apiPost<PasswordAuthResult>('/auth/register', payload);
}

/** Connexion Nest email ou username + mot de passe. */
export async function loginWithPassword(params: {
  email?: string;
  username?: string;
  password: string;
}): Promise<PasswordAuthResult> {
  const body = params.email?.trim()
    ? { email: params.email.trim().toLowerCase(), password: params.password }
    : { username: params.username?.trim(), password: params.password };
  return apiPost<PasswordAuthResult>('/auth/login', body);
}
