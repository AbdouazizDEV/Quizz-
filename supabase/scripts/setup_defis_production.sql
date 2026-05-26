-- ============================================================
-- SUPABASE PRODUCTION — Setup complet Défis (tournois + challenges)
-- Copier-coller TEL QUEL dans SQL Editor, puis Run query.
-- Ordre : 1) creer les tables manquantes  2) RLS mobile
-- ============================================================

-- ---------- ETAPE 1 : Tables challenges hebdo + inscriptions tournois ----------

CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'hebdomadaire',/
  status VARCHAR(20) NOT NULL DEFAULT 'actif'
    CHECK (status IN ('draft', 'actif', 'termine')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reward_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weekly_challenge_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  scheduled_day DATE NOT NULL,
  day_order INTEGER NOT NULL DEFAULT 1,
  UNIQUE (challenge_id, quiz_id)
);

CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, challenge_id, quiz_id)
);

CREATE TABLE IF NOT EXISTS public.competition_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, competition_id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_challenges_active
  ON public.weekly_challenges(status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user
  ON public.challenge_participations(user_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_comp
  ON public.competition_registrations(competition_id);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenge_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS weekly_challenge_quizzes_select ON public.weekly_challenge_quizzes;
CREATE POLICY weekly_challenge_quizzes_select ON public.weekly_challenge_quizzes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS challenge_participations_select_own ON public.challenge_participations;
DROP POLICY IF EXISTS challenge_participations_select_leaderboard ON public.challenge_participations;
CREATE POLICY challenge_participations_select_leaderboard ON public.challenge_participations
  FOR SELECT TO authenticated
  USING (true);

-- FK profiles (si table créée avant cette mise à jour)
ALTER TABLE public.challenge_participations
  DROP CONSTRAINT IF EXISTS challenge_participations_user_id_fkey;
ALTER TABLE public.challenge_participations
  ADD CONSTRAINT challenge_participations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS challenge_participations_insert_own ON public.challenge_participations;
CREATE POLICY challenge_participations_insert_own ON public.challenge_participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS competition_registrations_select ON public.competition_registrations;
CREATE POLICY competition_registrations_select ON public.competition_registrations
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS competition_registrations_insert_own ON public.competition_registrations;
CREATE POLICY competition_registrations_insert_own ON public.competition_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS competition_registrations_delete_own ON public.competition_registrations;
CREATE POLICY competition_registrations_delete_own ON public.competition_registrations
  FOR DELETE USING (auth.uid() = user_id);

-- ---------- ETAPE 2 : RLS mobile (tournois + challenges visibles dans l'app) ----------

GRANT SELECT ON public.competitions TO anon, authenticated;

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS competitions_select_mobile ON public.competitions;
CREATE POLICY competitions_select_mobile
  ON public.competitions
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('scheduled', 'live', 'completed'));

GRANT SELECT ON public.weekly_challenges TO anon, authenticated;
GRANT SELECT ON public.weekly_challenge_quizzes TO anon, authenticated;
GRANT SELECT ON public.competition_registrations TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.competition_registrations TO authenticated;
GRANT SELECT, INSERT ON public.challenge_participations TO authenticated;

DROP POLICY IF EXISTS weekly_challenges_select ON public.weekly_challenges;
CREATE POLICY weekly_challenges_select
  ON public.weekly_challenges
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('actif', 'termine'));

-- ---------- Verification (doit retourner 4 lignes) ----------
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'competitions',
    'weekly_challenges',
    'weekly_challenge_quizzes',
    'competition_registrations'
  )
ORDER BY table_name;
