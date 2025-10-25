-- Assignment Planner Database Migration
-- Creates table for storing base comparison data

CREATE TABLE pcs_assignment_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  comparison_name TEXT NOT NULL,
  bases JSONB NOT NULL, -- Array of base codes with metadata
  analysis_data JSONB, -- Calculated analysis results
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE pcs_assignment_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assignment comparisons"
  ON pcs_assignment_comparisons FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own assignment comparisons"
  ON pcs_assignment_comparisons FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own assignment comparisons"
  ON pcs_assignment_comparisons FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own assignment comparisons"
  ON pcs_assignment_comparisons FOR DELETE
  USING (auth.uid()::text = user_id);

-- Create index for performance
CREATE INDEX idx_pcs_assignment_comparisons_user_id ON pcs_assignment_comparisons(user_id);
CREATE INDEX idx_pcs_assignment_comparisons_created_at ON pcs_assignment_comparisons(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_pcs_assignment_comparisons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pcs_assignment_comparisons_updated_at
  BEFORE UPDATE ON pcs_assignment_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION update_pcs_assignment_comparisons_updated_at();
