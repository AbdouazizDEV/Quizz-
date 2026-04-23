import { getQuizzApiClient, parseQuizzApiError } from '@sdk';

import type { IPasswordResetGateway } from './IPasswordResetGateway';

export class ApiPasswordResetGateway implements IPasswordResetGateway {
  private pendingEmail: string | null = null;
  private pendingResetToken: string | null = null;

  async requestOtp(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) throw new Error('Email requis.');

    const { error, response } = await getQuizzApiClient().POST('/auth/forgot-password', {
      body: { channel: 'email', email: normalized },
    });

    if (error) {
      throw new Error(
        parseQuizzApiError(error) ??
          (response.status === 503
            ? 'Le serveur n’est pas configuré pour le reset (service role manquante).'
            : 'Impossible d’envoyer le code OTP.'),
      );
    }

    this.pendingEmail = normalized;
    this.pendingResetToken = null;
  }

  async verifyOtp(email: string, code: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) throw new Error('Email requis.');
    if (!/^\d{4}$/.test(code)) throw new Error('Le code OTP doit contenir 4 chiffres.');
    if (!this.pendingEmail || this.pendingEmail !== normalized) {
      throw new Error('Session OTP invalide. Recommencez la demande de code.');
    }

    const { data, error } = await getQuizzApiClient().POST('/auth/verify-otp', {
      body: { channel: 'email', email: normalized, code },
    });
    if (error || !data?.reset_token) {
      throw new Error(parseQuizzApiError(error) ?? 'Code OTP invalide ou expiré.');
    }

    this.pendingResetToken = data.reset_token;
  }

  async completePendingReset(newPassword: string): Promise<void> {
    if (!this.pendingEmail || !this.pendingResetToken) {
      throw new Error('Réinitialisation non autorisée.');
    }
    if (newPassword.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
    }

    const { error } = await getQuizzApiClient().POST('/auth/reset-password', {
      body: { reset_token: this.pendingResetToken, new_password: newPassword },
    });
    if (error) {
      throw new Error(parseQuizzApiError(error) ?? 'Impossible de réinitialiser le mot de passe.');
    }

    this.pendingEmail = null;
    this.pendingResetToken = null;
  }
}

