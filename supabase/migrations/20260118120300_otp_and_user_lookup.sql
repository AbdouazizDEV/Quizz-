-- otp_codes : aucune lecture / écriture via l’API anon (uniquement service_role côté backend).
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Résolution user id par e-mail pour le flux mot de passe oublié (appelée avec la clé service_role uniquement).
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(search_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
STABLE
AS $$
  SELECT id
  FROM auth.users
  WHERE lower(email) = lower(trim(search_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_user_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO service_role;
