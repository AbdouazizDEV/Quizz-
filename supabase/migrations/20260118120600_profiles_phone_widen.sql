-- Les numéros E.164 / saisis dans l’app peuvent dépasser 20 caractères → le trigger handle_new_user échouait avec « Database error saving new user ».
ALTER TABLE profiles
  ALTER COLUMN phone TYPE VARCHAR(40);
