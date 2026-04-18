import type { ILoginGateway, LoginCredentials } from './ILoginGateway';

/** Remplace par un client HTTP (axios) lorsque le backend est prêt. */
export class StubLoginGateway implements ILoginGateway {
  async signIn(_credentials: LoginCredentials): Promise<{ accessToken: string }> {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return { accessToken: `stub_${Date.now()}` };
  }
}
