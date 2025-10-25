#!/usr/bin/env node

/**
 * RAG System Test Suite
 * 
 * Comprehensive testing of the AI Expert system across all categories
 * Tests financial, PCS, deployment, lifestyle, and career questions
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// Test questions organized by category
const testQuestions = {
  financial: [
    "What's my BAH as an E-5 at Fort Hood with dependents?",
    "How much should I contribute to my TSP to get the full match?",
    "What's the current TSP contribution limit for 2025?",
    "How does the Blended Retirement System work?",
    "What's the difference between Traditional and Roth TSP?"
  ],
  pcs: [
    "I'm PCSing from Fort Bragg to Fort Hood. What should I know about the move?",
    "How much can I make on a DITY move with 8,000 pounds?",
    "What's the process for selling my house before a PCS?",
    "How do I calculate my PPM profit?",
    "What's included in my PCS entitlements?"
  ],
  deployment: [
    "How does the Savings Deposit Program work during deployment?",
    "What's the combat zone tax exclusion?",
    "How much can I save in SDP during a 12-month deployment?",
    "What happens to my TSP contributions during deployment?",
    "How do I prepare financially for deployment?"
  ],
  benefits: [
    "What's the current SGLI rate?",
    "How do I apply for VA disability benefits?",
    "What's the GI Bill transfer process?",
    "How does TRICARE work for dependents?",
    "What's the VA loan benefit?"
  ],
  career: [
    "Should I take the SRB or reenlist without it?",
    "What's the promotion timeline for E-5 to E-6?",
    "How do I become a warrant officer?",
    "What's the difference between officer and enlisted pay?",
    "How do I transition from military to contractor?"
  ],
  base_life: [
    "Should I live on-base or off-base at Fort Hood?",
    "How do I maximize commissary savings?",
    "What's the CDC childcare cost?",
    "How do I use MWR facilities?",
    "What's the best way to save money on base?"
  ]
};

async function testRAGSystem() {
  console.log('🧪 Starting RAG System Test Suite');
  console.log('═══════════════════════════════════════════════');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    categories: {}
  };

  for (const [category, questions] of Object.entries(testQuestions)) {
    console.log(`\n📋 Testing ${category.toUpperCase()} Questions`);
    console.log('─'.repeat(50));
    
    results.categories[category] = {
      total: questions.length,
      passed: 0,
      failed: 0,
      questions: []
    };

    for (const question of questions) {
      console.log(`\n❓ Question: ${question}`);
      
      try {
        // Test RAG retrieval using the hybridSearch function
        const { hybridSearch } = await import('../lib/rag/retrieval-engine.js');
        
        const ragChunks = await hybridSearch(question, {
          content_types: ['premium_guide', 'jtr_rule', 'bah_rate', 'military_pay']
        }, {
          limit: 5
        });

        if (!ragChunks || ragChunks.length === 0) {
          console.log(`  ❌ RAG retrieval failed: No chunks found`);
          results.categories[category].failed++;
          results.categories[category].questions.push({
            question,
            status: 'failed',
            error: 'No chunks found'
          });
          continue;
        }

        console.log(`  ✅ Retrieved ${ragChunks?.length || 0} relevant chunks`);

        // Test AI answer generation
        const startTime = Date.now();
        
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a military financial expert. Answer the user's question using the provided knowledge chunks. Be specific, accurate, and helpful.`
            },
            {
              role: 'user',
              content: `Question: ${question}\n\nKnowledge chunks: ${JSON.stringify(ragChunks)}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        });

        const responseTime = Date.now() - startTime;
        const answer = response.choices[0].message.content;

        console.log(`  ✅ Generated answer (${responseTime}ms)`);
        console.log(`  📝 Answer: ${answer.substring(0, 100)}...`);

        // Validate answer quality
        const qualityScore = await validateAnswerQuality(question, answer, ragChunks);
        console.log(`  📊 Quality Score: ${qualityScore}/10`);

        if (qualityScore >= 7) {
          console.log(`  ✅ PASSED`);
          results.categories[category].passed++;
          results.categories[category].questions.push({
            question,
            status: 'passed',
            qualityScore,
            responseTime,
            answerLength: answer.length
          });
        } else {
          console.log(`  ❌ FAILED (Quality too low)`);
          results.categories[category].failed++;
          results.categories[category].questions.push({
            question,
            status: 'failed',
            qualityScore,
            responseTime,
            answerLength: answer.length
          });
        }

        results.total++;
        if (qualityScore >= 7) {
          results.passed++;
        } else {
          results.failed++;
        }

      } catch (error) {
        console.log(`  ❌ Test failed: ${error.message}`);
        results.categories[category].failed++;
        results.categories[category].questions.push({
          question,
          status: 'failed',
          error: error.message
        });
        results.total++;
        results.failed++;
      }
    }
  }

  // Print summary
  console.log('\n\n📊 TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);
  
  console.log('\n📈 Category Breakdown:');
  for (const [category, data] of Object.entries(results.categories)) {
    const passRate = ((data.passed / data.total) * 100).toFixed(1);
    console.log(`  ${category.toUpperCase()}: ${data.passed}/${data.total} (${passRate}%)`);
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  if (results.passed / results.total >= 0.8) {
    console.log('✅ System performing well! Ready for production.');
  } else if (results.passed / results.total >= 0.6) {
    console.log('⚠️  System needs improvement. Consider adding more knowledge chunks.');
  } else {
    console.log('❌ System needs significant improvement. Review knowledge base and prompts.');
  }

  console.log('\n═══════════════════════════════════════════════');
}

async function validateAnswerQuality(question, answer, ragChunks) {
  // Simple quality validation based on answer characteristics
  let score = 0;
  
  // Length check (not too short, not too long)
  if (answer.length >= 100 && answer.length <= 2000) {
    score += 2;
  }
  
  // Specificity check (contains numbers, dates, or specific terms)
  if (/\d+/.test(answer) || /\$/.test(answer) || /2025|2024/.test(answer)) {
    score += 2;
  }
  
  // Structure check (has clear sections or bullet points)
  if (answer.includes('•') || answer.includes('-') || answer.includes('1.') || answer.includes('2.')) {
    score += 1;
  }
  
  // Relevance check (mentions military terms)
  const militaryTerms = ['BAH', 'TSP', 'PCS', 'deployment', 'military', 'service', 'benefits', 'entitlements'];
  const hasMilitaryTerms = militaryTerms.some(term => answer.toLowerCase().includes(term.toLowerCase()));
  if (hasMilitaryTerms) {
    score += 2;
  }
  
  // Completeness check (answers the question)
  if (answer.length > 200 && !answer.includes('I cannot') && !answer.includes('I don\'t know')) {
    score += 2;
  }
  
  // RAG utilization check (uses retrieved chunks)
  if (ragChunks && ragChunks.length > 0) {
    score += 1;
  }
  
  return Math.min(score, 10);
}

// Run the test suite
testRAGSystem().catch(console.error);
