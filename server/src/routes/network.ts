import { Hono } from 'hono';
import { z } from 'zod';

import { createServiceRoleClient, createUserClient } from '../lib/supabaseClients.js';
import { hasServiceRoleKey } from '../lib/env.js';

const listQuerySchema = z.object({
  filter: z.enum(['friends', 'suggestions']).default('friends'),
  q: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const followParamSchema = z.object({
  userId: z.string().uuid(),
});

const requestParamSchema = z.object({
  notificationId: z.string().uuid(),
});
const requestsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

function bearerToken(c: { req: { header: (n: string) => string | undefined } }): string | null {
  const h = c.req.header('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice('Bearer '.length).trim() || null;
}

const serviceRole503 = () =>
  ({
    error: 'SUPABASE_SERVICE_ROLE_KEY non configurée.',
    hint: 'Requise pour les endpoints réseau (liste amis/suggestions et follow/unfollow).',
  }) as const;

function applySearch<T extends { or: (filters: string) => T }>(query: T, rawQuery?: string): T {
  const q = rawQuery?.trim();
  if (!q) return query;
  // ILIKE sur full_name et username.
  return query.or(`full_name.ilike.%${q}%,username.ilike.%${q}%`);
}

type FriendRequestPayload = {
  requester_id: string;
  status: 'pending' | 'accepted' | 'rejected';
};

function parseFriendRequestData(data: unknown): FriendRequestPayload | null {
  if (!data || typeof data !== 'object') return null;
  const row = data as Partial<FriendRequestPayload>;
  const requesterId = typeof row.requester_id === 'string' ? row.requester_id : null;
  const status = row.status;
  if (!requesterId) return null;
  if (status !== 'pending' && status !== 'accepted' && status !== 'rejected') return null;
  return { requester_id: requesterId, status };
}

export const networkRoutes = new Hono()
  .get('/friend-requests', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const parsedQuery = requestsQuerySchema.safeParse(c.req.query());
    if (!parsedQuery.success) {
      return c.json({ error: 'Query invalide', details: parsedQuery.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { data: rows, error } = await admin
      .from('notifications')
      .select('id, created_at, data')
      .eq('user_id', viewerId)
      .eq('type', 'friend_request')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(parsedQuery.data.limit);
    if (error) return c.json({ error: error.message }, 500);

    const pending = (rows ?? [])
      .map((r) => ({
        id: r.id,
        created_at: r.created_at,
        payload: parseFriendRequestData(r.data),
      }))
      .filter((r) => r.payload?.status === 'pending') as Array<{
      id: string;
      created_at: string;
      payload: FriendRequestPayload;
    }>;

    const requesterIds = [...new Set(pending.map((r) => r.payload.requester_id))];
    const { data: requesterRows, error: reqErr } = requesterIds.length
      ? await admin
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', requesterIds)
      : { data: [], error: null };
    if (reqErr) return c.json({ error: reqErr.message }, 500);

    const byId = new Map(
      (requesterRows ?? []).map((r) => [
        r.id,
        {
          name: r.full_name?.trim() || r.username?.trim() || 'Joueur',
          handle: `@${r.username ?? 'joueur'}`,
          avatar_url: r.avatar_url,
        },
      ]),
    );

    return c.json({
      items: pending.map((r) => ({
        notification_id: r.id,
        created_at: r.created_at,
        requester_id: r.payload.requester_id,
        requester_name: byId.get(r.payload.requester_id)?.name ?? 'Joueur',
        requester_handle: byId.get(r.payload.requester_id)?.handle ?? '@joueur',
        requester_avatar_url: byId.get(r.payload.requester_id)?.avatar_url ?? null,
      })),
      total: pending.length,
    });
  })
  .get('/users', async (c) => {
    const token = bearerToken(c);
    if (!token) {
      return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    }
    if (!hasServiceRoleKey()) {
      return c.json(serviceRole503(), 503);
    }

    const parsed = listQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ error: 'Query invalide', details: parsed.error.flatten() }, 400);
    }

    const { filter, q, page, limit } = parsed.data;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) {
      return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);
    }

    const admin = createServiceRoleClient();
    const { data: viewerProfile } = await admin
      .from('profiles')
      .select('full_name, username')
      .eq('id', viewerId)
      .maybeSingle();
    const viewerDisplayName =
      viewerProfile?.full_name?.trim() || viewerProfile?.username?.trim() || 'Mon réseau';

    // IDs déjà suivis (exclusion suggestions + statut relation).
    const { data: followRows, error: followRowsErr } = await admin
      .from('friendships')
      .select('following_id')
      .eq('follower_id', viewerId);
    if (followRowsErr) {
      return c.json({ error: followRowsErr.message }, 500);
    }
    const followedIds = (followRows ?? []).map((r) => r.following_id);

    if (filter === 'friends') {
      if (followedIds.length === 0) {
        return c.json({
          viewer_display_name: viewerDisplayName,
          items: [],
          page,
          limit,
          total: 0,
          has_more: false,
        });
      }

      let query = admin
        .from('profiles')
        .select('id, username, full_name, avatar_url', { count: 'exact' })
        .in('id', followedIds)
        .order('total_score', { ascending: false })
        .range(from, to);
      query = applySearch(query, q);

      const { data: rows, count, error } = await query;
      if (error) {
        return c.json({ error: error.message }, 500);
      }
      const total = count ?? 0;

      return c.json({
        viewer_display_name: viewerDisplayName,
        items:
          rows?.map((r) => ({
            id: r.id,
            display_name: r.full_name?.trim() || r.username?.trim() || 'Joueur',
            handle: `@${r.username ?? 'joueur'}`,
            avatar_url: r.avatar_url,
            relationship_is_active: true,
          })) ?? [],
        page,
        limit,
        total,
        has_more: page * limit < total,
      });
    }

    // suggestions = profils non suivis + soi-même exclu.
    const excludedIds = [viewerId, ...followedIds];
    let query = admin
      .from('profiles')
      .select('id, username, full_name, avatar_url', { count: 'exact' })
      .order('total_score', { ascending: false })
      .range(from, to);
    query = applySearch(query, q);
    if (excludedIds.length > 0) {
      query = query.not('id', 'in', `(${excludedIds.join(',')})`);
    }

    const { data: rows, count, error } = await query;
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    const total = count ?? 0;

    return c.json({
      viewer_display_name: viewerDisplayName,
      items:
        rows?.map((r) => ({
          id: r.id,
          display_name: r.full_name?.trim() || r.username?.trim() || 'Joueur',
          handle: `@${r.username ?? 'joueur'}`,
          avatar_url: r.avatar_url,
          relationship_is_active: false,
        })) ?? [],
      page,
      limit,
      total,
      has_more: page * limit < total,
    });
  })
  .post('/follow/:userId', async (c) => {
    const token = bearerToken(c);
    if (!token) {
      return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    }
    if (!hasServiceRoleKey()) {
      return c.json(serviceRole503(), 503);
    }
    const parsed = followParamSchema.safeParse(c.req.param());
    if (!parsed.success) {
      return c.json({ error: 'Paramètre invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) {
      return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);
    }

    const targetUserId = parsed.data.userId;
    if (targetUserId === viewerId) {
      return c.json({ error: 'Impossible de vous suivre vous-même.' }, 400);
    }

    const admin = createServiceRoleClient();

    const { data: targetProfile, error: targetErr } = await admin
      .from('profiles')
      .select('id')
      .eq('id', targetUserId)
      .maybeSingle();
    if (targetErr) return c.json({ error: targetErr.message }, 500);
    if (!targetProfile) return c.json({ error: 'Utilisateur introuvable.' }, 404);

    // Déjà amis ? on ne recrée pas de demande.
    const { data: existingFriend } = await admin
      .from('friendships')
      .select('id')
      .eq('follower_id', viewerId)
      .eq('following_id', targetUserId)
      .maybeSingle();
    if (existingFriend?.id) return c.json({ ok: true, already_friends: true });

    // Eviter les doublons de demandes en attente.
    const { data: existingRequests, error: reqErr } = await admin
      .from('notifications')
      .select('id, data, is_read')
      .eq('user_id', targetUserId)
      .eq('type', 'friend_request')
      .order('created_at', { ascending: false })
      .limit(50);
    if (reqErr) return c.json({ error: reqErr.message }, 500);

    const hasPending = (existingRequests ?? []).some((n) => {
      if (n.is_read) return false;
      const payload = parseFriendRequestData(n.data);
      return payload?.requester_id === viewerId && payload.status === 'pending';
    });
    if (hasPending) return c.json({ ok: true, already_pending: true });

    const { data: requesterProfile } = await admin
      .from('profiles')
      .select('full_name, username')
      .eq('id', viewerId)
      .maybeSingle();
    const requesterName =
      requesterProfile?.full_name?.trim() || requesterProfile?.username?.trim() || 'Un utilisateur';

    const { error } = await admin.from('notifications').insert({
      user_id: targetUserId,
      type: 'friend_request',
      title: "Nouvelle demande d'ami",
      body: `${requesterName} veut devenir votre ami.`,
      data: {
        requester_id: viewerId,
        status: 'pending',
      },
      is_read: false,
    });
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ ok: true, pending_request_sent: true });
  })
  .delete('/follow/:userId', async (c) => {
    const token = bearerToken(c);
    if (!token) {
      return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    }
    if (!hasServiceRoleKey()) {
      return c.json(serviceRole503(), 503);
    }
    const parsed = followParamSchema.safeParse(c.req.param());
    if (!parsed.success) {
      return c.json({ error: 'Paramètre invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) {
      return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);
    }

    const admin = createServiceRoleClient();
    const { error } = await admin
      .from('friendships')
      .delete()
      .eq('follower_id', viewerId)
      .eq('following_id', parsed.data.userId);
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ ok: true });
  })
  .post('/friend-requests/:notificationId/accept', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const parsed = requestParamSchema.safeParse(c.req.param());
    if (!parsed.success) {
      return c.json({ error: 'Paramètre invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { data: notif, error: notifErr } = await admin
      .from('notifications')
      .select('id, user_id, data')
      .eq('id', parsed.data.notificationId)
      .eq('type', 'friend_request')
      .maybeSingle();
    if (notifErr) return c.json({ error: notifErr.message }, 500);
    if (!notif || notif.user_id !== viewerId) return c.json({ error: 'Demande introuvable.' }, 404);

    const payload = parseFriendRequestData(notif.data);
    if (!payload || payload.status !== 'pending') {
      return c.json({ error: 'Demande déjà traitée ou invalide.' }, 400);
    }

    // Relation mutuelle pour un vrai statut "ami".
    const { error: upsertErr } = await admin
      .from('friendships')
      .upsert(
        [
          { follower_id: payload.requester_id, following_id: viewerId },
          { follower_id: viewerId, following_id: payload.requester_id },
        ],
        { onConflict: 'follower_id,following_id' },
      );
    if (upsertErr) return c.json({ error: upsertErr.message }, 500);

    const { error: notifUpdateErr } = await admin
      .from('notifications')
      .update({ is_read: true, data: { ...payload, status: 'accepted' } })
      .eq('id', notif.id);
    if (notifUpdateErr) return c.json({ error: notifUpdateErr.message }, 500);

    return c.json({ ok: true });
  })
  .post('/friend-requests/:notificationId/reject', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const parsed = requestParamSchema.safeParse(c.req.param());
    if (!parsed.success) {
      return c.json({ error: 'Paramètre invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { data: notif, error: notifErr } = await admin
      .from('notifications')
      .select('id, user_id, data')
      .eq('id', parsed.data.notificationId)
      .eq('type', 'friend_request')
      .maybeSingle();
    if (notifErr) return c.json({ error: notifErr.message }, 500);
    if (!notif || notif.user_id !== viewerId) return c.json({ error: 'Demande introuvable.' }, 404);

    const payload = parseFriendRequestData(notif.data);
    if (!payload || payload.status !== 'pending') {
      return c.json({ error: 'Demande déjà traitée ou invalide.' }, 400);
    }

    const { error: notifUpdateErr } = await admin
      .from('notifications')
      .update({ is_read: true, data: { ...payload, status: 'rejected' } })
      .eq('id', notif.id);
    if (notifUpdateErr) return c.json({ error: notifUpdateErr.message }, 500);

    return c.json({ ok: true });
  });

