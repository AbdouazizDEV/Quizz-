-- Méta optionnelles (Excel : subcategory, tags, colonne difficulty libre)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty_label TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- Scoring rejeu : n’ajoute au profil que la progression vs meilleur score précédent
-- sur le même quiz ; bonus de complétion une seule fois au premier max score.
-- Compteur quizzes_completed : première complétion du quiz seulement.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_player_score()
RETURNS TRIGGER AS $$
DECLARE
  prev_best INTEGER;
  max_pts INTEGER;
  q_bonus INTEGER;
  q_pts_per INTEGER;
  n_questions INTEGER;
  delta INTEGER;
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    SELECT COALESCE(completion_bonus, 0), COALESCE(points_per_question, 1)
    INTO q_bonus, q_pts_per
    FROM quizzes WHERE id = NEW.quiz_id;

    SELECT COUNT(*)::int INTO n_questions FROM questions WHERE quiz_id = NEW.quiz_id;
    max_pts := GREATEST(0, n_questions * q_pts_per);

    SELECT COALESCE(MAX(score), 0) INTO prev_best
    FROM quiz_sessions
    WHERE user_id = NEW.user_id
      AND quiz_id = NEW.quiz_id
      AND is_completed = TRUE
      AND id <> NEW.id;

    delta := GREATEST(0, NEW.score - prev_best);

    UPDATE profiles
    SET
      total_score = total_score + delta,
      updated_at = NOW()
    WHERE id = NEW.user_id;

    -- Bonus : uniquement la première fois où le score session atteint le maximum possible (quiz non vide)
    IF max_pts > 0 AND NEW.score >= max_pts AND prev_best < max_pts THEN
      UPDATE profiles
      SET total_score = total_score + q_bonus
      WHERE id = NEW.user_id;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM quiz_sessions s
      WHERE s.user_id = NEW.user_id
        AND s.quiz_id = NEW.quiz_id
        AND s.is_completed = TRUE
        AND s.id <> NEW.id
    ) THEN
      UPDATE profiles
      SET quizzes_completed = quizzes_completed + 1
      WHERE id = NEW.user_id;
    END IF;

    UPDATE quizzes SET play_count = play_count + 1 WHERE id = NEW.quiz_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- Supprimer les questions en double (même quiz + même texte), garde l’id le plus bas
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM questions q
USING questions q2
WHERE q.quiz_id = q2.quiz_id
  AND q.question_text = q2.question_text
  AND q.id > q2.id;

-- ═══════════════════════════════════════════════════════════════════════════
-- Aligner total_questions sur le nombre réel de lignes
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE quizzes qu
SET total_questions = sub.cnt,
    updated_at = NOW()
FROM (
  SELECT quiz_id, COUNT(*)::int AS cnt
  FROM questions
  GROUP BY quiz_id
) sub
WHERE qu.id = sub.quiz_id;

UPDATE quizzes qu
SET total_questions = 0,
    updated_at = NOW()
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id = qu.id);

CREATE OR REPLACE FUNCTION sync_quiz_total_questions()
RETURNS TRIGGER AS $$
DECLARE
  target_quiz UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_quiz := OLD.quiz_id;
  ELSE
    target_quiz := NEW.quiz_id;
  END IF;

  UPDATE quizzes
  SET
    total_questions = (SELECT COUNT(*)::int FROM questions WHERE quiz_id = target_quiz),
    updated_at = NOW()
  WHERE id = target_quiz;

  IF TG_OP = 'UPDATE' AND OLD.quiz_id IS DISTINCT FROM NEW.quiz_id THEN
    UPDATE quizzes
    SET
      total_questions = (SELECT COUNT(*)::int FROM questions WHERE quiz_id = OLD.quiz_id),
      updated_at = NOW()
    WHERE id = OLD.quiz_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_quiz_question_count ON questions;
CREATE TRIGGER trigger_sync_quiz_question_count
AFTER INSERT OR UPDATE OR DELETE ON questions
FOR EACH ROW
EXECUTE FUNCTION sync_quiz_total_questions();
