-- =====================================================
-- INTELLIGENCE LIBRARY RATE LIMITING
-- =====================================================
-- Free users: 5 articles per day
-- Premium users: Unlimited
-- Tracks daily view count and resets at midnight

-- Add columns to user_profiles for library tracking
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS library_views_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS library_view_date DATE DEFAULT CURRENT_DATE;

-- Function: Check if user can view library content
CREATE OR REPLACE FUNCTION can_view_library(
  p_user_id TEXT,
  p_is_premium BOOLEAN
) RETURNS BOOLEAN AS $$
DECLARE
  v_views_today INTEGER;
  v_view_date DATE;
BEGIN
  -- Premium users have unlimited access
  IF p_is_premium THEN
    RETURN TRUE;
  END IF;

  -- Get user's current view count
  SELECT library_views_today, library_view_date
  INTO v_views_today, v_view_date
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Reset if it's a new day
  IF v_view_date < CURRENT_DATE THEN
    UPDATE user_profiles
    SET library_views_today = 0,
        library_view_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    v_views_today := 0;
  END IF;

  -- Free users limited to 5 per day
  RETURN v_views_today < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Record library view
CREATE OR REPLACE FUNCTION record_library_view(
  p_user_id TEXT,
  p_is_premium BOOLEAN
) RETURNS VOID AS $$
DECLARE
  v_view_date DATE;
BEGIN
  -- Premium users don't need tracking
  IF p_is_premium THEN
    RETURN;
  END IF;

  -- Get current view date
  SELECT library_view_date INTO v_view_date
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Reset if it's a new day
  IF v_view_date < CURRENT_DATE THEN
    UPDATE user_profiles
    SET library_views_today = 1,
        library_view_date = CURRENT_DATE
    WHERE user_id = p_user_id;
  ELSE
    -- Increment view count
    UPDATE user_profiles
    SET library_views_today = library_views_today + 1
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_library_tracking 
ON user_profiles(user_id, library_view_date);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION can_view_library(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION record_library_view(TEXT, BOOLEAN) TO authenticated;

