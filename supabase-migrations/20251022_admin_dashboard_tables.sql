-- =====================================================
-- ADMIN DASHBOARD TABLES MIGRATION
-- Created: 2025-10-22
-- Purpose: Add tables for admin dashboard functionality
-- =====================================================

-- Admin action audit trail
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'suspend_user', 'grant_premium', 'moderate_content', 'send_email', 'adjust_tier'
  target_type TEXT NOT NULL, -- 'user', 'content', 'system'
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for admin actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(action_type);

-- System alerts
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  category TEXT NOT NULL CHECK (category IN ('data', 'api', 'user', 'revenue', 'system')),
  message TEXT NOT NULL,
  details JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for system alerts
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity, resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_category ON system_alerts(category, resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created ON system_alerts(created_at DESC);

-- Centralized error logs
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info')),
  source TEXT NOT NULL, -- component/feature that logged the error
  message TEXT NOT NULL,
  stack_trace TEXT,
  user_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for error logs
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_level_source ON error_logs(level, source);
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON error_logs(user_id) WHERE user_id IS NOT NULL;

-- User tags for segmentation
CREATE TABLE IF NOT EXISTS user_tags (
  user_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  added_by TEXT NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, tag)
);

-- Index for user tags
CREATE INDEX IF NOT EXISTS idx_user_tags_user ON user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_tag ON user_tags(tag);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;

-- Admin actions: Only admin users can view and insert
CREATE POLICY "Admin users can view all admin actions" ON admin_actions
  FOR SELECT
  USING (true); -- Will be restricted at application level

CREATE POLICY "Admin users can insert admin actions" ON admin_actions
  FOR INSERT
  WITH CHECK (true); -- Will be restricted at application level

-- System alerts: Only admin users can view and manage
CREATE POLICY "Admin users can view all alerts" ON system_alerts
  FOR SELECT
  USING (true);

CREATE POLICY "Admin users can insert alerts" ON system_alerts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin users can update alerts" ON system_alerts
  FOR UPDATE
  USING (true);

-- Error logs: Only admin users can view
CREATE POLICY "Admin users can view all error logs" ON error_logs
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert error logs" ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- User tags: Only admin users can manage
CREATE POLICY "Admin users can view all user tags" ON user_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Admin users can insert user tags" ON user_tags
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin users can delete user tags" ON user_tags
  FOR DELETE
  USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_user_id TEXT,
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_action_id UUID;
BEGIN
  INSERT INTO admin_actions (admin_user_id, action_type, target_type, target_id, details)
  VALUES (p_admin_user_id, p_action_type, p_target_type, p_target_id, p_details)
  RETURNING id INTO v_action_id;
  
  RETURN v_action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create system alert
CREATE OR REPLACE FUNCTION create_system_alert(
  p_severity TEXT,
  p_category TEXT,
  p_message TEXT,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  INSERT INTO system_alerts (severity, category, message, details)
  VALUES (p_severity, p_category, p_message, p_details)
  RETURNING id INTO v_alert_id;
  
  RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log errors
CREATE OR REPLACE FUNCTION log_error(
  p_level TEXT,
  p_source TEXT,
  p_message TEXT,
  p_stack_trace TEXT DEFAULT NULL,
  p_user_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_error_id UUID;
BEGIN
  INSERT INTO error_logs (level, source, message, stack_trace, user_id, metadata)
  VALUES (p_level, p_source, p_message, p_stack_trace, p_user_id, p_metadata)
  RETURNING id INTO v_error_id;
  
  RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE admin_actions IS 'Audit trail of all administrative actions';
COMMENT ON TABLE system_alerts IS 'System-wide alerts for admin monitoring';
COMMENT ON TABLE error_logs IS 'Centralized error logging for debugging';
COMMENT ON TABLE user_tags IS 'User segmentation tags for admin organization';

COMMENT ON FUNCTION log_admin_action IS 'Helper function to log administrative actions';
COMMENT ON FUNCTION create_system_alert IS 'Helper function to create system alerts';
COMMENT ON FUNCTION log_error IS 'Helper function to log errors centrally';

