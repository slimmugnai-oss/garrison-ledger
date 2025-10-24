/**
 * EMBED CONTENT BLOCKS SCRIPT
 * 
 * Embeds all 410 existing content blocks into the vector database
 * 
 * Usage:
 *   ts-node scripts/embed-content-blocks.ts
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
import {
  createEmbeddingJob,
  processAndStoreEmbeddings,
  completeJob,
  estimateEmbeddingCost,
  type EmbeddingInput,
} from '../lib/embeddings/generate-embeddings';
import { chunkContentBlock } from '../lib/embeddings/chunk-content';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function embedContentBlocks() {
  console.log('='.repeat(60));
  console.log('EMBEDDING CONTENT BLOCKS');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    // Step 1: Fetch all content blocks
    console.log('[Step 1/5] Fetching content blocks from database...');
    const { data: blocks, error: fetchError } = await supabase
      .from('content_blocks')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Failed to fetch content blocks:', fetchError);
      process.exit(1);
    }
    
    if (!blocks || blocks.length === 0) {
      console.log('⚠️  No content blocks found in database');
      process.exit(0);
    }
    
    console.log(`✓ Found ${blocks.length} content blocks`);
    console.log('');
    
    // Step 2: Chunk content blocks
    console.log('[Step 2/5] Chunking content blocks...');
    const allChunks: EmbeddingInput[] = [];
    
    for (const block of blocks) {
      const chunks = chunkContentBlock({
        id: block.id,
        title: block.title,
        body: block.body,
        category: block.category,
        tags: block.tags,
        expert_level: block.expert_level,
        metadata: block.metadata,
      });
      
      chunks.forEach(chunk => {
        allChunks.push({
          content_id: chunk.id,
          content_type: 'content_block',
          content_text: chunk.text,
          metadata: chunk.metadata,
        });
      });
    }
    
    console.log(`✓ Created ${allChunks.length} chunks from ${blocks.length} blocks`);
    console.log(`  Average chunks per block: ${(allChunks.length / blocks.length).toFixed(1)}`);
    console.log('');
    
    // Step 3: Estimate cost
    console.log('[Step 3/5] Estimating embedding cost...');
    const allTexts = allChunks.map(c => c.content_text);
    const { tokens, costUSD } = estimateEmbeddingCost(allTexts);
    
    console.log(`  Estimated tokens: ${tokens.toLocaleString()}`);
    console.log(`  Estimated cost: $${costUSD.toFixed(4)}`);
    console.log('');
    
    // Confirm before proceeding
    if (costUSD > 0.10) {
      console.log('⚠️  Cost exceeds $0.10 - please confirm before proceeding');
      // In production, add confirmation prompt here
    }
    
    // Step 4: Create embedding job
    console.log('[Step 4/5] Creating embedding job...');
    const jobId = await createEmbeddingJob('initial', 'content_blocks', allChunks.length);
    console.log(`✓ Job created: ${jobId}`);
    console.log('');
    
    // Step 5: Generate and store embeddings
    console.log('[Step 5/5] Generating embeddings and storing in database...');
    console.log('  This may take several minutes...');
    console.log('');
    
    const startTime = Date.now();
    let lastProgressUpdate = 0;
    
    const { success, failed } = await processAndStoreEmbeddings(
      allChunks,
      jobId,
      {
        batchSize: 100,
        onProgress: (processed, total) => {
          const percent = Math.floor((processed / total) * 100);
          
          // Update every 10%
          if (percent >= lastProgressUpdate + 10) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const rate = processed / elapsed;
            const remaining = Math.ceil((total - processed) / rate);
            
            console.log(`  Progress: ${percent}% (${processed}/${total}) - ${elapsed}s elapsed, ~${remaining}s remaining`);
            lastProgressUpdate = percent;
          }
        },
      }
    );
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    
    console.log('');
    console.log('✓ Embedding generation complete!');
    console.log(`  Success: ${success}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Total time: ${totalTime}s`);
    console.log(`  Rate: ${(success / totalTime).toFixed(1)} chunks/sec`);
    console.log('');
    
    // Complete the job
    await completeJob(
      jobId,
      failed === 0 ? 'completed' : 'failed',
      failed > 0 ? { failed_count: failed, success_count: success } : undefined
    );
    
    // Step 6: Verify embeddings
    console.log('[Verification] Checking stored embeddings...');
    const { count, error: countError } = await supabase
      .from('knowledge_embeddings')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'content_block');
    
    if (countError) {
      console.error('❌ Failed to verify embeddings:', countError);
    } else {
      console.log(`✓ Verified: ${count} embeddings stored in database`);
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✨ EMBEDDING COMPLETE ✨');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('  1. Test vector search: npm run test-rag-search');
    console.log('  2. Integrate with Ask Assistant');
    console.log('  3. Monitor performance in admin dashboard');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ FATAL ERROR:', error);
    console.error('');
    process.exit(1);
  }
}

// ============================================================================
// RUN SCRIPT
// ============================================================================

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OpenAI API key');
  console.error('   Required: OPENAI_API_KEY');
  process.exit(1);
}

embedContentBlocks()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });

