/**
 * RAG RETRIEVAL ENGINE
 *
 * Hybrid search system combining:
 * 1. Vector similarity search (semantic)
 * 2. Keyword search (exact matches)
 * 3. Metadata filtering (content type, category, tags)
 * 4. Reranking (future: Cohere)
 *
 * Performance Target: <100ms for 100K vectors
 *
 * Created: 2025-01-25
 * Part of: Ask Military Expert RAG System
 */

import { createClient } from "@supabase/supabase-js";

import { generateEmbedding } from "../embeddings/generate-embeddings";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// TYPES
// ============================================================================

export interface RetrievedChunk {
  id: string;
  content_id: string;
  content_type: string;
  content_text: string;
  metadata: Record<string, unknown>;
  similarity: number;
  retrieval_method: "vector" | "keyword" | "hybrid";
}

export interface SearchFilters {
  content_types?: string[];
  categories?: string[];
  tags?: string[];
  branches?: string[];
  rank_context?: string[];
  min_similarity?: number;
  verified_only?: boolean; // For community tips
}

export interface SearchOptions {
  limit?: number;
  includeKeywordSearch?: boolean;
  rerank?: boolean;
}

// ============================================================================
// VECTOR SEARCH
// ============================================================================

/**
 * Perform vector similarity search
 * Uses cosine similarity with HNSW index for speed
 */
export async function vectorSearch(
  queryEmbedding: number[],
  filters?: SearchFilters,
  limit: number = 10
): Promise<RetrievedChunk[]> {
  try {
    const matchThreshold = filters?.min_similarity || 0.7;
    const matchCount = limit * 2; // Get more for potential reranking

    // Call Supabase RPC function for vector search
    const query = supabase.rpc("search_knowledge_filtered", {
      query_embedding: JSON.stringify(queryEmbedding),
      content_types: filters?.content_types || null,
      metadata_filter: buildMetadataFilter(filters),
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    const { data, error } = await query;

    if (error) {
      console.error("[RAG] Vector search failed:", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("[RAG] No results from vector search");
      return [];
    }

    // Map to RetrievedChunk format
    const chunks: RetrievedChunk[] = data.map((row: any) => ({
      id: row.id,
      content_id: row.content_id,
      content_type: row.content_type,
      content_text: row.content_text,
      metadata: row.metadata || {},
      similarity: row.similarity,
      retrieval_method: "vector",
    }));

    console.log(`[RAG] Vector search found ${chunks.length} results`);
    return chunks.slice(0, limit);
  } catch (error) {
    console.error("[RAG] Vector search exception:", error);
    return [];
  }
}

/**
 * Build metadata JSONB filter from search filters
 */
function buildMetadataFilter(filters?: SearchFilters): Record<string, unknown> | null {
  if (!filters) return null;

  const metadataFilter: Record<string, unknown> = {};

  if (filters.categories && filters.categories.length > 0) {
    metadataFilter.category = filters.categories[0]; // JSONB @> only works with single value
  }

  if (filters.branches && filters.branches.length > 0) {
    metadataFilter.branch = filters.branches[0];
  }

  if (filters.verified_only === true) {
    metadataFilter.verified = true;
  }

  return Object.keys(metadataFilter).length > 0 ? metadataFilter : null;
}

// ============================================================================
// KEYWORD SEARCH
// ============================================================================

/**
 * Full-text keyword search fallback
 * Useful for exact phrases, acronyms, specific terms
 */
export async function keywordSearch(
  query: string,
  filters?: SearchFilters,
  limit: number = 5
): Promise<RetrievedChunk[]> {
  try {
    const { data, error } = await supabase.rpc("keyword_search_knowledge", {
      search_query: query,
      content_types: filters?.content_types || null,
      match_count: limit,
    });

    if (error) {
      console.error("[RAG] Keyword search failed:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const chunks: RetrievedChunk[] = data.map((row: any) => ({
      id: row.id,
      content_id: row.content_id,
      content_type: row.content_type,
      content_text: row.content_text,
      metadata: row.metadata || {},
      similarity: row.rank, // Full-text rank as "similarity"
      retrieval_method: "keyword",
    }));

    console.log(`[RAG] Keyword search found ${chunks.length} results`);
    return chunks;
  } catch (error) {
    console.error("[RAG] Keyword search exception:", error);
    return [];
  }
}

// ============================================================================
// HYBRID SEARCH (MAIN FUNCTION)
// ============================================================================

/**
 * Hybrid search combining vector + keyword with deduplication
 * This is the main function used by Ask Assistant
 */
export async function hybridSearch(
  query: string,
  filters?: SearchFilters,
  options?: SearchOptions
): Promise<RetrievedChunk[]> {
  const limit = options?.limit || 10;
  const includeKeyword = options?.includeKeywordSearch !== false;

  console.log(`[RAG] Hybrid search: "${query.substring(0, 100)}..." (limit: ${limit})`);

  try {
    // Step 1: Generate query embedding
    const startEmbed = Date.now();
    const queryEmbedding = await generateEmbedding(query);
    const embedTime = Date.now() - startEmbed;
    console.log(`[RAG] Query embedding generated in ${embedTime}ms`);

    // Step 2: Vector similarity search
    const startVector = Date.now();
    const vectorResults = await vectorSearch(queryEmbedding, filters, limit);
    const vectorTime = Date.now() - startVector;
    console.log(`[RAG] Vector search completed in ${vectorTime}ms`);

    // Step 3: Keyword search (if enabled and vector results are sparse)
    let keywordResults: RetrievedChunk[] = [];
    if (includeKeyword && vectorResults.length < limit) {
      const startKeyword = Date.now();
      keywordResults = await keywordSearch(query, filters, 5);
      const keywordTime = Date.now() - startKeyword;
      console.log(`[RAG] Keyword search completed in ${keywordTime}ms`);
    }

    // Step 4: Merge and deduplicate
    const combined = [...vectorResults, ...keywordResults];
    const uniqueMap = new Map<string, RetrievedChunk>();

    for (const chunk of combined) {
      const existing = uniqueMap.get(chunk.content_id);
      if (!existing || chunk.similarity > existing.similarity) {
        uniqueMap.set(chunk.content_id, {
          ...chunk,
          retrieval_method: existing ? "hybrid" : chunk.retrieval_method,
        });
      }
    }

    // Step 5: Sort by similarity and limit
    const results = Array.from(uniqueMap.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    console.log(`[RAG] Hybrid search complete: ${results.length} unique results`);
    console.log(
      `[RAG] Breakdown: ${vectorResults.length} vector, ${keywordResults.length} keyword, ${results.length} merged`
    );

    return results;
  } catch (error) {
    console.error("[RAG] Hybrid search failed:", error);
    return [];
  }
}

// ============================================================================
// CONTENT-TYPE SPECIFIC SEARCHES
// ============================================================================

/**
 * Search only content blocks (410 curated articles)
 */
export async function searchContentBlocks(
  query: string,
  categories?: string[],
  limit: number = 5
): Promise<RetrievedChunk[]> {
  return hybridSearch(
    query,
    {
      content_types: ["content_block"],
      categories,
    },
    { limit }
  );
}

/**
 * Search JTR regulations
 */
export async function searchJTR(
  query: string,
  chapters?: string[],
  limit: number = 5
): Promise<RetrievedChunk[]> {
  // Note: chapter filtering would need custom metadata filter
  return hybridSearch(
    query,
    {
      content_types: ["jtr"],
    },
    { limit }
  );
}

/**
 * Search base guides
 */
export async function searchBaseGuides(
  query: string,
  baseNames?: string[],
  limit: number = 5
): Promise<RetrievedChunk[]> {
  return hybridSearch(
    query,
    {
      content_types: ["base_guide"],
    },
    { limit }
  );
}

/**
 * Search community tips (verified only)
 */
export async function searchCommunityTips(
  query: string,
  tipTypes?: string[],
  verifiedOnly: boolean = true,
  limit: number = 5
): Promise<RetrievedChunk[]> {
  return hybridSearch(
    query,
    {
      content_types: ["community_tip"],
      verified_only: verifiedOnly,
    },
    { limit }
  );
}

/**
 * Search deployment guides
 */
export async function searchDeploymentGuides(
  query: string,
  phases?: Array<"pre_deployment" | "during_deployment" | "post_deployment">,
  limit: number = 5
): Promise<RetrievedChunk[]> {
  return hybridSearch(
    query,
    {
      content_types: ["deployment_guide"],
    },
    { limit }
  );
}

// ============================================================================
// TOPIC-BASED ROUTING
// ============================================================================

/**
 * Map extracted topics to content types for filtering
 * Used by data query engine to route searches
 */
export function mapTopicsToContentTypes(topics: string[]): string[] {
  const contentTypes = new Set<string>();

  // Always include content blocks (general knowledge)
  contentTypes.add("content_block");

  for (const topic of topics) {
    switch (topic) {
      case "pcs":
      case "entitlements":
        contentTypes.add("jtr");
        contentTypes.add("base_guide");
        contentTypes.add("community_tip");
        break;

      case "deployment":
        contentTypes.add("deployment_guide");
        contentTypes.add("community_tip");
        break;

      case "base":
        contentTypes.add("base_guide");
        contentTypes.add("community_tip");
        break;

      case "career":
      case "retirement":
        contentTypes.add("content_block");
        contentTypes.add("community_tip");
        break;

      default:
        // For other topics, rely on general content blocks
        break;
    }
  }

  return Array.from(contentTypes);
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export interface SearchPerformanceMetrics {
  query: string;
  total_time_ms: number;
  embedding_time_ms: number;
  vector_search_time_ms: number;
  keyword_search_time_ms: number;
  results_count: number;
  avg_similarity: number;
}

/**
 * Wrapper that tracks performance metrics
 */
export async function hybridSearchWithMetrics(
  query: string,
  filters?: SearchFilters,
  options?: SearchOptions
): Promise<{ results: RetrievedChunk[]; metrics: SearchPerformanceMetrics }> {
  const startTotal = Date.now();

  const results = await hybridSearch(query, filters, options);

  const totalTime = Date.now() - startTotal;
  const avgSimilarity =
    results.length > 0 ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length : 0;

  const metrics: SearchPerformanceMetrics = {
    query: query.substring(0, 100),
    total_time_ms: totalTime,
    embedding_time_ms: 0, // Would need to track separately
    vector_search_time_ms: 0,
    keyword_search_time_ms: 0,
    results_count: results.length,
    avg_similarity: Math.round(avgSimilarity * 100) / 100,
  };

  return { results, metrics };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Test vector search performance
 */
export async function testSearchPerformance(testQueries: string[]): Promise<void> {
  console.log("[RAG] Testing search performance...");

  for (const query of testQueries) {
    const { results, metrics } = await hybridSearchWithMetrics(query, undefined, { limit: 10 });

    console.log(`\n[TEST] Query: "${query}"`);
    console.log(`       Time: ${metrics.total_time_ms}ms`);
    console.log(`       Results: ${metrics.results_count}`);
    console.log(`       Avg Similarity: ${metrics.avg_similarity}`);

    if (results.length > 0) {
      console.log(
        `       Top result: ${results[0].content_type} (${results[0].similarity.toFixed(3)})`
      );
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { supabase as ragSupabase };
