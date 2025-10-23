-- =====================================================================
-- USER PROFILES - STANDARDIZE FIELDS
-- =====================================================================
-- Standardizes on: years_of_service, has_dependents, dependents_count
-- Provides with_dependents alias for backward compatibility
--
-- Migration Date: 2025-01-23
-- Author: Garrison Ledger Team
-- =====================================================================

-- 1) Add the new standardized columns if they don't exist
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS years_of_service INT,
  ADD COLUMN IF NOT EXISTS has_dependents BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS dependents_count INT DEFAULT 0;

-- 2) Backfill from legacy columns if they exist
DO $$
BEGIN
  -- Backfill years_of_service from time_in_service_months
  IF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_profiles' AND column_name='time_in_service_months'
  ) THEN
    -- Convert months to years (floor division)
    UPDATE user_profiles
      SET years_of_service = COALESCE(
        years_of_service,
        FLOOR(COALESCE(time_in_service_months, 0) / 12)
      )
      WHERE years_of_service IS NULL;
    
    RAISE NOTICE 'Backfilled years_of_service from time_in_service_months';
  END IF;

  -- Backfill has_dependents and dependents_count from num_children and marital_status
  IF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_profiles' AND column_name='num_children'
  ) THEN
    UPDATE user_profiles
      SET 
        dependents_count = COALESCE(dependents_count, num_children, 0),
        has_dependents = COALESCE(
          has_dependents,
          (COALESCE(num_children, 0) > 0) OR (marital_status = 'married')
        )
      WHERE has_dependents IS NULL OR dependents_count IS NULL;
    
    RAISE NOTICE 'Backfilled has_dependents and dependents_count from num_children';
  END IF;
END$$;

-- 3) Set defaults for any remaining NULL values
UPDATE user_profiles
  SET 
    years_of_service = COALESCE(years_of_service, 0),
    has_dependents = COALESCE(has_dependents, false),
    dependents_count = COALESCE(dependents_count, 0)
  WHERE years_of_service IS NULL 
     OR has_dependents IS NULL 
     OR dependents_count IS NULL;

-- 4) Add NOT NULL constraints and defaults
ALTER TABLE user_profiles
  ALTER COLUMN years_of_service SET NOT NULL,
  ALTER COLUMN years_of_service SET DEFAULT 0,
  ALTER COLUMN has_dependents SET NOT NULL,
  ALTER COLUMN has_dependents SET DEFAULT false,
  ALTER COLUMN dependents_count SET NOT NULL,
  ALTER COLUMN dependents_count SET DEFAULT 0;

-- 5) Add reasonable constraints
ALTER TABLE user_profiles
  ADD CONSTRAINT IF NOT EXISTS chk_user_profiles_yos_nonneg 
    CHECK (years_of_service >= 0 AND years_of_service <= 50),
  ADD CONSTRAINT IF NOT EXISTS chk_user_profiles_dependents_nonneg 
    CHECK (dependents_count >= 0 AND dependents_count <= 20);

-- 6) Create computed column for backward compatibility (PostgreSQL 12+)
-- This provides the with_dependents alias that LES Auditor and other features expect
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS with_dependents BOOLEAN
  GENERATED ALWAYS AS (has_dependents) STORED;

-- 7) Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_years_of_service 
  ON user_profiles(years_of_service) WHERE years_of_service > 0;
CREATE INDEX IF NOT EXISTS idx_user_profiles_has_dependents 
  ON user_profiles(has_dependents) WHERE has_dependents = true;

-- 8) Add column comments for documentation
COMMENT ON COLUMN user_profiles.years_of_service IS 
  'Years of military service (integer) - used for pay table lookups and TSP calculations';
COMMENT ON COLUMN user_profiles.has_dependents IS 
  'Boolean flag for BAH/COLA with-dependents rate - true if married OR has children';
COMMENT ON COLUMN user_profiles.dependents_count IS 
  'Number of dependents (children) - for future features that scale with count';
COMMENT ON COLUMN user_profiles.with_dependents IS 
  'Computed alias for has_dependents - backward compatibility for LES Auditor and other features';

-- =====================================================================
-- VERIFICATION
-- =====================================================================

DO $$
DECLARE
  total_profiles INTEGER;
  profiles_with_yos INTEGER;
  profiles_with_deps INTEGER;
  avg_yos NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_profiles FROM user_profiles;
  SELECT COUNT(*) INTO profiles_with_yos FROM user_profiles WHERE years_of_service > 0;
  SELECT COUNT(*) INTO profiles_with_deps FROM user_profiles WHERE has_dependents = true;
  SELECT AVG(years_of_service)::NUMERIC(10,1) INTO avg_yos FROM user_profiles WHERE years_of_service > 0;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Profile Field Standardization Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total profiles: %', total_profiles;
  RAISE NOTICE 'Profiles with YOS > 0: % (%.0f%%)', 
    profiles_with_yos, 
    (profiles_with_yos::FLOAT / NULLIF(total_profiles, 0) * 100);
  RAISE NOTICE 'Profiles with dependents: % (%.0f%%)', 
    profiles_with_deps,
    (profiles_with_deps::FLOAT / NULLIF(total_profiles, 0) * 100);
  RAISE NOTICE 'Average YOS (for profiles with YOS > 0): % years', avg_yos;
  RAISE NOTICE '========================================';
END$$;

-- =====================================================================
-- NOTES FOR DEVELOPERS
-- =====================================================================
-- 
-- NEW FIELD USAGE:
-- - years_of_service: Use for pay tables, TSP calculations, career timeline
-- - has_dependents: Use for BAH/COLA rate lookups (boolean with/without dependents)
-- - dependents_count: Use for features that need actual count (schools, childcare)
-- - with_dependents: Computed alias (same as has_dependents) for legacy compatibility
--
-- CAMELCASE API MAPPING:
-- - DB: years_of_service  → API: yearsOfService
-- - DB: has_dependents    → API: hasDependents
-- - DB: dependents_count  → API: dependentsCount
-- - DB: with_dependents   → API: withDependents (read-only)
--
-- LEGACY FIELDS (DO NOT USE IN NEW CODE):
-- - time_in_service_months: Replaced by years_of_service
-- - num_children: Replaced by dependents_count
-- - Legacy code may still reference these; migrate gradually
--
-- =====================================================================

