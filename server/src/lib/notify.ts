import type { createServiceRoleClient } from './supabaseClients.js';

type AdminClient = ReturnType<typeof createServiceRoleClient>;

export async function insertNotification(
  admin: AdminClient,
  userId: string,
  type: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
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

/** Diffuse une notification à tous les profils (paginé). */
export async function broadcastNotification(
  admin: AdminClient,
  type: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
  pageSize = 200,
): Promise<number> {
  let sent = 0;
  let from = 0;
  for (;;) {
    const { data: profiles, error } = await admin
      .from('profiles')
      .select('id')
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    if (!profiles?.length) break;

    const rows = profiles.map((p) => ({
      user_id: p.id,
      type,
      title,
      body,
      data,
      is_read: false,
    }));
    const { error: insertErr } = await admin.from('notifications').insert(rows);
    if (insertErr) throw new Error(insertErr.message);
    sent += rows.length;
    if (profiles.length < pageSize) break;
    from += pageSize;
  }
  return sent;
}
