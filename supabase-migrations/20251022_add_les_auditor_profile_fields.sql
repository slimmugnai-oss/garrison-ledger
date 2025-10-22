-- ADD LES AUDITOR FIELDS TO USER PROFILES
-- Created: 2025-10-22
-- Purpose: Add Section 7 (Special Pays) and Section 8 (Deductions/Taxes) fields
-- Required for: Complete LES & Paycheck Auditor functionality

-- =============================================================================
-- SECTION 7: SPECIAL PAYS & ALLOWANCES
-- =============================================================================

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS mha_code_override TEXT,
ADD COLUMN IF NOT EXISTS receives_sdap BOOLEAN,
ADD COLUMN IF NOT EXISTS sdap_monthly_cents INTEGER,
ADD COLUMN IF NOT EXISTS receives_hfp_idp BOOLEAN,
ADD COLUMN IF NOT EXISTS hfp_idp_monthly_cents INTEGER,
ADD COLUMN IF NOT EXISTS receives_fsa BOOLEAN,
ADD COLUMN IF NOT EXISTS fsa_monthly_cents INTEGER,
ADD COLUMN IF NOT EXISTS receives_flpp BOOLEAN,
ADD COLUMN IF NOT EXISTS flpp_monthly_cents INTEGER;

-- Add comments
COMMENT ON COLUMN user_profiles.mha_code_override IS 'Manual MHA code override for bases not in our database - used for BAH verification';
COMMENT ON COLUMN user_profiles.receives_sdap IS 'Whether user receives Special Duty Assignment Pay';
COMMENT ON COLUMN user_profiles.sdap_monthly_cents IS 'SDAP monthly amount in cents (e.g., 15000 = $150)';
COMMENT ON COLUMN user_profiles.receives_hfp_idp IS 'Whether user receives Hostile Fire Pay / Imminent Danger Pay';
COMMENT ON COLUMN user_profiles.hfp_idp_monthly_cents IS 'HFP/IDP monthly amount in cents (typically 22500 = $225)';
COMMENT ON COLUMN user_profiles.receives_fsa IS 'Whether user receives Family Separation Allowance';
COMMENT ON COLUMN user_profiles.fsa_monthly_cents IS 'FSA monthly amount in cents (typically 25000 = $250)';
COMMENT ON COLUMN user_profiles.receives_flpp IS 'Whether user receives Foreign Language Proficiency Pay';
COMMENT ON COLUMN user_profiles.flpp_monthly_cents IS 'FLPP monthly amount in cents (varies by language and proficiency)';

-- =============================================================================
-- SECTION 8: DEDUCTIONS & TAXES
-- =============================================================================

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS tsp_contribution_percent NUMERIC(5,4),
ADD COLUMN IF NOT EXISTS tsp_contribution_type TEXT,
ADD COLUMN IF NOT EXISTS sgli_coverage_amount INTEGER,
ADD COLUMN IF NOT EXISTS has_dental_insurance BOOLEAN,
ADD COLUMN IF NOT EXISTS filing_status TEXT,
ADD COLUMN IF NOT EXISTS state_of_residence TEXT,
ADD COLUMN IF NOT EXISTS w4_allowances INTEGER;

-- Add comments
COMMENT ON COLUMN user_profiles.tsp_contribution_percent IS 'TSP contribution as decimal (e.g., 0.05 = 5%) - for net pay calculations';
COMMENT ON COLUMN user_profiles.tsp_contribution_type IS 'TSP contribution type: traditional, roth, or split';
COMMENT ON COLUMN user_profiles.sgli_coverage_amount IS 'SGLI coverage amount in dollars (0 to 400000)';
COMMENT ON COLUMN user_profiles.has_dental_insurance IS 'Whether user has TRICARE Dental or other military dental insurance';
COMMENT ON COLUMN user_profiles.filing_status IS 'Tax filing status: single, married_filing_jointly, married_filing_separately, head_of_household';
COMMENT ON COLUMN user_profiles.state_of_residence IS 'State of legal residence (home of record) for state tax withholding - 2 letter code';
COMMENT ON COLUMN user_profiles.w4_allowances IS 'Number of W-4 allowances claimed - affects federal tax withholding';

-- Add constraints
ALTER TABLE user_profiles 
ADD CONSTRAINT check_tsp_contribution_percent CHECK (tsp_contribution_percent IS NULL OR (tsp_contribution_percent >= 0 AND tsp_contribution_percent <= 1)),
ADD CONSTRAINT check_sgli_coverage_amount CHECK (sgli_coverage_amount IS NULL OR (sgli_coverage_amount >= 0 AND sgli_coverage_amount <= 500000)),
ADD CONSTRAINT check_w4_allowances CHECK (w4_allowances IS NULL OR (w4_allowances >= 0 AND w4_allowances <= 99)),
ADD CONSTRAINT check_state_of_residence CHECK (state_of_residence IS NULL OR LENGTH(state_of_residence) = 2);

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_mha_code_override ON user_profiles(mha_code_override) WHERE mha_code_override IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_state_of_residence ON user_profiles(state_of_residence) WHERE state_of_residence IS NOT NULL;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
  total INTEGER;
  with_special_pays INTEGER;
  with_deductions INTEGER;
BEGIN
  SELECT COUNT(*) INTO total FROM user_profiles;
  SELECT COUNT(*) INTO with_special_pays FROM user_profiles 
    WHERE receives_sdap = TRUE OR receives_hfp_idp = TRUE OR receives_fsa = TRUE OR receives_flpp = TRUE;
  SELECT COUNT(*) INTO with_deductions FROM user_profiles 
    WHERE tsp_contribution_percent IS NOT NULL OR sgli_coverage_amount IS NOT NULL OR filing_status IS NOT NULL;
  
  RAISE NOTICE 'LES Auditor fields added successfully';
  RAISE NOTICE 'Total profiles: %', total;
  RAISE NOTICE 'With special pays: %', with_special_pays;
  RAISE NOTICE 'With deductions/taxes configured: %', with_deductions;
  RAISE NOTICE 'All columns ready for LES & Paycheck Auditor';
END $$;

-- =============================================================================
-- MIGRATION COMPLETE
-- Profile setup Sections 7 & 8 can now save successfully
-- LES Auditor will have accurate data for complete paycheck validation
-- =============================================================================

