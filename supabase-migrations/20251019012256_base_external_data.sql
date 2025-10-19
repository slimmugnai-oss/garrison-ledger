-- BASE EXTERNAL DATA CACHE
-- Created: 2025-10-19
-- Purpose: Cache real external data (schools, weather, housing) for military bases

-- External Data Cache Table
CREATE TABLE IF NOT EXISTS base_external_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL, -- schools, weather, housing data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_base_external_data_base_id ON base_external_data_cache(base_id);
CREATE INDEX IF NOT EXISTS idx_base_external_data_created_at ON base_external_data_cache(created_at);

-- Comments
COMMENT ON TABLE base_external_data_cache IS 'Cached external data from GreatSchools, OpenWeatherMap, etc (30-day cache)';
COMMENT ON COLUMN base_external_data_cache.base_id IS 'Base ID from bases.ts';
COMMENT ON COLUMN base_external_data_cache.data IS 'External API data: schools, weather, housing';
COMMENT ON COLUMN base_external_data_cache.created_at IS 'When data was fetched (30-day cache expiry)';

-- No RLS needed - this is public data available to all users
ALTER TABLE base_external_data_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for external data" ON base_external_data_cache
  FOR SELECT
  USING (true);

-- Only admins/system can write
CREATE POLICY "System can insert external data" ON base_external_data_cache
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update external data" ON base_external_data_cache
  FOR UPDATE
  USING (true);

