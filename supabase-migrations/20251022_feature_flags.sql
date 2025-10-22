-- =====================================================
-- FEATURE FLAGS AND CONFIGURATION TABLES
-- Created: 2025-10-22
-- Purpose: Enable/disable features without deployment
-- =====================================================

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_tiers TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by TEXT
);

-- System configuration table
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  editable BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);

-- RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feature flags" ON feature_flags
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage feature flags" ON feature_flags
  FOR ALL
  USING (true);

CREATE POLICY "Anyone can view system config" ON system_config
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage system config" ON system_config
  FOR ALL
  USING (true);

-- Insert default feature flags
INSERT INTO feature_flags (flag_key, name, description, enabled) VALUES
  ('ai_plan_generation', 'AI Plan Generation', 'Enable AI-powered financial plan generation', true),
  ('les_auditor', 'LES Auditor', 'Enable LES Auditor premium tool', true),
  ('pcs_copilot', 'PCS Copilot', 'Enable PCS Copilot premium tool', true),
  ('base_navigator', 'Base Navigator', 'Enable Base Navigator premium tool', true),
  ('tdy_copilot', 'TDY Copilot', 'Enable TDY Copilot premium tool', true),
  ('document_binder', 'Document Binder', 'Enable document binder premium feature', true),
  ('natural_search', 'Natural Search', 'Enable AI-powered natural language search', false),
  ('streak_gamification', 'Streak Gamification', 'Enable daily streak and achievements', true),
  ('spouse_collaboration', 'Spouse Collaboration', 'Enable spouse plan sharing', true),
  ('email_campaigns', 'Email Campaigns', 'Enable automated email sequences', true)
ON CONFLICT (flag_key) DO NOTHING;

-- Insert default system config
INSERT INTO system_config (key, value, category, description, editable) VALUES
  ('maintenance_mode', '{"enabled": false, "message": "System under maintenance"}'::JSONB, 'system', 'Enable maintenance mode', true),
  ('rate_limits', '{"ai_per_day": 20, "tools_per_hour": 100}'::JSONB, 'system', 'API rate limits', true),
  ('ai_quotas', '{"free_plans_per_month": 1, "premium_plans_per_month": 10}'::JSONB, 'features', 'AI generation quotas by tier', true),
  ('free_tier_limits', '{"les_audits_per_month": 1, "calculator_saves": 3}'::JSONB, 'features', 'Free tier limitations', true),
  ('premium_tier_limits', '{"les_audits_per_month": -1, "calculator_saves": -1}'::JSONB, 'features', 'Premium tier limits (-1 = unlimited)', true),
  ('email_settings', '{"from_name": "Garrison Ledger", "reply_to": "support@garrisonledger.com"}'::JSONB, 'email', 'Email sender configuration', true)
ON CONFLICT (key) DO NOTHING;

-- Comments
COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout and A/B testing';
COMMENT ON TABLE system_config IS 'System configuration key-value store';

