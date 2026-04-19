-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ════════════════════════════════════════
-- TABLE : profiles (extension de auth.users)
-- ════════════════════════════════════════
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(20) UNIQUE,
  bio TEXT,
  level_code VARCHAR(5) DEFAULT 'Z0' CHECK (level_code IN ('Z0','Z1','Z2','Z3','A1','A2','A3')),
  total_score INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  days_active INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- TABLE : categories
-- ════════════════════════════════════════
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon TEXT,
  color VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- TABLE : quizzes
-- ════════════════════════════════════════
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  difficulty_level VARCHAR(5) DEFAULT 'Z0' CHECK (difficulty_level IN ('Z0','Z1','Z2','Z3','A1','A2','A3')),
  theme VARCHAR(100),
  thumbnail_url TEXT,
  total_questions INTEGER DEFAULT 10,
  points_per_question INTEGER DEFAULT 1,
  completion_bonus INTEGER DEFAULT 10,
  play_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- TABLE : questions
-- ════════════════════════════════════════
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_id VARCHAR(1) NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- TABLE : quiz_sessions
-- ════════════════════════════════════════
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  score INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE
);

-- ════════════════════════════════════════
-- TABLE : friendships
-- ════════════════════════════════════════
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ════════════════════════════════════════
-- TABLE : challenges
-- ════════════════════════════════════════
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID NOT NULL REFERENCES profiles(id),
  challenged_id UUID NOT NULL REFERENCES profiles(id),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','completed')),
  challenger_score INTEGER,
  challenged_score INTEGER,
  winner_id UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- TABLE : notifications
-- ════════════════════════════════════════
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- TABLE : otp_codes
-- ════════════════════════════════════════
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code VARCHAR(255) NOT NULL,
  type VARCHAR(20) DEFAULT 'password_reset' CHECK (type IN ('password_reset', 'phone_verify')),
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════
CREATE INDEX idx_quizzes_category ON quizzes(category_id);
CREATE INDEX idx_quizzes_level ON quizzes(difficulty_level);
CREATE INDEX idx_quizzes_play_count ON quizzes(play_count DESC);
CREATE INDEX idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_friendships_follower ON friendships(follower_id);
CREATE INDEX idx_friendships_following ON friendships(following_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_profiles_score ON profiles(total_score DESC);
CREATE INDEX idx_otp_identifier ON otp_codes(identifier, is_used, expires_at);

-- ════════════════════════════════════════
-- VIEWS : Leaderboard
-- ════════════════════════════════════════
CREATE VIEW leaderboard AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.total_score,
  p.level_code,
  p.quizzes_completed,
  RANK() OVER (ORDER BY p.total_score DESC) AS rank
FROM profiles p
ORDER BY p.total_score DESC;

-- ════════════════════════════════════════
-- FUNCTION : Mise à jour score après quiz
-- ════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_player_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    UPDATE profiles
    SET
      total_score = total_score + NEW.score + (
        SELECT completion_bonus FROM quizzes WHERE id = NEW.quiz_id
      ),
      quizzes_completed = quizzes_completed + 1,
      updated_at = NOW()
    WHERE id = NEW.user_id;

    UPDATE quizzes
    SET play_count = play_count + 1
    WHERE id = NEW.quiz_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_score
AFTER UPDATE ON quiz_sessions
FOR EACH ROW
EXECUTE FUNCTION update_player_score();

-- ════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "sessions_own" ON quiz_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "notifs_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Améliorations possibles (selon produit) :
-- - RLS + policies sur categories / quizzes / questions (lecture publique des quiz publiés, etc.)
-- - Trigger auth.users → insert dans profiles (voir doc Supabase « User Management »)
