import { AUTH_MESSAGES } from '@constants/auth.messages';
import { getQuizzApiClient, parseQuizzApiError } from '@sdk';

import type { IPasswordResetGateway } from './IPasswordResetGateway';
import { isPasswordReuseApiMessage, validateResetPasswordFields } from './resetPasswordValidation';

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
      const parsed = parseQuizzApiError(error);
      throw new Error(
        parsed ??
          (response.status === 503
            ? 'Le serveur n’est pas configuré pour l’envoi d’e-mail (SMTP ou clé service manquante). Vérifiez l’API ciblée (local vs production).'
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

  async completePendingReset(newPassword: string, confirmPassword?: string): Promise<void> {
    if (!this.pendingEmail || !this.pendingResetToken) {
      throw new Error('Réinitialisation non autorisée.');
    }

    const confirm = confirmPassword ?? newPassword;
    const validation = validateResetPasswordFields(newPassword, confirm);
    if (!validation.isValid) {
      const message =
        validation.fieldErrors.newPasswordError ??
        validation.fieldErrors.confirmPasswordError ??
        AUTH_MESSAGES.password.changeError;
      throw new Error(message);
    }

    const { error } = await getQuizzApiClient().POST('/auth/reset-password', {
      body: { reset_token: this.pendingResetToken, new_password: newPassword },
    });
    if (error) {
      const parsed = parseQuizzApiError(error);
      if (parsed && isPasswordReuseApiMessage(parsed)) {
        throw new Error(AUTH_MESSAGES.password.sameAsOld);
      }
      throw new Error(parsed ?? AUTH_MESSAGES.password.changeError);
    }

    this.pendingEmail = null;
    this.pendingResetToken = null;
  }
}

