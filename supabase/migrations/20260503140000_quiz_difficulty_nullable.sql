-- Difficulté quiz : NULL = parcours accessible aux visiteurs (non connectés).
-- Valeurs Z0–A3 = difficulté officielle (compte requis côté app).

ALTER TABLE quizzes ALTER COLUMN difficulty_level DROP DEFAULT;

ALTER TABLE quizzes ALTER COLUMN difficulty_level DROP NOT NULL;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    WHERE c.conrelid = 'public.quizzes'::regclass
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%difficulty_level%'
  LOOP
    EXECUTE format('ALTER TABLE public.quizzes DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.quizzes
  ADD CONSTRAINT quizzes_difficulty_level_check
  CHECK (
    difficulty_level IS NULL
    OR difficulty_level IN ('Z0', 'Z1', 'Z2', 'Z3', 'A1', 'A2', 'A3')
  );

COMMENT ON COLUMN public.quizzes.difficulty_level IS
  'NULL = pas de palier produit (visiteurs OK). Z0=Facile, Z1=Moyen, Z2+ = Difficile (règles taille quiz côté import).';
