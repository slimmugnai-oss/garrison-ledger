-- =====================================================================
-- ADD MISSING PROFILE FIELDS
-- Created: 2025-10-21
-- Purpose: Fix critical schema/UI mismatch - add 8 fields used in UI
-- Issue: Profile audit revealed UI uses fields not in database schema
-- Impact: Critical - data loss (users fill fields but data not saved)
-- =====================================================================

-- Add missing fields that exist in UI but not in schema
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS years_of_service INT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS service_status TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spouse_service_status TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spouse_age INT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS birth_year INT;

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_service_status ON user_profiles(service_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_age ON user_profiles(age) WHERE age IS NOT NULL;

-- Add column comments for documentation
COMMENT ON COLUMN user_profiles.age IS 'User age for retirement planning and personalization';
COMMENT ON COLUMN user_profiles.gender IS 'User gender (male, female, prefer not to say)';
COMMENT ON COLUMN user_profiles.years_of_service IS 'Total years of military service (redundant with time_in_service_months but used in UI)';
COMMENT ON COLUMN user_profiles.service_status IS 'Military status: active_duty, reserve, national_guard, retired, veteran, separating, military_spouse, dod_civilian';
COMMENT ON COLUMN user_profiles.spouse_service_status IS 'Spouse military status: active_duty, reserve, national_guard, retired, veteran (if married to military)';
COMMENT ON COLUMN user_profiles.spouse_age IS 'Spouse age if married';
COMMENT ON COLUMN user_profiles.education_level IS 'Highest education level: high school, some college, associate, bachelor, master, doctorate';
COMMENT ON COLUMN user_profiles.birth_year IS 'Birth year (alternative to age for year-based calculations)';

-- Validation notes:
-- - age and birth_year are somewhat redundant but both supported
-- - years_of_service and time_in_service_months are redundant (years_of_service * 12 = time_in_service_months)
-- - service_status is the primary military status field
-- - spouse_service_status only populated if marital_status='married' and spouse is/was military

-- These fields were present in:
-- 1. UI forms (both quick-start and full setup)
-- 2. database.types.ts (generated types)  
-- 3. API route type definitions
-- BUT were missing from the actual database schema, causing silent data loss

-- Post-migration verification:
-- 1. Verify columns exist: SELECT column_name FROM information_schema.columns WHERE table_name='user_profiles';
-- 2. Test profile save with all 8 fields
-- 3. Verify data persists after save
-- 4. Update SYSTEM_STATUS.md to mark issue resolved

