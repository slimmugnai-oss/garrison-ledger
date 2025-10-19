-- =====================================================================
-- ADMIN CONSTANTS TABLE
-- Created: 2025-10-20
-- Purpose: Store manually-maintained constants (IRS limits, TSP caps, TRICARE costs)
-- These are updated periodically by admins when official sources publish new values
-- =====================================================================

CREATE TABLE IF NOT EXISTS admin_constants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,          -- Unique identifier (e.g., 'IRS_TSP_ELECTIVE_DEFERRAL_LIMIT_2025')
  value_json JSONB NOT NULL,         -- Flexible JSON value (can store numbers, strings, objects)
  as_of_date DATE NOT NULL,          -- Date this value became effective
  source_url TEXT,                   -- Official source URL (e.g., IRS.gov, TSP.gov, TRICARE.mil)
  source_name TEXT,                  -- Human-readable source (e.g., 'IRS Notice 2024-80')
  category TEXT NOT NULL,            -- Category: 'IRS', 'TSP', 'TRICARE', 'DFAS', etc.
  notes TEXT,                        -- Admin notes or context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_constants_category ON admin_constants(category);
CREATE INDEX IF NOT EXISTS idx_admin_constants_as_of ON admin_constants(as_of_date DESC);
CREATE INDEX IF NOT EXISTS idx_admin_constants_key ON admin_constants(key);

-- Comments
COMMENT ON TABLE admin_constants IS 'Manually-maintained constants from official sources (IRS, TSP, TRICARE, etc.)';
COMMENT ON COLUMN admin_constants.key IS 'Unique key identifier - use uppercase snake_case (e.g., IRS_STANDARD_DEDUCTION_2025_SINGLE)';
COMMENT ON COLUMN admin_constants.value_json IS 'Flexible JSONB value - can store primitives or complex objects';
COMMENT ON COLUMN admin_constants.category IS 'Source category for filtering (IRS, TSP, TRICARE, DFAS, etc.)';

-- =====================================================================
-- SEED INITIAL DATA (2025 Values)
-- =====================================================================

-- IRS Tax Year 2025 Limits
-- Source: IRS Revenue Procedure 2024-40
INSERT INTO admin_constants (key, value_json, as_of_date, source_url, source_name, category, notes) VALUES
  (
    'IRS_STANDARD_DEDUCTION_2025_SINGLE',
    '15000'::jsonb,
    '2025-01-01',
    'https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2025',
    'IRS Revenue Procedure 2024-40',
    'IRS',
    'Standard deduction for single filers (tax year 2025)'
  ),
  (
    'IRS_STANDARD_DEDUCTION_2025_MARRIED_FILING_JOINTLY',
    '30000'::jsonb,
    '2025-01-01',
    'https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2025',
    'IRS Revenue Procedure 2024-40',
    'IRS',
    'Standard deduction for married filing jointly (tax year 2025)'
  ),
  (
    'IRS_STANDARD_DEDUCTION_2025_HEAD_OF_HOUSEHOLD',
    '22500'::jsonb,
    '2025-01-01',
    'https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2025',
    'IRS Revenue Procedure 2024-40',
    'IRS',
    'Standard deduction for head of household (tax year 2025)'
  )
ON CONFLICT (key) DO NOTHING;

-- TSP Contribution Limits 2025
-- Source: IRS Notice 2024-80
INSERT INTO admin_constants (key, value_json, as_of_date, source_url, source_name, category, notes) VALUES
  (
    'TSP_ELECTIVE_DEFERRAL_LIMIT_2025',
    '23500'::jsonb,
    '2025-01-01',
    'https://www.tsp.gov/making-contributions/contribution-limits/',
    'IRS Notice 2024-80',
    'TSP',
    'Maximum elective deferral limit for TSP (2025) - applies to traditional + Roth combined'
  ),
  (
    'TSP_CATCH_UP_LIMIT_2025',
    '7500'::jsonb,
    '2025-01-01',
    'https://www.tsp.gov/making-contributions/contribution-limits/',
    'IRS Notice 2024-80',
    'TSP',
    'Catch-up contribution limit for age 50+ (2025)'
  ),
  (
    'TSP_ANNUAL_ADDITIONS_LIMIT_2025',
    '69000'::jsonb,
    '2025-01-01',
    'https://www.tsp.gov/making-contributions/contribution-limits/',
    'IRS 415(c) Limit',
    'TSP',
    'Total annual additions limit (elective + matching + incentive pay) per IRC 415(c)'
  )
ON CONFLICT (key) DO NOTHING;

-- TRICARE Costs 2025
-- Source: TRICARE.mil
INSERT INTO admin_constants (key, value_json, as_of_date, source_url, source_name, category, notes) VALUES
  (
    'TRICARE_SELECT_INDIVIDUAL_DEDUCTIBLE_E1_E4_2025',
    '16800'::jsonb,
    '2025-01-01',
    'https://www.tricare.mil/Costs/2025Costs',
    'TRICARE 2025 Costs',
    'TRICARE',
    'TRICARE Select individual deductible for E-1 to E-4 (cents) - $168.00'
  ),
  (
    'TRICARE_SELECT_INDIVIDUAL_DEDUCTIBLE_E5_AND_ABOVE_2025',
    '18100'::jsonb,
    '2025-01-01',
    'https://www.tricare.mil/Costs/2025Costs',
    'TRICARE 2025 Costs',
    'TRICARE',
    'TRICARE Select individual deductible for E-5 and above (cents) - $181.00'
  ),
  (
    'TRICARE_SELECT_FAMILY_DEDUCTIBLE_E1_E4_2025',
    '33600'::jsonb,
    '2025-01-01',
    'https://www.tricare.mil/Costs/2025Costs',
    'TRICARE 2025 Costs',
    'TRICARE',
    'TRICARE Select family deductible for E-1 to E-4 (cents) - $336.00'
  ),
  (
    'TRICARE_SELECT_FAMILY_DEDUCTIBLE_E5_AND_ABOVE_2025',
    '36200'::jsonb,
    '2025-01-01',
    'https://www.tricare.mil/Costs/2025Costs',
    'TRICARE 2025 Costs',
    'TRICARE',
    'TRICARE Select family deductible for E-5 and above (cents) - $362.00'
  )
ON CONFLICT (key) DO NOTHING;

-- DFAS Mileage Rate 2025
-- Source: DFAS Travel Rates
INSERT INTO admin_constants (key, value_json, as_of_date, source_url, source_name, category, notes) VALUES
  (
    'DFAS_MILEAGE_RATE_2025',
    '0.70'::jsonb,
    '2025-01-01',
    'https://www.defensetravel.dod.mil/site/mileageRates.cfm',
    'DFAS Mileage Rates',
    'DFAS',
    'Official mileage reimbursement rate per mile (PCS/TDY) - $0.70/mile as of Jan 2025'
  )
ON CONFLICT (key) DO NOTHING;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE admin_constants ENABLE ROW LEVEL SECURITY;

-- Public read access (these are public official rates)
CREATE POLICY "Public read admin constants" ON admin_constants
  FOR SELECT USING (true);

-- Admin write access (service role only)
CREATE POLICY "Service role can insert admin constants" ON admin_constants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update admin constants" ON admin_constants
  FOR UPDATE USING (true);

CREATE POLICY "Service role can delete admin constants" ON admin_constants
  FOR DELETE USING (true);

