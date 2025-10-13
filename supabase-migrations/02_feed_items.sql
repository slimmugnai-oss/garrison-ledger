-- ==========================================
-- FEED ITEMS TABLE - Intelligence Briefing Pipeline
-- ==========================================
-- Stores RSS feed articles for admin curation
-- Automated ingestion → Admin review → Promote to content_blocks

CREATE TABLE IF NOT EXISTS feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL, -- Identifier for the RSS feed source (e.g., 'military_times', 'stars_stripes')
  url TEXT NOT NULL UNIQUE, -- Canonical URL of the article (used for deduplication)
  title TEXT NOT NULL,
  summary TEXT, -- Auto-extracted or RSS description
  raw_html TEXT, -- Sanitized HTML content
  tags TEXT[] DEFAULT '{}', -- Auto-suggested keyword tags
  published_at TIMESTAMPTZ, -- Original publication date from feed
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected', 'promoted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  promoted_slug TEXT, -- If promoted, the slug of the content_block it became
  notes TEXT -- Admin notes/feedback
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feed_items_status ON feed_items(status);
CREATE INDEX IF NOT EXISTS idx_feed_items_created_at ON feed_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_items_source_id ON feed_items(source_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_url ON feed_items(url); -- Fast dedup checks

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_feed_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feed_items_updated_at
  BEFORE UPDATE ON feed_items
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_items_updated_at();

-- Row Level Security (RLS)
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything (for API routes)
CREATE POLICY "Service role full access" ON feed_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE feed_items IS 'RSS feed articles for curation into content_blocks';
COMMENT ON COLUMN feed_items.source_id IS 'RSS feed identifier (e.g., military_times, stars_stripes)';
COMMENT ON COLUMN feed_items.url IS 'Canonical article URL for deduplication';
COMMENT ON COLUMN feed_items.status IS 'Workflow status: new → approved/rejected → promoted';
COMMENT ON COLUMN feed_items.promoted_slug IS 'Slug of content_block if promoted';

