import type { AuthSessionPayload } from '@app-types/authSession.types';

import {
  clearStoredRefreshToken,
  clearStoredSessionExpiresAt,
  clearStoredSessionHardExpiresAt,
  writeStoredRefreshToken,
  writeStoredSessionExpiresAt,
  writeStoredSessionHardExpiresAt,
} from './authTokenStorage';
import type { IAccountRegistrationPersistence, IAuthTokenPersistence } from './authPersistence';
import type { AuthBootstrapSnapshot, IAuthSessionService } from './IAuthSessionService';

export class DefaultAuthSessionService implements IAuthSessionService {
  constructor(
    private readonly tokens: IAuthTokenPersistence,
    private readonly accountFlags: IAccountRegistrationPersistence,
  ) {}

  async bootstrap(): Promise<AuthBootstrapSnapshot> {
    const [token, hasRegisteredAccount] = await Promise.all([
      this.tokens.readToken(),
      this.accountFlags.readHasRegisteredAccount(),
    ]);
    return { token, hasRegisteredAccount };
  }

  async saveAuthenticatedSession(
    token: string,
    refreshToken?: string | null,
    sessionMeta?: Pick<AuthSessionPayload, 'expires_at' | 'session_expires_at'> | null,
  ): Promise<void> {
    await this.tokens.writeToken(token);
    if (refreshToken?.trim()) {
      await writeStoredRefreshToken(refreshToken.trim());
    }
    if (typeof sessionMeta?.expires_at === 'number') {
      await writeStoredSessionExpiresAt(sessionMeta.expires_at);
    }
    if (typeof sessionMeta?.session_expires_at === 'number') {
      await writeStoredSessionHardExpiresAt(sessionMeta.session_expires_at);
    }
    await this.accountFlags.writeHasRegisteredAccount(true);
  }

  async signOut(): Promise<void> {
    await this.tokens.clearToken();
    await clearStoredRefreshToken();
    await clearStoredSessionExpiresAt();
    await clearStoredSessionHardExpiresAt();
  }
}
