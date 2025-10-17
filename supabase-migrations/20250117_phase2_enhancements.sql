-- =====================================================
-- PHASE 2 ENHANCEMENTS: ENHANCED FUNCTIONALITY
-- Date: 2025-01-17
-- Purpose: Dynamic questions, plan versioning, calculator integration, spouse sharing
-- AI Cost Impact: +$0.04 per assessment (2 extra questions)
-- =====================================================

-- =====================================================
-- 1. PLAN VERSIONING
-- =====================================================

-- Add versioning fields to user_plans
ALTER TABLE public.user_plans 
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS previous_versions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_regenerated_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS regeneration_count INTEGER DEFAULT 0;

COMMENT ON COLUMN public.user_plans.version IS 'Current plan version number (increments on regeneration)';
COMMENT ON COLUMN public.user_plans.previous_versions IS 'Array of previous plan versions with metadata';
COMMENT ON COLUMN public.user_plans.last_regenerated_at IS 'Timestamp of last plan regeneration';
COMMENT ON COLUMN public.user_plans.regeneration_count IS 'Total number of times plan has been regenerated';

-- =====================================================
-- 2. PLAN SHARING (SPOUSE COLLABORATION)
-- =====================================================

-- Table to track shared plans
CREATE TABLE IF NOT EXISTS public.shared_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.user_plans(id) ON DELETE CASCADE,
  shared_by TEXT NOT NULL,
  shared_with TEXT NOT NULL,
  share_message TEXT,
  can_regenerate BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_plan_share UNIQUE(plan_id, shared_with)
);

COMMENT ON TABLE public.shared_plans IS 'Tracks plans shared between spouses for collaboration';
COMMENT ON COLUMN public.shared_plans.shared_by IS 'User ID who shared the plan';
COMMENT ON COLUMN public.shared_plans.shared_with IS 'User ID who received the shared plan';
COMMENT ON COLUMN public.shared_plans.can_regenerate IS 'Whether recipient can regenerate the plan';

-- RLS Policies for shared_plans
ALTER TABLE public.shared_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view plans shared with them"
  ON public.shared_plans
  FOR SELECT
  USING (
    auth.jwt() ->> 'sub' = shared_with OR 
    auth.jwt() ->> 'sub' = shared_by
  );

CREATE POLICY "Users can share their own plans"
  ON public.shared_plans
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = shared_by);

CREATE POLICY "Users can update shares they created"
  ON public.shared_plans
  FOR UPDATE
  USING (auth.jwt() ->> 'sub' = shared_by)
  WITH CHECK (auth.jwt() ->> 'sub' = shared_by);

CREATE POLICY "Users can delete shares they created"
  ON public.shared_plans
  FOR DELETE
  USING (auth.jwt() ->> 'sub' = shared_by);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_shared_plans_shared_with 
  ON public.shared_plans(shared_with);

CREATE INDEX IF NOT EXISTS idx_shared_plans_shared_by 
  ON public.shared_plans(shared_by);

CREATE INDEX IF NOT EXISTS idx_shared_plans_plan_id 
  ON public.shared_plans(plan_id);

-- =====================================================
-- 3. CALCULATOR INTEGRATION TRACKING
-- =====================================================

-- Extend plan_analytics to track calculator clicks from plans
-- (Already created in Phase 1, just add comment for clarity)

COMMENT ON TABLE public.plan_analytics IS 'Tracks plan interactions including calculator clicks (tool_clicked event with tool_name)';

-- =====================================================
-- 4. DYNAMIC QUESTION METADATA
-- =====================================================

-- Add metadata to track which questions were dynamic vs core
ALTER TABLE public.user_assessments
  ADD COLUMN IF NOT EXISTS question_flow JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_assessments.question_flow IS 'Metadata about question flow: {core_questions: [], dynamic_questions: [], total_questions: N}';

-- =====================================================
-- 5. PLAN REGENERATION HELPER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION increment_plan_version(
  p_user_id TEXT,
  p_old_plan_data JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_version INTEGER;
  v_previous_versions JSONB;
BEGIN
  -- Get current version and previous versions
  SELECT version, previous_versions
  INTO v_current_version, v_previous_versions
  FROM user_plans
  WHERE user_id = p_user_id;
  
  -- If no existing plan, start at version 1
  IF v_current_version IS NULL THEN
    RETURN 1;
  END IF;
  
  -- Archive old plan version
  v_previous_versions := COALESCE(v_previous_versions, '[]'::jsonb);
  v_previous_versions := v_previous_versions || jsonb_build_object(
    'version', v_current_version,
    'plan_data', p_old_plan_data,
    'archived_at', now()
  );
  
  -- Update with new version
  UPDATE user_plans
  SET 
    version = v_current_version + 1,
    previous_versions = v_previous_versions,
    last_regenerated_at = now(),
    regeneration_count = COALESCE(regeneration_count, 0) + 1
  WHERE user_id = p_user_id;
  
  RETURN v_current_version + 1;
END;
$$;

COMMENT ON FUNCTION increment_plan_version IS 'Archives old plan and increments version number';

-- =====================================================
-- 6. SHARED PLAN VIEW HELPER
-- =====================================================

CREATE OR REPLACE FUNCTION get_accessible_plans(p_user_id TEXT)
RETURNS TABLE (
  plan_id UUID,
  owner_id TEXT,
  plan_data JSONB,
  version INTEGER,
  is_own_plan BOOLEAN,
  shared_by_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- User's own plan
  SELECT 
    up.id as plan_id,
    up.user_id as owner_id,
    up.plan_data,
    up.version,
    true as is_own_plan,
    NULL::TEXT as shared_by_name
  FROM user_plans up
  WHERE up.user_id = p_user_id
  
  UNION ALL
  
  -- Plans shared with user
  SELECT 
    up.id as plan_id,
    up.user_id as owner_id,
    up.plan_data,
    up.version,
    false as is_own_plan,
    sp.shared_by as shared_by_name
  FROM user_plans up
  JOIN shared_plans sp ON sp.plan_id = up.id
  WHERE sp.shared_with = p_user_id;
END;
$$;

COMMENT ON FUNCTION get_accessible_plans IS 'Returns all plans user can access (own + shared with them)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Phase 2 database enhancements complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'NEW FEATURES:';
  RAISE NOTICE '- Plan versioning with history';
  RAISE NOTICE '- Spouse plan sharing';
  RAISE NOTICE '- Calculator integration tracking';
  RAISE NOTICE '- Dynamic question metadata';
  RAISE NOTICE '';
  RAISE NOTICE 'NEW FUNCTIONS:';
  RAISE NOTICE '- increment_plan_version()';
  RAISE NOTICE '- get_accessible_plans()';
END $$;

