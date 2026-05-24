import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';

import type { CompetitionSummary } from '@app-types/challenge.types';

interface CompetitionRow {
  id: string;
  title: string;
  description: string | null;
  status: CompetitionSummary['status'];
  starts_at: string | null;
  ends_at: string | null;
  reward_text: string | null;
  category_id: string | null;
}

const DEFAULT_MAX = 32;

function mapCompetition(row: CompetitionRow, registeredCount: number, isRegistered: boolean): CompetitionSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    categoryName: null,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    rewardText: row.reward_text,
    registeredCount,
    maxParticipants: DEFAULT_MAX,
    isRegistered,
  };
}

export async function fetchCompetitionsByTab(
  tab: 'inscriptions' | 'en_cours' | 'fin',
  userId: string,
): Promise<CompetitionSummary[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase non configuré');

  let statusFilter: CompetitionSummary['status'][] = [];
  if (tab === 'inscriptions') statusFilter = ['scheduled'];
  if (tab === 'en_cours') statusFilter = ['live'];
  if (tab === 'fin') statusFilter = ['completed'];

  const { data, error } = await supabase
    .from('competitions')
    .select('id, title, description, status, starts_at, ends_at, reward_text, category_id')
    .in('status', statusFilter)
    .order('starts_at', { ascending: tab !== 'fin' });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as CompetitionRow[];
  const ids = rows.map((r) => r.id);

  const { data: registrations } = ids.length
    ? await supabase.from('competition_registrations').select('competition_id, user_id').in('competition_id', ids)
    : { data: [] };

  const countByComp = new Map<string, number>();
  const userRegistered = new Set<string>();
  for (const reg of registrations ?? []) {
    countByComp.set(reg.competition_id, (countByComp.get(reg.competition_id) ?? 0) + 1);
    if (reg.user_id === userId) userRegistered.add(reg.competition_id);
  }

  return rows.map((row) =>
    mapCompetition(row, countByComp.get(row.id) ?? 0, userRegistered.has(row.id)),
  );
}

export async function registerForCompetition(userId: string, competitionId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase non configuré');

  const { data: competition } = await supabase
    .from('competitions')
    .select('status')
    .eq('id', competitionId)
    .single();

  if (!competition || competition.status !== 'scheduled') {
    throw new Error('Les inscriptions sont fermées pour ce tournoi.');
  }

  const { error } = await supabase.from('competition_registrations').insert({
    user_id: userId,
    competition_id: competitionId,
  });

  if (error) throw new Error(error.message);
}

export async function unregisterFromCompetition(userId: string, competitionId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase non configuré');

  const { error } = await supabase
    .from('competition_registrations')
    .delete()
    .eq('user_id', userId)
    .eq('competition_id', competitionId);

  if (error) throw new Error(error.message);
}

export async function fetchCompetitionById(
  competitionId: string,
  userId: string,
): Promise<CompetitionSummary | null> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase non configuré');

  const { data } = await supabase
    .from('competitions')
    .select('id, title, description, status, starts_at, ends_at, reward_text, category_id')
    .eq('id', competitionId)
    .maybeSingle();

  if (!data) return null;

  const { count } = await supabase
    .from('competition_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('competition_id', competitionId);

  const { data: mine } = await supabase
    .from('competition_registrations')
    .select('id')
    .eq('competition_id', competitionId)
    .eq('user_id', userId)
    .maybeSingle();

  return mapCompetition(data as CompetitionRow, count ?? 0, Boolean(mine));
}
