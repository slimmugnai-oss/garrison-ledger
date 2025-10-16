-- =====================================================
-- MIGRATION 2: CHURN TRACKING & LTV ANALYTICS
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- =====================================================

-- 1. USER ACTIVITY LOG TABLE
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_type ON public.user_activity_log(activity_type);
CREATE INDEX idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);

-- 2. SUBSCRIPTION EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT subscription_events_type_check CHECK (event_type IN ('subscribed', 'cancelled', 'reactivated', 'upgraded', 'downgraded', 'churned'))
);

CREATE INDEX idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX idx_subscription_events_type ON public.subscription_events(event_type);
CREATE INDEX idx_subscription_events_created_at ON public.subscription_events(created_at DESC);

-- 3. USER LTV METRICS TABLE
CREATE TABLE IF NOT EXISTS public.user_ltv_metrics (
    user_id TEXT PRIMARY KEY,
    total_spent_cents INTEGER NOT NULL DEFAULT 0,
    lifetime_days INTEGER NOT NULL DEFAULT 0,
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    churn_risk_score INTEGER NOT NULL DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    last_plan_generated_at TIMESTAMPTZ,
    last_tool_used_at TIMESTAMPTZ,
    total_logins INTEGER NOT NULL DEFAULT 0,
    total_plans_generated INTEGER NOT NULL DEFAULT 0,
    total_tools_used INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_ltv_metrics_churn_risk ON public.user_ltv_metrics(churn_risk_score DESC);
CREATE INDEX idx_user_ltv_metrics_total_spent ON public.user_ltv_metrics(total_spent_cents DESC);
CREATE INDEX idx_user_ltv_metrics_last_login ON public.user_ltv_metrics(last_login_at DESC);

-- 4. FUNCTION: Log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id TEXT,
    p_activity_type TEXT,
    p_activity_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_activity_log (user_id, activity_type, activity_details)
    VALUES (p_user_id, p_activity_type, p_activity_details);
    
    INSERT INTO public.user_ltv_metrics (
        user_id,
        last_login_at,
        total_logins,
        last_plan_generated_at,
        total_plans_generated,
        last_tool_used_at,
        total_tools_used
    )
    VALUES (
        p_user_id,
        CASE WHEN p_activity_type = 'login' THEN NOW() ELSE NULL END,
        CASE WHEN p_activity_type = 'login' THEN 1 ELSE 0 END,
        CASE WHEN p_activity_type = 'plan_generated' THEN NOW() ELSE NULL END,
        CASE WHEN p_activity_type = 'plan_generated' THEN 1 ELSE 0 END,
        CASE WHEN p_activity_type LIKE 'tool_%' THEN NOW() ELSE NULL END,
        CASE WHEN p_activity_type LIKE 'tool_%' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id) DO UPDATE SET
        last_login_at = COALESCE(EXCLUDED.last_login_at, user_ltv_metrics.last_login_at),
        total_logins = user_ltv_metrics.total_logins + COALESCE(EXCLUDED.total_logins, 0),
        last_plan_generated_at = COALESCE(EXCLUDED.last_plan_generated_at, user_ltv_metrics.last_plan_generated_at),
        total_plans_generated = user_ltv_metrics.total_plans_generated + COALESCE(EXCLUDED.total_plans_generated, 0),
        last_tool_used_at = COALESCE(EXCLUDED.last_tool_used_at, user_ltv_metrics.last_tool_used_at),
        total_tools_used = user_ltv_metrics.total_tools_used + COALESCE(EXCLUDED.total_tools_used, 0),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. FUNCTION: Calculate churn risk score
CREATE OR REPLACE FUNCTION calculate_churn_risk(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    v_metrics RECORD;
    v_risk_score INTEGER := 0;
    v_days_since_login INTEGER;
    v_days_since_plan INTEGER;
    v_days_since_tool INTEGER;
BEGIN
    SELECT * INTO v_metrics
    FROM public.user_ltv_metrics
    WHERE user_id = p_user_id;
    
    IF v_metrics IS NULL THEN
        RETURN 50;
    END IF;
    
    v_days_since_login := COALESCE(
        EXTRACT(DAY FROM (NOW() - v_metrics.last_login_at))::INTEGER,
        9999
    );
    v_days_since_plan := COALESCE(
        EXTRACT(DAY FROM (NOW() - v_metrics.last_plan_generated_at))::INTEGER,
        9999
    );
    v_days_since_tool := COALESCE(
        EXTRACT(DAY FROM (NOW() - v_metrics.last_tool_used_at))::INTEGER,
        9999
    );
    
    IF v_days_since_login > 60 THEN v_risk_score := v_risk_score + 40;
    ELSIF v_days_since_login > 30 THEN v_risk_score := v_risk_score + 25;
    ELSIF v_days_since_login > 14 THEN v_risk_score := v_risk_score + 10;
    END IF;
    
    IF v_days_since_plan > 90 THEN v_risk_score := v_risk_score + 30;
    ELSIF v_days_since_plan > 60 THEN v_risk_score := v_risk_score + 15;
    END IF;
    
    IF v_days_since_tool > 45 THEN v_risk_score := v_risk_score + 20;
    ELSIF v_days_since_tool > 30 THEN v_risk_score := v_risk_score + 10;
    END IF;
    
    IF v_metrics.total_logins < 3 THEN v_risk_score := v_risk_score + 10;
    END IF;
    IF v_metrics.total_plans_generated = 0 THEN v_risk_score := v_risk_score + 15;
    END IF;
    
    v_risk_score := LEAST(v_risk_score, 100);
    
    UPDATE public.user_ltv_metrics
    SET churn_risk_score = v_risk_score, updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN v_risk_score;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCTION: Get at-risk users
CREATE OR REPLACE FUNCTION get_at_risk_users(
    p_risk_threshold INTEGER DEFAULT 70,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    user_id TEXT,
    churn_risk_score INTEGER,
    last_login_at TIMESTAMPTZ,
    days_since_login INTEGER,
    total_logins INTEGER,
    total_plans_generated INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ulm.user_id,
        ulm.churn_risk_score,
        ulm.last_login_at,
        EXTRACT(DAY FROM (NOW() - ulm.last_login_at))::INTEGER AS days_since_login,
        ulm.total_logins,
        ulm.total_plans_generated
    FROM public.user_ltv_metrics ulm
    WHERE ulm.churn_risk_score >= p_risk_threshold
    ORDER BY ulm.churn_risk_score DESC, ulm.last_login_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 7. FUNCTION: Calculate cohort retention
CREATE OR REPLACE FUNCTION get_cohort_retention(p_cohort_month TEXT)
RETURNS TABLE (
    cohort_month TEXT,
    total_users INTEGER,
    day_30_retained INTEGER,
    day_60_retained INTEGER,
    day_90_retained INTEGER,
    retention_30 NUMERIC,
    retention_60 NUMERIC,
    retention_90 NUMERIC
) AS $$
DECLARE
    v_cohort_start TIMESTAMPTZ;
    v_cohort_end TIMESTAMPTZ;
    v_day_30 TIMESTAMPTZ;
    v_day_60 TIMESTAMPTZ;
    v_day_90 TIMESTAMPTZ;
BEGIN
    v_cohort_start := (p_cohort_month || '-01')::TIMESTAMPTZ;
    v_cohort_end := v_cohort_start + INTERVAL '1 month';
    v_day_30 := v_cohort_start + INTERVAL '30 days';
    v_day_60 := v_cohort_start + INTERVAL '60 days';
    v_day_90 := v_cohort_start + INTERVAL '90 days';
    
    RETURN QUERY
    WITH cohort_users AS (
        SELECT DISTINCT user_id
        FROM public.user_activity_log
        WHERE activity_type = 'login'
          AND created_at >= v_cohort_start
          AND created_at < v_cohort_end
    ),
    retained_30 AS (
        SELECT DISTINCT cu.user_id
        FROM cohort_users cu
        WHERE EXISTS (
            SELECT 1 FROM public.user_activity_log ual
            WHERE ual.user_id = cu.user_id
              AND ual.activity_type = 'login'
              AND ual.created_at >= v_day_30
        )
    ),
    retained_60 AS (
        SELECT DISTINCT cu.user_id
        FROM cohort_users cu
        WHERE EXISTS (
            SELECT 1 FROM public.user_activity_log ual
            WHERE ual.user_id = cu.user_id
              AND ual.activity_type = 'login'
              AND ual.created_at >= v_day_60
        )
    ),
    retained_90 AS (
        SELECT DISTINCT cu.user_id
        FROM cohort_users cu
        WHERE EXISTS (
            SELECT 1 FROM public.user_activity_log ual
            WHERE ual.user_id = cu.user_id
              AND ual.activity_type = 'login'
              AND ual.created_at >= v_day_90
        )
    )
    SELECT
        p_cohort_month,
        (SELECT COUNT(*) FROM cohort_users)::INTEGER,
        (SELECT COUNT(*) FROM retained_30)::INTEGER,
        (SELECT COUNT(*) FROM retained_60)::INTEGER,
        (SELECT COUNT(*) FROM retained_90)::INTEGER,
        CASE WHEN (SELECT COUNT(*) FROM cohort_users) > 0 
            THEN ROUND((SELECT COUNT(*) FROM retained_30)::NUMERIC / (SELECT COUNT(*) FROM cohort_users) * 100, 1)
            ELSE 0 END,
        CASE WHEN (SELECT COUNT(*) FROM cohort_users) > 0 
            THEN ROUND((SELECT COUNT(*) FROM retained_60)::NUMERIC / (SELECT COUNT(*) FROM cohort_users) * 100, 1)
            ELSE 0 END,
        CASE WHEN (SELECT COUNT(*) FROM cohort_users) > 0 
            THEN ROUND((SELECT COUNT(*) FROM retained_90)::NUMERIC / (SELECT COUNT(*) FROM cohort_users) * 100, 1)
            ELSE 0 END;
END;
$$ LANGUAGE plpgsql;

-- 8. FUNCTION: Calculate average LTV
CREATE OR REPLACE FUNCTION get_average_ltv()
RETURNS TABLE (
    total_users INTEGER,
    avg_ltv_cents NUMERIC,
    avg_lifetime_days NUMERIC,
    total_revenue_cents BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER,
        AVG(total_spent_cents)::NUMERIC,
        AVG(lifetime_days)::NUMERIC,
        SUM(total_spent_cents)::BIGINT
    FROM public.user_ltv_metrics
    WHERE total_spent_cents > 0;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNCTION: Get monthly churn rate
CREATE OR REPLACE FUNCTION get_monthly_churn_rate(p_month TEXT)
RETURNS TABLE (
    month TEXT,
    active_start INTEGER,
    churned INTEGER,
    churn_rate NUMERIC
) AS $$
DECLARE
    v_month_start TIMESTAMPTZ;
    v_month_end TIMESTAMPTZ;
BEGIN
    v_month_start := (p_month || '-01')::TIMESTAMPTZ;
    v_month_end := v_month_start + INTERVAL '1 month';
    
    RETURN QUERY
    WITH active_at_start AS (
        SELECT DISTINCT user_id
        FROM public.user_ltv_metrics
        WHERE subscription_start_date < v_month_start
          AND (subscription_end_date IS NULL OR subscription_end_date >= v_month_start)
    ),
    churned_in_month AS (
        SELECT user_id
        FROM public.subscription_events
        WHERE event_type = 'churned'
          AND created_at >= v_month_start
          AND created_at < v_month_end
    )
    SELECT
        p_month,
        (SELECT COUNT(*)::INTEGER FROM active_at_start),
        (SELECT COUNT(*)::INTEGER FROM churned_in_month),
        CASE WHEN (SELECT COUNT(*) FROM active_at_start) > 0
            THEN ROUND((SELECT COUNT(*)::NUMERIC FROM churned_in_month) / (SELECT COUNT(*) FROM active_at_start) * 100, 2)
            ELSE 0 END;
END;
$$ LANGUAGE plpgsql;

-- 10. RLS POLICIES (Service role only - Clerk handles auth)
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ltv_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access activity_log"
    ON public.user_activity_log FOR ALL
    USING (true);

CREATE POLICY "Service role full access subscription_events"
    ON public.subscription_events FOR ALL
    USING (true);

CREATE POLICY "Service role full access ltv_metrics"
    ON public.user_ltv_metrics FOR ALL
    USING (true);

-- 11. TRIGGER: Update churn risk on activity
CREATE OR REPLACE FUNCTION update_churn_risk_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_churn_risk(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_churn_risk
    AFTER INSERT ON public.user_activity_log
    FOR EACH ROW
    EXECUTE FUNCTION update_churn_risk_trigger();

-- =====================================================
-- MIGRATION COMPLETE - YOU SHOULD SEE "Success. No rows returned"
-- =====================================================

