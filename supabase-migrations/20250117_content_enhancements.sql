-- Content Enhancements: Social Sharing, Analytics, and Advanced Features
-- Created: 2025-01-17

-- ============================================================================
-- CONTENT SHARES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  shared_by TEXT NOT NULL, -- Clerk user ID
  share_type TEXT NOT NULL CHECK (share_type IN ('public', 'private', 'unit')),
  share_token TEXT NOT NULL UNIQUE,
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_shares_content_id ON content_shares(content_id);
CREATE INDEX idx_content_shares_shared_by ON content_shares(shared_by);
CREATE INDEX idx_content_shares_token ON content_shares(share_token);
CREATE INDEX idx_content_shares_created_at ON content_shares(created_at DESC);

COMMENT ON TABLE content_shares IS 'Tracks content shared by users (public links, private shares, unit shares)';

-- ============================================================================
-- SHARE RECIPIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS share_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES content_shares(id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL, -- Clerk user ID
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'bookmarked')),
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_share_recipients_share_id ON share_recipients(share_id);
CREATE INDEX idx_share_recipients_recipient_id ON share_recipients(recipient_id);
CREATE INDEX idx_share_recipients_status ON share_recipients(status);

COMMENT ON TABLE share_recipients IS 'Tracks recipients of private content shares';

-- ============================================================================
-- SHARE VIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES content_shares(id) ON DELETE CASCADE,
  viewer_id TEXT, -- Clerk user ID (null for anonymous views)
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

CREATE INDEX idx_share_views_share_id ON share_views(share_id);
CREATE INDEX idx_share_views_viewer_id ON share_views(viewer_id);
CREATE INDEX idx_share_views_viewed_at ON share_views(viewed_at DESC);

COMMENT ON TABLE share_views IS 'Tracks views of shared content (analytics)';

-- ============================================================================
-- CONTENT COLLECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_collections_user_id ON content_collections(user_id);
CREATE INDEX idx_content_collections_is_public ON content_collections(is_public);
CREATE INDEX idx_content_collections_created_at ON content_collections(created_at DESC);

COMMENT ON TABLE content_collections IS 'User-created collections of content blocks (like playlists)';

-- ============================================================================
-- COLLECTION ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES content_collections(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX idx_collection_items_content_id ON collection_items(content_id);
CREATE INDEX idx_collection_items_position ON collection_items(collection_id, position);

COMMENT ON TABLE collection_items IS 'Content blocks within collections';

-- ============================================================================
-- CONTENT RECOMMENDATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  content_id TEXT NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('personalized', 'trending', 'related', 'similar_users')),
  relevance_score NUMERIC(5,4) NOT NULL DEFAULT 0.0, -- 0.0 to 1.0
  reasoning JSONB, -- Explanation of why recommended
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clicked_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_content_recommendations_user_id ON content_recommendations(user_id);
CREATE INDEX idx_content_recommendations_content_id ON content_recommendations(content_id);
CREATE INDEX idx_content_recommendations_type ON content_recommendations(recommendation_type);
CREATE INDEX idx_content_recommendations_score ON content_recommendations(relevance_score DESC);
CREATE INDEX idx_content_recommendations_shown_at ON content_recommendations(shown_at DESC);

COMMENT ON TABLE content_recommendations IS 'Tracks content recommendations shown to users (for ML improvement)';

-- ============================================================================
-- CONTENT SEQUENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT, -- e.g., 'pcs_preparation', 'deployment_readiness', 'retirement_planning'
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours NUMERIC(4,1),
  is_public BOOLEAN DEFAULT TRUE,
  created_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_sequences_goal ON content_sequences(goal);
CREATE INDEX idx_content_sequences_difficulty ON content_sequences(difficulty_level);
CREATE INDEX idx_content_sequences_public ON content_sequences(is_public);

COMMENT ON TABLE content_sequences IS 'Curated learning paths (sequences of content to complete)';

-- ============================================================================
-- SEQUENCE ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sequence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES content_sequences(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  estimated_minutes INTEGER,
  completion_criteria TEXT -- e.g., 'view', 'bookmark', 'rate', 'use_calculator'
);

CREATE INDEX idx_sequence_items_sequence_id ON sequence_items(sequence_id);
CREATE INDEX idx_sequence_items_position ON sequence_items(sequence_id, position);
CREATE INDEX idx_sequence_items_content_id ON sequence_items(content_id);

COMMENT ON TABLE sequence_items IS 'Content blocks within learning sequences';

-- ============================================================================
-- USER SEQUENCE PROGRESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sequence_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  sequence_id UUID NOT NULL REFERENCES content_sequences(id) ON DELETE CASCADE,
  current_position INTEGER DEFAULT 0,
  items_completed INTEGER DEFAULT 0,
  total_items INTEGER NOT NULL,
  completion_percentage NUMERIC(5,2) DEFAULT 0.00,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sequence_progress_user_id ON user_sequence_progress(user_id);
CREATE INDEX idx_user_sequence_progress_sequence_id ON user_sequence_progress(sequence_id);
CREATE INDEX idx_user_sequence_progress_completion ON user_sequence_progress(completion_percentage DESC);

COMMENT ON TABLE user_sequence_progress IS 'Tracks user progress through learning sequences';

-- ============================================================================
-- CONTENT NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  content_id TEXT NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_notes_user_id ON content_notes(user_id);
CREATE INDEX idx_content_notes_content_id ON content_notes(content_id);
CREATE INDEX idx_content_notes_created_at ON content_notes(created_at DESC);

COMMENT ON TABLE content_notes IS 'User notes on content blocks';

-- ============================================================================
-- CALCULATOR LAUNCHES TABLE (from content)
-- ============================================================================
CREATE TABLE IF NOT EXISTS calculator_launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  content_id TEXT REFERENCES content_blocks(id) ON DELETE SET NULL,
  calculator_id TEXT NOT NULL,
  prefill_data JSONB,
  launched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_calculator_launches_user_id ON calculator_launches(user_id);
CREATE INDEX idx_calculator_launches_content_id ON calculator_launches(content_id);
CREATE INDEX idx_calculator_launches_calculator_id ON calculator_launches(calculator_id);
CREATE INDEX idx_calculator_launches_launched_at ON calculator_launches(launched_at DESC);

COMMENT ON TABLE calculator_launches IS 'Tracks calculator launches from content blocks (conversion tracking)';

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Content Shares - Users can view their own shares and shares they're recipients of
ALTER TABLE content_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shares"
  ON content_shares FOR SELECT
  USING (shared_by = auth.uid()::text);

CREATE POLICY "Users can create shares"
  ON content_shares FOR INSERT
  WITH CHECK (shared_by = auth.uid()::text);

CREATE POLICY "Users can delete their own shares"
  ON content_shares FOR DELETE
  USING (shared_by = auth.uid()::text);

-- Share Recipients - Users can view shares they're recipients of
ALTER TABLE share_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their recipient records"
  ON share_recipients FOR SELECT
  USING (recipient_id = auth.uid()::text);

-- Share Views - Public read for analytics
ALTER TABLE share_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create share views"
  ON share_views FOR INSERT
  WITH CHECK (true);

-- Content Collections - Users own their collections
ALTER TABLE content_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collections"
  ON content_collections FOR SELECT
  USING (user_id = auth.uid()::text OR is_public = true);

CREATE POLICY "Users can create collections"
  ON content_collections FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their collections"
  ON content_collections FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their collections"
  ON content_collections FOR DELETE
  USING (user_id = auth.uid()::text);

-- Collection Items - Inherit collection permissions
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items in their collections"
  ON collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_collections
      WHERE id = collection_items.collection_id
      AND (user_id = auth.uid()::text OR is_public = true)
    )
  );

CREATE POLICY "Users can add items to their collections"
  ON collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_collections
      WHERE id = collection_items.collection_id
      AND user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete items from their collections"
  ON collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM content_collections
      WHERE id = collection_items.collection_id
      AND user_id = auth.uid()::text
    )
  );

-- Content Recommendations - Users see their own recommendations
ALTER TABLE content_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their recommendations"
  ON content_recommendations FOR SELECT
  USING (user_id = auth.uid()::text);

-- Content Sequences - Public sequences visible to all
ALTER TABLE content_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public sequences"
  ON content_sequences FOR SELECT
  USING (is_public = true OR created_by = auth.uid()::text);

-- User Sequence Progress - Users own their progress
ALTER TABLE user_sequence_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON user_sequence_progress FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own progress"
  ON user_sequence_progress FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own progress"
  ON user_sequence_progress FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Content Notes - Private by default
ALTER TABLE content_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON content_notes FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create notes"
  ON content_notes FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their notes"
  ON content_notes FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their notes"
  ON content_notes FOR DELETE
  USING (user_id = auth.uid()::text);

-- Calculator Launches - Users see their own launches
ALTER TABLE calculator_launches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their calculator launches"
  ON calculator_launches FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create calculator launches"
  ON calculator_launches FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_shares_updated_at
  BEFORE UPDATE ON content_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_collections_updated_at
  BEFORE UPDATE ON content_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_notes_updated_at
  BEFORE UPDATE ON content_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA - Example Learning Sequence
-- ============================================================================

-- PCS Preparation Sequence
INSERT INTO content_sequences (name, description, goal, difficulty_level, estimated_hours, is_public)
VALUES (
  'PCS Preparation Masterclass',
  'Complete guide to preparing for a PCS move, from start to finish',
  'pcs_preparation',
  'beginner',
  4.5,
  true
);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON content_shares TO authenticated;
GRANT ALL ON share_recipients TO authenticated;
GRANT ALL ON share_views TO authenticated;
GRANT ALL ON content_collections TO authenticated;
GRANT ALL ON collection_items TO authenticated;
GRANT ALL ON content_recommendations TO authenticated;
GRANT ALL ON content_sequences TO authenticated;
GRANT ALL ON sequence_items TO authenticated;
GRANT ALL ON user_sequence_progress TO authenticated;
GRANT ALL ON content_notes TO authenticated;
GRANT ALL ON calculator_launches TO authenticated;

