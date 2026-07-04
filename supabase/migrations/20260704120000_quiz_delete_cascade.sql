-- Permet la suppression d'un quiz même s'il a des sessions ou des duels liés.
-- questions, user_quiz_scores, weekly_challenge_* ont déjà ON DELETE CASCADE.

ALTER TABLE public.quiz_sessions
  DROP CONSTRAINT IF EXISTS quiz_sessions_quiz_id_fkey;

ALTER TABLE public.quiz_sessions
  ADD CONSTRAINT quiz_sessions_quiz_id_fkey
  FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;

ALTER TABLE public.challenges
  DROP CONSTRAINT IF EXISTS challenges_quiz_id_fkey;

ALTER TABLE public.challenges
  ADD CONSTRAINT challenges_quiz_id_fkey
  FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;
