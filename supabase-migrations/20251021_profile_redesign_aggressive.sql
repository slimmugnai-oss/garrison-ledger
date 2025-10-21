-- PROFILE SYSTEM REDESIGN - AGGRESSIVE CONSOLIDATION
-- Created: 2025-10-21
-- Purpose: Add computed fields, remove 20 unused fields, streamline profile
-- Priority: MAJOR REFACTOR - Test thoroughly before applying to production

-- =============================================================================
-- BACKUP RECOMMENDATION
-- =============================================================================
-- BEFORE running this migration:
-- 1. Create database backup in Supabase Dashboard
-- 2. Export user_profiles table as CSV
-- 3. Test on development/staging environment first
-- =============================================================================

-- =============================================================================
-- 1. ADD COMPUTED FIELDS (Auto-derived from user inputs)
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
-- 2. BACKFILL COMPUTED FIELDS FOR EXISTING PROFILES
-- =============================================================================

-- Derive paygrade from rank (common patterns)
UPDATE user_profiles SET paygrade = CASE
  -- Pattern matching for common ranks
  WHEN rank LIKE '%Private%PV1%' OR rank LIKE '%SR%' OR rank LIKE '%AB%' OR rank LIKE '%Spc1%' THEN 'E01'
  WHEN rank LIKE '%PV2%' OR rank LIKE '%SA%' OR rank LIKE '%Amn%' OR rank LIKE '%PFC%Navy%' OR rank LIKE '%Spc2%' THEN 'E02'
  WHEN rank LIKE '%PFC%' OR rank LIKE '%SN%' OR rank LIKE '%A1C%' OR rank LIKE '%LCpl%' OR rank LIKE '%Spc3%' THEN 'E03'
  WHEN rank LIKE '%SPC%' OR rank LIKE '%CPL%' OR rank LIKE '%PO3%' OR rank LIKE '%SrA%' OR rank LIKE '%Cpl%' OR rank LIKE '%Spc4%' THEN 'E04'
  WHEN rank LIKE '%SGT%' OR rank LIKE '%PO2%' OR rank LIKE '%SSgt%Air%' OR rank LIKE '%Sgt%Marine%' OR rank LIKE '%Sgt%Space%' THEN 'E05'
  WHEN rank LIKE '%SSG%' OR rank LIKE '%PO1%' OR rank LIKE '%TSgt%' THEN 'E06'
  WHEN rank LIKE '%SFC%' OR rank LIKE '%CPO%' OR rank LIKE '%MSgt%' OR rank LIKE '%GySgt%' THEN 'E07'
  WHEN rank LIKE '%MSG%' OR rank LIKE '%1SG%' OR rank LIKE '%SCPO%' OR rank LIKE '%SMSgt%' THEN 'E08'
  WHEN rank LIKE '%SGM%' OR rank LIKE '%CSM%' OR rank LIKE '%MCPO%' OR rank LIKE '%CMSgt%' THEN 'E09'
  
  -- Warrant Officers
  WHEN rank LIKE '%WO1%' OR rank LIKE '%WO-1%' OR rank LIKE '%Warrant Officer 1%' THEN 'W01'
  WHEN rank LIKE '%CW2%' OR rank LIKE '%CWO-2%' OR rank LIKE '%CWO2%' THEN 'W02'
  WHEN rank LIKE '%CW3%' OR rank LIKE '%CWO-3%' OR rank LIKE '%CWO3%' THEN 'W03'
  WHEN rank LIKE '%CW4%' OR rank LIKE '%CWO-4%' OR rank LIKE '%CWO4%' THEN 'W04'
  WHEN rank LIKE '%CW5%' OR rank LIKE '%CWO-5%' OR rank LIKE '%CWO5%' THEN 'W05'
  
  -- Officers
  WHEN rank LIKE '%2LT%' OR rank LIKE '%ENS%' OR rank LIKE '%2d Lt%' OR rank LIKE '%2ndLt%' THEN 'O01'
  WHEN rank LIKE '%1LT%' OR rank LIKE '%LTJG%' OR rank LIKE '%1st Lt%' OR rank LIKE '%1stLt%' THEN 'O02'
  WHEN rank LIKE '%CPT%' OR rank LIKE '%LT%' OR rank LIKE '%Capt%' THEN 'O03'
  WHEN rank LIKE '%MAJ%' OR rank LIKE '%LCDR%' OR rank LIKE '%Maj%' THEN 'O04'
  WHEN rank LIKE '%LTC%' OR rank LIKE '%Lt Col%' OR rank LIKE '%LtCol%' OR rank LIKE '%CDR%' THEN 'O05'
  WHEN rank LIKE '%COL%' OR rank LIKE '%Col%' OR rank LIKE '%CAPT%Navy%' THEN 'O06'
  WHEN rank LIKE '%BG%' OR rank LIKE '%Brig Gen%' OR rank LIKE '%BGen%' OR rank LIKE '%RDML%' THEN 'O07'
  WHEN rank LIKE '%MG%' OR rank LIKE '%Maj Gen%' OR rank LIKE '%MajGen%' OR rank LIKE '%RADM%' THEN 'O08'
  WHEN rank LIKE '%LTG%' OR rank LIKE '%Lt Gen%' OR rank LIKE '%LtGen%' OR rank LIKE '%VADM%' THEN 'O09'
  WHEN rank LIKE '%GEN%' OR rank LIKE '%Gen%Air%' OR rank LIKE '%ADM%' THEN 'O10'
  
  ELSE NULL
END
WHERE paygrade IS NULL AND rank IS NOT NULL;

-- Derive rank_category from paygrade
UPDATE user_profiles SET rank_category = CASE
  WHEN paygrade LIKE 'E%' THEN 'enlisted'
  WHEN paygrade LIKE 'W%' THEN 'warrant'
  WHEN paygrade LIKE 'O%' THEN 'officer'
  ELSE NULL
END
WHERE rank_category IS NULL AND paygrade IS NOT NULL;

-- Derive mha_code from current_base (common bases only - rest will be NULL)
UPDATE user_profiles SET mha_code = CASE
  WHEN current_base LIKE '%Fort Liberty%' OR current_base LIKE '%Fort Bragg%' THEN 'NC090'
  WHEN current_base LIKE '%Fort Cavazos%' OR current_base LIKE '%Fort Hood%' THEN 'TX191'
  WHEN current_base LIKE '%Fort Moore%' OR current_base LIKE '%Fort Benning%' THEN 'GA031'
  WHEN current_base LIKE '%Lewis-McChord%' OR current_base LIKE '%JBLM%' THEN 'WA053'
  WHEN current_base LIKE '%Fort Campbell%' THEN 'KY015'
  WHEN current_base LIKE '%West Point%' THEN 'NY349'
  WHEN current_base LIKE '%Annapolis%' OR current_base LIKE '%Naval Academy%' THEN 'MD015'
  WHEN current_base LIKE '%Colorado Springs%' OR current_base LIKE '%Air Force Academy%' THEN 'CO024'
  WHEN current_base LIKE '%Norfolk%' THEN 'VA105'
  WHEN current_base LIKE '%San Diego%' AND current_base LIKE '%Naval%' THEN 'CA624'
  WHEN current_base LIKE '%Pendleton%' THEN 'CA625'
  WHEN current_base LIKE '%Quantico%' THEN 'VA109'
  WHEN current_base LIKE '%San Antonio%' AND current_base LIKE '%Joint%' THEN 'TX256'
  -- Add state fallback
  WHEN current_base LIKE '%NC%' OR current_base LIKE '%North Carolina%' THEN 'NC176'
  WHEN current_base LIKE '%TX%' OR current_base LIKE '%Texas%' THEN 'TX270'
  WHEN current_base LIKE '%CA%' OR current_base LIKE '%California%' THEN 'CA018'
  WHEN current_base LIKE '%VA%' OR current_base LIKE '%Virginia%' THEN 'VA295'
  WHEN current_base LIKE '%GA%' OR current_base LIKE '%Georgia%' THEN 'GA071'
  WHEN current_base LIKE '%WA%' OR current_base LIKE '%Washington%' THEN 'WA306'
  WHEN current_base LIKE '%NY%' OR current_base LIKE '%New York%' THEN 'NY215'
  WHEN current_base LIKE '%FL%' OR current_base LIKE '%Florida%' THEN 'FL056'
  WHEN current_base LIKE '%KY%' OR current_base LIKE '%Kentucky%' THEN 'KY106'
  WHEN current_base LIKE '%CO%' OR current_base LIKE '%Colorado%' THEN 'CO045'
  ELSE NULL
END
WHERE mha_code IS NULL AND current_base IS NOT NULL;

-- Derive duty_location_type from mha_code
UPDATE user_profiles SET duty_location_type = CASE
  WHEN mha_code LIKE 'ZZ%' THEN 'OVERSEAS'
  WHEN mha_code LIKE 'AK%' OR mha_code LIKE 'HI%' THEN 'OCONUS'
  WHEN mha_code IS NOT NULL THEN 'CONUS'
  ELSE NULL
END
WHERE duty_location_type IS NULL AND mha_code IS NOT NULL;

-- =============================================================================
-- 3. REMOVE UNUSED FIELDS (20 fields total)
-- =============================================================================

-- IMPORTANT: These fields are confirmed NOT used by any tool/calculator
-- If you need these later, restore from backup

-- Military fields not used
ALTER TABLE user_profiles DROP COLUMN IF EXISTS clearance_level;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS mos_afsc_rate;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS deployment_status;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS last_deployment_date;

-- Spouse fields not used (keep only marital_status and spouse_military)
ALTER TABLE user_profiles DROP COLUMN IF EXISTS spouse_age;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS spouse_career_field;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS spouse_service_status;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS spouse_employed;

-- Children details (keep only num_children count)
ALTER TABLE user_profiles DROP COLUMN IF EXISTS children;

-- Education/career fields not used
ALTER TABLE user_profiles DROP COLUMN IF EXISTS education_level;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS education_goals;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS career_interests;

-- Financial fields not used by calculations
ALTER TABLE user_profiles DROP COLUMN IF EXISTS emergency_fund_range;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS tsp_allocation;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS monthly_income_range;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS bah_amount;

-- Preference fields not implemented
ALTER TABLE user_profiles DROP COLUMN IF EXISTS content_difficulty_pref;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS timezone;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS urgency_level;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS communication_pref;

-- =============================================================================
-- 4. VERIFICATION
-- =============================================================================

DO $$
DECLARE
  total_profiles INTEGER;
  profiles_with_paygrade INTEGER;
  profiles_with_mha INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_profiles FROM user_profiles;
  SELECT COUNT(*) INTO profiles_with_paygrade FROM user_profiles WHERE paygrade IS NOT NULL;
  SELECT COUNT(*) INTO profiles_with_mha FROM user_profiles WHERE mha_code IS NOT NULL;
  
  RAISE NOTICE 'Profile redesign migration complete';
  RAISE NOTICE 'Total profiles: %', total_profiles;
  RAISE NOTICE 'Profiles with paygrade: % (%.0f%%)', profiles_with_paygrade, (profiles_with_paygrade::float / NULLIF(total_profiles, 0) * 100);
  RAISE NOTICE 'Profiles with MHA code: % (%.0f%%)', profiles_with_mha, (profiles_with_mha::float / NULLIF(total_profiles, 0) * 100);
  
  IF profiles_with_paygrade < total_profiles THEN
    RAISE NOTICE 'Some profiles need manual paygrade assignment (complex rank titles)';
  END IF;
  
  IF profiles_with_mha < total_profiles THEN
    RAISE NOTICE 'Some profiles need manual MHA assignment (unmapped bases)';
  END IF;
END $$;

-- =============================================================================
-- MIGRATION COMPLETE - PROFILE SYSTEM STREAMLINED
-- =============================================================================
-- Added: 4 computed fields
-- Removed: 20 unused fields
-- Result: Cleaner schema, better tool integration
-- =============================================================================

