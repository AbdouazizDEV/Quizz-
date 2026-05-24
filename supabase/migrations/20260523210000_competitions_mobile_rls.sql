-- Lecture mobile des tournois (competitions) : grants + RLS.
-- Sans cette migration, l'app ne peut pas lister les tournois créés via le backoffice.

GRANT SELECT ON public.competitions TO anon, authenticated;

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS competitions_select_mobile ON public.competitions;
CREATE POLICY competitions_select_mobile
  ON public.competitions
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('scheduled', 'live', 'completed'));

-- Ne pas exposer les challenges brouillon à l'app mobile.
DROP POLICY IF EXISTS weekly_challenges_select ON public.weekly_challenges;
CREATE POLICY weekly_challenges_select
  ON public.weekly_challenges
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('actif', 'termine'));

GRANT SELECT ON public.weekly_challenges TO anon, authenticated;
GRANT SELECT ON public.weekly_challenge_quizzes TO anon, authenticated;
GRANT SELECT ON public.competition_registrations TO anon, authenticated;
