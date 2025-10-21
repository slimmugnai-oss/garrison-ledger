-- =====================================================================
-- ADD HAS_DEPENDENTS FIELD TO USER PROFILES
-- Created: 2025-10-20
-- Purpose: Store dependency status for BAH auto-population
-- =====================================================================

-- Add has_dependents column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS has_dependents BOOLEAN DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN user_profiles.has_dependents IS 
  'Whether user has dependents - affects BAH rate (with deps = higher rate)';

-- Create index for BAH lookup queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_bah_lookup 
  ON user_profiles(rank, has_dependents) 
  WHERE rank IS NOT NULL AND has_dependents IS NOT NULL;

