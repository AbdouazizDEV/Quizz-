-- Lecture côté app (anon / authentifié) des contenus publiés : catégories, quiz, questions.

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_public"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "quizzes_select_published"
  ON quizzes
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "questions_select_when_quiz_published"
  ON questions
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM quizzes q
      WHERE q.id = questions.quiz_id
        AND q.is_published = true
    )
  );
