import { Hono } from 'hono';
import { z } from 'zod';

import { hasServiceRoleKey } from '../lib/env.js';
import { createServiceRoleClient, createUserClient } from '../lib/supabaseClients.js';

const paramsSchema = z.object({
  quizId: z.string().uuid(),
});

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(7),
});

function bearerToken(c: { req: { header: (n: string) => string | undefined } }): string | null {
  const h = c.req.header('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice('Bearer '.length).trim() || null;
}

function displayNameFromProfile(p: {
  full_name?: string | null;
  username?: string | null;
}): string {
  const full = p.full_name?.trim();
  if (full) return full;
  const user = p.username?.trim();
  if (user) return user;
  return 'Joueur';
}

export const quizzesRoutes = new Hono().get('/:quizId/leaderboard', async (c) => {
  const parsedParams = paramsSchema.safeParse(c.req.param());
  if (!parsedParams.success) {
    return c.json({ error: 'Paramètre invalide', details: parsedParams.error.flatten() }, 400);
  }
  const parsedQuery = querySchema.safeParse(c.req.query());
  if (!parsedQuery.success) {
    return c.json({ error: 'Query invalide', details: parsedQuery.error.flatten() }, 400);
  }

  if (!hasServiceRoleKey()) {
    return c.json(
      {
        error: 'SUPABASE_SERVICE_ROLE_KEY non configurée.',
        hint: 'Requise pour le classement par quiz.',
      },
      503,
    );
  }

  const { quizId } = parsedParams.data;
  const { limit } = parsedQuery.data;
  const admin = createServiceRoleClient();

  const { data: quiz, error: quizErr } = await admin
    .from('quizzes')
    .select('id')
    .eq('id', quizId)
    .maybeSingle();
  if (quizErr) return c.json({ error: quizErr.message }, 500);
  if (!quiz) return c.json({ error: 'Quiz introuvable.' }, 404);

  const { data: scoreRows, error: scoresErr } = await admin
    .from('user_quiz_scores')
    .select('user_id, best_score')
    .eq('quiz_id', quizId)
    .order('best_score', { ascending: false })
    .limit(limit);
  if (scoresErr) return c.json({ error: scoresErr.message }, 500);

  const rows = scoreRows ?? [];
  if (rows.length === 0) {
    return c.json({ items: [] });
  }

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles, error: profilesErr } = await admin
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', userIds);
  if (profilesErr) return c.json({ error: profilesErr.message }, 500);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  let viewerId: string | null = null;
  const token = bearerToken(c);
  if (token) {
    const userClient = createUserClient(token);
    const { data: meUser, error: meErr } = await userClient.auth.getUser();
    if (!meErr && meUser.user?.id) viewerId = meUser.user.id;
  }

  const items = rows.map((row, index) => {
    const profile = profileById.get(row.user_id);
    return {
      user_id: row.user_id,
      display_name: profile ? displayNameFromProfile(profile) : 'Joueur',
      avatar_url: profile?.avatar_url ?? null,
      score: row.best_score,
      rank: index + 1,
      is_current_user: viewerId != null && row.user_id === viewerId,
    };
  });

  return c.json({ items });
});
