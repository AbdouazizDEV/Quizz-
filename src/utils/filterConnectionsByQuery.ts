import type { ConnectionUser } from '@app-types/network.types';

/** Filtre les connexions par pseudo (@handle) ou par nom affiché. */
export function filterConnectionsByQuery(
  users: ConnectionUser[],
  query: string,
): ConnectionUser[] {
  const q = query.trim().toLowerCase().replace(/^@/, '');
  if (!q) return users;
  return users.filter((u) => {
    const handle = u.handle.toLowerCase().replace(/^@/, '');
    return handle.includes(q) || u.displayName.toLowerCase().includes(q);
  });
}
