-- Remove unused plan/assessment system tables
-- This migration removes tables that are no longer used since the plan/assessment system was deprecated

-- First, drop dependent tables that reference user_plans
DROP TABLE IF EXISTS plan_analytics CASCADE;
DROP TABLE IF EXISTS shared_plans CASCADE;

-- Now drop the main tables
DROP TABLE IF EXISTS user_plans CASCADE;
DROP TABLE IF EXISTS user_assessments CASCADE;
DROP TABLE IF EXISTS plan_cache CASCADE;
DROP TABLE IF EXISTS assessments_v2 CASCADE;

-- Drop old backup tables
DROP TABLE IF EXISTS assessments_old_20251010170109 CASCADE;

-- Clean up any related functions
DROP FUNCTION IF EXISTS update_plan_cache_updated_at();
DROP FUNCTION IF EXISTS assessments_v2_save(jsonb, text);

-- Update any remaining references in the database
-- (This will be handled by the application code updates)