-- =====================================================
-- SPOUSE COLLABORATION SYSTEM
-- =====================================================
-- Purpose: Enable real-time collaboration between military couples
-- Created: 2025-01-17
-- Features:
--   - Spouse pairing/linking
--   - Shared calculator results
--   - Joint financial dashboard
--   - Real-time sync
--   - Privacy controls
-- =====================================================

-- Table: spouse_connections
-- Links two users as spouses for collaboration
CREATE TABLE IF NOT EXISTS spouse_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 TEXT NOT NULL,
  user_id_2 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'declined', 'disconnected'
  invited_by TEXT NOT NULL, -- Which user sent the invite
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connected_at TIMESTAMP WITH TIME ZONE,
  connection_code TEXT UNIQUE, -- 6-digit code for pairing
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique pairing (order doesn't matter)
  CONSTRAINT unique_spouse_pair UNIQUE (user_id_1, user_id_2),
  CHECK (user_id_1 != user_id_2)
);

-- Table: shared_calculator_data
-- Calculator results shared between spouses
CREATE TABLE IF NOT EXISTS shared_calculator_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES spouse_connections(id) ON DELETE CASCADE,
  shared_by TEXT NOT NULL, -- User who shared
  calculator_name TEXT NOT NULL,
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  notes TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: collaboration_settings
-- Privacy and sharing preferences
CREATE TABLE IF NOT EXISTS collaboration_settings (
  user_id TEXT PRIMARY KEY,
  auto_share_calculators BOOLEAN DEFAULT FALSE, -- Auto-share all calculator results
  share_preferences JSONB DEFAULT '{"tsp": true, "sdp": true, "pcs": true, "house": true, "savings": true, "career": true}',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spouse_connections_user1 ON spouse_connections(user_id_1);
CREATE INDEX IF NOT EXISTS idx_spouse_connections_user2 ON spouse_connections(user_id_2);
CREATE INDEX IF NOT EXISTS idx_spouse_connections_code ON spouse_connections(connection_code);
CREATE INDEX IF NOT EXISTS idx_spouse_connections_status ON spouse_connections(status);
CREATE INDEX IF NOT EXISTS idx_shared_data_connection ON shared_calculator_data(connection_id);
CREATE INDEX IF NOT EXISTS idx_shared_data_created ON shared_calculator_data(created_at DESC);

-- RLS Policies
ALTER TABLE spouse_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_calculator_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_settings ENABLE ROW LEVEL SECURITY;

-- Users can see their own connections
CREATE POLICY "Users view own connections"
  ON spouse_connections FOR SELECT
  USING (
    user_id_1 = current_setting('request.jwt.claims', true)::json->>'sub' OR
    user_id_2 = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can create connections
CREATE POLICY "Users create connections"
  ON spouse_connections FOR INSERT
  WITH CHECK (
    invited_by = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can update their own connections
CREATE POLICY "Users update own connections"
  ON spouse_connections FOR UPDATE
  USING (
    user_id_1 = current_setting('request.jwt.claims', true)::json->>'sub' OR
    user_id_2 = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can view shared data in their connections
CREATE POLICY "Users view shared data"
  ON shared_calculator_data FOR SELECT
  USING (
    connection_id IN (
      SELECT id FROM spouse_connections
      WHERE user_id_1 = current_setting('request.jwt.claims', true)::json->>'sub'
         OR user_id_2 = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Users can share their own data
CREATE POLICY "Users share own data"
  ON shared_calculator_data FOR INSERT
  WITH CHECK (
    shared_by = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can update/delete their own shared data
CREATE POLICY "Users update own shared data"
  ON shared_calculator_data FOR UPDATE
  USING (shared_by = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users delete own shared data"
  ON shared_calculator_data FOR DELETE
  USING (shared_by = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users manage their own settings
CREATE POLICY "Users view own settings"
  ON collaboration_settings FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users update own settings"
  ON collaboration_settings FOR ALL
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role full access
CREATE POLICY "Service role full access spouse_connections"
  ON spouse_connections FOR ALL
  USING (current_user = 'service_role');

CREATE POLICY "Service role full access shared_data"
  ON shared_calculator_data FOR ALL
  USING (current_user = 'service_role');

CREATE POLICY "Service role full access settings"
  ON collaboration_settings FOR ALL
  USING (current_user = 'service_role');

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: generate_connection_code
-- Generates a unique 6-digit code for spouse pairing
CREATE OR REPLACE FUNCTION generate_connection_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-digit code
    code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if code already exists and is not expired
    SELECT EXISTS(
      SELECT 1 FROM spouse_connections
      WHERE connection_code = code
        AND expires_at > NOW()
    ) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Function: get_spouse_connection
-- Gets the active connection for a user
CREATE OR REPLACE FUNCTION get_spouse_connection(p_user_id TEXT)
RETURNS TABLE (
  connection_id UUID,
  spouse_id TEXT,
  status TEXT,
  connected_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id as connection_id,
    CASE 
      WHEN user_id_1 = p_user_id THEN user_id_2
      ELSE user_id_1
    END as spouse_id,
    spouse_connections.status,
    spouse_connections.connected_at
  FROM spouse_connections
  WHERE (user_id_1 = p_user_id OR user_id_2 = p_user_id)
    AND status = 'active'
  LIMIT 1;
END;
$$;

-- Function: accept_spouse_invitation
-- Accepts a pending spouse connection
CREATE OR REPLACE FUNCTION accept_spouse_invitation(
  p_connection_id UUID,
  p_user_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE spouse_connections
  SET 
    status = 'active',
    connected_at = NOW(),
    updated_at = NOW()
  WHERE id = p_connection_id
    AND (user_id_1 = p_user_id OR user_id_2 = p_user_id)
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

-- Function: get_shared_calculators
-- Gets all calculator data shared in a connection
CREATE OR REPLACE FUNCTION get_shared_calculators(p_connection_id UUID)
RETURNS TABLE (
  id UUID,
  shared_by TEXT,
  calculator_name TEXT,
  inputs JSONB,
  outputs JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    shared_calculator_data.id,
    shared_calculator_data.shared_by,
    shared_calculator_data.calculator_name,
    shared_calculator_data.inputs,
    shared_calculator_data.outputs,
    shared_calculator_data.notes,
    shared_calculator_data.created_at
  FROM shared_calculator_data
  WHERE connection_id = p_connection_id
    AND is_visible = TRUE
  ORDER BY created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_connection_code TO service_role;
GRANT EXECUTE ON FUNCTION get_spouse_connection TO service_role;
GRANT EXECUTE ON FUNCTION accept_spouse_invitation TO service_role;
GRANT EXECUTE ON FUNCTION get_shared_calculators TO service_role;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE spouse_connections IS 'Links two users as spouses for financial collaboration';
COMMENT ON TABLE shared_calculator_data IS 'Calculator results shared between connected spouses';
COMMENT ON TABLE collaboration_settings IS 'User preferences for spouse collaboration';
COMMENT ON FUNCTION generate_connection_code IS 'Generates unique 6-digit pairing code';
COMMENT ON FUNCTION get_spouse_connection IS 'Returns active spouse connection for a user';
COMMENT ON FUNCTION accept_spouse_invitation IS 'Accepts a pending spouse invitation';
COMMENT ON FUNCTION get_shared_calculators IS 'Returns all shared calculator data for a connection';

