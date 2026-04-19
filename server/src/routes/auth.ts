import { Hono } from 'hono';
import { z } from 'zod';

import { getEnv, hasServiceRoleKey } from '../lib/env.js';
import { generateNumericOtp, hashOtp, safeEqualOtp } from '../lib/otp.js';
import { signResetToken, verifyResetToken } from '../lib/resetToken.js';
import {
  createAnonAuthClient,
  createServiceRoleClient,
  createSupabaseServerClient,
  createUserClient,
} from '../lib/supabaseClients.js';

const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(1).max(50),
  account_type: z.string().min(1).max(50),
  workplace: z.string().min(1).max(50),
  full_name: z.string().min(1).max(100),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  country_code: z.string().min(2).max(3),
  phone: z.string().min(3).max(32),
});

const loginBody = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  password: z.string().min(1),
});

const forgotBody = z.object({
  channel: z.enum(['email', 'sms']),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
});

const verifyOtpBody = z.object({
  channel: z.enum(['email', 'sms']),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  code: z.string().min(4).max(12),
});

const resetPasswordBody = z.object({
  reset_token: z.string().min(10),
  new_password: z.string().min(6),
});

function bearerToken(c: { req: { header: (n: string) => string | undefined } }): string | null {
  const h = c.req.header('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice('Bearer '.length).trim() || null;
}

const serviceRole503 = () =>
  ({
    error: 'SUPABASE_SERVICE_ROLE_KEY non configurée.',
    hint: 'Dashboard Supabase → Project Settings → API → copier la clé service_role dans .env.local ou server/.env.',
  }) as const;

function identifierForChannel(
  channel: 'email' | 'sms',
  email?: string,
  phone?: string,
): string | null {
  if (channel === 'email') {
    const e = email?.trim().toLowerCase();
    return e || null;
  }
  const p = phone?.trim();
  return p || null;
}

export const authRoutes = new Hono()
  .post('/register', async (c) => {
    const parsed = registerBody.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }
    const body = parsed.data;
    const {
      email,
      password,
      username,
      account_type,
      workplace,
      full_name,
      birth_date,
      country_code,
      phone,
    } = body;

    const userMetadata = {
      username,
      full_name,
      account_type,
      workplace,
      birth_date,
      country_code,
      phone,
    };

    /** Session immédiate : création confirmée + sign-in (nécessite la clé service_role). */
    if (hasServiceRoleKey()) {
      const admin = createServiceRoleClient();
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userMetadata,
      });
      if (createErr || !created.user) {
        return c.json({ error: createErr?.message ?? 'Création utilisateur impossible.', code: createErr?.name }, 400);
      }

      const anon = createAnonAuthClient();
      const { data: signedIn, error: signErr } = await anon.auth.signInWithPassword({ email, password });
      if (signErr || !signedIn.session) {
        return c.json(
          {
            error: signErr?.message ?? 'Compte créé mais connexion impossible.',
            user: created.user,
            session: null,
          },
          502,
        );
      }
      const s = signedIn.session;
      return c.json({
        user: signedIn.user,
        session: {
          access_token: s.access_token,
          refresh_token: s.refresh_token,
          expires_at: s.expires_at,
          expires_in: s.expires_in,
          token_type: s.token_type,
        },
      });
    }

    const supabase = createAnonAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userMetadata },
    });
    if (error) {
      return c.json({ error: error.message, code: error.name }, 400);
    }
    return c.json({
      user: data.user,
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            expires_in: data.session.expires_in,
            token_type: data.session.token_type,
          }
        : null,
      hint:
        'Session absente : activez SUPABASE_SERVICE_ROLE_KEY sur le serveur pour une session tout de suite, ou confirmez l’e-mail dans Supabase.',
    });
  })

  .post('/login', async (c) => {
    const parsed = loginBody.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }
    const { email, phone, password } = parsed.data;
    if (!email && !phone) {
      return c.json({ error: 'Fournir email ou phone avec le mot de passe.' }, 400);
    }
    if (email && phone) {
      return c.json({ error: 'Fournir uniquement email ou phone, pas les deux.' }, 400);
    }

    const supabase = createAnonAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword(
      email ? { email, password } : { phone: phone!, password },
    );
    if (error) {
      return c.json({ error: error.message, code: error.name }, 401);
    }
    const s = data.session;
    if (!s) {
      return c.json({ error: 'Session absente (vérifier la confirmation e-mail / téléphone).' }, 401);
    }
    return c.json({
      user: data.user,
      session: {
        access_token: s.access_token,
        refresh_token: s.refresh_token,
        expires_at: s.expires_at,
        expires_in: s.expires_in,
        token_type: s.token_type,
      },
    });
  })

  .post('/logout', async (c) => {
    const token = bearerToken(c);
    if (!token) {
      return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    }
    const supabase = createUserClient(token);
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ ok: true });
  })

  .post('/google', async (c) => {
    const env = getEnv();
    const supabase = createSupabaseServerClient(c);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: env.GOOGLE_OAUTH_REDIRECT_URL,
        skipBrowserRedirect: true,
      },
    });
    if (error || !data.url) {
      return c.json({ error: error?.message ?? 'Impossible de démarrer Google OAuth.' }, 400);
    }
    return c.json({ url: data.url });
  })

  .get('/google/callback', async (c) => {
    const code = c.req.query('code');
    if (!code) {
      return c.json({ error: 'Paramètre code manquant.' }, 400);
    }
    const supabase = createSupabaseServerClient(c);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.session) {
      return c.json({ error: error?.message ?? 'Échange du code impossible (cookies PKCE ?).' }, 400);
    }
    const s = data.session;
    return c.json({
      user: data.user,
      session: {
        access_token: s.access_token,
        refresh_token: s.refresh_token,
        expires_at: s.expires_at,
        expires_in: s.expires_in,
        token_type: s.token_type,
      },
    });
  })

  .post('/forgot-password', async (c) => {
    const env = getEnv();
    const parsed = forgotBody.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }
    const body = parsed.data;
    const id = identifierForChannel(body.channel, body.email, body.phone);
    if (!id) {
      return c.json({ error: 'email ou phone requis selon channel.' }, 400);
    }

    if (body.channel === 'sms') {
      return c.json(
        {
          error: 'Envoi SMS non configuré sur ce serveur.',
          hint: 'Utilisez channel=email ou branchez Twilio / fournisseur SMS.',
        },
        501,
      );
    }

    if (!hasServiceRoleKey()) {
      return c.json(serviceRole503(), 503);
    }

    const admin = createServiceRoleClient();
    const { data: userId, error: rpcError } = await admin.rpc('get_user_id_by_email', {
      search_email: id,
    });

    if (rpcError) {
      return c.json({ error: rpcError.message }, 500);
    }

    if (!userId) {
      return c.json({ ok: true });
    }

    const code = generateNumericOtp(6);
    const hashed = hashOtp(code, env.OTP_PEPPER);
    const { error: insError } = await admin.from('otp_codes').insert({
      identifier: id,
      user_id: userId as string,
      code: hashed,
      type: 'password_reset',
    });
    if (insError) {
      return c.json({ error: insError.message }, 500);
    }

    const response: Record<string, unknown> = { ok: true };
    if (env.INCLUDE_OTP_IN_RESPONSE) {
      response.dev_otp = code;
    }
    return c.json(response);
  })

  .post('/verify-otp', async (c) => {
    const env = getEnv();
    const parsed = verifyOtpBody.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }
    const body = parsed.data;
    if (body.channel === 'sms') {
      return c.json({ error: 'Vérification SMS non disponible.' }, 501);
    }
    const id = identifierForChannel(body.channel, body.email, body.phone);
    if (!id) {
      return c.json({ error: 'email requis.' }, 400);
    }

    if (!hasServiceRoleKey()) {
      return c.json(serviceRole503(), 503);
    }

    const admin = createServiceRoleClient();
    const { data: rows, error } = await admin
      .from('otp_codes')
      .select('id, code, is_used, expires_at')
      .eq('identifier', id)
      .eq('type', 'password_reset')
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      return c.json({ error: error.message }, 500);
    }
    const row = rows?.[0];
    if (!row || !safeEqualOtp(body.code, row.code, env.OTP_PEPPER)) {
      return c.json({ error: 'Code invalide ou expiré.' }, 400);
    }

    const { data: userId, error: rpcError } = await admin.rpc('get_user_id_by_email', {
      search_email: id,
    });
    if (rpcError || !userId) {
      return c.json({ error: 'Impossible de valider le compte.' }, 400);
    }

    await admin.from('otp_codes').update({ is_used: true }).eq('id', row.id);

    const resetToken = signResetToken(userId as string, env.RESET_TOKEN_SECRET);
    return c.json({ reset_token: resetToken });
  })

  .post('/reset-password', async (c) => {
    const env = getEnv();
    const parsed = resetPasswordBody.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }
    const { reset_token, new_password } = parsed.data;
    const claims = verifyResetToken(reset_token, env.RESET_TOKEN_SECRET);
    if (!claims) {
      return c.json({ error: 'reset_token invalide ou expiré.' }, 400);
    }

    if (!hasServiceRoleKey()) {
      return c.json(serviceRole503(), 503);
    }

    const admin = createServiceRoleClient();
    const { error } = await admin.auth.admin.updateUserById(claims.sub, { password: new_password });
    if (error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ ok: true });
  })

  .get('/me', async (c) => {
    const token = bearerToken(c);
    if (!token) {
      return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    }
    const supabase = createUserClient(token);
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return c.json({ error: userErr?.message ?? 'Jeton invalide.' }, 401);
    }

    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (profErr) {
      return c.json({ error: profErr.message }, 500);
    }

    return c.json({
      user: userData.user,
      profile,
    });
  });
