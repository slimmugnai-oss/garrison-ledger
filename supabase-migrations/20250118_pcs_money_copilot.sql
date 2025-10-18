-- =====================================================
-- PCS MONEY COPILOT - DATABASE SCHEMA
-- Date: 2025-01-18
-- Purpose: AI-powered reimbursement & claims assistant
-- =====================================================

-- =====================================================
-- 1. JTR RULES KNOWLEDGE BASE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.jtr_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code TEXT NOT NULL UNIQUE, -- e.g., "050302.B", "054205", etc.
  rule_title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'DLA', 'TLE', 'MALT', 'per_diem', 'PPM', 'weight_allowance'
  description TEXT NOT NULL,
  eligibility_criteria JSONB, -- Structured conditions
  calculation_formula TEXT, -- Plain English formula
  rate_table JSONB, -- Current rates if applicable
  branch_specific JSONB, -- Branch-specific variations
  common_mistakes TEXT[], -- Array of common errors
  citations TEXT[], -- Related JTR paragraph references
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jtr_rules_category ON public.jtr_rules(category);
CREATE INDEX idx_jtr_rules_code ON public.jtr_rules(rule_code);

COMMENT ON TABLE public.jtr_rules IS 'Joint Travel Regulations rules knowledge base for PCS reimbursement calculations';

-- =====================================================
-- 2. PCS CLAIM DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pcs_claim_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  claim_id UUID, -- References pcs_claims table
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'orders', 'weigh_ticket', 'lodging_receipt', 'fuel_receipt', 'other'
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  ocr_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  ocr_data JSONB, -- Extracted data from OCR
  normalized_data JSONB, -- Cleaned/normalized data
  verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'verified', 'flagged'
  flags JSONB, -- Array of issues/warnings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pcs_docs_user ON public.pcs_claim_documents(user_id);
CREATE INDEX idx_pcs_docs_claim ON public.pcs_claim_documents(claim_id);
CREATE INDEX idx_pcs_docs_type ON public.pcs_claim_documents(document_type);

COMMENT ON TABLE public.pcs_claim_documents IS 'Uploaded PCS documents with OCR extraction and normalization';

-- Enable RLS
ALTER TABLE public.pcs_claim_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PCS documents"
  ON public.pcs_claim_documents FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own PCS documents"
  ON public.pcs_claim_documents FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own PCS documents"
  ON public.pcs_claim_documents FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own PCS documents"
  ON public.pcs_claim_documents FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 3. PCS CLAIMS (Container for entire claim package)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pcs_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  claim_name TEXT NOT NULL DEFAULT 'My PCS Claim',
  pcs_orders_date DATE,
  departure_date DATE,
  arrival_date DATE,
  origin_base TEXT,
  destination_base TEXT,
  travel_method TEXT, -- 'ppm', 'government', 'mixed'
  dependents_count INTEGER DEFAULT 0,
  rank_at_pcs TEXT,
  branch TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'ready_to_submit', 'submitted', 'approved', 'needs_correction'
  readiness_score INTEGER DEFAULT 0, -- 0-100
  completion_percentage INTEGER DEFAULT 0, -- 0-100
  
  -- Entitlements
  entitlements JSONB, -- Calculated entitlements (DLA, TLE, MALT, etc.)
  
  -- Tracking
  submission_deadline DATE,
  submitted_date DATE,
  last_checked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pcs_claims_user ON public.pcs_claims(user_id);
CREATE INDEX idx_pcs_claims_status ON public.pcs_claims(status);

COMMENT ON TABLE public.pcs_claims IS 'PCS claim packages with entitlements and status tracking';

-- Enable RLS
ALTER TABLE public.pcs_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PCS claims"
  ON public.pcs_claims FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own PCS claims"
  ON public.pcs_claims FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own PCS claims"
  ON public.pcs_claims FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own PCS claims"
  ON public.pcs_claims FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 4. CLAIM ITEMS (Individual line items)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pcs_claim_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.pcs_claims(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.pcs_claim_documents(id) ON DELETE SET NULL,
  
  -- Item details
  category TEXT NOT NULL, -- 'DLA', 'TLE', 'MALT', 'per_diem', 'PPM', 'fuel', 'lodging', etc.
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  vendor TEXT,
  
  -- Eligibility
  is_eligible BOOLEAN DEFAULT true,
  eligibility_reason TEXT,
  jtr_rule_code TEXT, -- References jtr_rules.rule_code
  
  -- Status
  status TEXT DEFAULT 'valid', -- 'valid', 'flagged', 'excluded'
  flags JSONB, -- Array of issues
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_claim_items_claim ON public.pcs_claim_items(claim_id);
CREATE INDEX idx_claim_items_category ON public.pcs_claim_items(category);
CREATE INDEX idx_claim_items_status ON public.pcs_claim_items(status);

COMMENT ON TABLE public.pcs_claim_items IS 'Individual line items in PCS claims with eligibility tracking';

-- Enable RLS
ALTER TABLE public.pcs_claim_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view claim items for own claims"
  ON public.pcs_claim_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pcs_claims
      WHERE pcs_claims.id = pcs_claim_items.claim_id
      AND pcs_claims.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert claim items for own claims"
  ON public.pcs_claim_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pcs_claims
      WHERE pcs_claims.id = pcs_claim_items.claim_id
      AND pcs_claims.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update claim items for own claims"
  ON public.pcs_claim_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pcs_claims
      WHERE pcs_claims.id = pcs_claim_items.claim_id
      AND pcs_claims.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete claim items for own claims"
  ON public.pcs_claim_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pcs_claims
      WHERE pcs_claims.id = pcs_claim_items.claim_id
      AND pcs_claims.user_id = auth.uid()::text
    )
  );

-- =====================================================
-- 5. CLAIM CHECKS (Errors, Warnings, Issues)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pcs_claim_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.pcs_claims(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL, -- 'error', 'warning', 'info'
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  category TEXT NOT NULL, -- 'duplicate', 'missing_doc', 'date_mismatch', 'ineligible', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_fix TEXT,
  jtr_citation TEXT,
  affected_items UUID[], -- Array of claim_item IDs
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_claim_checks_claim ON public.pcs_claim_checks(claim_id);
CREATE INDEX idx_claim_checks_type ON public.pcs_claim_checks(check_type);
CREATE INDEX idx_claim_checks_resolved ON public.pcs_claim_checks(is_resolved);

COMMENT ON TABLE public.pcs_claim_checks IS 'Validation checks, errors, and warnings for PCS claims';

-- Enable RLS
ALTER TABLE public.pcs_claim_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checks for own claims"
  ON public.pcs_claim_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pcs_claims
      WHERE pcs_claims.id = pcs_claim_checks.claim_id
      AND pcs_claims.user_id = auth.uid()::text
    )
  );

-- =====================================================
-- 6. ENTITLEMENT SNAPSHOTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pcs_entitlement_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.pcs_claims(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Calculated entitlements
  dla_amount DECIMAL(10,2),
  tle_days INTEGER,
  tle_amount DECIMAL(10,2),
  malt_miles INTEGER,
  malt_amount DECIMAL(10,2),
  per_diem_days INTEGER,
  per_diem_amount DECIMAL(10,2),
  ppm_weight INTEGER,
  ppm_estimate DECIMAL(10,2),
  
  -- Total
  total_estimated DECIMAL(10,2),
  total_claimed DECIMAL(10,2),
  potential_left_on_table DECIMAL(10,2),
  
  -- Metadata
  calculation_details JSONB,
  rates_used JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entitlement_snapshots_claim ON public.pcs_entitlement_snapshots(claim_id);

COMMENT ON TABLE public.pcs_entitlement_snapshots IS 'Historical snapshots of entitlement calculations';

-- Enable RLS
ALTER TABLE public.pcs_entitlement_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view snapshots for own claims"
  ON public.pcs_entitlement_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pcs_claims
      WHERE pcs_claims.id = pcs_entitlement_snapshots.claim_id
      AND pcs_claims.user_id = auth.uid()::text
    )
  );

-- =====================================================
-- 7. PCS ANALYTICS & TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pcs_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  claim_id UUID REFERENCES public.pcs_claims(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'claim_created', 'document_uploaded', 'check_run', 'claim_submitted', etc.
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pcs_analytics_user ON public.pcs_analytics(user_id);
CREATE INDEX idx_pcs_analytics_claim ON public.pcs_analytics(claim_id);
CREATE INDEX idx_pcs_analytics_event ON public.pcs_analytics(event_type);

COMMENT ON TABLE public.pcs_analytics IS 'Event tracking for PCS Money Copilot usage';

-- Enable RLS
ALTER TABLE public.pcs_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PCS analytics"
  ON public.pcs_analytics FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own PCS analytics"
  ON public.pcs_analytics FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- =====================================================
-- 8. SEED JTR RULES (Top 10 for MVP)
-- =====================================================

INSERT INTO public.jtr_rules (rule_code, rule_title, category, description, calculation_formula, rate_table) VALUES
(
  '050302.B',
  'Dislocation Allowance (DLA)',
  'DLA',
  'One-time allowance to partially reimburse members for expenses incurred in relocating household.',
  'Based on rank (with/without dependents). No receipts required.',
  '{"E1-E4_without": 1234, "E1-E4_with": 2468, "E5-E6_without": 1543, "E5-E6_with": 3086, "E7-E9_without": 1852, "E7-E9_with": 3704, "O1-O3_without": 2160, "O1-O3_with": 4320, "O4-O6_without": 2469, "O4-O6_with": 4938}'::jsonb
),
(
  '054205',
  'Temporary Lodging Expense (TLE)',
  'TLE',
  'Reimbursement for temporary lodging and meals at old/new duty station.',
  'Up to 10 days per location. Actual expenses up to locality per diem rate.',
  '{"max_days_origin": 10, "max_days_destination": 10, "receipt_required": true}'::jsonb
),
(
  '054206',
  'Mileage Allowance in Lieu of Transportation (MALT)',
  'MALT',
  'Monetary allowance for POV travel in lieu of government transportation.',
  'Current rate per mile × official distance + 1 day per diem per 350 miles.',
  '{"rate_per_mile": 0.18, "per_diem_interval_miles": 350}'::jsonb
),
(
  '054401',
  'Per Diem',
  'per_diem',
  'Daily allowance for meals and incidental expenses during travel.',
  'Locality rate × 75% (travel days) or 55% (long-term TDY). First/last day = 75%.',
  '{"travel_rate": 0.75, "long_term_rate": 0.55, "first_last_day_rate": 0.75}'::jsonb
),
(
  '054703',
  'Personally Procured Move (PPM) Weight Allowance',
  'PPM',
  'Government pays percentage of what it would cost to move your household goods.',
  '95% of government cost estimate (GCC) based on weight, distance, and season.',
  '{"payment_percentage": 0.95, "max_weight_by_rank": {"E1": 5000, "E5": 7000, "E7": 11000, "O3": 13000, "O5": 16000}}'::jsonb
),
(
  '054801',
  'Advance Operating Allowance (AOA)',
  'advance',
  'Cash advance up to 100% of estimated entitlements (lodging, per diem).',
  'Requested amount up to estimated TLE + per diem. Must be repaid if not used.',
  '{"max_percentage": 1.0}'::jsonb
),
(
  '051302',
  'Dependent Travel',
  'dependent_travel',
  'Transportation and per diem for authorized dependents.',
  'Same rates as member. Per diem at 75% for travel days.',
  '{"per_diem_rate": 0.75}'::jsonb
),
(
  '052504',
  'POV Storage',
  'pov_storage',
  'Reimbursement for storing POV when authorized.',
  'Actual cost up to $X per month for duration of storage.',
  '{"max_months": 12}'::jsonb
),
(
  '054001',
  'House Hunting Trip (HHT)',
  'hht',
  'Round-trip transportation and per diem for member (and spouse if authorized) to find housing.',
  'Up to 10 days per diem at destination. Travel expenses reimbursed.',
  '{"max_days": 10, "spouse_authorized_conditions": ["married", "dependents"]}'::jsonb
),
(
  '055202',
  'Storage in Transit (SIT)',
  'sit',
  'Temporary storage of household goods at government expense.',
  'Up to 90 days at origin, 90 days at destination. Government arranges.',
  '{"max_days_origin": 90, "max_days_destination": 90}'::jsonb
);

-- =====================================================
-- 9. USAGE LIMITS FOR PCS COPILOT
-- =====================================================

-- Add PCS Copilot limits to existing entitlements tracking
COMMENT ON COLUMN public.entitlements.tier IS 'Subscription tier affects PCS Copilot: free (3 uploads/month), premium (unlimited), pro (unlimited + priority)';

-- =====================================================
-- 10. ANALYTICS EVENTS
-- =====================================================

COMMENT ON TABLE public.pcs_analytics IS 'Track PCS Copilot usage:
- claim_created: New claim started
- document_uploaded: Receipt/order uploaded
- ocr_completed: Document parsed successfully
- entitlement_calculated: Estimates generated
- check_run: Validation run
- item_flagged: Error detected
- item_fixed: User resolved issue
- claim_ready: 100% ready to submit
- claim_submitted: User marked as submitted
';

