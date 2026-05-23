-- Meilleur score par utilisateur / quiz (rejeu partiel) + anti-doublons questions

CREATE TABLE IF NOT EXISTS user_quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  best_score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_user ON user_quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_quiz ON user_quiz_scores(quiz_id);

ALTER TABLE user_quiz_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_quiz_scores_select_own ON user_quiz_scores;
CREATE POLICY user_quiz_scores_select_own
  ON user_quiz_scores
  FOR SELECT
  USING (auth.uid() = user_id);

-- Backfill depuis les sessions déjà complétées
INSERT INTO user_quiz_scores (user_id, quiz_id, best_score, max_score, attempts, completed_at)
SELECT
  s.user_id,
  s.quiz_id,
  MAX(s.score)::int AS best_score,
  GREATEST(
    0,
    (SELECT COUNT(*)::int FROM questions q WHERE q.quiz_id = s.quiz_id)
    * COALESCE((SELECT points_per_question FROM quizzes WHERE id = s.quiz_id), 1)
  ) AS max_score,
  COUNT(*)::int AS attempts,
  MAX(s.completed_at) AS completed_at
FROM quiz_sessions s
WHERE s.is_completed = TRUE
GROUP BY s.user_id, s.quiz_id
ON CONFLICT (user_id, quiz_id) DO UPDATE SET
  best_score = GREATEST(user_quiz_scores.best_score, EXCLUDED.best_score),
  max_score = EXCLUDED.max_score,
  attempts = GREATEST(user_quiz_scores.attempts, EXCLUDED.attempts),
  completed_at = EXCLUDED.completed_at;

CREATE OR REPLACE FUNCTION sync_user_quiz_scores_from_session()
RETURNS TRIGGER AS $$
DECLARE
  max_pts INTEGER;
  q_pts INTEGER;
  n_questions INTEGER;
BEGIN
  IF NEW.is_completed = TRUE AND (OLD.is_completed IS DISTINCT FROM TRUE) THEN
    SELECT COALESCE(points_per_question, 1) INTO q_pts FROM quizzes WHERE id = NEW.quiz_id;
    SELECT COUNT(*)::int INTO n_questions FROM questions WHERE quiz_id = NEW.quiz_id;
    max_pts := GREATEST(0, n_questions * q_pts);

    INSERT INTO user_quiz_scores (user_id, quiz_id, best_score, max_score, attempts, completed_at)
    VALUES (NEW.user_id, NEW.quiz_id, NEW.score, max_pts, 1, COALESCE(NEW.completed_at, NOW()))
    ON CONFLICT (user_id, quiz_id) DO UPDATE SET
      best_score = GREATEST(user_quiz_scores.best_score, NEW.score),
      max_score = max_pts,
      attempts = user_quiz_scores.attempts + 1,
      completed_at = COALESCE(NEW.completed_at, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_user_quiz_scores ON quiz_sessions;
CREATE TRIGGER trigger_sync_user_quiz_scores
AFTER INSERT OR UPDATE OF is_completed, score ON quiz_sessions
FOR EACH ROW
EXECUTE FUNCTION sync_user_quiz_scores_from_session();

-- Doublons : normaliser espaces + casse, garder la plus ancienne
DELETE FROM questions q
USING questions q2
WHERE q.quiz_id = q2.quiz_id
  AND LOWER(TRIM(q.question_text)) = LOWER(TRIM(q2.question_text))
  AND q.id > q2.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_unique_per_quiz
  ON questions (quiz_id, LOWER(TRIM(question_text)));
