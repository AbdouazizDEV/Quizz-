import type { AuthMeResponse } from '@sdk';

import { getCachedAuthMe, loadAuthMe } from '@services/auth/authMeRepository';

export type { AuthMeResponse };

/** @deprecated Préférer `loadAuthMe` ou `getCachedAuthMe` pour le cache local. */
export async function fetchAuthMe(options?: { force?: boolean }): Promise<AuthMeResponse | null> {
  if (options?.force) {
    return loadAuthMe({ force: true });
  }
  const cached = await getCachedAuthMe();
  if (cached) return cached;
  return loadAuthMe({ force: false });
}
