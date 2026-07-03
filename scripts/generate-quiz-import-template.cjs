#!/usr/bin/env node
/**
 * Génère le template Excel standardisé pour l'import de quiz.
 *
 * Usage (depuis la racine du repo) :
 *   node scripts/generate-quiz-import-template.cjs
 *
 * Fichier produit : quiz-import/TEMPLATE_import_quiz.xlsx
 */
'use strict';

const path = require('path');
const fs = require('fs');

let XLSX;
try {
  XLSX = require('xlsx');
} catch {
  console.error('Installez la dépendance : npm install xlsx --save-dev');
  process.exit(1);
}

const REPO_ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(REPO_ROOT, 'quiz-import', 'TEMPLATE_import_quiz.xlsx');

const QUESTION_HEADERS = [
  'question',
  'answer_1',
  'answer_2',
  'answer_3',
  'answer_4',
  'correct_answer',
  'fun_fact',
  'difficulty',
  'category',
  'subcategory',
  'tags',
];

const EXAMPLE_ROWS = [
  {
    question: 'Quelle est la capitale du Sénégal ?',
    answer_1: 'Dakar',
    answer_2: 'Bamako',
    answer_3: 'Abidjan',
    answer_4: 'Conakry',
    correct_answer: 'A',
    fun_fact: 'Dakar est un grand port d’Afrique de l’Ouest.',
    difficulty: 'facile',
    category: 'Culture générale',
    subcategory: 'Capitales',
    tags: 'Sénégal, Capitale, facile',
  },
  {
    question: 'En quelle année le Sénégal a-t-il accédé à l’indépendance ?',
    answer_1: '1958',
    answer_2: '1960',
    answer_3: '1962',
    answer_4: '1965',
    correct_answer: '2',
    fun_fact: 'L’indépendance a été proclamée le 4 avril 1960.',
    difficulty: 'moyen',
    category: 'Histoire',
    subcategory: 'Afrique de l’Ouest',
    tags: 'Sénégal; Histoire; indépendance',
  },
  {
    question: 'Quel océan borde la côte ouest-africaine du Sénégal ?',
    answer_1: 'Océan Atlantique',
    answer_2: 'Océan Indien',
    answer_3: 'Mer Méditerranée',
    answer_4: 'Mer Rouge',
    correct_answer: 'A',
    fun_fact: 'Dakar se situe sur la presqu’île du Cap-Vert, face à l’Atlantique.',
    difficulty: 'Z0',
    category: 'Géographie',
    subcategory: 'Océans',
    tags: 'géographie',
  },
];

const INSTRUCTIONS = [
  ['Quizz+ — Template d’import de questions'],
  [''],
  ['Feuille à remplir : « Questions » (une ligne = une question).'],
  ['Supprimez les 3 lignes d’exemple avant l’import réel, ou laissez-les si vous testez.'],
  [''],
  ['── Colonnes obligatoires ──'],
  ['question', 'Énoncé de la question (texte libre).'],
  ['answer_1 … answer_4', 'Les 4 propositions de réponse (toutes obligatoires).'],
  [
    'correct_answer',
    'Lettre A–D ou chiffre 1–4 indiquant la bonne réponse (1 = answer_1, 2 = answer_2, etc.).',
  ],
  [''],
  ['── Colonnes recommandées ──'],
  ['fun_fact', 'Anecdote affichée après la réponse (Fun Fact). Alias accepté côté API : explanation.'],
  [
    'difficulty',
    'Niveau : Z0/Z1/Z2/Z3 ou A1/A2/A3 — ou libellés facile, moyen, difficile, expert, débutant.',
  ],
  [
    'category',
    'Nom ou slug de catégorie (ex. « Culture générale » ou culture-generale). Si vide, déduit du nom de fichier.',
  ],
  ['subcategory', 'Sous-thème libre (ex. Capitales, Football).'],
  ['tags', 'Mots-clés séparés par des virgules ou des points-virgules.'],
  [''],
  ['── Découpage automatique par difficulté (script npm run quiz:import-excel) ──'],
  ['Z0 (facile)', 'max 10 questions par quiz généré'],
  ['Z1 (moyen)', 'max 15 questions par quiz généré'],
  ['Z2, Z3, A1–A3 (difficile / expert)', 'max 20 questions par quiz généré'],
  [''],
  ['── Catégories disponibles (slug Supabase) ──'],
  ['culture-generale', 'Culture générale'],
  ['sciences', 'Sciences'],
  ['education', 'Éducation'],
  ['games', 'Jeux'],
  ['business', 'Business'],
  ['entertainment', 'Divertissement'],
  ['politics', 'Politique'],
  ['sports', 'Sport'],
  ['technology', 'Technologie'],
  ['daily-life', 'Vie quotidienne'],
  ['geography', 'Géographie'],
  ['history', 'Histoire'],
  ['arts', 'Arts'],
  ['music', 'Musique'],
  [''],
  ['── Import ──'],
  ['Script local', 'npm run quiz:import-excel -- ./mon_fichier.xlsx'],
  ['API backoffice', 'POST /api/v1/backoffice/quizzes/import (multipart, fichier xlsx ou csv)'],
  [''],
  ['Nom de fichier conseillé', 'NN_slug_N_questions.xlsx — ex. 01_culture_generale_80_questions.xlsx'],
];

function buildWorkbook() {
  const wb = XLSX.utils.book_new();

  const instructionsSheet = XLSX.utils.aoa_to_sheet(INSTRUCTIONS);
  instructionsSheet['!cols'] = [{ wch: 28 }, { wch: 72 }];
  XLSX.utils.book_append_sheet(wb, instructionsSheet, 'Instructions');

  const questionsSheet = XLSX.utils.json_to_sheet(EXAMPLE_ROWS, { header: QUESTION_HEADERS });
  questionsSheet['!cols'] = [
    { wch: 52 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 14 },
    { wch: 42 },
    { wch: 12 },
    { wch: 20 },
    { wch: 18 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, questionsSheet, 'Questions');

  return wb;
}

function main() {
  const outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const wb = buildWorkbook();
  XLSX.writeFile(wb, OUTPUT);
  console.log('Template généré :', OUTPUT);
}

main();
