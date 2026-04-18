import type { IPasswordResetGateway } from './IPasswordResetGateway';

/**
 * Implémentation de démo : mémorise l’e-mail courant et accepte tout OTP à 4 chiffres.
 * Ne pas utiliser en production.
 */
export class StubPasswordResetGateway implements IPasswordResetGateway {
  private pendingEmail: string | null = null;

  private otpVerified = false;

  async requestOtp(email: string): Promise<void> {
    await this.delay(320);
    this.pendingEmail = email.trim().toLowerCase();
    this.otpVerified = false;
  }

  async verifyOtp(email: string, code: string): Promise<void> {
    await this.delay(280);
    const normalized = email.trim().toLowerCase();
    if (!this.pendingEmail || normalized !== this.pendingEmail) {
      throw new Error('Session OTP invalide');
    }
    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      throw new Error('Code OTP invalide');
    }
    this.otpVerified = true;
  }

  async completePendingReset(newPassword: string): Promise<void> {
    await this.delay(300);
    if (!this.otpVerified || !this.pendingEmail) {
      throw new Error('Réinitialisation non autorisée');
    }
    if (newPassword.length < 4) {
      throw new Error('Mot de passe trop court');
    }
    this.otpVerified = false;
    this.pendingEmail = null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
