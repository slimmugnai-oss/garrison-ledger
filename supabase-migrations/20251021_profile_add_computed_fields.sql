-- PROFILE REDESIGN - PART 1: ADD COMPUTED FIELDS
-- Created: 2025-10-21
-- Purpose: Add paygrade, mha_code, rank_category, duty_location_type
-- Priority: SAFE - Only adds columns, doesn't remove anything
-- Next: After testing, run part 2 to remove unused fields

-- =============================================================================
-- 1. ADD COMPUTED FIELDS
-- =============================================================================

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS paygrade TEXT,              -- E01-E09, O01-O10, W01-W05
ADD COLUMN IF NOT EXISTS rank_category TEXT,         -- enlisted, warrant, officer
ADD COLUMN IF NOT EXISTS mha_code TEXT,             -- NC090, TX191, NY349, etc.
ADD COLUMN IF NOT EXISTS duty_location_type TEXT;    -- CONUS, OCONUS, OVERSEAS

-- Add comments
COMMENT ON COLUMN user_profiles.paygrade IS 'Standardized paygrade code (E01-E09, O01-O10, W01-W05) - auto-derived from rank';
COMMENT ON COLUMN user_profiles.rank_category IS 'Rank category (enlisted, warrant, officer) - for BAS calculations';
COMMENT ON COLUMN user_profiles.mha_code IS 'Military Housing Area code for BAH lookups - auto-derived from current_base';
COMMENT ON COLUMN user_profiles.duty_location_type IS 'Location type (CONUS, OCONUS, OVERSEAS) - for COLA eligibility';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_paygrade ON user_profiles(paygrade) WHERE paygrade IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_mha_code ON user_profiles(mha_code) WHERE mha_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_rank_category ON user_profiles(rank_category) WHERE rank_category IS NOT NULL;

-- =============================================================================
-- 2. BACKFILL EXISTING PROFILES
-- =============================================================================

-- Derive paygrade from rank
UPDATE user_profiles SET paygrade = CASE
  WHEN rank LIKE '%Private%Pvt%' OR rank LIKE '%Private (PV1)%' THEN 'E01'
  WHEN rank LIKE '%Sergeant (SGT)%' THEN 'E05'
  WHEN rank LIKE '%Staff Sergeant%' THEN 'E06'
  WHEN rank LIKE '%Captain%CPT%' THEN 'O03'
  -- Will backfill common ones, rest will be NULL and filled on next profile save
  ELSE NULL
END
WHERE paygrade IS NULL AND rank IS NOT NULL;

-- Derive rank_category
UPDATE user_profiles SET rank_category = CASE
  WHEN paygrade LIKE 'E%' THEN 'enlisted'
  WHEN paygrade LIKE 'W%' THEN 'warrant'
  WHEN paygrade LIKE 'O%' THEN 'officer'
  ELSE NULL
END
WHERE rank_category IS NULL AND paygrade IS NOT NULL;

-- Derive mha_code from current_base (common ones)
UPDATE user_profiles SET mha_code = CASE
  WHEN current_base LIKE '%West Point%' THEN 'NY349'
  WHEN current_base LIKE '%Fort Liberty%' OR current_base LIKE '%Fort Bragg%' THEN 'NC090'
  WHEN current_base LIKE '%Fort Cavazos%' OR current_base LIKE '%Fort Hood%' THEN 'TX191'
  -- More will be added via profile form auto-derivation
  ELSE NULL
END
WHERE mha_code IS NULL AND current_base IS NOT NULL;

-- Derive duty_location_type
UPDATE user_profiles SET duty_location_type = CASE
  WHEN mha_code LIKE 'ZZ%' THEN 'OVERSEAS'
  WHEN mha_code LIKE 'AK%' OR mha_code LIKE 'HI%' THEN 'OCONUS'
  WHEN mha_code IS NOT NULL THEN 'CONUS'
  ELSE NULL
END
WHERE duty_location_type IS NULL;

-- =============================================================================
-- 3. VERIFICATION
-- =============================================================================

DO $$
DECLARE
  total INTEGER;
  with_paygrade INTEGER;
  with_mha INTEGER;
BEGIN
  SELECT COUNT(*) INTO total FROM user_profiles;
  SELECT COUNT(*) INTO with_paygrade FROM user_profiles WHERE paygrade IS NOT NULL;
  SELECT COUNT(*) INTO with_mha FROM user_profiles WHERE mha_code IS NOT NULL;
  
  RAISE NOTICE 'Computed fields added successfully';
  RAISE NOTICE 'Total profiles: %', total;
  RAISE NOTICE 'With paygrade: % (%.0f%%)', with_paygrade, (with_paygrade::float / NULLIF(total, 0) * 100);
  RAISE NOTICE 'With MHA code: % (%.0f%%)', with_mha, (with_mha::float / NULLIF(total, 0) * 100);
END $$;

-- =============================================================================
-- PART 1 COMPLETE - COMPUTED FIELDS ADDED
-- Next: Test tools with new fields, then run part 2 to remove unused fields
-- =============================================================================

