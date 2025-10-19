-- =====================================================================
-- BASE/AREA NAVIGATOR
-- Created: 2025-10-20
-- Purpose: Family Fit Score system for base neighborhood analysis
-- Features: School scoring, rent vs BAH, commute analysis, weather comfort
-- =====================================================================

-- =====================================================================
-- NEIGHBORHOOD PROFILES
-- =====================================================================
CREATE TABLE IF NOT EXISTS neighborhood_profiles (
  id BIGSERIAL PRIMARY KEY,
  base_code TEXT NOT NULL,          -- Base identifier (e.g., 'JBLM', 'NSNOR')
  zip TEXT NOT NULL,                 -- ZIP code for neighborhood
  bedrooms INTEGER NOT NULL DEFAULT 3,
  median_rent_cents INTEGER,         -- Median rent in cents
  school_score NUMERIC,              -- 0..10 composite school score
  commute_am_minutes INTEGER,        -- AM commute time
  commute_pm_minutes INTEGER,        -- PM commute time
  weather_index NUMERIC,             -- 0..10 weather comfort score
  family_fit_score NUMERIC,          -- 0..100 final composite score
  payload JSONB DEFAULT '{}'::jsonb, -- Raw data: top schools, sample listings, notes
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one profile per base/zip/bedrooms
CREATE UNIQUE INDEX IF NOT EXISTS idx_neighborhood_unique 
  ON neighborhood_profiles(base_code, zip, bedrooms);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_neighborhood_base ON neighborhood_profiles(base_code);
CREATE INDEX IF NOT EXISTS idx_neighborhood_score ON neighborhood_profiles(family_fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_neighborhood_zip ON neighborhood_profiles(zip);

-- Comments
COMMENT ON TABLE neighborhood_profiles IS 'Cached neighborhood analysis for base areas - schools, rent, commute, weather';
COMMENT ON COLUMN neighborhood_profiles.family_fit_score IS 'Composite score 0-100: schools(40%) + rentVsBah(30%) + commute(20%) + weather(10%)';
COMMENT ON COLUMN neighborhood_profiles.payload IS 'Raw data: {top_schools, sample_listings, weather_note, commute_text}';

-- =====================================================================
-- USER WATCHLISTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS user_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  base_code TEXT NOT NULL,
  zips TEXT[] DEFAULT '{}',          -- Watched ZIP codes
  max_rent_cents INTEGER,            -- Maximum rent threshold
  bedrooms INTEGER DEFAULT 3,
  max_commute_minutes INTEGER DEFAULT 30,
  kids_grades TEXT[] DEFAULT '{}',   -- ['elem', 'middle', 'high']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One watchlist per user per base
CREATE UNIQUE INDEX IF NOT EXISTS idx_watchlist_user_base 
  ON user_watchlists(user_id, base_code);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON user_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_base ON user_watchlists(base_code);

-- Comments
COMMENT ON TABLE user_watchlists IS 'User-saved watchlists for base area monitoring (premium feature)';
COMMENT ON COLUMN user_watchlists.kids_grades IS 'School grade levels of interest: elem, middle, high';

-- =====================================================================
-- ALERTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS navigator_alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,          -- 'listing', 'school_change', 'commute', 'weather'
  base_code TEXT,
  zip TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB,                     -- Alert-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alerts_user ON navigator_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON navigator_alerts(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_type ON navigator_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_base ON navigator_alerts(base_code);

-- Comments
COMMENT ON TABLE navigator_alerts IS 'Automated alerts for watchlist changes (new listings, school updates, etc.)';
COMMENT ON COLUMN navigator_alerts.alert_type IS 'Alert category: listing, school_change, commute, weather';

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

-- Neighborhood profiles: Public read (cached data), service role write
ALTER TABLE neighborhood_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read neighborhood profiles" ON neighborhood_profiles
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage neighborhood profiles" ON neighborhood_profiles
  FOR ALL USING (true);

-- Watchlists: User owns their watchlists
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their watchlists" ON user_watchlists
  FOR ALL 
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Alerts: User owns their alerts
ALTER TABLE navigator_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their alerts" ON navigator_alerts
  FOR ALL 
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

