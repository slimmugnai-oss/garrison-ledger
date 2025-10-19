-- =====================================================================
-- CONTENT GOVERNANCE SYSTEM
-- Created: 2025-10-20
-- Purpose: Content audit, versioning, and dynamic data source tracking
-- Part of: Intel Library Hardening & Auto-Updating Data Blocks
-- =====================================================================

-- =====================================================================
-- CONTENT BLOCKS ENHANCEMENTS
-- =====================================================================
-- Extend existing content_blocks table with governance fields
ALTER TABLE IF EXISTS content_blocks
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS gating TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS file_path TEXT,
  ADD COLUMN IF NOT EXISTS as_of_date DATE,
  ADD COLUMN IF NOT EXISTS last_linted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_autofixed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS domain TEXT;

-- Add constraint for valid status values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'content_blocks_status_check'
  ) THEN
    ALTER TABLE content_blocks
      ADD CONSTRAINT content_blocks_status_check 
      CHECK (status IN ('published', 'draft', 'needs_review', 'archived'));
  END IF;
END $$;

-- Add constraint for valid gating values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'content_blocks_gating_check'
  ) THEN
    ALTER TABLE content_blocks
      ADD CONSTRAINT content_blocks_gating_check 
      CHECK (gating IN ('free', 'premium'));
  END IF;
END $$;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_content_blocks_status ON content_blocks(status);
CREATE INDEX IF NOT EXISTS idx_content_blocks_gating ON content_blocks(gating);
CREATE INDEX IF NOT EXISTS idx_content_blocks_domain ON content_blocks(domain);
CREATE INDEX IF NOT EXISTS idx_content_blocks_as_of ON content_blocks(as_of_date DESC);

-- Comments
COMMENT ON COLUMN content_blocks.status IS 'Content status: published, draft, needs_review, archived';
COMMENT ON COLUMN content_blocks.gating IS 'Access tier: free or premium';
COMMENT ON COLUMN content_blocks.file_path IS 'Repository file path (e.g., content/finance/tsp-basics.mdx)';
COMMENT ON COLUMN content_blocks.as_of_date IS 'Last verified date for time-sensitive content';
COMMENT ON COLUMN content_blocks.domain IS 'Content domain: finance, pcs, lifestyle, career, deployment, etc.';

-- =====================================================================
-- CONTENT FLAGS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS content_flags (
  id BIGSERIAL PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  flag_type TEXT NOT NULL,  -- 'GUARANTEE_LANGUAGE', 'MISSING_DISCLAIMER', 'RATE', 'TAX_INFO', etc.
  sample TEXT,              -- Excerpt showing the flagged content
  recommendation TEXT,      -- Suggested fix
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,         -- User ID who resolved
  resolution_notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_flags_block_id ON content_flags(block_id);
CREATE INDEX IF NOT EXISTS idx_content_flags_severity ON content_flags(severity);
CREATE INDEX IF NOT EXISTS idx_content_flags_unresolved ON content_flags(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_flags_type ON content_flags(flag_type);

-- Comments
COMMENT ON TABLE content_flags IS 'Audit flags from content linter - tracks quality and compliance issues';
COMMENT ON COLUMN content_flags.flag_type IS 'Flag category: GUARANTEE_LANGUAGE, MISSING_DISCLAIMER, RATE, TAX_INFO, BENEFITS_INFO, etc.';
COMMENT ON COLUMN content_flags.sample IS 'Text excerpt showing the problematic content';

-- =====================================================================
-- CONTENT VERSIONS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS content_versions (
  id BIGSERIAL PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  commit_sha TEXT NOT NULL,
  changed_files TEXT[] NOT NULL,
  editor_user_id TEXT,      -- Who made the change
  change_summary TEXT,      -- Brief description
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_versions_block_id ON content_versions(block_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_commit ON content_versions(commit_sha);
CREATE INDEX IF NOT EXISTS idx_content_versions_created ON content_versions(created_at DESC);

-- Comments
COMMENT ON TABLE content_versions IS 'Version history snapshot for content blocks - tracks changes over time';
COMMENT ON COLUMN content_versions.commit_sha IS 'Git commit SHA for traceability';

-- =====================================================================
-- CONTENT SOURCES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS content_sources (
  id BIGSERIAL PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,  -- 'BAH', 'BAS', 'COLA', 'IRS_TSP_LIMITS', 'TRICARE_COSTS', etc.
  as_of_date DATE,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_sources_block_id ON content_sources(block_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_key ON content_sources(source_key);
CREATE INDEX IF NOT EXISTS idx_content_sources_meta ON content_sources USING gin(meta);

-- Comments
COMMENT ON TABLE content_sources IS 'Dynamic data sources referenced in content blocks';
COMMENT ON COLUMN content_sources.source_key IS 'Source identifier: BAH, BAS, COLA, IRS_TSP_LIMITS, TRICARE_COSTS, etc.';
COMMENT ON COLUMN content_sources.meta IS 'Additional metadata (attribution URL, cache info, etc.)';

-- =====================================================================
-- DYNAMIC FEEDS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS dynamic_feeds (
  id BIGSERIAL PRIMARY KEY,
  source_key TEXT NOT NULL UNIQUE,  -- 'BAH', 'BAS', 'COLA', 'IRS_TSP_LIMITS', 'TRICARE_COSTS'
  ttl_seconds INTEGER NOT NULL,
  last_refresh_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'stale', 'error')),
  notes TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_dynamic_feeds_source_key ON dynamic_feeds(source_key);
CREATE INDEX IF NOT EXISTS idx_dynamic_feeds_status ON dynamic_feeds(status);

-- Comments
COMMENT ON TABLE dynamic_feeds IS 'Catalog of dynamic data feeds and their refresh status';
COMMENT ON COLUMN dynamic_feeds.ttl_seconds IS 'Time-to-live in seconds (e.g., 86400 = 24 hours)';
COMMENT ON COLUMN dynamic_feeds.status IS 'Feed status: ok, stale (needs refresh), error (failed)';

-- =====================================================================
-- SEED INITIAL DYNAMIC FEEDS
-- =====================================================================
INSERT INTO dynamic_feeds (source_key, ttl_seconds, notes) VALUES
  ('BAH', 86400, 'BAH rates - refresh daily (tables updated annually in January)'),
  ('BAS', 604800, 'BAS constants - refresh weekly (changes rarely, usually January)'),
  ('COLA', 86400, 'COLA rates - refresh daily (CONUS/OCONUS updated quarterly)'),
  ('IRS_TSP_LIMITS', 86400, 'IRS/TSP contribution limits - refresh daily (changes annually in November)'),
  ('TRICARE_COSTS', 604800, 'TRICARE cost-shares and premiums - refresh weekly (changes annually in January)')
ON CONFLICT (source_key) DO NOTHING;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_feeds ENABLE ROW LEVEL SECURITY;

-- Public read for published content metadata
CREATE POLICY "Public read content flags for published blocks" ON content_flags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_blocks 
      WHERE content_blocks.id = content_flags.block_id 
      AND content_blocks.status = 'published'
    )
  );

CREATE POLICY "Public read content sources" ON content_sources
  FOR SELECT USING (true);

CREATE POLICY "Public read dynamic feeds" ON dynamic_feeds
  FOR SELECT USING (true);

CREATE POLICY "Public read content versions" ON content_versions
  FOR SELECT USING (true);

-- Admin write access (service role)
CREATE POLICY "Service role can manage content flags" ON content_flags
  FOR ALL USING (true);

CREATE POLICY "Service role can manage content versions" ON content_versions
  FOR ALL USING (true);

CREATE POLICY "Service role can manage content sources" ON content_sources
  FOR ALL USING (true);

CREATE POLICY "Service role can manage dynamic feeds" ON dynamic_feeds
  FOR ALL USING (true);

