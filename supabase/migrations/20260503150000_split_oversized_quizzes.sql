-- Découpe les quiz déjà en base qui dépassent les tailles produit :
--   Z0 (Facile)  → max 10 questions par quiz
--   Z1 (Moyen)   → max 15
--   Z2–Z3 / A*   → max 20
-- Les quiz avec difficulty_level NULL ne sont pas modifiés.
-- Idempotent : un quiz déjà au bon format (≤ max) est ignoré.
--
-- Un seul bloc DO pour l’éditeur SQL Supabase : utiliser « Run » (pas « Explain »).

DO $split$
DECLARE
  r RECORD;
  max_p int;
  n int;
  parts int;
  p int;
  new_id uuid;
  chunk_cnt int;
BEGIN
  DROP TABLE IF EXISTS _split_work;
  CREATE TEMP TABLE _split_work (
    question_id uuid PRIMARY KEY,
    rn int NOT NULL
  );

  FOR r IN
    SELECT
      q.id,
      q.title,
      q.description,
      q.category_id,
      q.difficulty_level,
      q.theme,
      q.thumbnail_url,
      q.points_per_question,
      q.completion_bonus,
      q.is_published
    FROM quizzes q
    WHERE q.difficulty_level IS NOT NULL
  LOOP
    TRUNCATE _split_work;

    max_p :=
      CASE r.difficulty_level
        WHEN 'Z0' THEN 10
        WHEN 'Z1' THEN 15
        ELSE 20
      END;

    SELECT COUNT(*)::int INTO n FROM questions WHERE quiz_id = r.id;

    IF n <= max_p THEN
      UPDATE quizzes SET total_questions = n WHERE id = r.id;
      CONTINUE;
    END IF;

    parts := (n + max_p - 1) / max_p;

    INSERT INTO _split_work (question_id, rn)
    SELECT qu.id, ROW_NUMBER() OVER (ORDER BY qu.order_index)
    FROM questions qu
    WHERE qu.quiz_id = r.id;

    IF parts > 1 THEN
      UPDATE quizzes
      SET title = r.title || ' — partie 1/' || parts::text
      WHERE id = r.id;
    END IF;

    UPDATE questions q
    SET order_index = w.rn
    FROM _split_work w
    WHERE q.id = w.question_id
      AND w.rn <= max_p;

    FOR p IN 2..parts LOOP
      new_id := gen_random_uuid();
      chunk_cnt := LEAST(max_p, n - (p - 1) * max_p);

      INSERT INTO quizzes (
        id,
        title,
        description,
        category_id,
        difficulty_level,
        theme,
        thumbnail_url,
        total_questions,
        points_per_question,
        completion_bonus,
        play_count,
        is_published
      )
      VALUES (
        new_id,
        r.title || ' — partie ' || p::text || '/' || parts::text,
        r.description,
        r.category_id,
        r.difficulty_level,
        r.theme,
        r.thumbnail_url,
        chunk_cnt,
        r.points_per_question,
        r.completion_bonus,
        0,
        r.is_published
      );

      UPDATE questions q
      SET
        quiz_id = new_id,
        order_index = w.rn - (p - 1) * max_p
      FROM _split_work w
      WHERE q.id = w.question_id
        AND w.rn > (p - 1) * max_p
        AND w.rn <= p * max_p;
    END LOOP;

    UPDATE quizzes
    SET total_questions = (SELECT COUNT(*)::int FROM questions WHERE quiz_id = r.id)
    WHERE id = r.id;
  END LOOP;

  DROP TABLE IF EXISTS _split_work;
END;
$split$;
