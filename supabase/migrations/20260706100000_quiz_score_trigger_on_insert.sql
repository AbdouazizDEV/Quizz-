-- Le trigger update_player_score ne s’exécutait qu’en UPDATE (is_completed false → true).
-- Les insertions directes en is_completed=true (app mobile) ne créditaient pas total_score.

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
  IF NEW.is_completed = TRUE AND (TG_OP = 'INSERT' OR OLD.is_completed IS DISTINCT FROM TRUE) THEN
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

DROP TRIGGER IF EXISTS trigger_update_score ON quiz_sessions;
CREATE TRIGGER trigger_update_score
AFTER INSERT OR UPDATE OF is_completed, score ON quiz_sessions
FOR EACH ROW
EXECUTE FUNCTION update_player_score();
