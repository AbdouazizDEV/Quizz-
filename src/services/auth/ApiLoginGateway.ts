import { getQuizzApiClient, parseQuizzApiError } from '@sdk';

import type { ILoginGateway, LoginCredentials } from './ILoginGateway';

export class ApiLoginGateway implements ILoginGateway {
  async signIn(credentials: LoginCredentials) {
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
    const refreshToken = data.session?.refresh_token;
    if (!token || !refreshToken) {
      throw new Error('Session absente.');
    }
    return { accessToken: token, refreshToken, user: data.user };
  }
}

