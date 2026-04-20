import { getQuizzApiClient, parseQuizzApiError } from '@sdk';

import type { ILoginGateway, LoginCredentials } from './ILoginGateway';

export class ApiLoginGateway implements ILoginGateway {
  async signIn(credentials: LoginCredentials): Promise<{ accessToken: string }> {
    const { data, error, response } = await getQuizzApiClient().POST('/auth/login', {
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    });

    if (error || !data) {
      const message =
        parseQuizzApiError(error) ??
        (response?.status === 401
          ? 'Email ou mot de passe incorrect.'
          : 'Impossible de se connecter pour le moment.');
      throw new Error(message);
    }

    const token = data.session?.access_token;
    if (!token) {
      throw new Error('Session absente.');
    }
    return { accessToken: token };
  }
}

