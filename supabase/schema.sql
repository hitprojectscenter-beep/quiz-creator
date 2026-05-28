-- ============================================
-- Quiz Generator Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Profiles (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  total_tests_created INTEGER DEFAULT 0,
  total_tests_taken INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Tests
-- ============================================
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  time_limit_minutes INTEGER,
  is_public BOOLEAN DEFAULT TRUE,
  share_code TEXT UNIQUE,
  source_summary TEXT,
  total_questions INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Questions
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of {key: 'A', text: '...'}
  correct_option TEXT NOT NULL, -- 'A', 'B', 'C', or 'D'
  explanation TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  topic TEXT,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Test Attempts
-- ============================================
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- {question_id: 'A', ...}
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  duration_seconds INTEGER,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Badges
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL, -- 'tests_created', 'tests_taken', 'perfect_score', 'streak', 'xp'
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50
);

-- ============================================
-- User Badges (earned)
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tests_creator ON tests(creator_id);
CREATE INDEX IF NOT EXISTS idx_tests_share_code ON tests(share_code);
CREATE INDEX IF NOT EXISTS idx_questions_test ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_test ON attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tests policies
CREATE POLICY "Public tests viewable by everyone" ON tests
  FOR SELECT USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create tests" ON tests
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own tests" ON tests
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own tests" ON tests
  FOR DELETE USING (auth.uid() = creator_id);

-- Questions policies (inherit from test access)
CREATE POLICY "Questions viewable with test access" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = questions.test_id
      AND (tests.is_public = true OR tests.creator_id = auth.uid())
    )
  );

CREATE POLICY "Test creators can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = questions.test_id
      AND tests.creator_id = auth.uid()
    )
  );

-- Attempts policies
CREATE POLICY "Users can view own attempts" ON attempts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Test creators can view all attempts on their tests" ON attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = attempts.test_id
      AND tests.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attempts" ON attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges
CREATE POLICY "Badges viewable by everyone" ON badges
  FOR SELECT USING (true);

CREATE POLICY "User badges viewable by everyone" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can grant badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Trigger: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Seed initial badges
-- ============================================
INSERT INTO badges (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
  ('צעדים ראשונים', 'יצרת את המבחן הראשון שלך', '🎯', 'tests_created', 1, 50),
  ('יוצר מנוסה', 'יצרת 5 מבחנים', '📚', 'tests_created', 5, 100),
  ('מורה מקצועי', 'יצרת 20 מבחנים', '🎓', 'tests_created', 20, 250),
  ('לומד מתחיל', 'השלמת את המבחן הראשון שלך', '⭐', 'tests_taken', 1, 50),
  ('סטודנט חרוץ', 'השלמת 10 מבחנים', '🔥', 'tests_taken', 10, 150),
  ('מאסטר', 'השלמת 50 מבחנים', '👑', 'tests_taken', 50, 500),
  ('מושלם!', 'קיבלת 100% במבחן', '💯', 'perfect_score', 1, 100),
  ('שאיפה למצוינות', 'קיבלת 100% ב-5 מבחנים', '🌟', 'perfect_score', 5, 300),
  ('רצף של 7', '7 ימים רצופים של למידה', '⚡', 'streak', 7, 200),
  ('רצף של 30', '30 ימים רצופים של למידה', '🏆', 'streak', 30, 1000),
  ('1000 XP', 'צברת 1000 נקודות ניסיון', '💎', 'xp', 1000, 100),
  ('5000 XP', 'צברת 5000 נקודות ניסיון', '🚀', 'xp', 5000, 500)
ON CONFLICT (name) DO NOTHING;
