import { AUTH_MESSAGES } from '@constants/auth.messages';

export const RESET_PASSWORD_MIN_LENGTH = 8;

export type ResetPasswordValidationCode =
  | 'TOO_SHORT'
  | 'PASSWORDS_DONT_MATCH';

export interface ResetPasswordFieldErrors {
  newPasswordError: string | null;
  confirmPasswordError: string | null;
}

export interface ResetPasswordValidationResult {
  isValid: boolean;
  fieldErrors: ResetPasswordFieldErrors;
  code?: ResetPasswordValidationCode;
}

export function validateResetPasswordFields(
  newPassword: string,
  confirmPassword: string,
): ResetPasswordValidationResult {
  const fieldErrors: ResetPasswordFieldErrors = {
    newPasswordError: null,
    confirmPasswordError: null,
  };

  let isValid = true;

  if (newPassword.length < RESET_PASSWORD_MIN_LENGTH) {
    fieldErrors.newPasswordError = AUTH_MESSAGES.password.tooShort;
    isValid = false;
  }

  if (newPassword !== confirmPassword) {
    fieldErrors.confirmPasswordError = AUTH_MESSAGES.password.dontMatch;
    isValid = false;
  }

  let code: ResetPasswordValidationCode | undefined;
  if (!isValid) {
    if (fieldErrors.newPasswordError) code = 'TOO_SHORT';
    else if (fieldErrors.confirmPasswordError) code = 'PASSWORDS_DONT_MATCH';
  }

  return { isValid, fieldErrors, code };
}

/** Détecte le message serveur de réutilisation du mot de passe. */
export function isPasswordReuseApiMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('différent') ||
    normalized.includes('different') ||
    normalized.includes('réutiliser') ||
    normalized.includes('reutiliser') ||
    normalized.includes('password_reuse')
  );
}
