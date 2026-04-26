import { Hono } from 'hono';
import { z } from 'zod';

import { uploadAvatarToCloudinary, uploadCoverToCloudinary } from '../lib/cloudinary.js';
import { createServiceRoleClient, createUserClient } from '../lib/supabaseClients.js';
import { hasServiceRoleKey } from '../lib/env.js';

const paramsSchema = z.object({
  userId: z.string().uuid(),
});
const avatarBodySchema = z.object({
  image_base64: z.string().min(40),
});
const coverBodySchema = z.object({
  image_base64: z.string().min(40),
});

function bearerToken(c: { req: { header: (n: string) => string | undefined } }): string | null {
  const h = c.req.header('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice('Bearer '.length).trim() || null;
}

const serviceRole503 = () =>
  ({
    error: 'SUPABASE_SERVICE_ROLE_KEY non configurée.',
    hint: 'Requise pour la lecture du profil public enrichi.',
  }) as const;

export const usersRoutes = new Hono().get('/:userId/profile', async (c) => {
  const token = bearerToken(c);
  if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
  if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

  const parsed = paramsSchema.safeParse(c.req.param());
  if (!parsed.success) {
    return c.json({ error: 'Paramètre invalide', details: parsed.error.flatten() }, 400);
  }
  const userId = parsed.data.userId;

  const userClient = createUserClient(token);
  const { data: meData, error: meErr } = await userClient.auth.getUser();
  const viewerId = meData.user?.id;
  if (meErr || !viewerId) {
    return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);
  }

  const admin = createServiceRoleClient();
  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .select('id, username, full_name, avatar_url, quizzes_completed, total_score')
    .eq('id', userId)
    .maybeSingle();
  if (profileErr) return c.json({ error: profileErr.message }, 500);
  if (!profile) return c.json({ error: 'Utilisateur introuvable.' }, 404);

  const { count: followersCount, error: followersErr } = await admin
    .from('friendships')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', userId);
  if (followersErr) return c.json({ error: followersErr.message }, 500);

  const { count: followingCount, error: followingErr } = await admin
    .from('friendships')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', userId);
  if (followingErr) return c.json({ error: followingErr.message }, 500);

  const { count: playsCount, error: playsErr } = await admin
    .from('quiz_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_completed', true);
  if (playsErr) return c.json({ error: playsErr.message }, 500);

  const { data: sessions, error: sessionsErr } = await admin
    .from('quiz_sessions')
    .select('id, completed_at, score, quizzes(id, title, thumbnail_url, total_questions, play_count)')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(12);
  if (sessionsErr) return c.json({ error: sessionsErr.message }, 500);

  const quizzes = (sessions ?? [])
    .map((s) => {
      const q = Array.isArray(s.quizzes) ? s.quizzes[0] : s.quizzes;
      if (!q?.id) return null;
      return {
        id: q.id,
        title: q.title ?? 'Quiz',
        thumbnail_url: q.thumbnail_url,
        question_count: q.total_questions ?? 0,
        played_at: s.completed_at,
        play_count: q.play_count ?? 0,
      };
    })
    .filter(Boolean);

  let viewerRelationship: 'self' | 'none' | 'pending' | 'friends' = 'none';
  if (viewerId === userId) {
    viewerRelationship = 'self';
  } else {
    const [{ data: fromViewer }, { data: toViewer }] = await Promise.all([
      admin
        .from('friendships')
        .select('id')
        .eq('follower_id', viewerId)
        .eq('following_id', userId)
        .maybeSingle(),
      admin
        .from('friendships')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', viewerId)
        .maybeSingle(),
    ]);

    if (fromViewer?.id && toViewer?.id) {
      viewerRelationship = 'friends';
    } else {
      const { data: pendingRows } = await admin
        .from('notifications')
        .select('id, data, is_read')
        .eq('user_id', userId)
        .eq('type', 'friend_request')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(25);
      const pending = (pendingRows ?? []).some((n) => {
        if (!n.data || typeof n.data !== 'object') return false;
        const d = n.data as { requester_id?: unknown; status?: unknown };
        return d.requester_id === viewerId && d.status === 'pending';
      });
      viewerRelationship = pending ? 'pending' : 'none';
    }
  }

  let gender: 'female' | 'male' | 'unknown' = 'unknown';
  let coverUrl: string | null = null;
  try {
    const authUser = await admin.auth.admin.getUserById(userId);
    const metadata = authUser.data.user?.user_metadata as { gender?: unknown; cover_url?: unknown } | undefined;
    const rawGender = metadata?.gender;
    if (typeof metadata?.cover_url === 'string' && metadata.cover_url.trim()) {
      coverUrl = metadata.cover_url.trim();
    }
    if (typeof rawGender === 'string') {
      const g = rawGender.trim().toLowerCase();
      if (['female', 'f', 'femme', 'woman'].includes(g)) gender = 'female';
      else if (['male', 'm', 'homme', 'man'].includes(g)) gender = 'male';
    }
  } catch {
    // ignore; keep unknown
  }

  return c.json({
    identity: {
      id: profile.id,
      display_name: profile.full_name?.trim() || profile.username?.trim() || 'Joueur',
      handle: `@${profile.username ?? 'joueur'}`,
      avatar_url: profile.avatar_url,
      cover_url: coverUrl,
      gender,
      viewer_relationship: viewerRelationship,
    },
    stats: {
      quiz_count: profile.quizzes_completed ?? 0,
      plays: playsCount ?? 0,
      players: 0,
      collections: 0,
      followers: followersCount ?? 0,
      following: followingCount ?? 0,
      total_score: profile.total_score ?? 0,
    },
    quizzes,
  });
})
  .post('/me/avatar', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const parsed = avatarBodySchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) {
      return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);
    }

    let avatarUrl: string;
    try {
      avatarUrl = await uploadAvatarToCloudinary(parsed.data.image_base64, viewerId);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Upload d'avatar impossible." }, 502);
    }

    const admin = createServiceRoleClient();
    const { error: updErr } = await admin.from('profiles').update({ avatar_url: avatarUrl }).eq('id', viewerId);
    if (updErr) return c.json({ error: updErr.message }, 500);

    return c.json({ ok: true, avatar_url: avatarUrl });
  })
  .post('/me/cover', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const parsed = coverBodySchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) {
      return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);
    }

    let coverUrl: string;
    try {
      coverUrl = await uploadCoverToCloudinary(parsed.data.image_base64, viewerId);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Upload de couverture impossible." }, 502);
    }

    const { data: userRow, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRow.user) {
      return c.json({ error: userErr?.message ?? 'Utilisateur introuvable.' }, 401);
    }

    const admin = createServiceRoleClient();
    const previousMeta = (userRow.user.user_metadata ?? {}) as Record<string, unknown>;
    const { error: updateAuthErr } = await admin.auth.admin.updateUserById(viewerId, {
      user_metadata: {
        ...previousMeta,
        cover_url: coverUrl,
      },
    });
    if (updateAuthErr) return c.json({ error: updateAuthErr.message }, 500);

    return c.json({ ok: true, cover_url: coverUrl });
  });

