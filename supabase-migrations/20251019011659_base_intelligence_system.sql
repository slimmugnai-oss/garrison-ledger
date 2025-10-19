-- BASE INTELLIGENCE SYSTEM
-- Created: 2025-10-19
-- Purpose: AI-powered base recommendations and caching

-- Base Recommendations Cache Table
CREATE TABLE IF NOT EXISTS base_recommendations_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE base_recommendations_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" ON base_recommendations_cache
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own recommendations" ON base_recommendations_cache
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own recommendations" ON base_recommendations_cache
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_base_recs_user_id ON base_recommendations_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_base_recs_created_at ON base_recommendations_cache(created_at);

-- Comments
COMMENT ON TABLE base_recommendations_cache IS 'Cached AI-generated base recommendations for users';
COMMENT ON COLUMN base_recommendations_cache.user_id IS 'Clerk user ID';
COMMENT ON COLUMN base_recommendations_cache.recommendations IS 'Array of recommended bases with scores and reasoning';
COMMENT ON COLUMN base_recommendations_cache.created_at IS 'When recommendations were generated (7-day cache)';

-- Base Analytics Table (for tracking views and interactions)
CREATE TABLE IF NOT EXISTS base_intelligence_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  base_id TEXT NOT NULL,
  base_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'view', 'click', 'compare', 'recommendation_click'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Analytics
ALTER TABLE base_intelligence_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own analytics" ON base_intelligence_analytics
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own analytics" ON base_intelligence_analytics
  FOR SELECT
  USING (auth.uid()::text = user_id OR user_id IS NULL);

-- Indexes for Analytics
CREATE INDEX IF NOT EXISTS idx_base_analytics_user_id ON base_intelligence_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_base_analytics_base_id ON base_intelligence_analytics(base_id);
CREATE INDEX IF NOT EXISTS idx_base_analytics_event_type ON base_intelligence_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_base_analytics_created_at ON base_intelligence_analytics(created_at);

-- Comments
COMMENT ON TABLE base_intelligence_analytics IS 'Analytics for base guide interactions';
COMMENT ON COLUMN base_intelligence_analytics.event_type IS 'Type of interaction: view, click, compare, recommendation_click';
COMMENT ON COLUMN base_intelligence_analytics.metadata IS 'Additional context (source, filters, etc)';

