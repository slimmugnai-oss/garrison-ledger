-- =====================================================
-- PHASE 1 IMPROVEMENTS: QUICK WINS
-- Date: 2025-01-17
-- Purpose: Assessment progress saving, plan feedback, analytics
-- Cost: $0 AI increase
-- =====================================================

-- =====================================================
-- 1. ASSESSMENT PROGRESS SAVING
-- =====================================================

-- Table to store partial assessment progress
CREATE TABLE IF NOT EXISTS public.assessment_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  partial_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  questions_asked TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  last_question_id TEXT,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  CONSTRAINT assessment_progress_user_id_key UNIQUE(user_id)
);

COMMENT ON TABLE public.assessment_progress IS 'Stores partial assessment progress so users can resume later';
COMMENT ON COLUMN public.assessment_progress.user_id IS 'User who started the assessment';
COMMENT ON COLUMN public.assessment_progress.partial_responses IS 'Answers collected so far';
COMMENT ON COLUMN public.assessment_progress.questions_asked IS 'List of question IDs already asked';
COMMENT ON COLUMN public.assessment_progress.last_question_id IS 'Last question the user saw';
COMMENT ON COLUMN public.assessment_progress.progress_percentage IS 'Estimated completion percentage';
COMMENT ON COLUMN public.assessment_progress.expires_at IS 'Progress deleted after 7 days of inactivity';

-- RLS Policies for assessment_progress
ALTER TABLE public.assessment_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessment progress"
  ON public.assessment_progress
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own assessment progress"
  ON public.assessment_progress
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own assessment progress"
  ON public.assessment_progress
  FOR UPDATE
  USING (auth.jwt() ->> 'sub' = user_id)
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own assessment progress"
  ON public.assessment_progress
  FOR DELETE
  USING (auth.jwt() ->> 'sub' = user_id);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_assessment_progress_user_id 
  ON public.assessment_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_assessment_progress_expires_at 
  ON public.assessment_progress(expires_at);

-- =====================================================
-- 2. PLAN FEEDBACK COLLECTION
-- =====================================================

-- Add feedback fields to user_plans table
ALTER TABLE public.user_plans 
  ADD COLUMN IF NOT EXISTS user_feedback JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS feedback_submitted_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.user_plans.user_feedback IS 'User feedback: {helpfulness: 1-5, actionability: 1-5, relevance: 1-5, comments: string}';
COMMENT ON COLUMN public.user_plans.feedback_submitted_at IS 'When user submitted feedback';

-- =====================================================
-- 3. ASSESSMENT ANALYTICS
-- =====================================================

-- Table to track assessment completion analytics
CREATE TABLE IF NOT EXISTS public.assessment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('started', 'question_answered', 'completed', 'abandoned', 'resumed')),
  question_id TEXT,
  time_spent_seconds INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.assessment_analytics IS 'Tracks assessment completion funnel and user behavior';
COMMENT ON COLUMN public.assessment_analytics.event_type IS 'Type of assessment event';
COMMENT ON COLUMN public.assessment_analytics.question_id IS 'Question ID if event is question-related';
COMMENT ON COLUMN public.assessment_analytics.time_spent_seconds IS 'Time spent on this step';
COMMENT ON COLUMN public.assessment_analytics.metadata IS 'Additional context (device, browser, etc)';

-- RLS Policies for assessment_analytics
ALTER TABLE public.assessment_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics"
  ON public.assessment_analytics
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Admin-only read access (no SELECT policy for regular users)
-- Admins will use service role key to query

-- Indexes for efficient analytics queries
CREATE INDEX IF NOT EXISTS idx_assessment_analytics_user_id 
  ON public.assessment_analytics(user_id);

CREATE INDEX IF NOT EXISTS idx_assessment_analytics_event_type 
  ON public.assessment_analytics(event_type);

CREATE INDEX IF NOT EXISTS idx_assessment_analytics_created_at 
  ON public.assessment_analytics(created_at DESC);

-- =====================================================
-- 4. PLAN ANALYTICS (BONUS)
-- =====================================================

-- Track plan viewing and interaction
CREATE TABLE IF NOT EXISTS public.plan_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.user_plans(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('viewed', 'content_expanded', 'tool_clicked', 'feedback_submitted', 'regenerated')),
  content_block_id UUID REFERENCES public.content_blocks(id) ON DELETE SET NULL,
  tool_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.plan_analytics IS 'Tracks how users interact with their personalized plans';
COMMENT ON COLUMN public.plan_analytics.event_type IS 'Type of plan interaction';
COMMENT ON COLUMN public.plan_analytics.content_block_id IS 'Content block if user expanded it';
COMMENT ON COLUMN public.plan_analytics.tool_name IS 'Calculator tool if user clicked it';

-- RLS Policies for plan_analytics
ALTER TABLE public.plan_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own plan analytics"
  ON public.plan_analytics
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Indexes for efficient analytics queries
CREATE INDEX IF NOT EXISTS idx_plan_analytics_user_id 
  ON public.plan_analytics(user_id);

CREATE INDEX IF NOT EXISTS idx_plan_analytics_plan_id 
  ON public.plan_analytics(plan_id);

CREATE INDEX IF NOT EXISTS idx_plan_analytics_event_type 
  ON public.plan_analytics(event_type);

CREATE INDEX IF NOT EXISTS idx_plan_analytics_created_at 
  ON public.plan_analytics(created_at DESC);

-- =====================================================
-- 5. CLEANUP JOB (OPTIONAL)
-- =====================================================

-- Function to clean up expired assessment progress
CREATE OR REPLACE FUNCTION cleanup_expired_assessment_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.assessment_progress
  WHERE expires_at < now();
END;
$$;

COMMENT ON FUNCTION cleanup_expired_assessment_progress IS 'Removes expired assessment progress (call via cron or manually)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assessment_progress') = 1, 'assessment_progress table not created';
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assessment_analytics') = 1, 'assessment_analytics table not created';
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'plan_analytics') = 1, 'plan_analytics table not created';
  RAISE NOTICE 'Phase 1 migration completed successfully!';
END $$;

