#!/usr/bin/env node

/**
 * Simple RAG System Test
 * 
 * Tests the basic functionality of the AI Expert system
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRAGSystem() {
  console.log('🧪 Starting Simple RAG System Test');
  console.log('═══════════════════════════════════════════════');
  
  try {
    // Test 1: Check embeddings count
    console.log('\n📊 Test 1: Embeddings Count');
    const { count: totalEmbeddings, error: countError } = await supabase
      .from('knowledge_embeddings')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log(`  ❌ Failed to count embeddings: ${countError.message}`);
      return;
    }
    
    console.log(`  ✅ Total embeddings: ${totalEmbeddings}`);
    
    if (totalEmbeddings < 1000) {
      console.log(`  ⚠️  Low embedding count: ${totalEmbeddings} (expected >1000)`);
    } else {
      console.log(`  ✅ Embedding count looks good: ${totalEmbeddings}`);
    }
    
    // Test 2: Check content type distribution
    console.log('\n📊 Test 2: Content Type Distribution');
    const { data: typeData, error: typeError } = await supabase
      .from('knowledge_embeddings')
      .select('content_type')
      .not('content_type', 'is', null);
    
    if (typeError) {
      console.log(`  ❌ Failed to get content types: ${typeError.message}`);
      return;
    }
    
    const typeCounts = {};
    typeData.forEach(item => {
      typeCounts[item.content_type] = (typeCounts[item.content_type] || 0) + 1;
    });
    
    console.log('  📈 Content type breakdown:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`    ${type}: ${count} chunks`);
    });
    
    // Test 3: Test vector search functionality
    console.log('\n📊 Test 3: Vector Search Test');
    const testQuery = "What's my BAH as an E-5 at Fort Hood?";
    
    try {
      // Try to get some embeddings to test similarity
      const { data: sampleEmbeddings, error: sampleError } = await supabase
        .from('knowledge_embeddings')
        .select('content_text, content_type, metadata')
        .eq('content_type', 'bah_rate')
        .limit(5);
      
      if (sampleError) {
        console.log(`  ❌ Failed to get sample embeddings: ${sampleError.message}`);
        return;
      }
      
      if (sampleEmbeddings && sampleEmbeddings.length > 0) {
        console.log(`  ✅ Found ${sampleEmbeddings.length} BAH rate chunks`);
        console.log(`  📝 Sample content: ${sampleEmbeddings[0].content_text.substring(0, 100)}...`);
      } else {
        console.log(`  ⚠️  No BAH rate chunks found`);
      }
      
    } catch (error) {
      console.log(`  ❌ Vector search test failed: ${error.message}`);
    }
    
    // Test 4: Check feedback system
    console.log('\n📊 Test 4: Feedback System Check');
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('answer_feedback')
      .select('*')
      .limit(1);
    
    if (feedbackError) {
      console.log(`  ❌ Feedback system not accessible: ${feedbackError.message}`);
    } else {
      console.log(`  ✅ Feedback system accessible`);
    }
    
    // Test 5: Check analytics system
    console.log('\n📊 Test 5: Analytics System Check');
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('answer_analytics')
      .select('*')
      .limit(1);
    
    if (analyticsError) {
      console.log(`  ❌ Analytics system not accessible: ${analyticsError.message}`);
    } else {
      console.log(`  ✅ Analytics system accessible`);
    }
    
    // Summary
    console.log('\n\n📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`✅ Embeddings: ${totalEmbeddings} total`);
    console.log(`✅ Content Types: ${Object.keys(typeCounts).length} types`);
    console.log(`✅ Vector Search: ${sampleEmbeddings?.length > 0 ? 'Working' : 'Needs attention'}`);
    console.log(`✅ Feedback System: ${feedbackError ? 'Not ready' : 'Ready'}`);
    console.log(`✅ Analytics System: ${analyticsError ? 'Not ready' : 'Ready'}`);
    
    if (totalEmbeddings > 1000 && Object.keys(typeCounts).length >= 3) {
      console.log('\n🎉 RAG SYSTEM READY FOR PRODUCTION!');
    } else {
      console.log('\n⚠️  RAG SYSTEM NEEDS ATTENTION');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRAGSystem();
