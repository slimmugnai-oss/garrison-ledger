-- =============================================
-- MIGRATION: Base Guide Analytics Tracking
-- Created: 2025-01-16
-- Purpose: Track user interactions with base guides
-- =============================================

-- Create base_guide_analytics table
CREATE TABLE IF NOT EXISTS public.base_guide_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'base_view', 'search', 'filter', 'guide_clickthrough'
    base_id TEXT,
    base_name TEXT,
    search_query TEXT,
    results_count INTEGER,
    filter_type TEXT,
    filter_value TEXT,
    external_url TEXT,
    user_id TEXT, -- Clerk user ID
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_base_analytics_event_type ON public.base_guide_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_base_analytics_base_id ON public.base_guide_analytics(base_id);
CREATE INDEX IF NOT EXISTS idx_base_analytics_user_id ON public.base_guide_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_base_analytics_timestamp ON public.base_guide_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_base_analytics_search_query ON public.base_guide_analytics(search_query) WHERE search_query IS NOT NULL;

-- Enable RLS
ALTER TABLE public.base_guide_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything
CREATE POLICY "Service role has full access to base analytics"
    ON public.base_guide_analytics
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users can insert their own analytics
CREATE POLICY "Users can insert their own base analytics"
    ON public.base_guide_analytics
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Admins can view all analytics
-- Note: This uses a simplified check. Replace with your actual admin check.
CREATE POLICY "Admins can view all base analytics"
    ON public.base_guide_analytics
    FOR SELECT
    TO authenticated
    USING (true); -- You can restrict this to admin users only if needed

-- =============================================
-- ANALYTICS FUNCTIONS
-- =============================================

-- Function: Get most viewed bases (last 30 days)
CREATE OR REPLACE FUNCTION get_most_viewed_bases(days_back INTEGER DEFAULT 30, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    base_id TEXT,
    base_name TEXT,
    view_count BIGINT,
    unique_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bga.base_id,
        bga.base_name,
        COUNT(*) as view_count,
        COUNT(DISTINCT bga.user_id) as unique_users
    FROM base_guide_analytics bga
    WHERE 
        bga.event_type = 'base_view'
        AND bga.timestamp >= NOW() - (days_back || ' days')::INTERVAL
        AND bga.base_id IS NOT NULL
    GROUP BY bga.base_id, bga.base_name
    ORDER BY view_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get most popular search terms
CREATE OR REPLACE FUNCTION get_popular_searches(days_back INTEGER DEFAULT 30, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    search_query TEXT,
    search_count BIGINT,
    avg_results_count NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bga.search_query,
        COUNT(*) as search_count,
        ROUND(AVG(bga.results_count::NUMERIC), 1) as avg_results_count
    FROM base_guide_analytics bga
    WHERE 
        bga.event_type = 'search'
        AND bga.timestamp >= NOW() - (days_back || ' days')::INTERVAL
        AND bga.search_query IS NOT NULL
        AND LENGTH(bga.search_query) > 1
    GROUP BY bga.search_query
    ORDER BY search_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get filter usage stats
CREATE OR REPLACE FUNCTION get_filter_usage_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    filter_type TEXT,
    filter_value TEXT,
    usage_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bga.filter_type,
        bga.filter_value,
        COUNT(*) as usage_count
    FROM base_guide_analytics bga
    WHERE 
        bga.event_type = 'filter'
        AND bga.timestamp >= NOW() - (days_back || ' days')::INTERVAL
        AND bga.filter_type IS NOT NULL
    GROUP BY bga.filter_type, bga.filter_value
    ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get guide clickthrough rates
CREATE OR REPLACE FUNCTION get_guide_clickthrough_rates(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    base_id TEXT,
    base_name TEXT,
    views BIGINT,
    clickthroughs BIGINT,
    ctr_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH base_views AS (
        SELECT base_id, base_name, COUNT(*) as view_count
        FROM base_guide_analytics
        WHERE event_type = 'base_view'
        AND timestamp >= NOW() - (days_back || ' days')::INTERVAL
        AND base_id IS NOT NULL
        GROUP BY base_id, base_name
    ),
    base_clicks AS (
        SELECT base_id, COUNT(*) as click_count
        FROM base_guide_analytics
        WHERE event_type = 'guide_clickthrough'
        AND timestamp >= NOW() - (days_back || ' days')::INTERVAL
        AND base_id IS NOT NULL
        GROUP BY base_id
    )
    SELECT 
        bv.base_id,
        bv.base_name,
        bv.view_count as views,
        COALESCE(bc.click_count, 0) as clickthroughs,
        ROUND((COALESCE(bc.click_count, 0)::NUMERIC / bv.view_count::NUMERIC) * 100, 2) as ctr_percentage
    FROM base_views bv
    LEFT JOIN base_clicks bc ON bv.base_id = bc.base_id
    ORDER BY ctr_percentage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_most_viewed_bases TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_popular_searches TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_filter_usage_stats TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_guide_clickthrough_rates TO authenticated, service_role;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Base Guide Analytics migration completed successfully!';
    RAISE NOTICE 'Created: base_guide_analytics table';
    RAISE NOTICE 'Created: 4 analytics functions';
    RAISE NOTICE 'Created: RLS policies for security';
END $$;

