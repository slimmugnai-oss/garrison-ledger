-- Add is_sample flag to user_plans table
-- Distinguishes between sample/demo plans and real AI-generated personalized plans

ALTER TABLE user_plans 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_user_plans_is_sample ON user_plans(is_sample);

-- Comment
COMMENT ON COLUMN user_plans.is_sample IS 'True if this is a sample/demo plan, false if personalized AI-generated';

