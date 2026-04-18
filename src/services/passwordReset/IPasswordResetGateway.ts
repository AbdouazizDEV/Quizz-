/** Contrat côté app pour le reset mot de passe (remplacer par API HTTP). */
export interface IPasswordResetGateway {
  requestOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<void>;
  completePendingReset(newPassword: string): Promise<void>;
}
