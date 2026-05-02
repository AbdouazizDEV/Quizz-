#!/usr/bin/env node
/**
 * Import de questions depuis des fichiers Excel (.xlsx) vers Supabase.
 *
 * Prérequis : npm install (xlsx est en devDependency)
 *
 * Variables (Dashboard Supabase → Settings → API) :
 *   SUPABASE_URL (ou EXPO_PUBLIC_SUPABASE_URL dans .env.local)
 *   SUPABASE_SERVICE_ROLE_KEY (secret — jamais dans le client Expo ; mettre dans server/.env ou .env.local)
 *
 * Commandes (à lancer depuis la RACINE du repo QuizzMobile, pas depuis server/) :
 *   npm run quiz:import-excel
 *      → lit les .xlsx dans le dossier ./quiz-import
 *   npm run quiz:import-excel -- .
 *      → lit les .xlsx à la racine du projet (où se trouve package.json)
 *   npm run quiz:import-excel -- ./quiz-import/04_science_tech_80_questions.xlsx
 *      → importe un seul fichier (chemin relatif ou absolu)
 *   npm run quiz:import-excel -- /chemin/absolu/vers/dossier
 *
 * Si le chemin contient des espaces, mettez des guillemets :
 *   npm run quiz:import-excel -- "/home/.../Contrat DIGIGROUP/Quizz+/QuizzMobile/quiz-import"
 *
 * Important pour npm : un seul `--` puis le chemin. Mauvais exemple :
 *   npm run quiz:import-excel -- ../npm run …   ← invalide
 *
 * Convention : un fichier par catégorie, nom = slug Supabase (ex. geographie.xlsx → slug geographie).
 * Feuille 1 : colonnes question, answer_1..answer_4, correct_answer (1-4 ou A-D),
 *             fun_fact, difficulty (Z0–Z3 / A1–A3 ou libellé), subcategory, tags.
 *
 * Un quiz est créé par couple (catégorie du fichier, difficulty).
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const REPO_ROOT = path.join(__dirname, '..');

/** Charge .env / .env.local / server/.env : les fichiers plus bas dans la liste écrasent les précédents. */
function loadEnvMerged() {
  const files = [
    path.join(REPO_ROOT, '.env'),
    path.join(REPO_ROOT, '.env.local'),
    path.join(REPO_ROOT, 'server', '.env'),
  ];
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    const txt = fs.readFileSync(filePath, 'utf8');
    for (const line of txt.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq <= 0) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      process.env[k] = v;
    }
  }

  if (!process.env.SUPABASE_URL?.trim() && process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()) {
    process.env.SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL.trim();
  }
}

loadEnvMerged();

let XLSX;
try {
  XLSX = require('xlsx');
} catch {
  console.error('Installez la dépendance : npm install xlsx --save-dev');
  process.exit(1);
}

function slugify(name) {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/**
 * Fichiers du type `01_culture_generale_100_questions.xlsx` :
 * on enlève le préfixe numérique et le suffixe `_N_questions`, puis on mappe vers les slugs réels du seed.
 */
function stemFromQuizFilename(baseWithoutExt) {
  let s = baseWithoutExt.replace(/^\d+_/, '');
  s = s.replace(/_\d+_questions?$/i, '');
  return s;
}

/** Nom intermédiaire (après slugify du stem) → slug dans la table `categories` (voir seed.sql). */
const STEM_TO_CATEGORY_SLUG = {
  'culture-generale': 'culture-generale',
  'histoire-societe': 'history',
  geographie: 'geography',
  'science-tech': 'sciences',
  /** Libellés Excel du type « Sciences & Technologie » → slug réel `sciences` */
  'sciences-technologie': 'sciences',
  'sciences-et-technologie': 'sciences',
  'science-et-technologie': 'sciences',
  'sciences-technologies': 'sciences',
  sport: 'sports',
  divertissement: 'entertainment',
  'business-vie-pratique': 'business',
};

function mapStemToDbSlug(rawSlug) {
  return STEM_TO_CATEGORY_SLUG[rawSlug] ?? rawSlug;
}

/** Utilise la colonne `category` / `Category` si présente, sinon le nom de fichier. */
function resolveCategorySlug(baseWithoutExt, rows) {
  for (const row of rows) {
    const c = row.category ?? row.Category ?? row.categorie ?? row.slug_cat ?? row.slug;
    const t = String(c ?? '').trim();
    if (!t) continue;
    const colSlug = slugify(t);
    return mapStemToDbSlug(colSlug);
  }
  const stem = stemFromQuizFilename(baseWithoutExt);
  const raw = slugify(stem);
  return mapStemToDbSlug(raw);
}

function mapDifficulty(cell) {
  const s = String(cell ?? '')
    .trim()
    .toUpperCase();
  if (/^(Z[0-3]|A[1-3])$/.test(s)) return s;
  const map = {
    FACILE: 'Z0',
    MOYEN: 'Z1',
    DIFFICILE: 'Z2',
    EXPERT: 'A1',
    DÉBUTANT: 'Z0',
    DEBUTANT: 'Z0',
  };
  return map[s] ?? 'Z0';
}

function normalizeCorrect(raw) {
  const x = String(raw ?? '').trim().toUpperCase();
  if (/^[ABCD]$/.test(x)) return x;
  if (/^[1-4]$/.test(x)) return ['A', 'B', 'C', 'D'][Number(x) - 1];
  return 'A';
}

async function main() {
  let dirArg = process.argv[2];
  if (!dirArg) {
    dirArg = path.join(REPO_ROOT, 'quiz-import');
    console.log('Aucun dossier passé : utilisation par défaut de', dirArg);
  }
  const resolvedInput = path.resolve(process.cwd(), dirArg);

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error('');
    console.error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant après lecture de :');
    console.error('  ', path.join(REPO_ROOT, '.env'));
    console.error('  ', path.join(REPO_ROOT, '.env.local'));
    console.error('  ', path.join(REPO_ROOT, 'server', '.env'));
    console.error('');
    console.error('Ajoutez au minimum dans server/.env ou .env.local :');
    console.error('  SUPABASE_URL=https://xxxx.supabase.co');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJ... (clé service_role du dashboard)');
    console.error('');
    console.error('Si l’URL est déjà dans EXPO_PUBLIC_SUPABASE_URL, SUPABASE_URL sera déduite automatiquement.');
    console.error('La clé SERVICE ROLE ne doit jamais être préfixée EXPO_PUBLIC_.');
    console.error('');
    process.exit(1);
  }

  if (!fs.existsSync(resolvedInput)) {
    console.error('Chemin introuvable :', resolvedInput);
    console.error('Si le chemin contient des espaces, entourez-le de guillemets.');
    process.exit(1);
  }

  const stat = fs.statSync(resolvedInput);
  /** Dossier à utiliser avec path.join + nom de fichier */
  let workDir;
  /** Noms de fichiers .xlsx à traiter */
  let files;

  if (stat.isFile()) {
    if (!resolvedInput.toLowerCase().endsWith('.xlsx')) {
      console.error('Indiquez un dossier ou un fichier .xlsx :', resolvedInput);
      process.exit(1);
    }
    workDir = path.dirname(resolvedInput);
    files = [path.basename(resolvedInput)];
    console.log('Import d’un seul fichier :', resolvedInput);
  } else if (stat.isDirectory()) {
    workDir = resolvedInput;
    files = fs.readdirSync(workDir).filter((f) => f.endsWith('.xlsx') && !f.startsWith('~'));
  } else {
    console.error('Chemin invalide (ni dossier ni fichier) :', resolvedInput);
    process.exit(1);
  }

  if (!files.length) {
    console.error('Aucun fichier .xlsx dans', workDir);
    process.exit(1);
  }

  const admin = createClient(url, key);

  for (const file of files) {
    const abs = path.join(workDir, file);
    const workbook = XLSX.readFile(abs);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const baseName = path.basename(file, '.xlsx');
    const categorySlug = resolveCategorySlug(baseName, rows);
    const { data: cat, error: catErr } = await admin
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (catErr || !cat) {
      console.warn(
        `[skip] Catégorie introuvable pour "${file}" — slug résolu : "${categorySlug}". Vérifiez categories.slug dans Supabase ou la colonne category dans l’Excel.`,
      );
      continue;
    }
    console.log(`→ ${file} — catégorie "${categorySlug}"`);

    const byQuiz = new Map();
    for (const row of rows) {
      const qtext =
        row.question ??
        row.Question ??
        row['question '];
      if (!String(qtext ?? '').trim()) continue;

      const diff = mapDifficulty(row.difficulty ?? row.Difficulty ?? row.difficulté);
      const keyQuiz = `${cat.id}::${diff}`;
      if (!byQuiz.has(keyQuiz)) {
        byQuiz.set(keyQuiz, { difficulty: diff, questions: [] });
      }

      const answers = [
        row.answer_1 ?? row.Answer_1,
        row.answer_2 ?? row.Answer_2,
        row.answer_3 ?? row.Answer_3,
        row.answer_4 ?? row.Answer_4,
      ].map((cell, i) => ({
        id: ['A', 'B', 'C', 'D'][i],
        label: String(cell ?? '').trim(),
      }));

      const correct = normalizeCorrect(row.correct_answer ?? row.correctAnswer ?? row['correct answer']);
      const fun = String(row.fun_fact ?? row.funFact ?? '').trim();

      const sub = String(row.subcategory ?? row.Subcategory ?? '').trim();
      const tagsRaw = row.tags ?? row.Tags ?? '';
      const tags = String(tagsRaw)
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean);

      byQuiz.get(keyQuiz).questions.push({
        question_text: String(qtext).trim(),
        options: answers,
        correct_option_id: correct,
        explanation: fun || null,
        subcategory: sub || null,
        tags: tags.length ? tags : null,
        difficulty_label: String(row.difficulty ?? row.Difficulty ?? '').trim() || null,
      });
    }

    for (const bundle of byQuiz.values()) {
      if (!bundle.questions.length) continue;

      const title = `${categorySlug.replace(/-/g, ' ')} — ${bundle.difficulty}`;
      const { data: quizRow, error: quizErr } = await admin
        .from('quizzes')
        .insert({
          title,
          category_id: cat.id,
          difficulty_level: bundle.difficulty,
          total_questions: bundle.questions.length,
          points_per_question: 1,
          completion_bonus: 10,
          is_published: true,
        })
        .select('id')
        .single();

      if (quizErr || !quizRow) {
        console.error('[quiz]', quizErr?.message ?? quizErr);
        continue;
      }

      let order = 1;
      for (const q of bundle.questions) {
        const { error: insQ } = await admin.from('questions').insert({
          quiz_id: quizRow.id,
          question_text: q.question_text,
          options: q.options,
          correct_option_id: q.correct_option_id,
          explanation: q.explanation,
          order_index: order++,
          subcategory: q.subcategory,
          tags: q.tags,
          difficulty_label: q.difficulty_label,
        });
        if (insQ) {
          console.error('[question]', insQ.message);
          break;
        }
      }
      console.log(`OK  ${title}  (${bundle.questions.length} questions)`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
