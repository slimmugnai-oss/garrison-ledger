-- ==========================================
-- USER PROFILES TABLE - Rich User Data
-- ==========================================
-- Comprehensive user profiling for deep personalization
-- Enables GPT-4o to generate truly customized plans

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  
  -- ==========================================
  -- MILITARY IDENTITY
  -- ==========================================
  rank TEXT, -- E-1 through E-9, W-1 through W-5, O-1 through O-10
  branch TEXT, -- Army, Navy, Air Force, Marines, Coast Guard, Space Force
  mos_afsc_rate TEXT, -- Military Occupational Specialty / Career field
  component TEXT, -- Active, Reserve, Guard
  time_in_service_months INT,
  clearance_level TEXT, -- None, Secret, TS, TS/SCI
  
  -- ==========================================
  -- LOCATION & TIMELINE
  -- ==========================================
  current_base TEXT, -- e.g., "Fort Liberty, NC"
  next_base TEXT, -- If known
  pcs_date DATE, -- Report date if orders in hand
  pcs_count INT DEFAULT 0,
  deployment_count INT DEFAULT 0,
  deployment_status TEXT, -- never, pre, current, post, multiple
  last_deployment_date DATE,
  
  -- ==========================================
  -- FAMILY STRUCTURE
  -- ==========================================
  marital_status TEXT, -- single, married, divorced, widowed
  spouse_military BOOLEAN DEFAULT false, -- Dual-military household
  spouse_employed BOOLEAN,
  spouse_career_field TEXT,
  children JSONB, -- [{ age: 3, school_grade: 'pre-k', efmp: false }]
  num_children INT DEFAULT 0,
  has_efmp BOOLEAN DEFAULT false,
  
  -- ==========================================
  -- FINANCIAL SNAPSHOT (Optional ranges for privacy)
  -- ==========================================
  tsp_balance_range TEXT, -- '0-25k', '25k-50k', '50k-100k', '100k-200k', '200k+'
  tsp_allocation TEXT, -- '70C-30S', 'L2050', etc.
  debt_amount_range TEXT, -- 'none', '1-10k', '10k-25k', '25k-50k', '50k+'
  emergency_fund_range TEXT, -- 'none', '1-5k', '5k-10k', '10k-25k', '25k+'
  monthly_income_range TEXT, -- Calculated from rank or manual
  bah_amount INT,
  housing_situation TEXT, -- on-base, rent-off-base, own-primary, own-rental
  owns_rental_properties BOOLEAN DEFAULT false,
  
  -- ==========================================
  -- GOALS & INTERESTS
  -- ==========================================
  long_term_goal TEXT, -- retire-20, retire-30, transition-soon, unsure
  retirement_age_target INT, -- When they plan to stop working
  career_interests TEXT[], -- federal, entrepreneur, remote, education, transition
  financial_priorities TEXT[], -- tsp, debt, emergency, house-hack, budget, sdp
  education_goals TEXT[], -- degree, certification, mycaa, gi-bill
  
  -- ==========================================
  -- PREFERENCES & CONTEXT
  -- ==========================================
  content_difficulty_pref TEXT DEFAULT 'all', -- beginner, intermediate, advanced, all
  urgency_level TEXT DEFAULT 'normal', -- low, normal, high, crisis
  communication_pref TEXT, -- email, sms, in-app
  timezone TEXT,
  
  -- ==========================================
  -- ENGAGEMENT & SYSTEM
  -- ==========================================
  profile_completed BOOLEAN DEFAULT false,
  profile_completed_at TIMESTAMPTZ,
  last_assessment_at TIMESTAMPTZ,
  plan_generated_count INT DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_rank ON user_profiles(rank);
CREATE INDEX IF NOT EXISTS idx_profiles_branch ON user_profiles(branch);
CREATE INDEX IF NOT EXISTS idx_profiles_current_base ON user_profiles(current_base);
CREATE INDEX IF NOT EXISTS idx_profiles_pcs_date ON user_profiles(pcs_date) WHERE pcs_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_deployment_status ON user_profiles(deployment_status);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed ON user_profiles(profile_completed);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE user_profiles IS 'Comprehensive user profiles for deep personalization and AI plan curation';
COMMENT ON COLUMN user_profiles.children IS 'Array of child objects with age, grade, and EFMP status';
COMMENT ON COLUMN user_profiles.rank IS 'Current military rank (E-1 to O-10)';
COMMENT ON COLUMN user_profiles.clearance_level IS 'Security clearance affects career opportunities';
COMMENT ON COLUMN user_profiles.tsp_balance_range IS 'Privacy-friendly ranges instead of exact amounts';

