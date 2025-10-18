-- PCS MONEY COPILOT ENHANCEMENTS
-- Adds city/state fields for accurate per diem calculations
-- Adds actual reimbursement tracking for accuracy validation
-- Run after: 20250118_pcs_money_copilot.sql

-- Add origin and destination city/state fields to pcs_claims
ALTER TABLE public.pcs_claims
ADD COLUMN IF NOT EXISTS origin_city TEXT,
ADD COLUMN IF NOT EXISTS origin_state TEXT,
ADD COLUMN IF NOT EXISTS destination_city TEXT,
ADD COLUMN IF NOT EXISTS destination_state TEXT,
ADD COLUMN IF NOT EXISTS actual_reimbursements JSONB,
ADD COLUMN IF NOT EXISTS submitted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_date TIMESTAMP WITH TIME ZONE;

-- Add comment explaining the fields
COMMENT ON COLUMN public.pcs_claims.origin_city IS 'Origin city for per diem rate lookup';
COMMENT ON COLUMN public.pcs_claims.origin_state IS 'Origin state (2-letter code) for per diem rate lookup';
COMMENT ON COLUMN public.pcs_claims.destination_city IS 'Destination city for per diem rate lookup';
COMMENT ON COLUMN public.pcs_claims.destination_state IS 'Destination state (2-letter code) for per diem rate lookup';
COMMENT ON COLUMN public.pcs_claims.actual_reimbursements IS 'Actual reimbursement amounts received from finance office';
COMMENT ON COLUMN public.pcs_claims.submitted_date IS 'Date claim was submitted to finance office';
COMMENT ON COLUMN public.pcs_claims.approved_date IS 'Date claim was approved by finance office';

