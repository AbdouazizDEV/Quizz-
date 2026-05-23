-- Statut « expired » pour les duels dont le délai d'acceptation est dépassé
ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_status_check;

ALTER TABLE public.challenges
  ADD CONSTRAINT challenges_status_check
  CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'expired'));

ALTER TABLE public.challenges
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '30 minutes');
