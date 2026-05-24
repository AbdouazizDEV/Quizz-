import { clearStoredRefreshToken, writeStoredRefreshToken } from './authTokenStorage';
import type { IAccountRegistrationPersistence, IAuthTokenPersistence } from './authPersistence';
import type { AuthBootstrapSnapshot, IAuthSessionService } from './IAuthSessionService';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';

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

  async saveAuthenticatedSession(token: string, refreshToken?: string | null): Promise<void> {
    await this.tokens.writeToken(token);
    if (refreshToken?.trim()) {
      await writeStoredRefreshToken(refreshToken.trim());
    }
    await this.accountFlags.writeHasRegisteredAccount(true);
  }

  async signOut(): Promise<void> {
    await this.tokens.clearToken();
    await clearStoredRefreshToken();
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
  }
}
