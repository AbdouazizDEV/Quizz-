export interface LoginCredentials {
  /** E-mail ou nom d’utilisateur. */
  identifier: string;
}

import type { components } from '@sdk';
import type { AuthSessionPayload } from '@app-types/authSession.types';

type AuthUser = components['schemas']['AuthUser'];

/** Point d’extension pour brancher l’API passkey sans coupler l’écran. */
export interface ILoginGateway {
  signIn(credentials: LoginCredentials): Promise<{
    accessToken: string;
    refreshToken: string;
    user?: AuthUser;
    session?: AuthSessionPayload;
  }>;
}
