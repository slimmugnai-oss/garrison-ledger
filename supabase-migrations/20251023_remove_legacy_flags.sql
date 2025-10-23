-- Remove Legacy Feature Flags
-- These features were phased out:
-- - AI Plan Generation (legacy, replaced by tools-first approach)
-- - Natural Search (removed Jan 2025 for cost optimization)
-- - Spouse Collaboration (not fully functional, removed)

DELETE FROM feature_flags 
WHERE key IN ('ai_plan_generation', 'natural_search', 'spouse_collaboration');

-- Verify remaining feature flags (should keep only active features)
-- Expected to remain:
-- - les_auditor
-- - pcs_copilot
-- - base_navigator
-- - tdy_copilot
-- - document_binder
-- - streak_gamification
-- - email_campaigns

