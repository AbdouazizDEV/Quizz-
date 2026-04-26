import { type Context, Hono } from 'hono';
import { z } from 'zod';

import { createAnonAuthClient, createUserClient } from '../lib/supabaseClients.js';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function bearerToken(c: { req: { header: (n: string) => string | undefined } }): string | null {
  const h = c.req.header('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice('Bearer '.length).trim() || null;
}

async function globalLeaderboardHandler(c: Context) {
  const parsed = querySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: 'Query invalide', details: parsed.error.flatten() }, 400);
  }
  const { limit } = parsed.data;

  const anon = createAnonAuthClient();
  const { data: rows, error } = await anon
    .from('leaderboard')
    .select('id, username, full_name, avatar_url, total_score, rank')
    .order('rank', { ascending: true })
    .limit(limit);
  if (error) {
    return c.json({ error: error.message }, 500);
  }

  const items =
    rows?.map((r) => ({
      id: r.id,
      display_name: r.full_name?.trim() || r.username,
      avatar_url: r.avatar_url,
      score: r.total_score,
      rank: r.rank,
    })) ?? [];

  const token = bearerToken(c);
  let me: { user_id: string; rank: number | null } | null = null;
  if (token) {
    const userClient = createUserClient(token);
    const { data: meUser, error: meErr } = await userClient.auth.getUser();
    const userId = meUser.user?.id;
    if (!meErr && userId) {
      const { data: meRow } = await anon
        .from('leaderboard')
        .select('rank')
        .eq('id', userId)
        .maybeSingle();
      me = { user_id: userId, rank: meRow?.rank ?? null };
    }
  }

  return c.json({ items, me });
}

export const leaderboardRoutes = new Hono()
  .get('/global', globalLeaderboardHandler)
  .get('/players', globalLeaderboardHandler);

