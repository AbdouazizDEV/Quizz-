import { Hono } from 'hono';
import { z } from 'zod';

import { createServiceRoleClient, createUserClient } from '../lib/supabaseClients.js';
import { hasServiceRoleKey } from '../lib/env.js';
import {
  duelExpiresAtIso,
  isDuelPastExpiry,
  shouldAutoExpireStatus,
} from '../lib/duelHelpers.js';

const DUEL_QUESTIONS_COUNT = 15;

const createDuelSchema = z.object({
  challenged_id: z.string().uuid(),
});

const duelIdParamSchema = z.object({
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
    hint: 'Requise pour les duels entre amis.',
  }) as const;

function adminNotifyUserIds(): string[] {
  const raw = process.env.DUEL_ADMIN_USER_IDS?.trim();
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

async function profileDisplayName(
  admin: ReturnType<typeof createServiceRoleClient>,
  userId: string,
): Promise<string> {
  const { data } = await admin
    .from('profiles')
    .select('full_name, username')
    .eq('id', userId)
    .maybeSingle();
  return data?.full_name?.trim() || data?.username?.trim() || 'Un joueur';
}

async function notifyUser(
  admin: ReturnType<typeof createServiceRoleClient>,
  userId: string,
  type: string,
  title: string,
  body: string,
  data: Record<string, unknown>,
): Promise<void> {
  const { error } = await admin.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body,
    data,
    is_read: false,
  });
  if (error) throw new Error(error.message);
}

async function notifyAdmins(
  admin: ReturnType<typeof createServiceRoleClient>,
  title: string,
  body: string,
  data: Record<string, unknown>,
): Promise<void> {
  const ids = adminNotifyUserIds();
  if (ids.length === 0) return;
  const rows = ids.map((user_id) => ({
    user_id,
    type: 'duel_admin',
    title,
    body,
    data,
    is_read: false,
  }));
  const { error } = await admin.from('notifications').insert(rows);
  if (error) throw new Error(error.message);
}

type DuelPhase =
  | 'needs_your_acceptance'
  | 'waiting_opponent_acceptance'
  | 'your_turn'
  | 'waiting_opponent_play'
  | 'expired'
  | 'finished';

interface PlayerProfile {
  name: string;
  avatar_url: string | null;
  total_score: number;
}

function mapDuelRow(
  row: {
    id: string;
    challenger_id: string;
    challenged_id: string;
    challenger_score: number | null;
    challenged_score: number | null;
    status: string;
    winner_id: string | null;
    expires_at: string;
    quiz_id: string;
  },
  profiles: Map<string, PlayerProfile>,
  viewerId: string,
) {
  const challenger = profiles.get(row.challenger_id);
  const challenged = profiles.get(row.challenged_id);
  const expired =
    row.status === 'expired' ||
    (shouldAutoExpireStatus(row.status) && isDuelPastExpiry(row.expires_at));

  return {
    id: row.id,
    challenger_id: row.challenger_id,
    challenged_id: row.challenged_id,
    challenger_name: challenger?.name ?? 'Joueur',
    challenged_name: challenged?.name ?? 'Joueur',
    challenger_avatar_url: challenger?.avatar_url ?? null,
    challenged_avatar_url: challenged?.avatar_url ?? null,
    challenger_total_score: challenger?.total_score ?? 0,
    challenged_total_score: challenged?.total_score ?? 0,
    challenger_score: row.challenger_score,
    challenged_score: row.challenged_score,
    status: expired && row.status !== 'expired' ? 'expired' : row.status,
    winner_id: row.winner_id,
    expires_at: row.expires_at,
    quiz_id: row.quiz_id,
    questions_count: DUEL_QUESTIONS_COUNT,
    is_expired: expired,
    phase: computeDuelPhase(row, viewerId, expired),
  };
}

function bothScoresSet(row: {
  challenger_score: number | null;
  challenged_score: number | null;
}): boolean {
  return row.challenger_score !== null && row.challenged_score !== null;
}

function isDuelFinished(row: {
  status: string;
  expires_at: string;
  challenger_score: number | null;
  challenged_score: number | null;
}): boolean {
  if (row.status === 'expired') return true;
  if (shouldAutoExpireStatus(row.status) && isDuelPastExpiry(row.expires_at)) return true;
  if (row.status === 'completed' || row.status === 'declined') return true;
  return bothScoresSet(row);
}

function isDuelActive(row: {
  status: string;
  expires_at: string;
  challenger_score: number | null;
  challenged_score: number | null;
}): boolean {
  if (row.status === 'expired') return false;
  if (shouldAutoExpireStatus(row.status) && isDuelPastExpiry(row.expires_at)) return false;
  if (row.status !== 'pending' && row.status !== 'accepted') return false;
  return !bothScoresSet(row);
}

function computeDuelPhase(
  row: {
    challenger_id: string;
    challenged_id: string;
    challenger_score: number | null;
    challenged_score: number | null;
    status: string;
    expires_at: string;
  },
  viewerId: string,
  forceExpired = false,
): DuelPhase {
  const expired =
    forceExpired ||
    row.status === 'expired' ||
    (shouldAutoExpireStatus(row.status) && isDuelPastExpiry(row.expires_at));

  if (expired) return 'expired';

  if (row.status === 'declined' || row.status === 'completed' || bothScoresSet(row)) {
    return 'finished';
  }

  const isChallenger = row.challenger_id === viewerId;

  if (row.status === 'pending') {
    if (isChallenger) return 'waiting_opponent_acceptance';
    return 'needs_your_acceptance';
  }

  if (row.status === 'accepted') {
    const myScore = isChallenger ? row.challenger_score : row.challenged_score;
    const oppScore = isChallenger ? row.challenged_score : row.challenger_score;
    if (myScore === null) return 'your_turn';
    if (oppScore === null) return 'waiting_opponent_play';
  }

  return 'finished';
}

async function fetchUserDuels(
  admin: ReturnType<typeof createServiceRoleClient>,
  viewerId: string,
  limit = 40,
) {
  const { data: rows, error } = await admin
    .from('challenges')
    .select(
      'id, challenger_id, challenged_id, challenger_score, challenged_score, status, winner_id, expires_at, quiz_id, updated_at, created_at',
    )
    .or(`challenger_id.eq.${viewerId},challenged_id.eq.${viewerId}`)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return rows ?? [];
}

async function loadPlayerProfiles(
  admin: ReturnType<typeof createServiceRoleClient>,
  ids: string[],
): Promise<Map<string, PlayerProfile>> {
  if (ids.length === 0) return new Map();
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, username, avatar_url, total_score')
    .in('id', ids);
  const map = new Map<string, PlayerProfile>();
  for (const p of data ?? []) {
    map.set(p.id, {
      name: p.full_name?.trim() || p.username?.trim() || 'Joueur',
      avatar_url: p.avatar_url ?? null,
      total_score: p.total_score ?? 0,
    });
  }
  return map;
}

type DuelRow = {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenger_score: number | null;
  challenged_score: number | null;
  status: string;
  winner_id: string | null;
  expires_at: string;
  quiz_id: string;
  updated_at?: string;
  created_at?: string;
};

async function syncExpiredDuels(
  admin: ReturnType<typeof createServiceRoleClient>,
  rows: DuelRow[],
): Promise<DuelRow[]> {
  const ids = rows
    .filter((r) => shouldAutoExpireStatus(r.status) && isDuelPastExpiry(r.expires_at))
    .map((r) => r.id);

  if (ids.length > 0) {
    await admin.from('challenges').update({ status: 'expired' }).in('id', ids);
    for (const row of rows) {
      if (ids.includes(row.id)) row.status = 'expired';
    }
  }

  return rows;
}

export const defisRoutes = new Hono()
  .get('/duels/pending', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    try {
      const rows = await syncExpiredDuels(admin, await fetchUserDuels(admin, viewerId));
      const activeRows = rows.filter(isDuelActive);
      const ids = [...new Set(activeRows.flatMap((r) => [r.challenger_id, r.challenged_id]))];
      const profiles = await loadPlayerProfiles(admin, ids);
      return c.json({ items: activeRows.map((r) => mapDuelRow(r, profiles, viewerId)) });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur serveur';
      return c.json({ error: message }, 500);
    }
  })
  .get('/duels/recent', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    try {
      const rows = await syncExpiredDuels(admin, await fetchUserDuels(admin, viewerId));
      const finishedRows = rows.filter(isDuelFinished);
      const ids = [...new Set(finishedRows.flatMap((r) => [r.challenger_id, r.challenged_id]))];
      const profiles = await loadPlayerProfiles(admin, ids);
      return c.json({
        items: finishedRows.slice(0, 15).map((r) => mapDuelRow(r, profiles, viewerId)),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur serveur';
      return c.json({ error: message }, 500);
    }
  })
  .get('/duels/:id', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const parsed = duelIdParamSchema.safeParse(c.req.param());
    if (!parsed.success) return c.json({ error: 'Paramètre invalide' }, 400);

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { data: row, error } = await admin
      .from('challenges')
      .select(
        'id, challenger_id, challenged_id, challenger_score, challenged_score, status, winner_id, expires_at, quiz_id',
      )
      .eq('id', parsed.data.id)
      .maybeSingle();

    if (error) return c.json({ error: error.message }, 500);
    if (!row) return c.json({ error: 'Duel introuvable.' }, 404);
    if (row.challenger_id !== viewerId && row.challenged_id !== viewerId) {
      return c.json({ error: 'Accès refusé.' }, 403);
    }

    const synced = await syncExpiredDuels(admin, [row]);
    const duelRow = synced[0] ?? row;
    const profiles = await loadPlayerProfiles(admin, [duelRow.challenger_id, duelRow.challenged_id]);
    return c.json({ item: mapDuelRow(duelRow, profiles, viewerId) });
  })
  .post('/duels', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const parsed = createDuelSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
    }

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const challengerId = meData.user?.id;
    if (meErr || !challengerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const challengedId = parsed.data.challenged_id;
    if (challengedId === challengerId) {
      return c.json({ error: 'Vous ne pouvez pas vous défier vous-même.' }, 400);
    }

    const admin = createServiceRoleClient();

    const { data: friendship } = await admin
      .from('friendships')
      .select('id')
      .eq('follower_id', challengerId)
      .eq('following_id', challengedId)
      .maybeSingle();
    if (!friendship?.id) {
      return c.json({ error: 'Cet utilisateur n\'est pas dans vos amis.' }, 400);
    }

    const { data: existingPending } = await admin
      .from('challenges')
      .select('id')
      .eq('challenger_id', challengerId)
      .eq('challenged_id', challengedId)
      .eq('status', 'pending')
      .maybeSingle();
    if (existingPending?.id) {
      return c.json({ error: 'Un duel est déjà en attente avec cet ami.' }, 409);
    }

    const { data: quiz } = await admin
      .from('quizzes')
      .select('id, title, total_questions')
      .eq('is_published', true)
      .order('play_count', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!quiz?.id) return c.json({ error: 'Aucun quiz disponible pour le duel.' }, 503);

    const expiresAt = duelExpiresAtIso();
    const questionsCount = Math.min(DUEL_QUESTIONS_COUNT, quiz.total_questions ?? DUEL_QUESTIONS_COUNT);

    const { data: duel, error: duelErr } = await admin
      .from('challenges')
      .insert({
        challenger_id: challengerId,
        challenged_id: challengedId,
        quiz_id: quiz.id,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select(
        'id, challenger_id, challenged_id, challenger_score, challenged_score, status, winner_id, expires_at, quiz_id',
      )
      .single();

    if (duelErr || !duel) return c.json({ error: duelErr?.message ?? 'Création impossible.' }, 500);

    const challengerName = await profileDisplayName(admin, challengerId);

    const notifData = {
      duel_id: duel.id,
      challenger_id: challengerId,
      challenged_id: challengedId,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      questions_count: questionsCount,
      expires_at: expiresAt,
      status: 'pending',
    };

    try {
      await notifyUser(
        admin,
        challengedId,
        'duel_request',
        'Nouveau défi !',
        `${challengerName} vous défie sur « ${quiz.title} » (${questionsCount} questions). Vous avez 30 minutes pour accepter.`,
        notifData,
      );
    } catch (notifErr) {
      await admin.from('challenges').delete().eq('id', duel.id);
      const msg = notifErr instanceof Error ? notifErr.message : 'Notification impossible.';
      return c.json({ error: msg }, 500);
    }

    const names = await loadPlayerProfiles(admin, [challengerId, challengedId]);
    return c.json({ item: mapDuelRow(duel, names, challengerId) }, 201);
  })
  .post('/duels/:id/accept', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const parsed = duelIdParamSchema.safeParse(c.req.param());
    if (!parsed.success) return c.json({ error: 'Paramètre invalide' }, 400);

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { data: duel, error: fetchErr } = await admin
      .from('challenges')
      .select('id, challenger_id, challenged_id, quiz_id, status, expires_at')
      .eq('id', parsed.data.id)
      .maybeSingle();

    if (fetchErr) return c.json({ error: fetchErr.message }, 500);
    if (!duel) return c.json({ error: 'Duel introuvable.' }, 404);
    if (duel.challenged_id !== viewerId) return c.json({ error: 'Accès refusé.' }, 403);

    if (isDuelPastExpiry(duel.expires_at)) {
      await admin.from('challenges').update({ status: 'expired' }).eq('id', duel.id);
      return c.json({ error: 'Ce défi a expiré. Vous ne pouvez plus l\'accepter.' }, 410);
    }

    if (duel.status !== 'pending') {
      return c.json({ error: 'Ce défi n\'est plus en attente.' }, 409);
    }

    const { error: updErr } = await admin
      .from('challenges')
      .update({ status: 'accepted' })
      .eq('id', duel.id);
    if (updErr) return c.json({ error: updErr.message }, 500);

    const { data: quiz } = await admin.from('quizzes').select('title, total_questions').eq('id', duel.quiz_id).maybeSingle();
    const quizTitle = quiz?.title ?? 'Quiz';
    const questionsCount = Math.min(DUEL_QUESTIONS_COUNT, quiz?.total_questions ?? DUEL_QUESTIONS_COUNT);
    const challengedName = await profileDisplayName(admin, viewerId);
    const challengerName = await profileDisplayName(admin, duel.challenger_id);

    const notifData = {
      duel_id: duel.id,
      quiz_id: duel.quiz_id,
      quiz_title: quizTitle,
      questions_count: questionsCount,
      status: 'accepted',
    };

    await notifyUser(
      admin,
      duel.challenger_id,
      'duel_accepted',
      'Défi accepté !',
      `${challengedName} a accepté votre défi sur « ${quizTitle} ». Vous pouvez jouer vos questions.`,
      { ...notifData, challenged_id: viewerId, challenger_id: duel.challenger_id },
    );

    await notifyAdmins(
      admin,
      'Duel accepté',
      `${challengerName} vs ${challengedName} — « ${quizTitle} » (${questionsCount} questions).`,
      {
        ...notifData,
        challenger_id: duel.challenger_id,
        challenged_id: viewerId,
        challenger_name: challengerName,
        challenged_name: challengedName,
      },
    );

    return c.json({ ok: true, duel_id: duel.id, quiz_id: duel.quiz_id });
  })
  .post('/duels/:id/decline', async (c) => {
    const token = bearerToken(c);
    if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);
    if (!hasServiceRoleKey()) return c.json(serviceRole503(), 503);

    const parsed = duelIdParamSchema.safeParse(c.req.param());
    if (!parsed.success) return c.json({ error: 'Paramètre invalide' }, 400);

    const userClient = createUserClient(token);
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    const viewerId = meData.user?.id;
    if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

    const admin = createServiceRoleClient();
    const { data: duel, error: fetchErr } = await admin
      .from('challenges')
      .select('id, challenger_id, challenged_id, quiz_id, status, expires_at')
      .eq('id', parsed.data.id)
      .maybeSingle();

    if (fetchErr) return c.json({ error: fetchErr.message }, 500);
    if (!duel) return c.json({ error: 'Duel introuvable.' }, 404);
    if (duel.challenged_id !== viewerId) return c.json({ error: 'Accès refusé.' }, 403);

    if (isDuelPastExpiry(duel.expires_at)) {
      await admin.from('challenges').update({ status: 'expired' }).eq('id', duel.id);
      return c.json({ error: 'Ce défi a expiré.' }, 410);
    }

    if (duel.status !== 'pending') {
      return c.json({ error: 'Ce défi n\'est plus en attente.' }, 409);
    }

    const { error: updErr } = await admin
      .from('challenges')
      .update({ status: 'declined' })
      .eq('id', duel.id);
    if (updErr) return c.json({ error: updErr.message }, 500);

    const { data: quiz } = await admin.from('quizzes').select('title').eq('id', duel.quiz_id).maybeSingle();
    const quizTitle = quiz?.title ?? 'Quiz';
    const challengedName = await profileDisplayName(admin, viewerId);

    await notifyUser(
      admin,
      duel.challenger_id,
      'duel_declined',
      'Défi refusé',
      `${challengedName} a refusé votre défi sur « ${quizTitle} ».`,
      {
        duel_id: duel.id,
        quiz_id: duel.quiz_id,
        quiz_title: quizTitle,
        status: 'declined',
        challenged_id: viewerId,
        challenger_id: duel.challenger_id,
      },
    );

    return c.json({ ok: true });
  });
