-- Champs profil issus du parcours d’inscription (type, lieu, naissance).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_type_slug VARCHAR(50),
  ADD COLUMN IF NOT EXISTS workplace_slug VARCHAR(50),
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Trigger : remplit le profil à partir des métadonnées utilisateur à l’inscription.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    phone,
    account_type_slug,
    workplace_slug,
    birth_date
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'account_type'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'workplace'), ''),
    CASE
      WHEN NULLIF(TRIM(NEW.raw_user_meta_data->>'birth_date'), '') IS NULL THEN NULL
      ELSE (NULLIF(TRIM(NEW.raw_user_meta_data->>'birth_date'), ''))::date
    END
  );
  RETURN NEW;
END;
$$;
