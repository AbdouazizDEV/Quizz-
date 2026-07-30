import { Hono } from 'hono';
import { z } from 'zod';

import { notifyTreasurerPayment } from '../lib/mailer.js';
import { createUserClient } from '../lib/supabaseClients.js';

function bearerToken(c: { req: { header: (n: string) => string | undefined } }): string | null {
  const h = c.req.header('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice('Bearer '.length).trim() || null;
}

const subscribeSchema = z.object({
  planId: z.string().min(1),
  methodId: z.string().min(1),
  amountLabel: z.string().optional(),
  kind: z.enum(['deposit', 'withdrawal']).default('deposit'),
});

/**
 * Paiements (stub produit) — notifie le trésorier par e-mail à chaque dépôt/retrait.
 * TREASURER_EMAIL doit être défini côté serveur.
 */
export const paymentsRoutes = new Hono().post('/subscribe', async (c) => {
  const token = bearerToken(c);
  if (!token) return c.json({ error: 'Authorization: Bearer <access_token> requis.' }, 401);

  const parsed = subscribeSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: 'Payload invalide', details: parsed.error.flatten() }, 400);
  }

  const userClient = createUserClient(token);
  const { data: meData, error: meErr } = await userClient.auth.getUser();
  const viewerId = meData.user?.id;
  if (meErr || !viewerId) return c.json({ error: meErr?.message ?? 'Jeton invalide.' }, 401);

  const amountLabel = parsed.data.amountLabel?.trim() || `Plan ${parsed.data.planId}`;
  const treasurer = await notifyTreasurerPayment({
    kind: parsed.data.kind,
    userId: viewerId,
    amountLabel,
    methodLabel: parsed.data.methodId,
    reference: `sub-${parsed.data.planId}-${Date.now()}`,
  });

  return c.json({
    ok: true,
    status: 'recorded',
    planId: parsed.data.planId,
    methodId: parsed.data.methodId,
    treasurer_notified: treasurer.sent,
    treasurer_reason: treasurer.reason ?? null,
  });
});
