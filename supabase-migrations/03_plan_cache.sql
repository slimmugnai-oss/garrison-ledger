-- ==========================================
-- PLAN CACHE TABLE - Store AI-enhanced plans
-- ==========================================
-- Cache AI reasoning so we don't regenerate on every page load
-- Invalidate when user updates assessment

CREATE TABLE IF NOT EXISTS plan_cache (
  user_id TEXT PRIMARY KEY,
  plan_data JSONB NOT NULL, -- Complete plan with AI reasoning
  assessment_hash TEXT NOT NULL, -- Hash of assessment answers (for invalidation)
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'), -- Cache for 7 days
  ai_enhanced BOOLEAN DEFAULT false,
  ai_model TEXT, -- Track which AI model was used
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plan_cache_expires_at ON plan_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_plan_cache_generated_at ON plan_cache(generated_at DESC);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_plan_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plan_cache_updated_at
  BEFORE UPDATE ON plan_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_cache_updated_at();

-- RLS
ALTER TABLE plan_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON plan_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup old cache entries (runs daily via pg_cron if available)
-- DELETE FROM plan_cache WHERE expires_at < NOW();

COMMENT ON TABLE plan_cache IS 'Cached AI-enhanced plans to avoid regenerating on every page load';
COMMENT ON COLUMN plan_cache.assessment_hash IS 'MD5 hash of assessment answers - invalidate cache when this changes';
COMMENT ON COLUMN plan_cache.expires_at IS 'Auto-expires after 7 days to ensure freshness';

