-- Droits INSERT/DELETE pour inscriptions tournois et participations challenges (RLS reste actif).

GRANT SELECT, INSERT, DELETE ON public.competition_registrations TO authenticated;
GRANT SELECT, INSERT ON public.challenge_participations TO authenticated;
