-- =====================================================================
-- RATE TABLES: BAH, COLA (CONUS/OCONUS)
-- Created: 2025-10-20
-- Purpose: Store official DoD housing and cost-of-living allowance rates
-- Source: DFAS, DTMO official rate tables
-- =====================================================================

-- =====================================================================
-- BAH RATES (Basic Allowance for Housing)
-- =====================================================================
CREATE TABLE IF NOT EXISTS bah_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paygrade TEXT NOT NULL,           -- E01-E09, O01-O10, W01-W05
  mha TEXT NOT NULL,                 -- Military Housing Area code (e.g., 'WA408', 'CA918')
  with_dependents BOOLEAN NOT NULL,  -- true = with deps, false = without deps
  effective_date DATE NOT NULL,      -- First day rate is effective (YYYY-MM-DD)
  rate_cents INTEGER NOT NULL,       -- Monthly BAH rate in cents
  zip_code TEXT,                     -- Associated ZIP code (optional, for reference)
  location_name TEXT,                -- Human-readable location (e.g., 'Seattle, WA')
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Composite unique constraint: one rate per paygrade/mha/deps/date
CREATE UNIQUE INDEX IF NOT EXISTS idx_bah_unique 
  ON bah_rates(paygrade, mha, with_dependents, effective_date);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bah_mha ON bah_rates(mha);
CREATE INDEX IF NOT EXISTS idx_bah_paygrade ON bah_rates(paygrade);
CREATE INDEX IF NOT EXISTS idx_bah_effective_date ON bah_rates(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_bah_location ON bah_rates(location_name);

-- Comments
COMMENT ON TABLE bah_rates IS 'Official BAH rates from DFAS - updated annually (usually January)';
COMMENT ON COLUMN bah_rates.mha IS 'Military Housing Area code - primary geographic identifier';
COMMENT ON COLUMN bah_rates.rate_cents IS 'Monthly BAH amount in cents (e.g., 245000 = $2,450.00)';
COMMENT ON COLUMN bah_rates.effective_date IS 'First day this rate is valid - use for date range queries';

-- =====================================================================
-- CONUS COLA RATES (Cost of Living Allowance - Continental US)
-- =====================================================================
CREATE TABLE IF NOT EXISTS conus_cola_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mha TEXT NOT NULL,                 -- Military Housing Area code
  paygrade TEXT NOT NULL,            -- E01-E09, O01-O10, W01-W05
  with_dependents BOOLEAN NOT NULL,  -- true = with deps, false = without deps
  effective_date DATE NOT NULL,      -- First day rate is effective
  monthly_amount_cents INTEGER NOT NULL,  -- Monthly COLA in cents
  location_name TEXT,                -- Human-readable location
  cola_index DECIMAL(5,2),           -- COLA index percentage (e.g., 8.5 for 8.5%)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Composite unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_conus_cola_unique 
  ON conus_cola_rates(mha, paygrade, with_dependents, effective_date);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conus_cola_mha ON conus_cola_rates(mha);
CREATE INDEX IF NOT EXISTS idx_conus_cola_paygrade ON conus_cola_rates(paygrade);
CREATE INDEX IF NOT EXISTS idx_conus_cola_effective_date ON conus_cola_rates(effective_date DESC);

-- Comments
COMMENT ON TABLE conus_cola_rates IS 'CONUS COLA rates - only applies to high-cost areas in Continental US';
COMMENT ON COLUMN conus_cola_rates.cola_index IS 'COLA index as percentage - for reference only';

-- =====================================================================
-- OCONUS COLA RATES (Cost of Living Allowance - Outside Continental US)
-- =====================================================================
CREATE TABLE IF NOT EXISTS oconus_cola_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_code TEXT NOT NULL,       -- OCONUS location code (e.g., 'HAWAII', 'GERMANY', 'JAPAN')
  paygrade TEXT NOT NULL,            -- E01-E09, O01-O10, W01-W05
  with_dependents BOOLEAN NOT NULL,  -- true = with deps, false = without deps
  effective_date DATE NOT NULL,      -- First day rate is effective
  monthly_amount_cents INTEGER NOT NULL,  -- Monthly COLA in cents
  location_name TEXT,                -- Human-readable location (e.g., 'Oahu, Hawaii')
  cola_index DECIMAL(5,2),           -- COLA index percentage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Composite unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_oconus_cola_unique 
  ON oconus_cola_rates(location_code, paygrade, with_dependents, effective_date);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_oconus_cola_location ON oconus_cola_rates(location_code);
CREATE INDEX IF NOT EXISTS idx_oconus_cola_paygrade ON oconus_cola_rates(paygrade);
CREATE INDEX IF NOT EXISTS idx_oconus_cola_effective_date ON oconus_cola_rates(effective_date DESC);

-- Comments
COMMENT ON TABLE oconus_cola_rates IS 'OCONUS COLA rates - applies to overseas locations';
COMMENT ON COLUMN oconus_cola_rates.location_code IS 'Country/region code for OCONUS location';

-- =====================================================================
-- RLS POLICIES (Public read, admin write)
-- =====================================================================

ALTER TABLE bah_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE conus_cola_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE oconus_cola_rates ENABLE ROW LEVEL SECURITY;

-- Public read access (rates are public information)
CREATE POLICY "Public read BAH rates" ON bah_rates
  FOR SELECT USING (true);

CREATE POLICY "Public read CONUS COLA rates" ON conus_cola_rates
  FOR SELECT USING (true);

CREATE POLICY "Public read OCONUS COLA rates" ON oconus_cola_rates
  FOR SELECT USING (true);

-- Admin write access (service role only)
CREATE POLICY "Service role can insert BAH rates" ON bah_rates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update BAH rates" ON bah_rates
  FOR UPDATE USING (true);

CREATE POLICY "Service role can insert CONUS COLA rates" ON conus_cola_rates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update CONUS COLA rates" ON conus_cola_rates
  FOR UPDATE USING (true);

CREATE POLICY "Service role can insert OCONUS COLA rates" ON oconus_cola_rates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update OCONUS COLA rates" ON oconus_cola_rates
  FOR UPDATE USING (true);

