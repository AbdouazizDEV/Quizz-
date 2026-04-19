import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { buildAuthEmailBridgeHtml } from './authEmailBridgeHtml.js';
import { getEnv, hasServiceRoleKey } from './lib/env.js';
import { loadEnvFiles } from './loadEnv.js';
import { authRoutes } from './routes/auth.js';

loadEnvFiles();

const app = new Hono();

/** Pont : clic sur le lien e-mail Supabase (localhost:3000#access_token=…) → deep link app. */
app.get('/', (c) => {
  const target = process.env.AUTH_DEEP_LINK_TARGET?.trim() || 'quizzplus://auth/callback';
  return c.html(buildAuthEmailBridgeHtml(target));
});

app.use('/api/v1/*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const status = c.res.status;
  console.log(`[API] ${c.req.method} ${c.req.path} -> ${status} (${ms}ms)`);
});

app.get('/health', (c) => c.json({ ok: true }));

const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);

app.use(
  '/api/v1/*',
  cors({
    origin: (origin) => {
      if (!corsOrigins?.length) return origin ?? '*';
      if (origin && corsOrigins.includes(origin)) return origin;
      return corsOrigins[0] ?? '';
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    credentials: Boolean(corsOrigins?.length),
  }),
);

app.route('/api/v1/auth', authRoutes);

const env = getEnv();
if (process.env.NODE_ENV === 'production' && !hasServiceRoleKey()) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY est obligatoire en production.');
}
if (!hasServiceRoleKey()) {
  console.warn(
    '[API] SUPABASE_SERVICE_ROLE_KEY absente : forgot-password / verify-otp / reset → 503 ; register → pas de session JWT (confirmer l’e-mail ou ajouter la clé).',
  );
}

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API Quizz+ listening on http://localhost:${info?.port ?? env.PORT}/api/v1`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[API] Port ${env.PORT} déjà utilisé : une autre instance tourne déjà (Ctrl+C dans l’autre terminal), ou définissez PORT=3001 dans .env.local.`,
    );
  } else {
    console.error('[API] Erreur serveur:', err.message);
  }
  process.exit(1);
});
