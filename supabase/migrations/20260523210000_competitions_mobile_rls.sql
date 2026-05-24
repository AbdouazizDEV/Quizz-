-- Lecture mobile : tournois (competitions) + challenges hebdomadaires.
-- Prerequis : migrations 20260508105000 (competitions) et 20260523160000 (weekly_challenges) deja appliquees.

-- === Tournois (competitions) ===
GRANT SELECT ON public.competitions TO anon, authenticated;

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS competitions_select_mobile ON public.competitions;
CREATE POLICY competitions_select_mobile
  ON public.competitions
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('scheduled', 'live', 'completed'));

-- === Challenges hebdomadaires (masquer les brouillons) ===
GRANT SELECT ON public.weekly_challenges TO anon, authenticated;
GRANT SELECT ON public.weekly_challenge_quizzes TO anon, authenticated;
GRANT SELECT ON public.competition_registrations TO anon, authenticated;

DROP POLICY IF EXISTS weekly_challenges_select ON public.weekly_challenges;
CREATE POLICY weekly_challenges_select
  ON public.weekly_challenges
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('actif', 'termine'));
