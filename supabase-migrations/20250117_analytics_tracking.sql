-- =====================================================
-- ANALYTICS & TRACKING SYSTEM
-- =====================================================
-- Purpose: Track user engagement and conversions
-- Created: 2025-01-17
-- =====================================================

-- Table: analytics_events
-- Stores all tracked events for analysis
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_event ON analytics_events(user_id, event_name);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Service role can do anything
CREATE POLICY "Service role full access analytics"
  ON analytics_events FOR ALL
  USING (current_user = 'service_role');

-- Users can view their own events
CREATE POLICY "Users view own events"
  ON analytics_events FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Function: get_calculator_completion_rates
-- Returns completion rates for all calculators
CREATE OR REPLACE FUNCTION get_calculator_completion_rates()
RETURNS TABLE (
  calculator_name TEXT,
  started_count BIGINT,
  completed_count BIGINT,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH starts AS (
    SELECT 
      properties->>'calculator_name' as calc_name,
      COUNT(*) as start_count
    FROM analytics_events
    WHERE event_name = 'calculator_started'
      AND properties->>'calculator_name' IS NOT NULL
    GROUP BY properties->>'calculator_name'
  ),
  completions AS (
    SELECT 
      properties->>'calculator_name' as calc_name,
      COUNT(*) as complete_count
    FROM analytics_events
    WHERE event_name = 'calculator_completed'
      AND properties->>'calculator_name' IS NOT NULL
    GROUP BY properties->>'calculator_name'
  )
  SELECT 
    COALESCE(starts.calc_name, completions.calc_name) as calculator_name,
    COALESCE(starts.start_count, 0) as started_count,
    COALESCE(completions.complete_count, 0) as completed_count,
    CASE 
      WHEN COALESCE(starts.start_count, 0) > 0 
      THEN ROUND((COALESCE(completions.complete_count, 0)::NUMERIC / starts.start_count) * 100, 1)
      ELSE 0
    END as completion_rate
  FROM starts
  FULL OUTER JOIN completions ON starts.calc_name = completions.calc_name
  ORDER BY started_count DESC;
END;
$$;

-- Function: get_conversion_funnel
-- Returns conversion metrics through the user funnel
CREATE OR REPLACE FUNCTION get_conversion_funnel()
RETURNS TABLE (
  stage TEXT,
  user_count BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users BIGINT;
BEGIN
  -- Get total unique users
  SELECT COUNT(DISTINCT user_id) INTO total_users
  FROM analytics_events
  WHERE user_id != 'anonymous';
  
  RETURN QUERY
  WITH funnel_data AS (
    SELECT 
      'Total Users' as stage,
      total_users as count,
      1 as order_num
    UNION ALL
    SELECT 
      'Completed Assessment' as stage,
      COUNT(DISTINCT user_id) as count,
      2 as order_num
    FROM analytics_events
    WHERE event_name = 'assessment_completed'
    UNION ALL
    SELECT 
      'Generated Plan' as stage,
      COUNT(DISTINCT user_id) as count,
      3 as order_num
    FROM analytics_events
    WHERE event_name = 'plan_generated'
    UNION ALL
    SELECT 
      'Used Calculator' as stage,
      COUNT(DISTINCT user_id) as count,
      4 as order_num
    FROM analytics_events
    WHERE event_name = 'calculator_completed'
    UNION ALL
    SELECT 
      'Premium Upgraded' as stage,
      COUNT(DISTINCT user_id) as count,
      5 as order_num
    FROM analytics_events
    WHERE event_name = 'premium_upgraded'
  )
  SELECT 
    funnel_data.stage,
    funnel_data.count as user_count,
    CASE 
      WHEN total_users > 0 
      THEN ROUND((funnel_data.count::NUMERIC / total_users) * 100, 1)
      ELSE 0
    END as conversion_rate
  FROM funnel_data
  ORDER BY order_num;
END;
$$;

-- Function: get_top_features
-- Returns most used features
CREATE OR REPLACE FUNCTION get_top_features(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  feature_name TEXT,
  usage_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    event_name as feature_name,
    COUNT(*) as usage_count
  FROM analytics_events
  WHERE user_id != 'anonymous'
  GROUP BY event_name
  ORDER BY usage_count DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_calculator_completion_rates TO service_role;
GRANT EXECUTE ON FUNCTION get_conversion_funnel TO service_role;
GRANT EXECUTE ON FUNCTION get_top_features TO service_role;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE analytics_events IS 'Stores all user interaction events for analytics';
COMMENT ON FUNCTION get_calculator_completion_rates IS 'Returns completion rates for all calculators';
COMMENT ON FUNCTION get_conversion_funnel IS 'Returns user conversion metrics through the funnel';
COMMENT ON FUNCTION get_top_features IS 'Returns most frequently used features';

