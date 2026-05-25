export interface LoginCredentials {
  email: string;
  password: string;
}

import type { components } from '@sdk';

type AuthUser = components['schemas']['AuthUser'];

/** Point d’extension pour brancher l’API réelle sans coupler l’écran. */
export interface ILoginGateway {
  signIn(credentials: LoginCredentials): Promise<{
    accessToken: string;
    refreshToken: string;
    user?: AuthUser;
  }>;
}
