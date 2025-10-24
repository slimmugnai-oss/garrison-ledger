/**
 * TEST RAG SEARCH
 * 
 * Tests the RAG retrieval system with sample military questions
 * 
 * Usage:
 *   ts-node scripts/test-rag-search.ts
 * 
 * Created: 2025-01-25
 */

import { hybridSearch, hybridSearchWithMetrics } from '../lib/rag/retrieval-engine';

// ============================================================================
// TEST QUESTIONS
// ============================================================================

const TEST_QUESTIONS = [
  // Financial
  { category: 'Financial', question: "What is my BAH as an E-5 with dependents?" },
  { category: 'Financial', question: "Should I max out my TSP or pay off debt?" },
  { category: 'Financial', question: "How does SGLI life insurance work?" },
  
  // PCS/Relocation
  { category: 'PCS', question: "How do I maximize profit on a DITY move?" },
  { category: 'PCS', question: "What is the PCS timeline from orders to moving day?" },
  { category: 'PCS', question: "Should I live on-base or off-base at Fort Hood?" },
  
  // Deployment
  { category: 'Deployment', question: "How does the Savings Deposit Program (SDP) work?" },
  { category: 'Deployment', question: "What financial preparations should I make before deployment?" },
  { category: 'Deployment', question: "How does combat zone tax exclusion work?" },
  
  // Career
  { category: 'Career', question: "When can I expect promotion to E-6?" },
  { category: 'Career', question: "What are selective reenlistment bonuses?" },
  { category: 'Career', question: "How do I decide between BRS and High-3 retirement?" },
  
  // Lifestyle
  { category: 'Lifestyle', question: "How much can I save shopping at the commissary?" },
  { category: 'Lifestyle', question: "What is military spouse preference hiring?" },
  { category: 'Lifestyle', question: "How do I transfer my GI Bill to my spouse?" },
];

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runTests() {
  console.log('='.repeat(70));
  console.log('RAG SEARCH TEST SUITE');
  console.log('='.repeat(70));
  console.log('');
  console.log(`Testing ${TEST_QUESTIONS.length} questions across ${new Set(TEST_QUESTIONS.map(q => q.category)).size} categories`);
  console.log('');
  
  const results: Array<{
    category: string;
    question: string;
    results_count: number;
    avg_similarity: number;
    top_content_type: string;
    time_ms: number;
    success: boolean;
  }> = [];
  
  for (let i = 0; i < TEST_QUESTIONS.length; i++) {
    const { category, question } = TEST_QUESTIONS[i];
    
    console.log(`[${i + 1}/${TEST_QUESTIONS.length}] ${category}: "${question}"`);
    console.log('-'.repeat(70));
    
    try {
      const { results: chunks, metrics } = await hybridSearchWithMetrics(
        question,
        undefined,
        { limit: 5 }
      );
      
      if (chunks.length === 0) {
        console.log('  ⚠️  No results found');
        results.push({
          category,
          question,
          results_count: 0,
          avg_similarity: 0,
          top_content_type: 'none',
          time_ms: metrics.total_time_ms,
          success: false,
        });
      } else {
        console.log(`  ✓ Found ${chunks.length} results in ${metrics.total_time_ms}ms`);
        console.log(`  Top match: ${chunks[0].content_type} (similarity: ${chunks[0].similarity.toFixed(3)})`);
        console.log(`  Preview: ${chunks[0].content_text.substring(0, 150)}...`);
        
        results.push({
          category,
          question,
          results_count: chunks.length,
          avg_similarity: metrics.avg_similarity,
          top_content_type: chunks[0].content_type,
          time_ms: metrics.total_time_ms,
          success: true,
        });
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.push({
        category,
        question,
        results_count: 0,
        avg_similarity: 0,
        top_content_type: 'error',
        time_ms: 0,
        success: false,
      });
    }
    
    console.log('');
  }
  
  // Summary
  console.log('='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));
  console.log('');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgTime = results.filter(r => r.success).reduce((sum, r) => sum + r.time_ms, 0) / successful;
  const avgSimilarity = results.filter(r => r.success).reduce((sum, r) => sum + r.avg_similarity, 0) / successful;
  
  console.log(`Tests run: ${results.length}`);
  console.log(`Successful: ${successful} (${(successful / results.length * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed}`);
  console.log(`Average search time: ${avgTime.toFixed(0)}ms`);
  console.log(`Average similarity: ${avgSimilarity.toFixed(3)}`);
  console.log('');
  
  // Category breakdown
  console.log('By Category:');
  const categories = Array.from(new Set(results.map(r => r.category)));
  for (const cat of categories) {
    const catResults = results.filter(r => r.category === cat);
    const catSuccess = catResults.filter(r => r.success).length;
    const catAvgSim = catResults.filter(r => r.success).reduce((sum, r) => sum + r.avg_similarity, 0) / catSuccess;
    console.log(`  ${cat}: ${catSuccess}/${catResults.length} (avg similarity: ${catAvgSim.toFixed(3)})`);
  }
  console.log('');
  
  // Performance check
  console.log('Performance Check:');
  if (avgTime < 100) {
    console.log('  ✅ Search speed: EXCELLENT (<100ms)');
  } else if (avgTime < 200) {
    console.log('  ✅ Search speed: GOOD (<200ms)');
  } else if (avgTime < 500) {
    console.log('  ⚠️  Search speed: ACCEPTABLE (<500ms) - Consider optimization');
  } else {
    console.log('  ❌ Search speed: SLOW (>500ms) - Optimization needed');
  }
  
  if (avgSimilarity > 0.8) {
    console.log('  ✅ Relevance: EXCELLENT (>0.8 similarity)');
  } else if (avgSimilarity > 0.7) {
    console.log('  ✅ Relevance: GOOD (>0.7 similarity)');
  } else if (avgSimilarity > 0.6) {
    console.log('  ⚠️  Relevance: ACCEPTABLE (>0.6 similarity) - Consider more content');
  } else {
    console.log('  ❌ Relevance: LOW (<0.6 similarity) - Add more relevant content');
  }
  
  console.log('');
  console.log('='.repeat(70));
  console.log('✨ TEST COMPLETE ✨');
  console.log('='.repeat(70));
  
  if (failed > 0) {
    process.exit(1);
  }
}

// ============================================================================
// RUN
// ============================================================================

// Check environment
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OpenAI API key');
  process.exit(1);
}

runTests()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('');
    console.error('❌ Test suite failed:', error);
    console.error('');
    process.exit(1);
  });

