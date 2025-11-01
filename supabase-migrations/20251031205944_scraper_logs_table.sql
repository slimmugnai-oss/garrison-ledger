-- Create scraper_logs table for tracking automated scraper executions

CREATE TABLE IF NOT EXISTS scraper_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scraper_name TEXT NOT NULL CHECK (scraper_name IN ('dfas', 'jtr', 'va')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
  items_found INTEGER DEFAULT 0,
  error_message TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying scraper history
CREATE INDEX IF NOT EXISTS idx_scraper_logs_scraper_name ON scraper_logs(scraper_name);
CREATE INDEX IF NOT EXISTS idx_scraper_logs_executed_at ON scraper_logs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraper_logs_status ON scraper_logs(status);

-- RLS (no user access needed - admin only)
ALTER TABLE scraper_logs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE scraper_logs IS 'Tracks execution history of automated scrapers (DFAS, JTR, VA)';
COMMENT ON COLUMN scraper_logs.scraper_name IS 'Name of the scraper: dfas, jtr, or va';
COMMENT ON COLUMN scraper_logs.status IS 'Execution status: success or failure';
COMMENT ON COLUMN scraper_logs.items_found IS 'Number of items found/processed in this run';
COMMENT ON COLUMN scraper_logs.error_message IS 'Error message if status is failure';
COMMENT ON COLUMN scraper_logs.executed_at IS 'When the scraper ran';
