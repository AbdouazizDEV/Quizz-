import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Dossier `server/` (parent de `src/`). */
const serverRoot = path.join(__dirname, '..');
/** Racine du repo QuizzMobile. */
const repoRoot = path.join(serverRoot, '..');

/**
 * Charge les fichiers d’environnement dans l’ordre (les derniers écrasent les précédents).
 * `npm run api:dev` est lancé depuis la racine : `dotenv/config` seul ne lit pas `server/.env`.
 *
 * Important : `server/.env` est chargé en dernier. Une ligne `SUPABASE_URL=...` dans ce fichier
 * remplace donc `EXPO_PUBLIC_SUPABASE_URL` de la racine `.env.local`. Vérifie que l’URL
 * correspond bien au projet du dashboard (Project Settings → API).
 */
export function loadEnvFiles(): void {
  const files = [
    path.join(repoRoot, '.env'),
    path.join(repoRoot, '.env.local'),
    path.join(serverRoot, '.env'),
  ];
  for (const file of files) {
    if (existsSync(file)) {
      loadDotenv({ path: file, override: true });
    }
  }

  // Alias Expo → API (évite de dupliquer URL + clé anon)
  if (!process.env.SUPABASE_URL?.trim() && process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()) {
    process.env.SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL.trim();
  }
  const expoKey =
    process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!process.env.SUPABASE_ANON_KEY?.trim() && expoKey) {
    process.env.SUPABASE_ANON_KEY = expoKey;
  }

  const port = Number(process.env.PORT) || 3000;
  if (!process.env.GOOGLE_OAUTH_REDIRECT_URL?.trim()) {
    process.env.GOOGLE_OAUTH_REDIRECT_URL = `http://localhost:${port}/api/v1/auth/google/callback`;
  }

  // Dev local uniquement : évite l’erreur si les secrets OTP ne sont pas encore dans un fichier
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    if (!process.env.OTP_PEPPER?.trim()) {
      process.env.OTP_PEPPER = 'dev-otp-pepper-min-16-chars!!';
    }
    if (!process.env.RESET_TOKEN_SECRET?.trim()) {
      process.env.RESET_TOKEN_SECRET = 'dev-reset-secret-min-16-chars!!';
    }
  }
}
