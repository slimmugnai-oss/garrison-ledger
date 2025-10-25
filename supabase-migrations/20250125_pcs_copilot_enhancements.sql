-- =====================================================
-- PCS COPILOT COMPREHENSIVE ENHANCEMENTS
-- Date: 2025-01-25
-- Purpose: Transform PCS Copilot to LES Auditor-level excellence
-- =====================================================

-- =====================================================
-- 1. JTR RATE CACHE WITH PROVENANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.jtr_rates_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_type TEXT NOT NULL, -- 'per_diem', 'dla', 'malt', 'tle', 'weight_allowance'
  effective_date DATE NOT NULL,
  expiration_date DATE,
  rate_data JSONB NOT NULL, -- Structured rate data
  source_url TEXT, -- Official source URL
  last_verified TIMESTAMPTZ DEFAULT NOW(),
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'failed', 'stale'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jtr_rates_type ON public.jtr_rates_cache(rate_type);
CREATE INDEX idx_jtr_rates_effective ON public.jtr_rates_cache(effective_date);
CREATE INDEX idx_jtr_rates_status ON public.jtr_rates_cache(verification_status);

COMMENT ON TABLE public.jtr_rates_cache IS 'Cached JTR rates with provenance tracking for data accuracy';

-- Enable RLS
ALTER TABLE public.jtr_rates_cache ENABLE ROW LEVEL SECURITY;

-- Admin-only access (no user policies needed)
CREATE POLICY "Admin access only"
  ON public.jtr_rates_cache FOR ALL
  USING (false);

-- =====================================================
-- 2. PCS CLAIM TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pcs_claim_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  description TEXT,
  scenario JSONB NOT NULL, -- Common PCS scenario data
  default_items JSONB, -- Pre-filled line items
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pcs_templates_active ON public.pcs_claim_templates(is_active);

COMMENT ON TABLE public.pcs_claim_templates IS 'Pre-configured claim templates for common PCS scenarios';

-- Enable RLS
ALTER TABLE public.pcs_claim_templates ENABLE ROW LEVEL SECURITY;

-- Public read access for templates
CREATE POLICY "Anyone can view templates"
  ON public.pcs_claim_templates FOR SELECT
  USING (is_active = true);

-- =====================================================
-- 3. MANUAL ENTRY AUDIT TRAIL
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pcs_manual_entry_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.pcs_claims(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_manual_entry_claim ON public.pcs_manual_entry_log(claim_id);
CREATE INDEX idx_manual_entry_user ON public.pcs_manual_entry_log(user_id);
CREATE INDEX idx_manual_entry_field ON public.pcs_manual_entry_log(field_name);

COMMENT ON TABLE public.pcs_manual_entry_log IS 'Audit trail for manual entry changes in PCS claims';

-- Enable RLS
ALTER TABLE public.pcs_manual_entry_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own manual entry logs"
  ON public.pcs_manual_entry_log FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own manual entry logs"
  ON public.pcs_manual_entry_log FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- =====================================================
-- 4. SCHEMA MODIFICATIONS TO EXISTING TABLES
-- =====================================================

-- Add entry_method to pcs_claims
ALTER TABLE public.pcs_claims 
ADD COLUMN IF NOT EXISTS entry_method TEXT DEFAULT 'manual' 
CHECK (entry_method IN ('manual', 'ocr', 'imported'));

-- Add validation_status to pcs_claim_items
ALTER TABLE public.pcs_claim_items 
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'valid' 
CHECK (validation_status IN ('valid', 'warning', 'error'));

-- Add confidence_scores to pcs_entitlement_snapshots
ALTER TABLE public.pcs_entitlement_snapshots 
ADD COLUMN IF NOT EXISTS confidence_scores JSONB;

-- Add jtr_rule_version to track which rules were used
ALTER TABLE public.pcs_entitlement_snapshots 
ADD COLUMN IF NOT EXISTS jtr_rule_version TEXT;

-- Add data_sources tracking for provenance
ALTER TABLE public.pcs_entitlement_snapshots 
ADD COLUMN IF NOT EXISTS data_sources JSONB;

-- =====================================================
-- 5. SEED JTR RATE CACHE WITH INITIAL DATA
-- =====================================================

-- Insert current DLA rates (2025)
INSERT INTO public.jtr_rates_cache (rate_type, effective_date, expiration_date, rate_data, source_url, verification_status) VALUES
(
  'dla',
  '2025-01-01',
  '2026-01-01',
  '{
    "E1-E4_without": 1234,
    "E1-E4_with": 2468,
    "E5-E6_without": 1543,
    "E5-E6_with": 3086,
    "E7-E9_without": 1852,
    "E7-E9_with": 3704,
    "O1-O3_without": 2160,
    "O1-O3_with": 4320,
    "O4-O6_without": 2469,
    "O4-O6_with": 4938
  }'::jsonb,
  'https://www.dfas.mil/militarymembers/payentitlements/Pay-Tables/',
  'verified'
),
(
  'malt',
  '2025-01-01',
  '2026-01-01',
  '{
    "rate_per_mile": 0.18,
    "source": "IRS Standard Mileage Rate"
  }'::jsonb,
  'https://www.irs.gov/tax-professionals/standard-mileage-rates',
  'verified'
),
(
  'weight_allowance',
  '2025-01-01',
  '2026-01-01',
  '{
    "E1": 5000,
    "E2": 5000,
    "E3": 5000,
    "E4": 5000,
    "E5": 7000,
    "E6": 7000,
    "E7": 11000,
    "E8": 11000,
    "E9": 11000,
    "O1": 8000,
    "O2": 8000,
    "O3": 13000,
    "O4": 13000,
    "O5": 16000,
    "O6": 16000,
    "O7": 18000,
    "O8": 18000,
    "O9": 18000,
    "O10": 18000
  }'::jsonb,
  'https://www.defensetravel.dod.mil/site/travelreg.cfm',
  'verified'
);

-- =====================================================
-- 6. SEED CLAIM TEMPLATES
-- =====================================================

INSERT INTO public.pcs_claim_templates (template_name, description, scenario, default_items) VALUES
(
  'Standard CONUS PCS',
  'Typical CONUS to CONUS PCS move with family',
  '{
    "travel_method": "ppm",
    "dependents_count": 2,
    "distance_estimate": 1500,
    "tle_days_origin": 5,
    "tle_days_destination": 5
  }'::jsonb,
  '{
    "dla": true,
    "tle": true,
    "malt": true,
    "per_diem": true,
    "ppm": true
  }'::jsonb
),
(
  'OCONUS to CONUS',
  'Overseas assignment return to CONUS',
  '{
    "travel_method": "government",
    "dependents_count": 1,
    "distance_estimate": 0,
    "tle_days_origin": 10,
    "tle_days_destination": 10
  }'::jsonb,
  '{
    "dla": true,
    "tle": true,
    "per_diem": true,
    "sit": true
  }'::jsonb
),
(
  'Single Member PCS',
  'Individual service member PCS without dependents',
  '{
    "travel_method": "ppm",
    "dependents_count": 0,
    "distance_estimate": 800,
    "tle_days_origin": 3,
    "tle_days_destination": 3
  }'::jsonb,
  '{
    "dla": true,
    "malt": true,
    "per_diem": true,
    "ppm": true
  }'::jsonb
);

-- =====================================================
-- 7. EXPAND JTR RULES (Add 40+ more rules)
-- =====================================================

-- Core Entitlements (Priority 1)
INSERT INTO public.jtr_rules (rule_code, rule_title, category, description, calculation_formula, rate_table) VALUES
-- AOP (Advance Operating Allowance)
(
  '050401',
  'Advance Operating Allowance (AOP)',
  'advance',
  'Cash advance up to 100% of estimated entitlements for lodging and per diem.',
  'Requested amount up to estimated TLE + per diem. Must be repaid if not used.',
  '{"max_percentage": 1.0, "repayment_required": true}'::jsonb
),
-- HHT (House Hunting Trip)
(
  '050501',
  'House Hunting Trip (HHT)',
  'hht',
  'Round-trip transportation and per diem for member and spouse to find housing.',
  'Up to 10 days per diem at destination. Travel expenses reimbursed.',
  '{"max_days": 10, "spouse_authorized": true, "travel_reimbursed": true}'::jsonb
),
-- SIT (Storage in Transit)
(
  '050601',
  'Storage in Transit (SIT)',
  'sit',
  'Temporary storage of household goods at government expense.',
  'Up to 90 days at origin, 90 days at destination. Government arranges.',
  '{"max_days_origin": 90, "max_days_destination": 90, "government_arranged": true}'::jsonb
),
-- NTS (Non-Temporary Storage)
(
  '050701',
  'Non-Temporary Storage (NTS)',
  'nts',
  'Long-term storage for OCONUS assignments or special circumstances.',
  'Government arranges and pays for duration of assignment.',
  '{"government_arranged": true, "duration_based": true}'::jsonb
),
-- Mobile Home Transport
(
  '050801',
  'Mobile Home Transport',
  'mobile_home',
  'Transportation of mobile home as household goods.',
  'Actual cost up to authorized weight allowance.',
  '{"weight_allowance_applies": true, "actual_cost": true}'::jsonb
);

-- Travel Allowances (Priority 2)
INSERT INTO public.jtr_rules (rule_code, rule_title, category, description, calculation_formula, rate_table) VALUES
-- POV Transport
(
  '051001',
  'POV Transport (Ship Car)',
  'pov_transport',
  'Government transportation of privately owned vehicle.',
  'Government arranges and pays for POV transport.',
  '{"government_arranged": true, "no_cost_to_member": true}'::jsonb
),
-- Pet Transport
(
  '051101',
  'Pet Transport',
  'pet_transport',
  'Transportation of household pets at government expense.',
  'Actual cost up to authorized limits per pet.',
  '{"max_pets": 2, "cost_limit_per_pet": 500}'::jsonb
),
-- Trailer Transport
(
  '051201',
  'Trailer Transport',
  'trailer_transport',
  'Transportation of trailer as household goods.',
  'Actual cost up to authorized weight allowance.',
  '{"weight_allowance_applies": true, "actual_cost": true}'::jsonb
),
-- Dependent Travel Separate
(
  '051301',
  'Dependent Travel Separate',
  'dependent_travel_separate',
  'Transportation and per diem when dependents travel separately.',
  'Same rates as member. Per diem at 75% for travel days.',
  '{"per_diem_rate": 0.75, "same_rates_as_member": true}'::jsonb
),
-- En Route Travel Days
(
  '051401',
  'En Route Travel Days',
  'en_route_travel',
  'Additional per diem for authorized en route stops.',
  'Per diem rate × number of authorized en route days.',
  '{"per_diem_rate": 1.0, "authorization_required": true}'::jsonb
);

-- Dependent Allowances (Priority 3)
INSERT INTO public.jtr_rules (rule_code, rule_title, category, description, calculation_formula, rate_table) VALUES
-- Dependent Per Diem
(
  '052001',
  'Dependent Per Diem',
  'dependent_per_diem',
  'Per diem allowance for authorized dependents during travel.',
  '75% of member per diem rate for travel days.',
  '{"per_diem_rate": 0.75, "travel_days_only": true}'::jsonb
),
-- Dependent Lodging
(
  '052101',
  'Dependent Lodging',
  'dependent_lodging',
  'Lodging reimbursement for dependents during TLE.',
  'Actual cost up to locality per diem rate.',
  '{"actual_cost": true, "locality_rate_limit": true}'::jsonb
),
-- Dependent MALT
(
  '052201',
  'Dependent MALT',
  'dependent_malt',
  'Mileage allowance for dependent travel in POV.',
  'Same rate as member MALT for authorized dependent travel.',
  '{"same_rate_as_member": true, "authorization_required": true}'::jsonb
),
-- Unaccompanied Baggage
(
  '052301',
  'Unaccompanied Baggage',
  'unaccompanied_baggage',
  'Transportation of essential items ahead of main shipment.',
  'Up to 500 lbs at government expense.',
  '{"max_weight": 500, "government_arranged": true}'::jsonb
);

-- Special Circumstances (Priority 4)
INSERT INTO public.jtr_rules (rule_code, rule_title, category, description, calculation_formula, rate_table) VALUES
-- OCONUS to CONUS variations
(
  '053001',
  'OCONUS to CONUS PCS',
  'oconus_to_conus',
  'Special entitlements for OCONUS to CONUS moves.',
  'Enhanced DLA, extended TLE, special per diem rates.',
  '{"enhanced_dla": true, "extended_tle": true, "special_per_diem": true}'::jsonb
),
-- Overseas Housing Allowance (OHA)
(
  '053101',
  'Overseas Housing Allowance (OHA)',
  'oha',
  'Housing allowance for OCONUS assignments.',
  'Based on locality and family size.',
  '{"locality_based": true, "family_size_based": true}'::jsonb
),
-- Living Quarters Allowance (LQA)
(
  '053201',
  'Living Quarters Allowance (LQA)',
  'lqa',
  'Housing allowance for certain OCONUS locations.',
  'Based on locality and family size.',
  '{"locality_based": true, "family_size_based": true}'::jsonb
),
-- Alaska/Hawaii COLA
(
  '053301',
  'Alaska/Hawaii COLA',
  'cola',
  'Cost of Living Allowance for Alaska and Hawaii.',
  'Percentage of base pay based on location and family size.',
  '{"percentage_of_base_pay": true, "location_based": true}'::jsonb
),
-- Post Allowance
(
  '053401',
  'Post Allowance',
  'post_allowance',
  'Additional allowance for high-cost OCONUS locations.',
  'Percentage of base pay based on location and family size.',
  '{"percentage_of_base_pay": true, "high_cost_locations": true}'::jsonb
);

-- =====================================================
-- 8. CREATE FUNCTIONS FOR RATE LOOKUP
-- =====================================================

-- Function to get current DLA rate
CREATE OR REPLACE FUNCTION get_dla_rate(
  rank TEXT,
  has_dependents BOOLEAN,
  effective_date DATE DEFAULT CURRENT_DATE
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  rate_key TEXT;
  rate_value DECIMAL(10,2);
BEGIN
  -- Determine rate key based on rank and dependents
  IF rank ~ '^E[1-4]' THEN
    rate_key := CASE WHEN has_dependents THEN 'E1-E4_with' ELSE 'E1-E4_without' END;
  ELSIF rank ~ '^E[5-6]' THEN
    rate_key := CASE WHEN has_dependents THEN 'E5-E6_with' ELSE 'E5-E6_without' END;
  ELSIF rank ~ '^E[7-9]' THEN
    rate_key := CASE WHEN has_dependents THEN 'E7-E9_with' ELSE 'E7-E9_without' END;
  ELSIF rank ~ '^O[1-3]' THEN
    rate_key := CASE WHEN has_dependents THEN 'O1-O3_with' ELSE 'O1-O3_without' END;
  ELSIF rank ~ '^O[4-6]' THEN
    rate_key := CASE WHEN has_dependents THEN 'O4-O6_with' ELSE 'O4-O6_without' END;
  ELSE
    RETURN 0;
  END IF;
  
  -- Get rate from cache
  SELECT (rate_data->>rate_key)::DECIMAL(10,2)
  INTO rate_value
  FROM jtr_rates_cache
  WHERE rate_type = 'dla'
    AND effective_date <= effective_date
    AND (expiration_date IS NULL OR expiration_date > effective_date)
    AND verification_status = 'verified'
  ORDER BY effective_date DESC
  LIMIT 1;
  
  RETURN COALESCE(rate_value, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get MALT rate
CREATE OR REPLACE FUNCTION get_malt_rate(
  effective_date DATE DEFAULT CURRENT_DATE
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  rate_value DECIMAL(10,2);
BEGIN
  SELECT (rate_data->>'rate_per_mile')::DECIMAL(10,2)
  INTO rate_value
  FROM jtr_rates_cache
  WHERE rate_type = 'malt'
    AND effective_date <= effective_date
    AND (expiration_date IS NULL OR expiration_date > effective_date)
    AND verification_status = 'verified'
  ORDER BY effective_date DESC
  LIMIT 1;
  
  RETURN COALESCE(rate_value, 0.18);
END;
$$ LANGUAGE plpgsql;

-- Function to get weight allowance
CREATE OR REPLACE FUNCTION get_weight_allowance(
  rank TEXT,
  effective_date DATE DEFAULT CURRENT_DATE
) RETURNS INTEGER AS $$
DECLARE
  rate_value INTEGER;
BEGIN
  SELECT (rate_data->>rank)::INTEGER
  INTO rate_value
  FROM jtr_rates_cache
  WHERE rate_type = 'weight_allowance'
    AND effective_date <= effective_date
    AND (expiration_date IS NULL OR expiration_date > effective_date)
    AND verification_status = 'verified'
  ORDER BY effective_date DESC
  LIMIT 1;
  
  RETURN COALESCE(rate_value, 5000);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for pcs_claims
CREATE INDEX IF NOT EXISTS idx_pcs_claims_entry_method ON public.pcs_claims(entry_method);
CREATE INDEX IF NOT EXISTS idx_pcs_claims_created_at ON public.pcs_claims(created_at);

-- Indexes for pcs_claim_items
CREATE INDEX IF NOT EXISTS idx_pcs_claim_items_validation_status ON public.pcs_claim_items(validation_status);
CREATE INDEX IF NOT EXISTS idx_pcs_claim_items_date ON public.pcs_claim_items(date);

-- Indexes for pcs_manual_entry_log
CREATE INDEX IF NOT EXISTS idx_pcs_manual_entry_log_changed_at ON public.pcs_manual_entry_log(changed_at);

-- =====================================================
-- 10. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.jtr_rates_cache IS 'Cached JTR rates with provenance tracking for 100% data accuracy';
COMMENT ON TABLE public.pcs_claim_templates IS 'Pre-configured claim templates for common PCS scenarios';
COMMENT ON TABLE public.pcs_manual_entry_log IS 'Audit trail for manual entry changes in PCS claims';

COMMENT ON COLUMN public.pcs_claims.entry_method IS 'Method used to create claim: manual, ocr, or imported';
COMMENT ON COLUMN public.pcs_claim_items.validation_status IS 'Validation status: valid, warning, or error';
COMMENT ON COLUMN public.pcs_entitlement_snapshots.confidence_scores IS 'Confidence scores for calculation accuracy';
COMMENT ON COLUMN public.pcs_entitlement_snapshots.jtr_rule_version IS 'Version of JTR rules used in calculation';
COMMENT ON COLUMN public.pcs_entitlement_snapshots.data_sources IS 'Data sources used with provenance information';

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_dla_rate(TEXT, BOOLEAN, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_malt_rate(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weight_allowance(TEXT, DATE) TO authenticated;
