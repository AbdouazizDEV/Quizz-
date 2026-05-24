const FIELD_LABELS: Record<string, string> = {
  email: 'E-mail',
  password: 'Mot de passe',
  phone: 'Téléphone',
  username: "Nom d'utilisateur",
  full_name: 'Nom complet',
  birth_date: 'Date de naissance',
  country_code: 'Pays',
  channel: 'Canal',
  otp: 'Code',
  new_password: 'Nouveau mot de passe',
};

const GENERIC_ERROR_TITLES: Record<string, string> = {
  'Payload invalide': 'Vérifiez les informations saisies.',
  'Query invalide': 'Requête invalide. Réessayez.',
  'Paramètre invalide': 'Paramètre invalide.',
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou mot de passe incorrect.',
  'Email not confirmed': 'Confirmez votre adresse e-mail avant de vous connecter.',
  'Invalid email or password': 'E-mail ou mot de passe incorrect.',
};

function translateZodMessage(message: string, field?: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('at least 1 character') || lower.includes('required')) {
    if (field === 'password') return 'Saisissez votre mot de passe.';
    if (field === 'email') return 'Saisissez votre adresse e-mail.';
    return 'Ce champ est obligatoire.';
  }
  if (lower.includes('at least 6 character')) return 'Minimum 6 caractères.';
  if (lower.includes('invalid email') || lower.includes('valid email')) {
    return 'Adresse e-mail invalide.';
  }
  if (lower.includes('too small') || lower.includes('too short')) return 'Valeur trop courte.';
  if (lower.includes('too big') || lower.includes('too long')) return 'Valeur trop longue.';

  return message;
}

/** Convertit un objet `details` Zod (flatten) en phrases lisibles. */
export function formatValidationDetails(details: unknown): string | undefined {
  if (!details) return undefined;

  if (typeof details === 'string') {
    const trimmed = details.trim();
    return trimmed || undefined;
  }

  if (typeof details !== 'object') return undefined;

  const d = details as {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };

  const lines: string[] = [];

  for (const err of d.formErrors ?? []) {
    lines.push(translateZodMessage(err));
  }

  for (const [field, errors] of Object.entries(d.fieldErrors ?? {})) {
    for (const err of errors) {
      const translated = translateZodMessage(err, field);
      const label = FIELD_LABELS[field];
      if (
        translated.startsWith('Saisissez') ||
        translated === 'Ce champ est obligatoire.' ||
        !label
      ) {
        lines.push(translated);
      } else {
        lines.push(`${label} : ${translated}`);
      }
    }
  }

  if (lines.length === 0) return undefined;
  return [...new Set(lines)].join('\n');
}

export function humanizeApiErrorTitle(error: string): string {
  const trimmed = error.trim();
  return GENERIC_ERROR_TITLES[trimmed] ?? AUTH_ERROR_MESSAGES[trimmed] ?? trimmed;
}

export function humanizeAuthError(message: string): string {
  const trimmed = message.trim();
  return AUTH_ERROR_MESSAGES[trimmed] ?? trimmed;
}
