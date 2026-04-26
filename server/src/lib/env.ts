import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  /** Optionnel en dev (register / login / logout / me / Google fonctionnent sans). Requis pour OTP + reset et en production. */
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined),
    z.string().min(1).optional(),
  ),
  OTP_PEPPER: z.string().min(16),
  RESET_TOKEN_SECRET: z.string().min(16),
  GOOGLE_OAUTH_REDIRECT_URL: z.string().url(),
  CORS_ORIGINS: z.string().optional(),
  INCLUDE_OTP_IN_RESPONSE: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(
      `Variables d'environnement invalides: ${JSON.stringify(msg)}\n` +
        `Vérifiez server/.env ou la racine .env.local (EXPO_PUBLIC_SUPABASE_* pour URL + clé anon). ` +
        `Pour forgot-password / verify-otp / reset-password : SUPABASE_SERVICE_ROLE_KEY (Dashboard → API).`,
    );
  }
  cached = parsed.data;
  return cached;
}

export function hasServiceRoleKey(): boolean {
  return Boolean(getEnv().SUPABASE_SERVICE_ROLE_KEY);
}
