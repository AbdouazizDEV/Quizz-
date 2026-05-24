-- ============================================================
-- A executer dans Supabase Dashboard > SQL Editor
-- PREREQUIS : la table competitions doit exister (migration backoffice).
-- Si weekly_challenges n'existe pas, utiliser setup_defis_production.sql
-- ============================================================

-- ETAPE 0 — Verification (doit retourner 4 lignes apres setup complet)
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

-- Si seulement "competitions" apparait :
--   Executer d'abord supabase/scripts/setup_defis_production.sql (script complet)

-- ETAPE 1 — RLS mobile uniquement (tables deja creees)
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

DROP POLICY IF EXISTS weekly_challenges_select ON public.weekly_challenges;
CREATE POLICY weekly_challenges_select
  ON public.weekly_challenges
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('actif', 'termine'));
