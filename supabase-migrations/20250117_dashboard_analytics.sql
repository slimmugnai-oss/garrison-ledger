-- Dashboard Analytics Tracking
-- Created: 2025-01-17

-- ============================================================================
-- DASHBOARD ANALYTICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS dashboard_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  widget_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'click', 'interact')),
  click_action TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dashboard_analytics_user_id ON dashboard_analytics(user_id);
CREATE INDEX idx_dashboard_analytics_widget ON dashboard_analytics(widget_name);
CREATE INDEX idx_dashboard_analytics_action ON dashboard_analytics(action);
CREATE INDEX idx_dashboard_analytics_timestamp ON dashboard_analytics(timestamp DESC);
CREATE INDEX idx_dashboard_analytics_created_at ON dashboard_analytics(created_at DESC);

COMMENT ON TABLE dashboard_analytics IS 'Tracks user interactions with dashboard widgets for optimization';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE dashboard_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON dashboard_analytics FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their analytics"
  ON dashboard_analytics FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- ============================================================================
-- GRANTS
-- ============================================================================
GRANT ALL ON dashboard_analytics TO authenticated;

