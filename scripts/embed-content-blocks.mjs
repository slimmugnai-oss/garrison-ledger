/**
 * EMBED CONTENT BLOCKS SCRIPT
 * 
 * Embeds all 410 existing content blocks into the vector database
 * 
 * Usage:
 *   node scripts/embed-content-blocks.mjs
 * 
 * Environment variables required:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - OPENAI_API_KEY
 * 
 * Created: 2025-01-25
 * Part of: Ask Military Expert RAG System
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

// Verify environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: Generate embedding
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });
  return response.data[0].embedding;
}

// Helper: Chunk content block
function chunkContentBlock(block) {
  const maxChunkWords = 500;
  const overlapWords = 50;
  
  if (!block.text_content || block.text_content.trim().length === 0) {
    // If no text content, use title + summary
    const fallbackText = `${block.title}\n\n${block.summary || block.html?.replace(/<[^>]*>/g, '').substring(0, 500) || ''}`;
    return [{
      id: `${block.id}_chunk_0`,
      text: fallbackText,
      metadata: {
        content_block_id: block.id,
        title: block.title,
        domain: block.domain,
        topics: block.topics || [],
        difficulty_level: block.difficulty_level,
        gating: block.gating,
        status: block.status,
      },
    }];
  }
  
  const words = block.text_content.split(/\s+/);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += (maxChunkWords - overlapWords)) {
    const chunk = words.slice(i, i + maxChunkWords).join(' ');
    chunks.push({
      id: `${block.id}_chunk_${chunks.length}`,
      text: `${block.title}\n\n${chunk}`,
      metadata: {
        content_block_id: block.id,
        title: block.title,
        domain: block.domain,
        topics: block.topics || [],
        difficulty_level: block.difficulty_level,
        gating: block.gating,
        status: block.status,
      },
    });
  }
  
  return chunks;
}

async function main() {
  console.log('🚀 Starting content block embedding process...\n');
  
  // 1. Create embedding job
  const { data: job, error: jobError } = await supabase
    .from('embedding_jobs')
    .insert({
      job_type: 'initial',
      content_type: 'content_blocks',
      status: 'running',
    })
    .select()
    .single();
    
  if (jobError) {
    console.error('❌ Failed to create embedding job:', jobError);
    process.exit(1);
  }
  
  console.log(`✅ Created embedding job: ${job.id}\n`);
  
  // 2. Fetch all content blocks
  const { data: blocks, error: blocksError } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('status', 'published');
    
  if (blocksError) {
    console.error('❌ Failed to fetch content blocks:', blocksError);
    process.exit(1);
  }
  
  console.log(`📚 Found ${blocks.length} published content blocks\n`);
  
  // 3. Chunk all blocks
  const allChunks = [];
  for (const block of blocks) {
    const chunks = chunkContentBlock(block);
    allChunks.push(...chunks);
  }
  
  console.log(`🔪 Created ${allChunks.length} chunks from ${blocks.length} blocks\n`);
  
  // 4. Update job with total count
  await supabase
    .from('embedding_jobs')
    .update({ items_total: allChunks.length })
    .eq('id', job.id);
  
  // 5. Process in batches
  const batchSize = 50;
  let processed = 0;
  let failed = 0;
  
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allChunks.length / batchSize)}...`);
    
    try {
      // Generate embeddings for batch
      const embeddings = await Promise.all(
        batch.map(chunk => generateEmbedding(chunk.text))
      );
      
      // Prepare records
      const records = batch.map((chunk, idx) => ({
        content_id: chunk.id,
        content_type: 'content_block',
        content_text: chunk.text,
        embedding: embeddings[idx],
        metadata: chunk.metadata,
      }));
      
      // Insert into database
      const { error: insertError } = await supabase
        .from('knowledge_embeddings')
        .insert(records);
        
      if (insertError) {
        console.error(`  ❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, insertError.message);
        failed += batch.length;
      } else {
        processed += batch.length;
        console.log(`  ✅ Processed ${processed}/${allChunks.length} chunks`);
      }
      
      // Update job progress
      await supabase
        .from('embedding_jobs')
        .update({ 
          items_processed: processed,
          items_failed: failed,
        })
        .eq('id', job.id);
        
    } catch (error) {
      console.error(`  ❌ Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
      failed += batch.length;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 6. Complete job
  const endTime = new Date();
  const startTime = new Date(job.started_at);
  const durationSeconds = Math.floor((endTime - startTime) / 1000);
  
  await supabase
    .from('embedding_jobs')
    .update({ 
      status: failed > 0 ? 'completed_with_errors' : 'completed',
      completed_at: endTime.toISOString(),
      duration_seconds: durationSeconds,
      avg_time_per_item_ms: Math.floor((durationSeconds * 1000) / processed),
    })
    .eq('id', job.id);
  
  console.log(`\n✅ Embedding complete!`);
  console.log(`   Processed: ${processed}/${allChunks.length}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Duration: ${durationSeconds}s`);
  console.log(`   Avg time per chunk: ${Math.floor((durationSeconds * 1000) / processed)}ms`);
}

main().catch(console.error);

