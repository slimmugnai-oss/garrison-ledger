-- PCS MONEY COPILOT ENHANCEMENTS
-- Adds city/state fields for accurate per diem calculations
-- Run after: 20250118_pcs_money_copilot.sql

-- Add origin and destination city/state fields to pcs_claims
ALTER TABLE public.pcs_claims
ADD COLUMN IF NOT EXISTS origin_city TEXT,
ADD COLUMN IF NOT EXISTS origin_state TEXT,
ADD COLUMN IF NOT EXISTS destination_city TEXT,
ADD COLUMN IF NOT EXISTS destination_state TEXT;

-- Add comment explaining the fields
COMMENT ON COLUMN public.pcs_claims.origin_city IS 'Origin city for per diem rate lookup';
COMMENT ON COLUMN public.pcs_claims.origin_state IS 'Origin state (2-letter code) for per diem rate lookup';
COMMENT ON COLUMN public.pcs_claims.destination_city IS 'Destination city for per diem rate lookup';
COMMENT ON COLUMN public.pcs_claims.destination_state IS 'Destination state (2-letter code) for per diem rate lookup';

