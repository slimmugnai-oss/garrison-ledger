/**
 * EMBEDDING GENERATION SYSTEM
 *
 * Generates vector embeddings for knowledge content using OpenAI's
 * text-embedding-3-small model (1536 dimensions)
 *
 * Features:
 * - Batch processing for efficiency
 * - Job tracking for monitoring
 * - Error handling with retries
 */


/**
 * - Cost tracking
 *
 * Created: 2025-01-25
 * Part of: Ask Military Expert RAG System
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

import { logger } from "@/lib/logger";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_EMBEDDING_KEY,
});

// ============================================================================
// TYPES
// ============================================================================

export interface EmbeddingInput {
  content_id: string;
  content_type: string;
  content_text: string;
  metadata: Record<string, unknown>;
}

export interface EmbeddingJob {
  id: string;
  job_type: "initial" | "incremental" | "full_refresh";
  content_type: string;
  items_total: number;
  items_processed: number;
  items_failed: number;
  status: "running" | "completed" | "failed" | "cancelled";
  started_at: string;
}

export interface EmbeddingResult {
  content_id: string;
  embedding: number[];
  success: boolean;
  error?: string;
}

// ============================================================================
// CORE EMBEDDING FUNCTIONS
// ============================================================================

/**
 * Generate a single embedding for text
 * Uses OpenAI text-embedding-3-small (1536 dimensions, $0.02 per 1M tokens)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    logger.error("[Embeddings] Generation failed:", error);
    throw new Error(
      `Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * OpenAI allows up to 2048 inputs per request, we use 100 for safety
 */
export async function batchGenerateEmbeddings(
  texts: string[],
  options?: {
    batchSize?: number;
    onProgress?: (processed: number, total: number) => void;
  }
): Promise<number[][]> {
  const batchSize = options?.batchSize || 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, Math.min(i + batchSize, texts.length));

    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batch,
        encoding_format: "float",
      });

      const embeddings = response.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);

      allEmbeddings.push(...embeddings);

      // Report progress
      if (options?.onProgress) {
        options.onProgress(Math.min(i + batchSize, texts.length), texts.length);
      }

      logger.info(
        `[Embeddings] Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} embeddings generated`
      );
    } catch (error) {
      logger.error(`[Embeddings] Batch failed at index ${i}:`, error);

      // Retry individual items in failed batch
      logger.info(`[Embeddings] Retrying ${batch.length} items individually...`);
      for (const text of batch) {
        try {
          const embedding = await generateEmbedding(text);
          allEmbeddings.push(embedding);
        } catch (retryError) {
          logger.error("[Embeddings] Individual retry failed:", retryError);
          // Push zero vector as placeholder
          allEmbeddings.push(new Array(1536).fill(0));
        }
      }
    }

    // Small delay to respect rate limits
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allEmbeddings;
}

// ============================================================================
// JOB MANAGEMENT
// ============================================================================

/**
 * Create a new embedding job
 */
export async function createEmbeddingJob(
  jobType: "initial" | "incremental" | "full_refresh",
  contentType: string,
  totalItems: number
): Promise<string> {
  const { data, error } = await supabase
    .from("embedding_jobs")
    .insert({
      job_type: jobType,
      content_type: contentType,
      items_total: totalItems,
      status: "running",
    })
    .select("id")
    .single();

  if (error) {
    logger.error("[Embeddings] Failed to create job:", error);
    throw new Error("Failed to create embedding job");
  }

  logger.info(`[Embeddings] Job created: ${data.id} (${jobType} - ${contentType})`);
  return data.id;
}

/**
 * Update job progress
 */
export async function updateJobProgress(
  jobId: string,
  processed: number,
  failed: number = 0
): Promise<void> {
  const { error } = await supabase
    .from("embedding_jobs")
    .update({
      items_processed: processed,
      items_failed: failed,
    })
    .eq("id", jobId);

  if (error) {
    logger.error("[Embeddings] Failed to update job progress:", error);
  }
}

/**
 * Complete a job
 */
export async function completeJob(
  jobId: string,
  status: "completed" | "failed",
  errorDetails?: Record<string, unknown>
): Promise<void> {
  // Calculate duration
  const { data: job } = await supabase
    .from("embedding_jobs")
    .select("started_at, items_total, items_processed")
    .eq("id", jobId)
    .single();

  if (!job) return;

  const duration = Math.floor((Date.now() - new Date(job.started_at).getTime()) / 1000);
  const avgTimePerItem =
    job.items_processed > 0 ? Math.floor((duration * 1000) / job.items_processed) : 0;

  const { error } = await supabase
    .from("embedding_jobs")
    .update({
      status,
      completed_at: new Date().toISOString(),
      duration_seconds: duration,
      avg_time_per_item_ms: avgTimePerItem,
      error_details: errorDetails || null,
    })
    .eq("id", jobId);

  if (error) {
    logger.error("[Embeddings] Failed to complete job:", error);
  }

  logger.info(
    `[Embeddings] Job ${jobId} ${status}. Duration: ${duration}s, Avg: ${avgTimePerItem}ms/item`
  );
}

// ============================================================================
// HIGH-LEVEL BATCH PROCESSING
// ============================================================================

/**
 * Process a batch of content and store embeddings
 * This is the main function used by scripts
 */
export async function processAndStoreEmbeddings(
  inputs: EmbeddingInput[],
  jobId: string,
  options?: {
    batchSize?: number;
    onProgress?: (processed: number, total: number) => void;
  }
): Promise<{ success: number; failed: number }> {
  const batchSize = options?.batchSize || 100;
  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < inputs.length; i += batchSize) {
    const batch = inputs.slice(i, Math.min(i + batchSize, inputs.length));

    try {
      // Generate embeddings for batch
      const texts = batch.map((b) => b.content_text);
      const embeddings = await batchGenerateEmbeddings(texts, {
        batchSize: 100,
        onProgress: (processed, total) => {
          const globalProcessed = i + processed;
          options?.onProgress?.(globalProcessed, inputs.length);
        },
      });

      // Prepare records for insertion
      const records = batch.map((input, idx) => ({
        content_id: input.content_id,
        content_type: input.content_type,
        content_text: input.content_text,
        embedding: JSON.stringify(embeddings[idx]), // Supabase needs JSON string for vector
        metadata: input.metadata,
      }));

      // Insert into database (upsert to handle duplicates)
      const { error } = await supabase.from("knowledge_embeddings").upsert(records, {
        onConflict: "content_id",
        ignoreDuplicates: false,
      });

      if (error) {
        logger.error(`[Embeddings] Failed to insert batch at index ${i}:`, error);
        failedCount += batch.length;
      } else {
        successCount += batch.length;
        logger.info(
          `[Embeddings] Inserted ${batch.length} embeddings (${successCount}/${inputs.length})`
        );
      }

      // Update job progress
      await updateJobProgress(jobId, successCount, failedCount);
    } catch (error) {
      logger.error(`[Embeddings] Batch processing failed at index ${i}:`, error);
      failedCount += batch.length;
      await updateJobProgress(jobId, successCount, failedCount);
    }
  }

  return { success: successCount, failed: failedCount };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Delete all embeddings for a specific content type
 * Useful for full refresh
 */
export async function deleteEmbeddingsByType(contentType: string): Promise<number> {
  const { error, count } = await supabase
    .from("knowledge_embeddings")
    .delete({ count: "exact" })
    .eq("content_type", contentType);

  if (error) {
    logger.error("[Embeddings] Failed to delete embeddings:", error);
    throw new Error("Failed to delete embeddings");
  }

  logger.info(`[Embeddings] Deleted ${count || 0} embeddings for type: ${contentType}`);
  return count || 0;
}

/**
 * Get total count of embeddings by type
 */
export async function getEmbeddingStats(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("knowledge_base_stats")
    .select("content_type, chunk_count");

  if (error) {
    logger.error("[Embeddings] Failed to get stats:", error);
    return {};
  }

  const stats: Record<string, number> = {};
  data?.forEach((row) => {
    stats[row.content_type] = row.chunk_count;
  });

  return stats;
}

/**
 * Estimate cost for embedding text
 * OpenAI text-embedding-3-small: $0.02 per 1M tokens
 */
export function estimateEmbeddingCost(texts: string[]): { tokens: number; costUSD: number } {
  // Rough estimate: 1 token ≈ 0.75 words (4 chars)
  const totalChars = texts.reduce((sum, text) => sum + text.length, 0);
  const estimatedTokens = Math.ceil(totalChars / 4);
  const costUSD = (estimatedTokens / 1_000_000) * 0.02;

  return {
    tokens: estimatedTokens,
    costUSD: Math.round(costUSD * 10000) / 10000, // Round to 4 decimals
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { supabase as embeddingsSupabase, openai as embeddingsOpenAI };
