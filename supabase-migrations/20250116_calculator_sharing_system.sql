-- ============================================
-- CALCULATOR SHARING SYSTEM
-- Enables users to share calculator results via unique links
-- Created: 2025-01-16
-- ============================================

-- Shared Calculations Table
CREATE TABLE IF NOT EXISTS shared_calculations (
  id TEXT PRIMARY KEY DEFAULT ('calc_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16)),
  user_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  data JSONB NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shared_calculations_user_id ON shared_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_calculations_tool ON shared_calculations(tool);
CREATE INDEX IF NOT EXISTS idx_shared_calculations_created_at ON shared_calculations(created_at DESC);

-- RLS Policies
ALTER TABLE shared_calculations ENABLE ROW LEVEL SECURITY;

-- Users can create their own shares
CREATE POLICY "Users can create their own shared calculations"
  ON shared_calculations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Anyone can view shared calculations (public)
CREATE POLICY "Anyone can view shared calculations"
  ON shared_calculations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can update their own shares (increment view count)
CREATE POLICY "Users can update their own shared calculations"
  ON shared_calculations FOR UPDATE
  TO authenticated
  USING (true);

-- Users can delete their own shares
CREATE POLICY "Users can delete their own shared calculations"
  ON shared_calculations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_share_view_count(share_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_calculations
  SET 
    view_count = view_count + 1,
    updated_at = NOW()
  WHERE id = share_id;
END;
$$;

-- Function to get user's shared calculations
CREATE OR REPLACE FUNCTION get_user_shared_calculations(p_user_id TEXT)
RETURNS TABLE (
  id TEXT,
  tool TEXT,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.tool,
    sc.view_count,
    sc.created_at,
    sc.expires_at
  FROM shared_calculations sc
  WHERE sc.user_id = p_user_id
  ORDER BY sc.created_at DESC;
END;
$$;

-- Cleanup function for expired shares (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM shared_calculations
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON TABLE shared_calculations IS 'Stores shareable calculator results with unique links';
COMMENT ON FUNCTION increment_share_view_count IS 'Increments view count for a shared calculation';
COMMENT ON FUNCTION get_user_shared_calculations IS 'Returns all shared calculations for a user';
COMMENT ON FUNCTION cleanup_expired_shares IS 'Deletes expired shared calculations (call via cron)';

