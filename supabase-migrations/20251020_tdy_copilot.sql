-- =====================================================================
-- TDY / TRAVEL VOUCHER COPILOT
-- Created: 2025-10-20
-- Purpose: Travel voucher builder with receipt parsing and compliance checking
-- Features: Per-diem calculations, receipt categorization, duplicate detection
-- =====================================================================

-- =====================================================================
-- ENUMS
-- =====================================================================
CREATE TYPE tdy_doc_type AS ENUM ('ORDERS', 'LODGING', 'MEALS', 'MILEAGE', 'MISC', 'OTHER');

-- =====================================================================
-- TDY TRIPS
-- =====================================================================
CREATE TABLE IF NOT EXISTS tdy_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  purpose TEXT NOT NULL,          -- 'TDY', 'House-Hunting', 'ITA', etc.
  origin TEXT NOT NULL,            -- City, state or ZIP
  destination TEXT NOT NULL,       -- City, state or ZIP
  depart_date DATE NOT NULL,
  return_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tdy_trips_user ON tdy_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_tdy_trips_depart ON tdy_trips(user_id, depart_date DESC);

COMMENT ON TABLE tdy_trips IS 'TDY travel trips with dates and locations';
COMMENT ON COLUMN tdy_trips.purpose IS 'Trip type: TDY, House-Hunting, ITA, etc.';

-- =====================================================================
-- TDY DOCUMENTS (PDFs, Images)
-- =====================================================================
CREATE TABLE IF NOT EXISTS tdy_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES tdy_trips(id) ON DELETE CASCADE,
  doc_type tdy_doc_type NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_path TEXT NOT NULL,      -- Supabase storage path
  parsed_ok BOOLEAN DEFAULT false,
  parsed JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tdy_docs_trip ON tdy_docs(trip_id);
CREATE INDEX IF NOT EXISTS idx_tdy_docs_type ON tdy_docs(doc_type);

COMMENT ON TABLE tdy_docs IS 'Uploaded receipts and documents for TDY trips';
COMMENT ON COLUMN tdy_docs.parsed IS 'Parsed data: { hints: item_count } or { error: reason }';

-- =====================================================================
-- NORMALIZED LINE ITEMS
-- =====================================================================
CREATE TABLE IF NOT EXISTS tdy_items_normalized (
  id BIGSERIAL PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES tdy_trips(id) ON DELETE CASCADE,
  source_doc UUID REFERENCES tdy_docs(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL,         -- 'lodging', 'meals', 'mileage', 'misc'
  tx_date DATE NOT NULL,
  vendor TEXT,
  description TEXT,
  amount_cents INTEGER NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,  -- nights, nightly_rate_cents, tax_cents, miles, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tdy_items_trip ON tdy_items_normalized(trip_id);
CREATE INDEX IF NOT EXISTS idx_tdy_items_date ON tdy_items_normalized(trip_id, tx_date);
CREATE INDEX IF NOT EXISTS idx_tdy_items_type ON tdy_items_normalized(item_type);

COMMENT ON TABLE tdy_items_normalized IS 'Parsed and normalized line items from receipts';
COMMENT ON COLUMN tdy_items_normalized.meta IS 'Additional data: { nights, nightly_rate_cents, tax_cents, miles, includes_tax, etc. }';

-- =====================================================================
-- PER DIEM SNAPSHOTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS tdy_per_diem_snap (
  id BIGSERIAL PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES tdy_trips(id) ON DELETE CASCADE,
  locality TEXT NOT NULL,          -- 'ZIP:98498' or 'CITY:SEATTLE,WA'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  mie_cents INTEGER NOT NULL,      -- Meals & Incidentals daily rate
  lodging_cap_cents INTEGER NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perdiem_trip ON tdy_per_diem_snap(trip_id);

COMMENT ON TABLE tdy_per_diem_snap IS 'Cached per-diem rates for trip date ranges';
COMMENT ON COLUMN tdy_per_diem_snap.mie_cents IS 'Daily M&IE rate in cents (apply 75% on travel days)';

-- =====================================================================
-- TDY FLAGS (Compliance Issues)
-- =====================================================================
CREATE TABLE IF NOT EXISTS tdy_flags (
  id BIGSERIAL PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES tdy_trips(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('red', 'yellow', 'green')),
  flag_code TEXT NOT NULL,         -- 'DUP_RECEIPT', 'OUT_OF_WINDOW', 'OVER_LODGING_CAP', etc.
  message TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  ref TEXT,                        -- Reference to DFAS/DoD policy
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tdy_flags_trip ON tdy_flags(trip_id);
CREATE INDEX IF NOT EXISTS idx_tdy_flags_severity ON tdy_flags(severity);

COMMENT ON TABLE tdy_flags IS 'Compliance flags for TDY vouchers (duplicates, over-caps, etc.)';

-- =====================================================================
-- CONFIG CONSTANTS (Mileage Rate, etc.)
-- =====================================================================
CREATE TABLE IF NOT EXISTS config_constants (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE config_constants IS 'System configuration constants (mileage rate, etc.)';

-- Seed default mileage rate (67 cents per mile as of 2025)
INSERT INTO config_constants (key, value) VALUES
  ('mileage_cents_per_mile', jsonb_build_object('cents', 67, 'as_of', '2025-01-01'))
ON CONFLICT (key) DO NOTHING;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

-- Trips: Users own their trips
ALTER TABLE tdy_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their TDY trips" ON tdy_trips
  FOR ALL 
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Docs: Users own their trip docs
ALTER TABLE tdy_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own TDY docs via trip" ON tdy_docs
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM tdy_trips 
      WHERE tdy_trips.id = tdy_docs.trip_id 
      AND tdy_trips.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Items: Users own their trip items
ALTER TABLE tdy_items_normalized ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own TDY items via trip" ON tdy_items_normalized
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM tdy_trips 
      WHERE tdy_trips.id = tdy_items_normalized.trip_id 
      AND tdy_trips.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Per diem: Users own their trip per-diem
ALTER TABLE tdy_per_diem_snap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own TDY per-diem via trip" ON tdy_per_diem_snap
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM tdy_trips 
      WHERE tdy_trips.id = tdy_per_diem_snap.trip_id 
      AND tdy_trips.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Flags: Users own their trip flags
ALTER TABLE tdy_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own TDY flags via trip" ON tdy_flags
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM tdy_trips 
      WHERE tdy_trips.id = tdy_flags.trip_id 
      AND tdy_trips.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Config: Public read, service role write
ALTER TABLE config_constants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read config constants" ON config_constants
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage config" ON config_constants
  FOR ALL USING (true);

