-- Corrige « Database error creating new user » lors de l'inscription :
-- - username déjà pris
-- - téléphone déjà pris ou trop long
-- - échec du trigger handle_new_user

ALTER TABLE public.profiles
  ALTER COLUMN phone TYPE VARCHAR(40);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_phone TEXT;
  v_suffix TEXT;
BEGIN
  v_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    split_part(COALESCE(NEW.email, 'user'), '@', 1)
  );
  v_username := LEFT(v_username, 50);

  v_phone := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');
  IF v_phone IS NOT NULL THEN
    v_phone := LEFT(v_phone, 40);
    IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.phone = v_phone) THEN
      v_phone := NULL;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.username = v_username) THEN
    v_suffix := LEFT(REPLACE(NEW.id::text, '-', ''), 8);
    v_username := LEFT(v_username, GREATEST(1, 50 - LENGTH(v_suffix) - 1)) || '_' || v_suffix;
  END IF;

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
    v_username,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    v_phone,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'account_type'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'workplace'), ''),
    CASE
      WHEN NULLIF(TRIM(NEW.raw_user_meta_data->>'birth_date'), '') IS NULL THEN NULL
      ELSE (NULLIF(TRIM(NEW.raw_user_meta_data->>'birth_date'), ''))::date
    END
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    v_suffix := LEFT(REPLACE(NEW.id::text, '-', ''), 8);
    v_username := 'user_' || v_suffix;
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, v_username)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE;
END;
$$;
