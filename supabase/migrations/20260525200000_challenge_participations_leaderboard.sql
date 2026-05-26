-- Classement challenge : FK vers profiles (embed PostgREST) + lecture des scores par tous les joueurs connectés.

ALTER TABLE public.challenge_participations
  DROP CONSTRAINT IF EXISTS challenge_participations_user_id_fkey;

ALTER TABLE public.challenge_participations
  ADD CONSTRAINT challenge_participations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS challenge_participations_select_own ON public.challenge_participations;

DROP POLICY IF EXISTS challenge_participations_select_leaderboard ON public.challenge_participations;
CREATE POLICY challenge_participations_select_leaderboard ON public.challenge_participations
  FOR SELECT TO authenticated
  USING (true);