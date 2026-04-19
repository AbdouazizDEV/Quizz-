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

  async saveAuthenticatedSession(token: string): Promise<void> {
    await this.tokens.writeToken(token);
    await this.accountFlags.writeHasRegisteredAccount(true);
  }

  async signOut(): Promise<void> {
    await this.tokens.clearToken();
    await this.accountFlags.writeHasRegisteredAccount(false);
  }
}
