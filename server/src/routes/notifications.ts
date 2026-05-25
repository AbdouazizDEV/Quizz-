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
  });
