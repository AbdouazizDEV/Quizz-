import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parse } from 'cookie';
import type { Context } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';

import { getEnv } from './env.js';

type AnyClient = SupabaseClient;

const DEFAULT_SUPABASE_FETCH_MS = 30_000;

function supabaseFetchTimeoutMs(): number {
  const raw = process.env.SUPABASE_FETCH_TIMEOUT_MS?.trim();
  if (raw && /^\d+$/.test(raw)) return Number.parseInt(raw, 10);
  return DEFAULT_SUPABASE_FETCH_MS;
}

/** Undici utilise 10 s par défaut ; on aligne avec le timeout Axios côté app. */
function createSupabaseGlobalFetch(): typeof fetch {
  return (input, init) => {
    const ms = supabaseFetchTimeoutMs();
    const timeoutSig = AbortSignal.timeout(ms);
    const parent = init?.signal;
    const signal =
      parent && typeof AbortSignal !== 'undefined' && typeof (AbortSignal as unknown as { any?: (s: AbortSignal[]) => AbortSignal }).any === 'function'
        ? (AbortSignal as unknown as { any: (s: AbortSignal[]) => AbortSignal }).any([parent, timeoutSig])
        : timeoutSig;
    return fetch(input, { ...init, signal });
  };
}

let cachedGlobalFetch: typeof fetch | null = null;
function globalFetchForSupabase(): typeof fetch {
  if (!cachedGlobalFetch) cachedGlobalFetch = createSupabaseGlobalFetch();
  return cachedGlobalFetch;
}

/** Client « utilisateur » (sans persistance fichier) : register, login. */
export function createAnonAuthClient(): AnyClient {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: globalFetchForSupabase() },
  });
}

/** Admin : OTP, reset mot de passe, RPC sécurisées (nécessite {@link hasServiceRoleKey}). */
export function createServiceRoleClient(): AnyClient {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnv();
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY non configurée');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: globalFetchForSupabase() },
  });
}

/** OAuth Google (PKCE) + callback : cookies sur la réponse Hono. */
export function createSupabaseServerClient(c: Context): AnyClient {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { fetch: globalFetchForSupabase() },
    cookies: {
      getAll() {
        const header = c.req.header('Cookie') ?? '';
        const jar = parse(header);
        return Object.entries(jar).map(([name, value]) => ({ name, value: value ?? '' }));
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        for (const { name, value, options } of cookiesToSet) {
          const path = options?.path ?? '/';
          if (!value) {
            deleteCookie(c, name, { ...options, path });
            continue;
          }
          setCookie(c, name, value, { ...options, path });
        }
      },
    },
  }) as unknown as AnyClient;
}

/** Requêtes authentifiées avec le JWT courant (ex. GET /me). */
export function createUserClient(accessToken: string): AnyClient {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
      fetch: globalFetchForSupabase(),
    },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
