/**
 * RAG INFRASTRUCTURE - Phase 1.1
 * 
 * Creates vector storage, embedding tracking, and search functions for
 * Ask Our Military Expert transformation
 * 
 * Created: 2025-01-25
 * Part of: Ask Military Expert Complete Transformation
 */

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- KNOWLEDGE EMBEDDINGS TABLE
-- ============================================================================
-- Stores vector embeddings of all knowledge content (content blocks, JTR, 
-- base guides, community tips, deployment guides)
-- ============================================================================

CREATE TABLE knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content identification
  content_id TEXT NOT NULL,           -- Reference to source (content_block_id, jtr_section_id, etc)
  content_type TEXT NOT NULL,         -- 'content_block', 'jtr', 'base_guide', 'community_tip', 'deployment_guide'
  content_text TEXT NOT NULL,         -- Original text chunk
  
  -- Vector embedding (OpenAI text-embedding-3-small = 1536 dimensions)
  embedding vector(1536),
  
  -- Metadata for filtering and context
  metadata JSONB,                     -- Source URL, effective date, category, tags, rank_context, etc
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vector similarity index using HNSW (Hierarchical Navigable Small World)
-- This provides <100ms search times even with 100K+ vectors
CREATE INDEX idx_knowledge_embeddings_vector ON knowledge_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Create indexes for filtering during searches
CREATE INDEX idx_knowledge_embeddings_type ON knowledge_embeddings(content_type);
CREATE INDEX idx_knowledge_embeddings_content_id ON knowledge_embeddings(content_id);
CREATE INDEX idx_knowledge_embeddings_metadata ON knowledge_embeddings USING gin(metadata);

-- Full-text search index for keyword fallback
CREATE INDEX idx_knowledge_embeddings_text ON knowledge_embeddings 
USING gin(to_tsvector('english', content_text));

COMMENT ON TABLE knowledge_embeddings IS 'Vector embeddings of all military knowledge content for RAG retrieval';
COMMENT ON COLUMN knowledge_embeddings.content_id IS 'Unique identifier of source content (e.g., content_block_id, jtr_chapter_05_section_02)';
COMMENT ON COLUMN knowledge_embeddings.content_type IS 'Type of content: content_block, jtr, base_guide, community_tip, deployment_guide';
COMMENT ON COLUMN knowledge_embeddings.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions)';
COMMENT ON COLUMN knowledge_embeddings.metadata IS 'JSON metadata: {category, tags, source_url, effective_date, rank_context, branch, etc}';

-- ============================================================================
-- EMBEDDING JOBS TABLE
-- ============================================================================
-- Tracks batch embedding generation jobs for monitoring and debugging
-- ============================================================================

CREATE TABLE embedding_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Job details
  job_type TEXT NOT NULL,             -- 'initial', 'incremental', 'full_refresh'
  content_type TEXT NOT NULL,         -- What's being embedded
  
  -- Progress tracking
  items_total INTEGER DEFAULT 0,
  items_processed INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL,               -- 'running', 'completed', 'failed', 'cancelled'
  error_details JSONB,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Performance metrics
  duration_seconds INTEGER,
  avg_time_per_item_ms INTEGER
);

CREATE INDEX idx_embedding_jobs_status ON embedding_jobs(status);
CREATE INDEX idx_embedding_jobs_started ON embedding_jobs(started_at DESC);

COMMENT ON TABLE embedding_jobs IS 'Tracks embedding generation batch jobs for monitoring and debugging';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_jobs ENABLE ROW LEVEL SECURITY;

-- Public read access to embeddings (needed for Ask Assistant queries)
CREATE POLICY "Public read access to knowledge embeddings" 
  ON knowledge_embeddings 
  FOR SELECT 
  USING (true);

-- Service role has full access for embedding generation
CREATE POLICY "Service role full access to knowledge embeddings" 
  ON knowledge_embeddings 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Only service role can manage embedding jobs
CREATE POLICY "Service role full access to embedding jobs" 
  ON embedding_jobs 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Admin users can view jobs for monitoring
CREATE POLICY "Admins can view embedding jobs" 
  ON embedding_jobs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM entitlements 
      WHERE user_id = auth.uid()::text 
      AND tier = 'admin'
    )
  );

-- ============================================================================
-- VECTOR SEARCH FUNCTION
-- ============================================================================
-- Performs cosine similarity search on embeddings
-- Returns top N most similar chunks above threshold
-- ============================================================================

CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content_id text,
  content_type text,
  content_text text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content_id,
    content_type,
    content_text,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  FROM knowledge_embeddings
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

COMMENT ON FUNCTION search_knowledge IS 'Vector similarity search for RAG retrieval. Returns chunks above threshold sorted by cosine similarity.';

-- ============================================================================
-- FILTERED VECTOR SEARCH FUNCTION
-- ============================================================================
-- Same as search_knowledge but allows filtering by content_type and metadata
-- ============================================================================

CREATE OR REPLACE FUNCTION search_knowledge_filtered(
  query_embedding vector(1536),
  content_types text[] DEFAULT NULL,
  metadata_filter jsonb DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content_id text,
  content_type text,
  content_text text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id,
    ke.content_id,
    ke.content_type,
    ke.content_text,
    ke.metadata,
    (1 - (ke.embedding <=> query_embedding)) as similarity
  FROM knowledge_embeddings ke
  WHERE 
    (1 - (ke.embedding <=> query_embedding)) > match_threshold
    AND (content_types IS NULL OR ke.content_type = ANY(content_types))
    AND (metadata_filter IS NULL OR ke.metadata @> metadata_filter)
  ORDER BY ke.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION search_knowledge_filtered IS 'Filtered vector similarity search. Supports content_type array and metadata JSONB filtering.';

-- ============================================================================
-- KEYWORD SEARCH FUNCTION (FALLBACK)
-- ============================================================================
-- Full-text search for exact keyword matches
-- Used as fallback when vector search returns insufficient results
-- ============================================================================

CREATE OR REPLACE FUNCTION keyword_search_knowledge(
  search_query text,
  content_types text[] DEFAULT NULL,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content_id text,
  content_type text,
  content_text text,
  metadata jsonb,
  rank float
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id,
    ke.content_id,
    ke.content_type,
    ke.content_text,
    ke.metadata,
    ts_rank(to_tsvector('english', ke.content_text), websearch_to_tsquery('english', search_query)) as rank
  FROM knowledge_embeddings ke
  WHERE 
    to_tsvector('english', ke.content_text) @@ websearch_to_tsquery('english', search_query)
    AND (content_types IS NULL OR ke.content_type = ANY(content_types))
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION keyword_search_knowledge IS 'Full-text keyword search fallback for exact phrase matching.';

-- ============================================================================
-- STATISTICS VIEW
-- ============================================================================
-- Provides quick stats on knowledge base coverage
-- ============================================================================

CREATE OR REPLACE VIEW knowledge_base_stats AS
SELECT
  content_type,
  COUNT(*) as chunk_count,
  COUNT(DISTINCT content_id) as unique_content_count,
  AVG(LENGTH(content_text)) as avg_chunk_length,
  MIN(created_at) as first_embedded,
  MAX(created_at) as last_embedded
FROM knowledge_embeddings
GROUP BY content_type;

COMMENT ON VIEW knowledge_base_stats IS 'Statistics on knowledge base coverage by content type';

-- ============================================================================
-- TRIGGER: UPDATE TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION update_knowledge_embeddings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_knowledge_embeddings_timestamp
  BEFORE UPDATE ON knowledge_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_embeddings_timestamp();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema (if needed)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant table permissions
GRANT SELECT ON knowledge_embeddings TO anon, authenticated;
GRANT ALL ON knowledge_embeddings TO service_role;
GRANT SELECT ON embedding_jobs TO authenticated;
GRANT ALL ON embedding_jobs TO service_role;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION search_knowledge TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_knowledge_filtered TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION keyword_search_knowledge TO anon, authenticated, service_role;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after migration to verify setup

-- Verify pgvector extension
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- Verify tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('knowledge_embeddings', 'embedding_jobs');

-- Verify indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'knowledge_embeddings';

-- Verify RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('knowledge_embeddings', 'embedding_jobs');

-- Test vector search function (after embeddings are added)
-- SELECT * FROM search_knowledge('[0.1, 0.2, ...]'::vector, 0.5, 5);

-- View knowledge base stats
-- SELECT * FROM knowledge_base_stats;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'RAG Infrastructure Migration Complete';
  RAISE NOTICE 'Tables created: knowledge_embeddings, embedding_jobs';
  RAISE NOTICE 'Functions created: search_knowledge, search_knowledge_filtered, keyword_search_knowledge';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run embedding generation script for content blocks';
  RAISE NOTICE '  2. Verify vector search performance';
  RAISE NOTICE '  3. Test RAG retrieval in Ask Assistant';
END $$;

