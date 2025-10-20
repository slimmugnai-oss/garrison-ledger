-- Remove unused plan/assessment system tables
-- This migration removes tables that are no longer used since the plan/assessment system was deprecated

-- Drop user_plans table (AI plan generation system)
DROP TABLE IF EXISTS user_plans;

-- Drop user_assessments table (new assessment system)
DROP TABLE IF EXISTS user_assessments;

-- Drop plan_cache table (old plan caching system)
DROP TABLE IF EXISTS plan_cache;

-- Drop assessments_v2 table (unknown purpose, appears unused)
DROP TABLE IF EXISTS assessments_v2;

-- Drop old backup tables
DROP TABLE IF EXISTS assessments_old_20251010170109;

-- Clean up any related functions
DROP FUNCTION IF EXISTS update_plan_cache_updated_at();
DROP FUNCTION IF EXISTS assessments_v2_save(jsonb, text);

-- Update any remaining references in the database
-- (This will be handled by the application code updates)