import { Hono } from 'hono';
import { z } from 'zod';

import { hasServiceRoleKey } from '../lib/env.js';
import { createServiceRoleClient, createUserClient } from '../lib/supabaseClients.js';

const listQuerySchema = z.object({
  filter: z.enum(['all', 'unread']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

function bearerToken(c: { req: { header: (n: string) => string | undefined } }): string | null {
  const h = c.req.header('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice('Bearer '.length).trim() || null;
}

const serviceRole503 = () =>
  ({
    error: 'SUPABASE_SERVICE_ROLE_KEY non configurée.',
    hint: 'Requise pour la liste des notifications.',
  }) as const;

export const notificationsRoutes = new Hono()
  .get('/', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const parsed = listQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ error: 'Query invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const { filter, page, limit } = parsed.data;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const admin = createServiceRoleClient();
    let query = admin
      .from('notifications')
      .select('id, type, title, body, data, is_read, created_at', { count: 'exact' })
      .eq('user_id', viewerId)
      .order('created_at', { ascending: false });

    if (filter === 'unread') {
      query = query.eq('is_read', false);
    }

    const { data: rows, error, count } = await query.range(from, to);
    if (error) return c.json({ error: error.message }, 500);

    const unreadQuery = admin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', viewerId)
      .eq('is_read', false);
    const { count: unreadCount, error: unreadErr } = await unreadQuery;
    if (unreadErr) return c.json({ error: unreadErr.message }, 500);

    return c.json({
      items: rows ?? [],
      page,
      limit,
      total: count ?? 0,
      unread_count: unreadCount ?? 0,
    });
  })
  .patch('/:id/read', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const param = idParamSchema.safeParse(c.req.param());
    if (!param.success) return c.json({ error: 'Paramètre invalide' }, 400);

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', param.data.id)
      .eq('user_id', viewerId)
      .select('id, is_read')
      .maybeSingle();

    if (error) return c.json({ error: error.message }, 500);
    if (!data) return c.json({ error: 'Notification introuvable.' }, 404);

    return c.json({ ok: true, id: data.id, is_read: true });
  })
  .post('/read-all', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { error } = await admin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', viewerId)
      .eq('is_read', false);

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
  })
  /** Rappel de série : afternoon (18h) + final (deadline - 1h). */
  .post('/streak-reminder', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const bodySchema = z.object({
      phase: z.enum(['afternoon', 'final', '1h', '10s']),
      streak_days: z.coerce.number().int().min(0).optional(),
      local_day_key: z.string().min(8).max(16),
      hours_remaining: z.coerce.number().int().min(1).max(24).optional(),
    });
    const parsed = bodySchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();

    // Normalise les anciennes phases client → nouvelles
    const phaseRaw = parsed.data.phase;
    const phase =
      phaseRaw === '1h' ? 'afternoon' : phaseRaw === '10s' ? 'final' : phaseRaw;
    const dedupeKey = `${phase}:${parsed.data.local_day_key}`;

    // Anti-doublon : notification_log puis notifications
    const { data: logHit } = await admin
      .from('notification_log')
      .select('id')
      .eq('user_id', viewerId)
      .eq('type', 'streak_reminder')
      .eq('dedupe_key', dedupeKey)
      .maybeSingle();
    if (logHit?.id) return c.json({ ok: true, created: false, reason: 'already_sent' });

    const { data: recent } = await admin
      .from('notifications')
      .select('id, data, created_at')
      .eq('user_id', viewerId)
      .eq('type', 'streak_reminder')
      .order('created_at', { ascending: false })
      .limit(8);

    const already = (recent ?? []).some((row) => {
      const d = row.data as { dedupe_key?: string } | null;
      return d?.dedupe_key === dedupeKey;
    });
    if (already) return c.json({ ok: true, created: false, reason: 'already_sent' });

    // Préférence utilisateur
    const { data: pref } = await admin
      .from('notification_preferences')
      .select('enabled')
      .eq('user_id', viewerId)
      .eq('type', 'streak_reminder')
      .maybeSingle();
    if (pref && pref.enabled === false) {
      return c.json({ ok: true, created: false, reason: 'disabled' });
    }

    const streak = parsed.data.streak_days ?? 0;
    const hoursRemaining = parsed.data.hours_remaining ?? 1;
    const title =
      phase === 'afternoon' ? 'Ta série t’attend 🔥' : 'Dernière chance !';
    const body =
      phase === 'afternoon'
        ? `Ta série de ${streak} jour${streak > 1 ? 's' : ''} t'attend 🔥 Joue un quiz avant minuit pour la conserver !`
        : `Dernière chance ! Il te reste ${hoursRemaining}h pour ne pas perdre ta série de ${streak} jour${streak > 1 ? 's' : ''}.`;

    const { error } = await admin.from('notifications').insert({
      user_id: viewerId,
      type: 'streak_reminder',
      title,
      body,
      data: {
        phase,
        dedupe_key: dedupeKey,
        streak_days: streak,
        hours_remaining: hoursRemaining,
      },
      is_read: false,
    });
    if (error) return c.json({ error: error.message }, 500);

    await admin.from('notification_log').upsert(
      {
        user_id: viewerId,
        type: 'streak_reminder',
        dedupe_key: dedupeKey,
      },
      { onConflict: 'user_id,type,dedupe_key' },
    );

    return c.json({ ok: true, created: true });
  })
  .delete('/:id', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const param = idParamSchema.safeParse(c.req.param());
    if (!param.success) return c.json({ error: 'Paramètre invalide' }, 400);

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { error } = await admin
      .from('notifications')
      .delete()
      .eq('id', param.data.id)
      .eq('user_id', viewerId);

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
  })
  /** Enregistre un token Expo Push pour l’appareil courant. */
  .post('/devices', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const bodySchema = z.object({
      expo_push_token: z.string().min(8).max(256),
      platform: z.enum(['ios', 'android', 'web']).optional(),
      timezone: z.string().min(2).max(64).optional(),
    });
    const parsed = bodySchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const timezone =
      parsed.data.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone ??
      'Africa/Dakar';

    const { error } = await admin.from('user_devices').upsert(
      {
        user_id: viewerId,
        expo_push_token: parsed.data.expo_push_token,
        platform: parsed.data.platform ?? null,
        timezone,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,expo_push_token' },
    );
    if (error) return c.json({ error: error.message }, 500);

    await admin.from('profiles').update({ timezone }).eq('id', viewerId);

    return c.json({ ok: true });
  })
  /** Liste / maj des préférences de notification. */
  .get('/preferences', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from('notification_preferences')
      .select('type, enabled, updated_at')
      .eq('user_id', viewerId);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ items: data ?? [] });
  })
  .put('/preferences', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const bodySchema = z.object({
      type: z.string().min(2).max(64),
      enabled: z.boolean(),
    });
    const parsed = bodySchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { error } = await admin.from('notification_preferences').upsert(
      {
        user_id: viewerId,
        type: parsed.data.type,
        enabled: parsed.data.enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,type' },
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
  });
