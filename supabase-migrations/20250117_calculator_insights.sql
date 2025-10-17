-- =====================================================
-- CALCULATOR INSIGHTS & AI RECOMMENDATIONS SYSTEM
-- =====================================================
-- Purpose: Track calculator usage, generate AI-powered insights
-- Created: 2025-01-17
-- Features:
--   - Multi-calculator usage tracking
--   - Cross-calculator pattern detection
--   - AI-powered recommendation engine
--   - Personalized insights dashboard
-- =====================================================

-- Table: calculator_usage_log
-- Tracks every calculator interaction for pattern analysis
CREATE TABLE IF NOT EXISTS calculator_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  calculator_name TEXT NOT NULL, -- 'tsp', 'sdp', 'pcs', 'house', 'savings', 'career'
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  session_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for fast queries
  INDEX idx_calculator_usage_user (user_id),
  INDEX idx_calculator_usage_calc (calculator_name),
  INDEX idx_calculator_usage_created (created_at DESC)
);

-- Table: user_calculator_profile
-- Aggregated profile of user's calculator behavior
CREATE TABLE IF NOT EXISTS user_calculator_profile (
  user_id TEXT PRIMARY KEY,
  calculators_used TEXT[] DEFAULT '{}', -- List of calculators user has tried
  total_calculations INTEGER DEFAULT 0,
  favorite_calculator TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  financial_goals JSONB DEFAULT '{}', -- Detected goals from usage patterns
  risk_profile TEXT, -- 'conservative', 'moderate', 'aggressive'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: ai_recommendations
-- Stores AI-generated personalized recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'calculator', 'action', 'resource', 'goal'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER DEFAULT 50, -- 0-100, higher = more important
  calculator_related TEXT, -- Which calculator triggered this
  action_url TEXT,
  is_dismissed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_ai_recommendations_user (user_id),
  INDEX idx_ai_recommendations_priority (priority DESC),
  INDEX idx_ai_recommendations_active (user_id, is_dismissed, expires_at)
);

-- RLS Policies
ALTER TABLE calculator_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calculator_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users view own calculator usage"
  ON calculator_usage_log FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users insert own calculator usage"
  ON calculator_usage_log FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users view own calculator profile"
  ON user_calculator_profile FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users update own calculator profile"
  ON user_calculator_profile FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users insert own calculator profile"
  ON user_calculator_profile FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users view own recommendations"
  ON ai_recommendations FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users update own recommendations"
  ON ai_recommendations FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role has full access
CREATE POLICY "Service role full access calculator_usage_log"
  ON calculator_usage_log FOR ALL
  USING (current_user = 'service_role');

CREATE POLICY "Service role full access user_calculator_profile"
  ON user_calculator_profile FOR ALL
  USING (current_user = 'service_role');

CREATE POLICY "Service role full access ai_recommendations"
  ON ai_recommendations FOR ALL
  USING (current_user = 'service_role');

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: update_user_calculator_profile
-- Updates user profile after each calculator use
CREATE OR REPLACE FUNCTION update_user_calculator_profile(
  p_user_id TEXT,
  p_calculator_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_calculator_profile (user_id, calculators_used, total_calculations, favorite_calculator, last_active)
  VALUES (
    p_user_id,
    ARRAY[p_calculator_name],
    1,
    p_calculator_name,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    calculators_used = CASE
      WHEN p_calculator_name = ANY(user_calculator_profile.calculators_used)
      THEN user_calculator_profile.calculators_used
      ELSE array_append(user_calculator_profile.calculators_used, p_calculator_name)
    END,
    total_calculations = user_calculator_profile.total_calculations + 1,
    last_active = NOW(),
    updated_at = NOW();
END;
$$;

-- Function: get_user_insights
-- Analyzes user's calculator usage and returns insights
CREATE OR REPLACE FUNCTION get_user_insights(p_user_id TEXT)
RETURNS TABLE (
  total_calculations BIGINT,
  calculators_count INTEGER,
  most_used_calculator TEXT,
  days_active INTEGER,
  avg_session_duration NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_calculations,
    COUNT(DISTINCT calculator_name)::INTEGER as calculators_count,
    MODE() WITHIN GROUP (ORDER BY calculator_name) as most_used_calculator,
    (DATE_PART('day', NOW() - MIN(created_at)))::INTEGER as days_active,
    ROUND(AVG(session_duration_seconds)::NUMERIC, 1) as avg_session_duration
  FROM calculator_usage_log
  WHERE user_id = p_user_id;
END;
$$;

-- Function: get_cross_calculator_patterns
-- Identifies common patterns across multiple calculators
CREATE OR REPLACE FUNCTION get_cross_calculator_patterns(p_user_id TEXT)
RETURNS TABLE (
  pattern_name TEXT,
  calculators_involved TEXT[],
  frequency INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Common pattern: TSP + Career (planning transition)
  SELECT
    'Transition Planning'::TEXT as pattern_name,
    ARRAY['tsp', 'career']::TEXT[] as calculators_involved,
    COUNT(*)::INTEGER as frequency
  FROM (
    SELECT DISTINCT user_id, DATE(created_at) as day
    FROM calculator_usage_log
    WHERE user_id = p_user_id
      AND calculator_name IN ('tsp', 'career')
  ) daily_usage
  GROUP BY user_id
  
  UNION ALL
  
  -- Pattern: PCS + House (moving and buying)
  SELECT
    'PCS + Real Estate'::TEXT,
    ARRAY['pcs', 'house']::TEXT[],
    COUNT(*)::INTEGER
  FROM (
    SELECT DISTINCT user_id, DATE(created_at) as day
    FROM calculator_usage_log
    WHERE user_id = p_user_id
      AND calculator_name IN ('pcs', 'house')
  ) daily_usage
  GROUP BY user_id
  
  UNION ALL
  
  -- Pattern: Savings + Career (maximizing income)
  SELECT
    'Income Optimization'::TEXT,
    ARRAY['savings', 'career']::TEXT[],
    COUNT(*)::INTEGER
  FROM (
    SELECT DISTINCT user_id, DATE(created_at) as day
    FROM calculator_usage_log
    WHERE user_id = p_user_id
      AND calculator_name IN ('savings', 'career')
  ) daily_usage
  GROUP BY user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_user_calculator_profile TO service_role;
GRANT EXECUTE ON FUNCTION get_user_insights TO service_role;
GRANT EXECUTE ON FUNCTION get_cross_calculator_patterns TO service_role;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_calculator_usage_user_calc_date 
  ON calculator_usage_log(user_id, calculator_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_priority 
  ON ai_recommendations(user_id, priority DESC, created_at DESC)
  WHERE is_dismissed = FALSE;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE calculator_usage_log IS 'Tracks every calculator interaction for AI pattern analysis';
COMMENT ON TABLE user_calculator_profile IS 'Aggregated user behavior profile across all calculators';
COMMENT ON TABLE ai_recommendations IS 'AI-generated personalized recommendations for users';
COMMENT ON FUNCTION update_user_calculator_profile IS 'Updates user profile after calculator use';
COMMENT ON FUNCTION get_user_insights IS 'Returns aggregated insights about user calculator behavior';
COMMENT ON FUNCTION get_cross_calculator_patterns IS 'Identifies patterns across multiple calculator uses';

