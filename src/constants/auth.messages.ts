export const GOOGLE_AUTH_ERROR_CODES = {
  accountNotRegistered: 'GOOGLE_ACCOUNT_NOT_REGISTERED',
} as const;

export const GOOGLE_AUTH_MESSAGES = {
  accountNotRegistered:
    "Aucun compte Quizz+ n'est associé à cet e-mail Google. Inscrivez-vous pour continuer.",
} as const;

export const AUTH_MESSAGES = {
  password: {
    tooShort: 'Le mot de passe doit contenir au moins 8 caractères.',
    dontMatch: 'Les mots de passe ne correspondent pas.',
    sameAsOld: 'Vous ne pouvez pas réutiliser votre ancien mot de passe.',
    changeSuccess: 'Votre mot de passe a été modifié avec succès.',
    changeError: 'Une erreur est survenue. Veuillez réessayer.',
    otpInvalid: 'Code invalide ou expiré.',
  },
} as const;
