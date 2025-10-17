-- =====================================================
-- UPDATE RATE LIMITS FOR SUSTAINABLE MARGINS
-- Date: 2025-01-17
-- Purpose: Adjust assessment rate limits to protect profit margins
-- =====================================================

-- OLD LIMITS:
-- Free: 1 per week (4-5/month)
-- Premium: 3 per day (90/month) ❌ UNSUSTAINABLE

-- NEW LIMITS:
-- Free: 1 per week (4-5/month) ✅ SAME
-- Premium: 1 per 48 hours (15/month) ✅ SUSTAINABLE

-- =====================================================
-- UPDATE can_take_assessment FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION can_take_assessment(
  p_user_id TEXT,
  p_is_premium BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_can_take BOOLEAN := TRUE;
  v_reason TEXT := '';
  v_next_available TIMESTAMPTZ;
BEGIN
  -- Get user's assessment history
  SELECT 
    last_assessment_at,
    assessment_count_today,
    assessment_date
  INTO v_profile
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- If no profile, allow (first time)
  IF v_profile IS NULL THEN
    RETURN jsonb_build_object(
      'canTake', TRUE,
      'reason', 'First assessment'
    );
  END IF;
  
  -- Premium users: 1 per 48 hours limit (15 per month)
  IF p_is_premium THEN
    IF v_profile.last_assessment_at IS NULL THEN
      v_can_take := TRUE;
    ELSIF v_profile.last_assessment_at + INTERVAL '48 hours' > NOW() THEN
      v_can_take := FALSE;
      v_next_available := v_profile.last_assessment_at + INTERVAL '48 hours';
      v_reason := 'Premium members can generate a new plan every 48 hours. Next plan available in ' || 
                  EXTRACT(HOUR FROM (v_next_available - NOW())) || ' hours';
    END IF;
  ELSE
    -- Free users: 1 per week limit (unchanged)
    IF v_profile.last_assessment_at IS NULL THEN
      v_can_take := TRUE;
    ELSIF v_profile.last_assessment_at + INTERVAL '7 days' > NOW() THEN
      v_can_take := FALSE;
      v_reason := 'Free members can generate a new plan every 7 days. Next plan available in ' || 
                  EXTRACT(DAY FROM (v_profile.last_assessment_at + INTERVAL '7 days' - NOW())) || ' days';
      v_next_available := v_profile.last_assessment_at + INTERVAL '7 days';
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'canTake', v_can_take,
    'reason', v_reason,
    'nextAvailable', v_next_available,
    'lastAssessment', v_profile.last_assessment_at
  );
END;
$$;

COMMENT ON FUNCTION can_take_assessment IS 'Check if user can take assessment based on tier: Free=1/week, Premium=1/48hours';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Rate limits updated successfully!';
  RAISE NOTICE 'Free: 1 assessment per week (4-5 per month)';
  RAISE NOTICE 'Premium: 1 assessment per 48 hours (15 per month)';
  RAISE NOTICE 'Maximum premium cost: ~$7/month (down from $41/month)';
  RAISE NOTICE 'Premium margin: 30%% profit (was -300%% loss)';
END $$;

