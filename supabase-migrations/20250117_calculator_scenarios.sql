-- ============================================
-- CALCULATOR SCENARIOS (COMPARISON MODE)
-- Enables users to save and compare multiple calculation scenarios
-- Created: 2025-01-17
-- ============================================

-- Calculator Scenarios Table
CREATE TABLE IF NOT EXISTS calculator_scenarios (
  id TEXT PRIMARY KEY DEFAULT ('scenario_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16)),
  user_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  name TEXT NOT NULL,
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_calculator_scenarios_user_tool ON calculator_scenarios(user_id, tool);
CREATE INDEX IF NOT EXISTS idx_calculator_scenarios_created_at ON calculator_scenarios(created_at DESC);

-- RLS Policies
ALTER TABLE calculator_scenarios ENABLE ROW LEVEL SECURITY;

-- Users can view their own scenarios
CREATE POLICY "Users can view their own scenarios"
  ON calculator_scenarios FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Users can create their own scenarios
CREATE POLICY "Users can create their own scenarios"
  ON calculator_scenarios FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own scenarios
CREATE POLICY "Users can update their own scenarios"
  ON calculator_scenarios FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Users can delete their own scenarios
CREATE POLICY "Users can delete their own scenarios"
  ON calculator_scenarios FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Function to get user's scenarios for a specific tool
CREATE OR REPLACE FUNCTION get_user_scenarios(p_user_id TEXT, p_tool TEXT)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  input JSONB,
  output JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.name,
    cs.input,
    cs.output,
    cs.created_at
  FROM calculator_scenarios cs
  WHERE cs.user_id = p_user_id
    AND cs.tool = p_tool
  ORDER BY cs.created_at DESC;
END;
$$;

-- Function to count user's scenarios for a tool
CREATE OR REPLACE FUNCTION count_user_scenarios(p_user_id TEXT, p_tool TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  scenario_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO scenario_count
  FROM calculator_scenarios
  WHERE user_id = p_user_id
    AND tool = p_tool;
  
  RETURN scenario_count;
END;
$$;

COMMENT ON TABLE calculator_scenarios IS 'Stores saved calculation scenarios for comparison mode';
COMMENT ON FUNCTION get_user_scenarios IS 'Returns all scenarios for a user and tool';
COMMENT ON FUNCTION count_user_scenarios IS 'Counts scenarios for a user and tool';

