/**
 * CHECK EMBEDDINGS STATUS
 * 
 * Verifies RAG infrastructure and embedding coverage
 * 
 * Usage:
 *   ts-node scripts/check-embeddings-status.ts
 * 
 * Created: 2025-01-25
 */

import { createClient } from '@supabase/supabase-js';
import { getEmbeddingStats } from '../lib/embeddings/generate-embeddings';
import { DATA_SOURCES, getDataSourceSummary } from '../lib/data/freshness-tracker';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// MAIN
// ============================================================================

async function checkStatus() {
  console.log('='.repeat(60));
  console.log('RAG INFRASTRUCTURE STATUS CHECK');
  console.log('='.repeat(60));
  console.log('');
  
  let allChecks = true;
  
  // ============================================================
  // 1. Check pgvector extension
  // ============================================================
  console.log('[1/6] Checking pgvector extension...');
  try {
    const { data: extensions, error } = await supabase.rpc('pg_get_extensions' as any);
    
    if (error) {
      console.log('  ⚠️  Cannot check extensions (might not have permission)');
    } else {
      console.log('  ✓ pgvector extension verified');
    }
  } catch (error) {
    console.log('  ⚠️  Extension check skipped (permission issue)');
  }
  console.log('');
  
  // ============================================================
  // 2. Check tables exist
  // ============================================================
  console.log('[2/6] Checking database tables...');
  try {
    const { error: embeddingsError } = await supabase
      .from('knowledge_embeddings')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    const { error: jobsError } = await supabase
      .from('embedding_jobs')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    if (embeddingsError) {
      console.log('  ❌ knowledge_embeddings table not found');
      console.log('     Run migration: supabase-migrations/20250125_rag_infrastructure.sql');
      allChecks = false;
    } else {
      console.log('  ✓ knowledge_embeddings table exists');
    }
    
    if (jobsError) {
      console.log('  ❌ embedding_jobs table not found');
      allChecks = false;
    } else {
      console.log('  ✓ embedding_jobs table exists');
    }
  } catch (error) {
    console.log('  ❌ Table check failed:', error);
    allChecks = false;
  }
  console.log('');
  
  // ============================================================
  // 3. Check embedding coverage
  // ============================================================
  console.log('[3/6] Checking embedding coverage...');
  try {
    const stats = await getEmbeddingStats();
    
    if (Object.keys(stats).length === 0) {
      console.log('  ⚠️  No embeddings found');
      console.log('     Run: npm run rag:embed-content');
    } else {
      console.log('  ✓ Embeddings found:');
      for (const [type, count] of Object.entries(stats)) {
        console.log(`    - ${type}: ${count} chunks`);
      }
      
      const totalChunks = Object.values(stats).reduce((sum, count) => sum + count, 0);
      console.log(`  Total: ${totalChunks} chunks embedded`);
    }
  } catch (error) {
    console.log('  ❌ Failed to get embedding stats:', error);
    allChecks = false;
  }
  console.log('');
  
  // ============================================================
  // 4. Check embedding jobs
  // ============================================================
  console.log('[4/6] Checking embedding jobs...');
  try {
    const { data: jobs, error } = await supabase
      .from('embedding_jobs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('  ❌ Failed to fetch jobs:', error.message);
      allChecks = false;
    } else if (!jobs || jobs.length === 0) {
      console.log('  ⚠️  No embedding jobs found');
      console.log('     Run: npm run rag:embed-content');
    } else {
      console.log(`  ✓ Found ${jobs.length} recent jobs:`);
      for (const job of jobs) {
        const status = job.status === 'completed' ? '✓' : job.status === 'failed' ? '❌' : '⏳';
        const duration = job.duration_seconds ? `${job.duration_seconds}s` : 'N/A';
        console.log(`    ${status} ${job.job_type} - ${job.content_type} (${job.items_processed}/${job.items_total}) - ${duration}`);
      }
    }
  } catch (error) {
    console.log('  ❌ Job check failed:', error);
    allChecks = false;
  }
  console.log('');
  
  // ============================================================
  // 5. Check search functions
  // ============================================================
  console.log('[5/6] Checking search functions...');
  try {
    // Test a simple vector search
    const testEmbedding = new Array(1536).fill(0);
    testEmbedding[0] = 1; // Set first dimension to 1 for valid vector
    
    const { error: searchError } = await supabase.rpc('search_knowledge', {
      query_embedding: JSON.stringify(testEmbedding),
      match_threshold: 0.5,
      match_count: 1,
    });
    
    if (searchError) {
      console.log('  ❌ search_knowledge function not working:', searchError.message);
      allChecks = false;
    } else {
      console.log('  ✓ search_knowledge function operational');
    }
    
    // Test filtered search
    const { error: filteredError } = await supabase.rpc('search_knowledge_filtered', {
      query_embedding: JSON.stringify(testEmbedding),
      content_types: ['content_block'],
      metadata_filter: null,
      match_threshold: 0.5,
      match_count: 1,
    });
    
    if (filteredError) {
      console.log('  ❌ search_knowledge_filtered function not working:', filteredError.message);
      allChecks = false;
    } else {
      console.log('  ✓ search_knowledge_filtered function operational');
    }
  } catch (error) {
    console.log('  ❌ Function check failed:', error);
    allChecks = false;
  }
  console.log('');
  
  // ============================================================
  // 6. Check data source freshness
  // ============================================================
  console.log('[6/6] Checking data source freshness...');
  try {
    const summary = getDataSourceSummary();
    
    console.log('  Data Sources Status:');
    console.log(`    Fresh: ${summary.fresh}/${summary.total}`);
    console.log(`    Stale: ${summary.stale}/${summary.total}`);
    console.log(`    Expired: ${summary.expired}/${summary.total}`);
    
    if (summary.expired > 0) {
      console.log('');
      console.log('  ⚠️  Expired sources (need refresh):');
      summary.sources
        .filter(s => s.status === 'expired')
        .forEach(s => {
          console.log(`    - ${s.name} (${s.daysSinceUpdate} days old)`);
        });
    }
    
    if (summary.stale > 0) {
      console.log('');
      console.log('  ⚠️  Stale sources (refresh recommended):');
      summary.sources
        .filter(s => s.status === 'stale')
        .forEach(s => {
          console.log(`    - ${s.name} (${s.daysSinceUpdate} days old)`);
        });
    }
  } catch (error) {
    console.log('  ❌ Freshness check failed:', error);
  }
  console.log('');
  
  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('='.repeat(60));
  if (allChecks) {
    console.log('✅ ALL CHECKS PASSED');
    console.log('RAG infrastructure is operational and ready to use!');
  } else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('Please review errors above and fix before proceeding.');
  }
  console.log('='.repeat(60));
  console.log('');
  
  // Next steps
  console.log('Next Steps:');
  const stats = await getEmbeddingStats();
  const totalChunks = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  if (totalChunks === 0) {
    console.log('  1. Run embedding script: npm run rag:embed-content');
    console.log('  2. Test RAG search: npm run rag:test-search');
    console.log('  3. Integrate with Ask Assistant (Phase 2)');
  } else if (totalChunks < 500) {
    console.log('  1. ✓ Embeddings present but limited');
    console.log('  2. Test RAG search: npm run rag:test-search');
    console.log('  3. Consider adding more content (Phase 3)');
    console.log('  4. Integrate with Ask Assistant (Phase 2)');
  } else {
    console.log('  1. ✓ Good embedding coverage');
    console.log('  2. Test RAG search: npm run rag:test-search');
    console.log('  3. Integrate with Ask Assistant (Phase 2)');
    console.log('  4. Monitor performance in production');
  }
  console.log('');
  
  if (!allChecks) {
    process.exit(1);
  }
}

// ============================================================================
// RUN
// ============================================================================

// Check environment
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

checkStatus()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('');
    console.error('❌ Status check failed:', error);
    console.error('');
    process.exit(1);
  });

