import type { components } from '@sdk';

import { loginWithPasskey } from './passkeyAuthService';
import type { ILoginGateway } from './ILoginGateway';

type AuthUser = components['schemas']['AuthUser'];

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Connexion passkey (email ou username + biométrie). */
export class PasskeyLoginGateway implements ILoginGateway {
  async signIn(credentials: { identifier: string }) {
    const identifier = credentials.identifier.trim();
    if (!identifier) {
      throw new Error('Saisissez votre e-mail ou nom d’utilisateur.');
    }

    const params = looksLikeEmail(identifier)
      ? { email: identifier.toLowerCase() }
      : { username: identifier };

    const { user, session } = await loginWithPasskey(params);
    const token = session.access_token;
    const refreshToken = session.refresh_token;
    if (!token || !refreshToken) {
      throw new Error('Session absente.');
    }
    return { accessToken: token, refreshToken, user: user as AuthUser, session };
  }

  /** Passkey discoverable (comptes sur l’appareil). */
  async signInDiscoverable() {
    const { user, session } = await loginWithPasskey();
    const token = session.access_token;
    const refreshToken = session.refresh_token;
    if (!token || !refreshToken) {
      throw new Error('Session absente.');
    }
    return { accessToken: token, refreshToken, user: user as AuthUser, session };
  }
}
