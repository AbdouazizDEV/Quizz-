import { Hono } from 'hono';
import { z } from 'zod';
import * as XLSX from 'xlsx';

import { getEnv, hasServiceRoleKey } from '../lib/env.js';
import { uploadCoverToCloudinary } from '../lib/cloudinary.js';
import { createServiceRoleClient } from '../lib/supabaseClients.js';

type JsonRecord = Record<string, unknown>;

const uuidParam = z.object({ id: z.string().uuid() });
const quizIdParam = z.object({ quizId: z.string().uuid() });
const questionIdParam = z.object({ questionId: z.string().uuid() });
const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().max(120).optional(),
});

const levelCreateSchema = z.object({
  code: z.string().trim().min(1).max(20),
  label: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).nullable().optional(),
  max_questions_per_quiz: z.coerce.number().int().min(1).max(200).default(10),
  sort_order: z.coerce.number().int().min(1).default(1),
  is_active: z.boolean().default(true),
});
const levelUpdateSchema = levelCreateSchema.partial();

const categoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100),
  icon: z.string().trim().max(120).nullable().optional(),
  color: z.string().trim().max(20).nullable().optional(),
});
const categoryUpdateSchema = categoryCreateSchema.partial();

const subcategoryCreateSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600).nullable().optional(),
});
const subcategoryUpdateSchema = subcategoryCreateSchema.partial();

const quizCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1200).nullable().optional(),
  category_id: z.string().uuid(),
  subcategory_id: z.string().uuid(),
  difficulty_level: z.string().trim().max(20).nullable().optional(),
  theme: z.string().trim().max(100).nullable().optional(),
  thumbnail_url: z.string().trim().url().max(2000).nullable().optional(),
  points_per_question: z.coerce.number().int().min(0).max(100).default(1),
  completion_bonus: z.coerce.number().int().min(0).max(10000).default(10),
  is_published: z.boolean().default(true),
});
const quizUpdateSchema = quizCreateSchema.partial();

const questionCreateSchema = z.object({
  quiz_id: z.string().uuid(),
  question_text: z.string().trim().min(1),
  options: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(5),
        label: z.string().trim().min(1).max(500),
      }),
    )
    .min(2)
    .max(8),
  correct_option_id: z.string().trim().min(1).max(5),
  explanation: z.string().trim().max(2000).nullable().optional(),
  order_index: z.coerce.number().int().min(1),
  subcategory: z.string().trim().max(200).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(30).nullable().optional(),
  difficulty_label: z.string().trim().max(80).nullable().optional(),
});
const questionUpdateSchema = questionCreateSchema.partial();

const challengeCreateSchema = z.object({
  challenger_id: z.string().uuid(),
  challenged_id: z.string().uuid(),
  quiz_id: z.string().uuid(),
  status: z.enum(['pending', 'accepted', 'declined', 'completed']).default('pending'),
  challenger_score: z.coerce.number().int().min(0).nullable().optional(),
  challenged_score: z.coerce.number().int().min(0).nullable().optional(),
  winner_id: z.string().uuid().nullable().optional(),
  expires_at: z.string().datetime().optional(),
});
const challengeUpdateSchema = challengeCreateSchema.partial();

const competitionCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  quiz_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  status: z.enum(['draft', 'scheduled', 'live', 'completed', 'cancelled']).default('draft'),
  starts_at: z.string().datetime().nullable().optional(),
  ends_at: z.string().datetime().nullable().optional(),
  reward_text: z.string().trim().max(1000).nullable().optional(),
});
const competitionUpdateSchema = competitionCreateSchema.partial();

const profileSuspendSchema = z.object({
  is_suspended: z.boolean(),
  suspended_until: z.string().datetime().nullable().optional(),
  suspension_reason: z.string().trim().max(1000).nullable().optional(),
});

const notifSchema = z.object({
  type: z.string().trim().min(1).max(60).default('admin_notice'),
  title: z.string().trim().min(1).max(180),
  body: z.string().trim().min(1).max(2000),
  data: z.record(z.string(), z.unknown()).optional(),
});
const singleNotifSchema = notifSchema.extend({
  user_id: z.string().uuid(),
});
const imageUploadSchema = z.object({
  image_base64: z.string().min(40),
  owner_id: z.string().trim().min(1).max(120).default('backoffice'),
});

function normalizeDifficulty(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;
  return input.trim().toUpperCase();
}

function parsePagination(raw: Record<string, string | undefined>) {
  const parsed = pageQuery.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const { page, limit, search } = parsed.data;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, search, from, to };
}

function jsonError(message: string, status = 400, details?: unknown) {
  return { ok: false, error: message, details, status };
}

function readAuthToken(c: { req: { header: (name: string) => string | undefined } }): string {
  return (
    c.req.header('x-api-key')?.trim() ??
    c.req.header('X-API-Key')?.trim() ??
    c.req.header('authorization')?.replace(/^Bearer\s+/i, '').trim() ??
    ''
  );
}

async function ensureBackofficeAccess(
  c: { req: { header: (name: string) => string | undefined } },
): Promise<{ ok: true } | { ok: false; code: 401 | 503; payload: JsonRecord }> {
  if (!hasServiceRoleKey()) {
    return { ok: false, code: 503, payload: jsonError('SUPABASE_SERVICE_ROLE_KEY non configurée.', 503) };
  }
  const configured = getEnv().BACKOFFICE_API_KEY?.trim();
  if (!configured) {
    if (process.env.NODE_ENV !== 'production') {
      return { ok: true };
    }
    return { ok: false, code: 503, payload: jsonError('BACKOFFICE_API_KEY non configurée.', 503) };
  }
  const provided = readAuthToken(c);
  if (!provided || provided !== configured) {
    return { ok: false, code: 401, payload: jsonError('Accès backoffice refusé (api key invalide).', 401) };
  }
  return { ok: true };
}

type ImportQuestion = {
  question_text: string;
  options: { id: string; label: string }[];
  correct_option_id: string;
  explanation: string | null;
  subcategory: string | null;
  tags: string[] | null;
  difficulty_label: string | null;
};

function parseSpreadsheet(fileName: string, bytes: ArrayBuffer): ImportQuestion[] {
  const wb = XLSX.read(Buffer.from(bytes), { type: 'buffer' });
  const first = wb.Sheets[wb.SheetNames[0] ?? ''];
  if (!first) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(first, { defval: '' });
  const out: ImportQuestion[] = [];
  for (const row of rows) {
    const question = String(row.question ?? row.Question ?? '').trim();
    if (!question) continue;
    const options = [row.answer_1, row.answer_2, row.answer_3, row.answer_4].map((v, i) => ({
      id: ['A', 'B', 'C', 'D'][i] as string,
      label: String(v ?? '').trim(),
    }));
    if (options.some((o) => !o.label)) continue;
    const rawCorrect = String(row.correct_answer ?? row.correctAnswer ?? '').trim().toUpperCase();
    const correct =
      rawCorrect && /^[1-4]$/.test(rawCorrect)
        ? (['A', 'B', 'C', 'D'][Number(rawCorrect) - 1] as string)
        : rawCorrect;
    if (!['A', 'B', 'C', 'D'].includes(correct)) continue;
    const rawTags = String(row.tags ?? '').trim();
    out.push({
      question_text: question,
      options,
      correct_option_id: correct,
      explanation: String(row.explanation ?? row.fun_fact ?? '').trim() || null,
      subcategory: String(row.subcategory ?? '').trim() || null,
      tags: rawTags ? rawTags.split(/[,;]/).map((t) => t.trim()).filter(Boolean) : null,
      difficulty_label: String(row.difficulty ?? '').trim() || null,
    });
  }
  if (!out.length) {
    throw new Error(`Aucune ligne valide trouvée dans ${fileName}.`);
  }
  return out;
}

async function ensureSubcategoryBelongsToCategory(
  admin: ReturnType<typeof createServiceRoleClient>,
  categoryId: string,
  subcategoryId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data, error } = await admin
    .from('subcategories')
    .select('id, category_id')
    .eq('id', subcategoryId)
    .maybeSingle();
  if (error) return { ok: false, message: error.message };
  if (!data) return { ok: false, message: 'Sous-catégorie introuvable.' };
  if (data.category_id !== categoryId) {
    return { ok: false, message: 'La sous-catégorie ne correspond pas à la catégorie fournie.' };
  }
  return { ok: true };
}

async function getDifficultyMaxQuestions(
  admin: ReturnType<typeof createServiceRoleClient>,
  difficultyLevel: string | null,
): Promise<{ ok: true; max: number | null } | { ok: false; message: string }> {
  if (!difficultyLevel) return { ok: true, max: null };
  const code = normalizeDifficulty(difficultyLevel);
  if (!code) return { ok: true, max: null };
  const { data, error } = await admin
    .from('difficulty_levels')
    .select('max_questions_per_quiz')
    .eq('code', code)
    .maybeSingle();
  if (error) return { ok: false, message: error.message };
  if (!data) return { ok: false, message: `Niveau de difficulté inconnu: ${code}` };
  return { ok: true, max: data.max_questions_per_quiz };
}

async function getQuizQuestionCount(
  admin: ReturnType<typeof createServiceRoleClient>,
  quizId: string,
): Promise<{ ok: true; count: number } | { ok: false; message: string }> {
  const { count, error } = await admin
    .from('questions')
    .select('id', { head: true, count: 'exact' })
    .eq('quiz_id', quizId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, count: count ?? 0 };
}

export const backofficeRoutes = new Hono()
  .use('*', async (c, next) => {
    const auth = await ensureBackofficeAccess(c);
    if (!auth.ok) return c.json(auth.payload, auth.code);
    await next();
  })
  // Upload image (Cloudinary)
  .post('/media/upload-image', async (c) => {
    const parsed = imageUploadSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json(jsonError('Payload invalide', 400, parsed.error.flatten()), 400);
    try {
      const url = await uploadCoverToCloudinary(parsed.data.image_base64, parsed.data.owner_id);
      return c.json({ ok: true, secure_url: url }, 201);
    } catch (error) {
      return c.json(
        jsonError(error instanceof Error ? error.message : "Impossible d'uploader l'image.", 502),
        502,
      );
    }
  })
  // Difficulty levels CRUD
  .get('/levels', async (c) => {
    const admin = createServiceRoleClient();
    const { data, error } = await admin.from('difficulty_levels').select('*').order('sort_order');
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, items: data ?? [] });
  })
  .post('/levels', async (c) => {
    const parsed = levelCreateSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json(jsonError('Payload invalide', 400, parsed.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const payload = { ...parsed.data, code: parsed.data.code.toUpperCase() };
    const { data, error } = await admin.from('difficulty_levels').insert(payload).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data }, 201);
  })
  .put('/levels/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    const body = levelUpdateSchema.safeParse(await c.req.json());
    if (!param.success || !body.success) {
      return c.json(jsonError('Payload invalide', 400, { param: param.error?.flatten(), body: body.error?.flatten() }), 400);
    }
    const patch = { ...body.data };
    if (patch.code) patch.code = patch.code.toUpperCase();
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from('difficulty_levels')
      .update(patch)
      .eq('id', param.data.id)
      .select('*')
      .single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data });
  })
  .delete('/levels/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    if (!param.success) return c.json(jsonError('Paramètre invalide', 400, param.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { error } = await admin.from('difficulty_levels').delete().eq('id', param.data.id);
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true });
  })
  // Categories + subcategories CRUD
  .get('/categories', async (c) => {
    const admin = createServiceRoleClient();
    const { data, error } = await admin.from('categories').select('*').order('name');
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, items: data ?? [] });
  })
  .post('/categories', async (c) => {
    const parsed = categoryCreateSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json(jsonError('Payload invalide', 400, parsed.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const payload = { ...parsed.data, slug: parsed.data.slug.toLowerCase() };
    const { data, error } = await admin.from('categories').insert(payload).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data }, 201);
  })
  .put('/categories/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    const parsed = categoryUpdateSchema.safeParse(await c.req.json());
    if (!param.success || !parsed.success) {
      return c.json(jsonError('Payload invalide', 400, { param: param.error?.flatten(), body: parsed.error?.flatten() }), 400);
    }
    const patch = { ...parsed.data };
    if (patch.slug) patch.slug = patch.slug.toLowerCase();
    const admin = createServiceRoleClient();
    const { data, error } = await admin.from('categories').update(patch).eq('id', param.data.id).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data });
  })
  .delete('/categories/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    if (!param.success) return c.json(jsonError('Paramètre invalide', 400, param.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { error } = await admin.from('categories').delete().eq('id', param.data.id);
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true });
  })
  .get('/subcategories', async (c) => {
    const categoryId = c.req.query('category_id');
    const admin = createServiceRoleClient();
    let query = admin.from('subcategories').select('*').order('name');
    if (categoryId) query = query.eq('category_id', categoryId);
    const { data, error } = await query;
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, items: data ?? [] });
  })
  .post('/subcategories', async (c) => {
    const parsed = subcategoryCreateSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json(jsonError('Payload invalide', 400, parsed.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const payload = { ...parsed.data, slug: parsed.data.slug.toLowerCase() };
    const { data, error } = await admin.from('subcategories').insert(payload).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data }, 201);
  })
  .put('/subcategories/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    const parsed = subcategoryUpdateSchema.safeParse(await c.req.json());
    if (!param.success || !parsed.success) {
      return c.json(jsonError('Payload invalide', 400, { param: param.error?.flatten(), body: parsed.error?.flatten() }), 400);
    }
    const patch = { ...parsed.data };
    if (patch.slug) patch.slug = patch.slug.toLowerCase();
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from('subcategories')
      .update(patch)
      .eq('id', param.data.id)
      .select('*')
      .single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data });
  })
  .delete('/subcategories/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    if (!param.success) return c.json(jsonError('Paramètre invalide', 400, param.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { error } = await admin.from('subcategories').delete().eq('id', param.data.id);
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true });
  })
  // Quizzes CRUD
  .get('/quizzes', async (c) => {
    const paged = parsePagination(c.req.query());
    if ('error' in paged) return c.json(jsonError('Query invalide', 400, paged.error), 400);
    const { page, limit, from, to, search } = paged;
    const categoryId = c.req.query('category_id');
    const subcategoryId = c.req.query('subcategory_id');
    const difficulty = normalizeDifficulty(c.req.query('difficulty_level'));
    const admin = createServiceRoleClient();
    let query = admin
      .from('quizzes')
      .select('*, categories(id,name,slug), subcategories(id,name,slug)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (subcategoryId) query = query.eq('subcategory_id', subcategoryId);
    if (difficulty) query = query.eq('difficulty_level', difficulty);
    if (search) query = query.ilike('title', `%${search}%`);
    const { data, error, count } = await query;
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({
      ok: true,
      items: data ?? [],
      page,
      limit,
      total: count ?? 0,
      has_more: page * limit < (count ?? 0),
    });
  })
  .post('/quizzes', async (c) => {
    const parsed = quizCreateSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json(jsonError('Payload invalide', 400, parsed.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const payload = {
      ...parsed.data,
      difficulty_level: normalizeDifficulty(parsed.data.difficulty_level),
      total_questions: 0,
    };
    const subOk = await ensureSubcategoryBelongsToCategory(
      admin,
      payload.category_id,
      payload.subcategory_id,
    );
    if (!subOk.ok) return c.json(jsonError(subOk.message, 400), 400);
    const lvl = await getDifficultyMaxQuestions(admin, payload.difficulty_level);
    if (!lvl.ok) return c.json(jsonError(lvl.message, 400), 400);
    const { data, error } = await admin.from('quizzes').insert(payload).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data }, 201);
  })
  .put('/quizzes/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    const parsed = quizUpdateSchema.safeParse(await c.req.json());
    if (!param.success || !parsed.success) {
      return c.json(jsonError('Payload invalide', 400, { param: param.error?.flatten(), body: parsed.error?.flatten() }), 400);
    }
    const patch = { ...parsed.data };
    if ('difficulty_level' in patch) patch.difficulty_level = normalizeDifficulty(patch.difficulty_level);
    const admin = createServiceRoleClient();
    const { data: currentQuiz, error: currentErr } = await admin
      .from('quizzes')
      .select('id, category_id, subcategory_id, difficulty_level')
      .eq('id', param.data.id)
      .maybeSingle();
    if (currentErr) return c.json(jsonError(currentErr.message, 500), 500);
    if (!currentQuiz) return c.json(jsonError('Quiz introuvable.', 404), 404);
    const effectiveCategory = (patch.category_id ?? currentQuiz.category_id) as string | null;
    const effectiveSubcategory = (patch.subcategory_id ?? currentQuiz.subcategory_id) as string | null;
    if (!effectiveCategory || !effectiveSubcategory) {
      return c.json(jsonError('category_id et subcategory_id sont obligatoires pour un quiz.', 400), 400);
    }
    const subOk = await ensureSubcategoryBelongsToCategory(admin, effectiveCategory, effectiveSubcategory);
    if (!subOk.ok) return c.json(jsonError(subOk.message, 400), 400);
    const effectiveDifficulty = (patch.difficulty_level ?? currentQuiz.difficulty_level) as string | null;
    const lvl = await getDifficultyMaxQuestions(admin, effectiveDifficulty);
    if (!lvl.ok) return c.json(jsonError(lvl.message, 400), 400);
    const cnt = await getQuizQuestionCount(admin, param.data.id);
    if (!cnt.ok) return c.json(jsonError(cnt.message, 500), 500);
    if (typeof lvl.max === 'number' && cnt.count > lvl.max) {
      return c.json(
        jsonError(
          `Ce quiz contient ${cnt.count} questions, supérieur au maximum ${lvl.max} pour ${effectiveDifficulty}.`,
          400,
        ),
        400,
      );
    }
    const { data, error } = await admin.from('quizzes').update(patch).eq('id', param.data.id).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data });
  })
  .delete('/quizzes/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    if (!param.success) return c.json(jsonError('Paramètre invalide', 400, param.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { error } = await admin.from('quizzes').delete().eq('id', param.data.id);
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true });
  })
  .post('/quizzes/import', async (c) => {
    const body = await c.req.parseBody();
    const filePart = body.file;
    if (!(filePart instanceof File)) {
      return c.json(jsonError('Fichier requis (champ form-data: file).'), 400);
    }
    const title = String(body.title ?? '').trim();
    if (!title) return c.json(jsonError('title requis.'), 400);
    const categoryId = String(body.category_id ?? '').trim();
    const subcategoryId = String(body.subcategory_id ?? '').trim();
    if (!categoryId || !subcategoryId) {
      return c.json(jsonError('category_id et subcategory_id requis.'), 400);
    }
    const difficultyLevel = normalizeDifficulty(String(body.difficulty_level ?? '').trim() || null);
    const theme = String(body.theme ?? '').trim() || null;
    const questions = parseSpreadsheet(filePart.name, await filePart.arrayBuffer());
    const admin = createServiceRoleClient();
    const subOk = await ensureSubcategoryBelongsToCategory(admin, categoryId, subcategoryId);
    if (!subOk.ok) return c.json(jsonError(subOk.message, 400), 400);
    const lvl = await getDifficultyMaxQuestions(admin, difficultyLevel);
    if (!lvl.ok) return c.json(jsonError(lvl.message, 400), 400);
    const max = lvl.max;
    const chunks: ImportQuestion[][] = [];
    if (typeof max === 'number' && max > 0) {
      for (let i = 0; i < questions.length; i += max) chunks.push(questions.slice(i, i + max));
    } else {
      chunks.push(questions);
    }
    const createdQuizIds: string[] = [];
    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i]!;
      const partTitle = chunks.length > 1 ? `${title} — partie ${i + 1}/${chunks.length}` : title;
      const { data: quiz, error: qErr } = await admin
        .from('quizzes')
        .insert({
          title: partTitle,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          difficulty_level: difficultyLevel,
          theme,
          total_questions: chunk.length,
          points_per_question: 1,
          completion_bonus: 10,
          is_published: true,
        })
        .select('*')
        .single();
      if (qErr || !quiz) return c.json(jsonError(qErr?.message ?? 'Création quiz impossible.', 500), 500);
      createdQuizIds.push(quiz.id);
      const payload = chunk.map((q, idx) => ({
        quiz_id: quiz.id,
        question_text: q.question_text,
        options: q.options,
        correct_option_id: q.correct_option_id,
        explanation: q.explanation,
        order_index: idx + 1,
        subcategory: q.subcategory,
        tags: q.tags,
        difficulty_label: q.difficulty_label,
      }));
      const { error: insErr } = await admin.from('questions').insert(payload);
      if (insErr) return c.json(jsonError(insErr.message, 500), 500);
    }
    return c.json({ ok: true, quiz_ids: createdQuizIds, imported_questions: questions.length }, 201);
  })
  .post('/quizzes/:quizId/import', async (c) => {
    const param = quizIdParam.safeParse(c.req.param());
    if (!param.success) return c.json(jsonError('Paramètre invalide', 400, param.error.flatten()), 400);
    const body = await c.req.parseBody();
    const filePart = body.file;
    if (!(filePart instanceof File)) {
      return c.json(jsonError('Fichier requis (champ form-data: file).'), 400);
    }
    const admin = createServiceRoleClient();
    const { data: quiz, error: quizErr } = await admin
      .from('quizzes')
      .select('id, difficulty_level')
      .eq('id', param.data.quizId)
      .maybeSingle();
    if (quizErr) return c.json(jsonError(quizErr.message, 500), 500);
    if (!quiz) return c.json(jsonError('Quiz introuvable.', 404), 404);
    const questions = parseSpreadsheet(filePart.name, await filePart.arrayBuffer());
    const lvl = await getDifficultyMaxQuestions(admin, quiz.difficulty_level);
    if (!lvl.ok) return c.json(jsonError(lvl.message, 400), 400);
    const cnt = await getQuizQuestionCount(admin, quiz.id);
    if (!cnt.ok) return c.json(jsonError(cnt.message, 500), 500);
    if (typeof lvl.max === 'number' && cnt.count + questions.length > lvl.max) {
      return c.json(
        jsonError(
          `Import refusé: ${cnt.count} questions existantes + ${questions.length} importées > max ${lvl.max}.`,
          400,
        ),
        400,
      );
    }
    const payload = questions.map((q, idx) => ({
      quiz_id: quiz.id,
      question_text: q.question_text,
      options: q.options,
      correct_option_id: q.correct_option_id,
      explanation: q.explanation,
      order_index: cnt.count + idx + 1,
      subcategory: q.subcategory,
      tags: q.tags,
      difficulty_label: q.difficulty_label,
    }));
    const { error: insErr } = await admin.from('questions').insert(payload);
    if (insErr) return c.json(jsonError(insErr.message, 500), 500);
    return c.json({ ok: true, quiz_id: quiz.id, imported_questions: questions.length }, 201);
  })
  // Questions CRUD
  .get('/quizzes/:quizId/questions', async (c) => {
    const param = quizIdParam.safeParse(c.req.param());
    if (!param.success) return c.json(jsonError('Paramètre invalide', 400, param.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from('questions')
      .select('*')
      .eq('quiz_id', param.data.quizId)
      .order('order_index', { ascending: true });
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, items: data ?? [] });
  })
  .post('/questions', async (c) => {
    const parsed = questionCreateSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json(jsonError('Payload invalide', 400, parsed.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { data: quiz, error: qErr } = await admin
      .from('quizzes')
      .select('id, difficulty_level')
      .eq('id', parsed.data.quiz_id)
      .maybeSingle();
    if (qErr) return c.json(jsonError(qErr.message, 500), 500);
    if (!quiz) return c.json(jsonError('Quiz introuvable.', 404), 404);
    const lvl = await getDifficultyMaxQuestions(admin, quiz.difficulty_level);
    if (!lvl.ok) return c.json(jsonError(lvl.message, 400), 400);
    const cnt = await getQuizQuestionCount(admin, quiz.id);
    if (!cnt.ok) return c.json(jsonError(cnt.message, 500), 500);
    if (typeof lvl.max === 'number' && cnt.count >= lvl.max) {
      return c.json(
        jsonError(
          `Ajout refusé: quiz déjà à ${cnt.count} questions (max ${lvl.max} pour ${quiz.difficulty_level}).`,
          400,
        ),
        400,
      );
    }
    const { data, error } = await admin.from('questions').insert(parsed.data).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data }, 201);
  })
  .put('/questions/:questionId', async (c) => {
    const param = questionIdParam.safeParse(c.req.param());
    const parsed = questionUpdateSchema.safeParse(await c.req.json());
    if (!param.success || !parsed.success) {
      return c.json(jsonError('Payload invalide', 400, { param: param.error?.flatten(), body: parsed.error?.flatten() }), 400);
    }
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from('questions')
      .update(parsed.data)
      .eq('id', param.data.questionId)
      .select('*')
      .single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data });
  })
  .delete('/questions/:questionId', async (c) => {
    const param = questionIdParam.safeParse(c.req.param());
    if (!param.success) return c.json(jsonError('Paramètre invalide', 400, param.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { error } = await admin.from('questions').delete().eq('id', param.data.questionId);
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true });
  })
  // Challenges CRUD
  .get('/challenges', async (c) => {
    const paged = parsePagination(c.req.query());
    if ('error' in paged) return c.json(jsonError('Query invalide', 400, paged.error), 400);
    const { page, limit, from, to } = paged;
    const admin = createServiceRoleClient();
    const { data, error, count } = await admin
      .from('challenges')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, items: data ?? [], page, limit, total: count ?? 0 });
  })
  .post('/challenges', async (c) => {
    const parsed = challengeCreateSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json(jsonError('Payload invalide', 400, parsed.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { data, error } = await admin.from('challenges').insert(parsed.data).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data }, 201);
  })
  .put('/challenges/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    const parsed = challengeUpdateSchema.safeParse(await c.req.json());
    if (!param.success || !parsed.success) {
      return c.json(jsonError('Payload invalide', 400, { param: param.error?.flatten(), body: parsed.error?.flatten() }), 400);
    }
    const admin = createServiceRoleClient();
    const { data, error } = await admin.from('challenges').update(parsed.data).eq('id', param.data.id).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data });
  })
  .delete('/challenges/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    if (!param.success) return c.json(jsonError('Paramètre invalide', 400, param.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { error } = await admin.from('challenges').delete().eq('id', param.data.id);
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true });
  })
  // Competitions CRUD
  .get('/competitions', async (c) => {
    const paged = parsePagination(c.req.query());
    if ('error' in paged) return c.json(jsonError('Query invalide', 400, paged.error), 400);
    const { page, limit, from, to } = paged;
    const admin = createServiceRoleClient();
    const { data, error, count } = await admin
      .from('competitions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, items: data ?? [], page, limit, total: count ?? 0 });
  })
  .post('/competitions', async (c) => {
    const parsed = competitionCreateSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json(jsonError('Payload invalide', 400, parsed.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { data, error } = await admin.from('competitions').insert(parsed.data).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data }, 201);
  })
  .put('/competitions/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    const parsed = competitionUpdateSchema.safeParse(await c.req.json());
    if (!param.success || !parsed.success) {
      return c.json(jsonError('Payload invalide', 400, { param: param.error?.flatten(), body: parsed.error?.flatten() }), 400);
    }
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from('competitions')
      .update(parsed.data)
      .eq('id', param.data.id)
      .select('*')
      .single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data });
  })
  .delete('/competitions/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    if (!param.success) return c.json(jsonError('Paramètre invalide', 400, param.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { error } = await admin.from('competitions').delete().eq('id', param.data.id);
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true });
  })
  // Profiles admin (list, detail, suspend)
  .get('/profiles', async (c) => {
    const paged = parsePagination(c.req.query());
    if ('error' in paged) return c.json(jsonError('Query invalide', 400, paged.error), 400);
    const { page, limit, from, to, search } = paged;
    const suspended = c.req.query('is_suspended');
    const admin = createServiceRoleClient();
    let query = admin
      .from('profiles')
      .select(
        'id,username,full_name,avatar_url,phone,bio,level_code,total_score,quizzes_completed,days_active,streak_days,is_premium,is_suspended,suspended_at,suspended_until,suspension_reason,created_at,updated_at',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, to);
    if (search) query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
    if (suspended === 'true') query = query.eq('is_suspended', true);
    if (suspended === 'false') query = query.eq('is_suspended', false);
    const { data, error, count } = await query;
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, items: data ?? [], page, limit, total: count ?? 0 });
  })
  .get('/profiles/:id', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    if (!param.success) return c.json(jsonError('Paramètre invalide', 400, param.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { data: profile, error } = await admin
      .from('profiles')
      .select('*')
      .eq('id', param.data.id)
      .maybeSingle();
    if (error) return c.json(jsonError(error.message, 500), 500);
    if (!profile) return c.json(jsonError('Profil introuvable', 404), 404);
    const authRes = await admin.auth.admin.getUserById(param.data.id);
    const authUser = authRes.data.user;
    return c.json({
      ok: true,
      profile,
      auth: authUser
        ? {
            email: authUser.email ?? null,
            phone: authUser.phone ?? null,
            email_confirmed_at: authUser.email_confirmed_at ?? null,
            last_sign_in_at: authUser.last_sign_in_at ?? null,
            created_at: authUser.created_at ?? null,
          }
        : null,
    });
  })
  .patch('/profiles/:id/suspend', async (c) => {
    const param = uuidParam.safeParse(c.req.param());
    const parsed = profileSuspendSchema.safeParse(await c.req.json());
    if (!param.success || !parsed.success) {
      return c.json(jsonError('Payload invalide', 400, { param: param.error?.flatten(), body: parsed.error?.flatten() }), 400);
    }
    const now = new Date().toISOString();
    const patch = parsed.data.is_suspended
      ? {
          is_suspended: true,
          suspended_at: now,
          suspended_until: parsed.data.suspended_until ?? null,
          suspension_reason: parsed.data.suspension_reason ?? null,
        }
      : {
          is_suspended: false,
          suspended_at: null,
          suspended_until: null,
          suspension_reason: null,
        };
    const admin = createServiceRoleClient();
    const { data, error } = await admin.from('profiles').update(patch).eq('id', param.data.id).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data });
  })
  // Notifications admin
  .post('/notifications/send', async (c) => {
    const parsed = singleNotifSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json(jsonError('Payload invalide', 400, parsed.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const payload = {
      user_id: parsed.data.user_id,
      type: parsed.data.type,
      title: parsed.data.title,
      body: parsed.data.body,
      data: parsed.data.data ?? {},
      is_read: false,
    };
    const { data, error } = await admin.from('notifications').insert(payload).select('*').single();
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, item: data }, 201);
  })
  .post('/notifications/broadcast', async (c) => {
    const parsed = notifSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json(jsonError('Payload invalide', 400, parsed.error.flatten()), 400);
    const admin = createServiceRoleClient();
    const { data: profiles, error: pErr } = await admin.from('profiles').select('id');
    if (pErr) return c.json(jsonError(pErr.message, 500), 500);
    const rows = (profiles ?? []).map((p) => ({
      user_id: p.id,
      type: parsed.data.type,
      title: parsed.data.title,
      body: parsed.data.body,
      data: parsed.data.data ?? {},
      is_read: false,
    }));
    if (!rows.length) return c.json({ ok: true, inserted: 0 });
    const { error } = await admin.from('notifications').insert(rows);
    if (error) return c.json(jsonError(error.message, 500), 500);
    return c.json({ ok: true, inserted: rows.length });
  });
