-- User Gamification Table
-- Tracks streaks, badges, achievements for user engagement

CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  
  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  
  -- Activity metrics
  total_logins INTEGER DEFAULT 0,
  total_plans_generated INTEGER DEFAULT 0,
  total_assessments INTEGER DEFAULT 0,
  
  -- Badges earned (array of badge slugs)
  badges TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own gamification"
  ON user_gamification
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update own gamification"
  ON user_gamification
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own gamification"
  ON user_gamification
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_current_streak ON user_gamification(current_streak);
CREATE INDEX IF NOT EXISTS idx_user_gamification_last_active ON user_gamification(last_active);

-- Comments
COMMENT ON TABLE user_gamification IS 'Tracks user engagement metrics, streaks, and achievements for gamification';
COMMENT ON COLUMN user_gamification.current_streak IS 'Consecutive days of activity';
COMMENT ON COLUMN user_gamification.longest_streak IS 'All-time longest streak';
COMMENT ON COLUMN user_gamification.badges IS 'Array of earned badge slugs (week_warrior, month_master, etc)';

