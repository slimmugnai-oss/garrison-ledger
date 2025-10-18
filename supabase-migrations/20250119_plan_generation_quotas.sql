-- =====================================================
-- ADD PLAN GENERATION QUOTAS TO AI SYSTEM
-- Date: 2025-01-19
-- Purpose: Add monthly plan generation limits to prevent cost overruns
-- =====================================================

-- Update check_ai_quota function to include ai_plan feature
CREATE OR REPLACE FUNCTION check_ai_quota(
  p_user_id TEXT,
  p_feature TEXT,
  p_tier TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usage_today INTEGER := 0;
  v_usage_this_month INTEGER := 0;
  v_daily_limit INTEGER;
  v_monthly_limit INTEGER;
  v_can_use BOOLEAN;
  v_next_reset TIMESTAMPTZ;
BEGIN
  -- Set limits based on tier and feature
  CASE p_feature
    WHEN 'natural_search' THEN
      CASE p_tier
        WHEN 'pro' THEN v_daily_limit := 20;
        WHEN 'premium' THEN v_daily_limit := 10;
        ELSE v_daily_limit := 5;  -- free
      END CASE;
    WHEN 'ai_explainer' THEN
      CASE p_tier
        WHEN 'pro' THEN v_daily_limit := 30;
        WHEN 'premium' THEN v_daily_limit := 15;
        ELSE v_daily_limit := 5;  -- free
      END CASE;
    WHEN 'ai_plan' THEN
      CASE p_tier
        WHEN 'pro' THEN v_monthly_limit := 30;
        WHEN 'premium' THEN v_monthly_limit := 10;
        ELSE v_monthly_limit := 1;  -- free
      END CASE;
    ELSE
      v_daily_limit := 999;  -- No limit for other features
  END CASE;
  
  -- For monthly features (ai_plan), check monthly usage
  IF p_feature = 'ai_plan' THEN
    -- Get this month's usage count
    SELECT COALESCE(usage_count, 0)
    INTO v_usage_this_month
    FROM ai_usage_quotas
    WHERE user_id = p_user_id
      AND feature = p_feature
      AND date_trunc('month', usage_date) = date_trunc('month', CURRENT_DATE);
    
    v_can_use := v_usage_this_month < v_monthly_limit;
    v_next_reset := date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
    
    RETURN jsonb_build_object(
      'canUse', v_can_use,
      'usedThisMonth', v_usage_this_month,
      'monthlyLimit', v_monthly_limit,
      'remaining', GREATEST(0, v_monthly_limit - v_usage_this_month),
      'nextReset', v_next_reset
    );
  ELSE
    -- For daily features, check daily usage
    SELECT COALESCE(usage_count, 0)
    INTO v_usage_today
    FROM ai_usage_quotas
    WHERE user_id = p_user_id
      AND feature = p_feature
      AND usage_date = CURRENT_DATE;
    
    v_can_use := v_usage_today < v_daily_limit;
    v_next_reset := CURRENT_DATE + INTERVAL '1 day';
    
    RETURN jsonb_build_object(
      'canUse', v_can_use,
      'usedToday', v_usage_today,
      'dailyLimit', v_daily_limit,
      'remaining', GREATEST(0, v_daily_limit - v_usage_today),
      'nextReset', v_next_reset
    );
  END IF;
END;
$$;

-- Update increment_ai_quota function to handle monthly features
CREATE OR REPLACE FUNCTION increment_ai_quota(
  p_user_id TEXT,
  p_feature TEXT,
  p_tier TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usage_date DATE;
BEGIN
  -- For monthly features (ai_plan), use month start as the key
  IF p_feature = 'ai_plan' THEN
    v_usage_date := date_trunc('month', CURRENT_DATE)::DATE;
  ELSE
    v_usage_date := CURRENT_DATE;
  END IF;
  
  -- Upsert and increment usage count
  INSERT INTO ai_usage_quotas (user_id, feature, usage_date, usage_count)
  VALUES (p_user_id, p_feature, v_usage_date, 1)
  ON CONFLICT (user_id, feature, usage_date)
  DO UPDATE SET 
    usage_count = ai_usage_quotas.usage_count + 1,
    updated_at = NOW();
END;
$$;

-- Update comment to include ai_plan
COMMENT ON COLUMN public.ai_usage_quotas.feature IS 'Feature: natural_search, ai_explainer, ai_plan, dashboard_ai';

-- Add comment explaining the quota system
COMMENT ON TABLE public.ai_usage_quotas IS 'Tracks AI feature usage for rate limiting. Daily features: natural_search, ai_explainer. Monthly features: ai_plan.';
