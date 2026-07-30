import type { createServiceRoleClient } from '../lib/supabaseClients.js';
import { buildQuizQuestionSet } from '../domain/quiz/buildQuizQuestionSet.js';
import { pointsForDifficulty } from '../domain/quiz/difficultyPoints.js';

type AdminClient = ReturnType<typeof createServiceRoleClient>;

interface PoolRow {
  id: string;
  difficulty?: string | null;
  difficulty_label?: string | null;
}

/**
 * Matérialise le pool de questions d’un tournoi (une seule fois).
 * Seed = competition.seed ?? competition.id → même set pour tous les joueurs.
 */
export async function materializeTournamentQuestions(
  admin: AdminClient,
  tournamentId: string,
): Promise<{ created: number; alreadyExists: boolean }> {
  const { count } = await admin
    .from('tournament_questions')
    .select('question_id', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId);
  if ((count ?? 0) > 0) return { created: 0, alreadyExists: true };

  const { data: competition, error: cErr } = await admin
    .from('competitions')
    .select('id, quiz_id, category_id, seed, difficulty_mix')
    .eq('id', tournamentId)
    .maybeSingle();
  if (cErr) throw new Error(cErr.message);
  if (!competition) throw new Error('Tournoi introuvable.');

  const seed = (competition.seed as string | null)?.trim() || competition.id;
  const quizLevel = (competition.difficulty_mix as string | null) ?? 'medium';

  let poolRows: PoolRow[] = [];

  if (competition.quiz_id) {
    const { data, error } = await admin
      .from('questions')
      .select('id, difficulty, difficulty_label')
      .eq('quiz_id', competition.quiz_id)
      .limit(500);
    if (error) throw new Error(error.message);
    poolRows = (data ?? []) as PoolRow[];
  } else if (competition.category_id) {
    const { data: quizzes, error: qErr } = await admin
      .from('quizzes')
      .select('id')
      .eq('category_id', competition.category_id)
      .eq('is_published', true)
      .limit(50);
    if (qErr) throw new Error(qErr.message);
    const quizIds = (quizzes ?? []).map((q) => q.id as string);
    if (!quizIds.length) throw new Error('Aucune question disponible pour ce tournoi.');

    const { data, error } = await admin
      .from('questions')
      .select('id, difficulty, difficulty_label')
      .in('quiz_id', quizIds)
      .limit(500);
    if (error) throw new Error(error.message);
    poolRows = (data ?? []) as PoolRow[];
  } else {
    throw new Error('Tournoi sans quiz_id ni category_id.');
  }

  if (!poolRows.length) throw new Error('Aucune question disponible pour ce tournoi.');

  const pool = poolRows.map((r) => ({
    id: r.id,
    difficulty: r.difficulty ?? r.difficulty_label ?? 'medium',
  }));

  const totalQuestions = Math.min(10, pool.length);
  const composed = buildQuizQuestionSet({
    pool,
    totalQuestions,
    quizLevel,
    seed,
  });

  const rows = composed.questions.map((q, index) => ({
    tournament_id: tournamentId,
    question_id: q.id,
    position: index + 1,
    points: pointsForDifficulty(q.difficulty),
  }));

  const { error: insertErr } = await admin.from('tournament_questions').insert(rows);
  if (insertErr) throw new Error(insertErr.message);

  if (!(competition.seed as string | null)?.trim()) {
    await admin.from('competitions').update({ seed }).eq('id', tournamentId);
  }

  return { created: rows.length, alreadyExists: false };
}
