-- Quizz+ : notifications (devices, log, prefs, timezone) + quiz difficulty + tournoi questions
-- SOLID foundations for streak push, event notifications, difficulty scoring, tournament pools

-- ════════════════════════════════════════
-- Questions : difficulté normalisée (easy|medium|hard)
-- ════════════════════════════════════════
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS difficulty TEXT;

UPDATE public.questions
SET difficulty = CASE
  WHEN lower(coalesce(difficulty_label, '')) IN ('easy', 'facile', 'e', '1', 'z0') THEN 'easy'
  WHEN lower(coalesce(difficulty_label, '')) IN ('hard', 'difficile', 'h', '3', 'z2', 'z3') THEN 'hard'
  WHEN lower(coalesce(difficulty_label, '')) IN ('medium', 'moyen', 'm', '2', 'z1') THEN 'medium'
  ELSE 'medium'
END
WHERE difficulty IS NULL;

ALTER TABLE public.questions
  ALTER COLUMN difficulty SET DEFAULT 'medium';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'questions_difficulty_check'
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_difficulty_check
      CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions (difficulty);

-- ════════════════════════════════════════
-- Profils : fuseau horaire (rappels streak locaux)
-- ════════════════════════════════════════
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Dakar';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_played_at TIMESTAMPTZ;

-- ════════════════════════════════════════
-- Devices Expo Push
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  platform TEXT,
  timezone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, expo_push_token)
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices (user_id)
  WHERE is_active = TRUE;

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_devices_own ON public.user_devices;
CREATE POLICY user_devices_own ON public.user_devices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════
-- Log d’envois (anti-doublon cron)
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, type, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_notification_log_user_type
  ON public.notification_log (user_id, type, created_at DESC);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Lecture seule pour le propriétaire ; écriture via service role
DROP POLICY IF EXISTS notification_log_select_own ON public.notification_log;
CREATE POLICY notification_log_select_own ON public.notification_log
  FOR SELECT USING (auth.uid() = user_id);

-- ════════════════════════════════════════
-- Préférences par type
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, type)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notification_preferences_own ON public.notification_preferences;
CREATE POLICY notification_preferences_own ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════
-- Tournois : seed + pool de questions figé
-- ════════════════════════════════════════
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS seed TEXT;

ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS difficulty_mix TEXT DEFAULT 'medium';

CREATE TABLE IF NOT EXISTS public.tournament_questions (
  tournament_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (tournament_id, question_id),
  UNIQUE (tournament_id, position)
);

CREATE INDEX IF NOT EXISTS idx_tournament_questions_tournament
  ON public.tournament_questions (tournament_id, position);

ALTER TABLE public.tournament_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tournament_questions_read ON public.tournament_questions;
CREATE POLICY tournament_questions_read ON public.tournament_questions
  FOR SELECT USING (TRUE);

-- ════════════════════════════════════════
-- Score serveur : recalcul à partir de difficulty (anti-triche)
-- Barème : easy=1, medium=2, hard=3
-- ════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.recompute_quiz_session_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  computed INTEGER := 0;
  ans JSONB;
  qid UUID;
  is_correct BOOLEAN;
  qdiff TEXT;
BEGIN
  IF NEW.answers IS NULL OR jsonb_typeof(NEW.answers) <> 'array' THEN
    RETURN NEW;
  END IF;

  FOR ans IN SELECT * FROM jsonb_array_elements(NEW.answers)
  LOOP
    is_correct := COALESCE((ans->>'correct')::boolean, (ans->>'isCorrect')::boolean, FALSE);
    IF NOT is_correct THEN
      CONTINUE;
    END IF;

    BEGIN
      qid := NULLIF(ans->>'questionId', '')::uuid;
    EXCEPTION WHEN others THEN
      qid := NULL;
    END;

    IF qid IS NULL THEN
      CONTINUE;
    END IF;

    SELECT q.difficulty INTO qdiff FROM public.questions q WHERE q.id = qid;
    computed := computed + CASE COALESCE(qdiff, 'medium')
      WHEN 'easy' THEN 1
      WHEN 'hard' THEN 3
      ELSE 2
    END;
  END LOOP;

  NEW.score := computed;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recompute_quiz_session_score ON public.quiz_sessions;
CREATE TRIGGER trg_recompute_quiz_session_score
  BEFORE INSERT OR UPDATE OF answers, score, is_completed
  ON public.quiz_sessions
  FOR EACH ROW
  WHEN (NEW.answers IS NOT NULL AND jsonb_typeof(NEW.answers) = 'array' AND jsonb_array_length(NEW.answers) > 0)
  EXECUTE FUNCTION public.recompute_quiz_session_score();

-- last_played_at sur completion
CREATE OR REPLACE FUNCTION public.touch_last_played_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_completed IS TRUE AND (OLD.is_completed IS DISTINCT FROM TRUE) THEN
    UPDATE public.profiles
    SET last_played_at = COALESCE(NEW.completed_at, NOW())
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_last_played_at ON public.quiz_sessions;
CREATE TRIGGER trg_touch_last_played_at
  AFTER INSERT OR UPDATE OF is_completed
  ON public.quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_last_played_at();
