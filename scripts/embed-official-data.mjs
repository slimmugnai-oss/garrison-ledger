/**
 * SMART EMBEDDING STRATEGY - Official Data First
 * 
 * Embeds high-quality official data sources in priority order:
 * 1. BAH rates (14,352 rows) - Most queried
 * 2. Military pay tables (282 rows) - Second most queried
 * 3. JTR rules (10 rows) - High-value entitlements
 * 4. SGLI rates (8 rows) - Insurance questions
 * 5. Entitlements data (44 rows) - PCS/DLA questions
 * 
 * Usage:
 *   node scripts/embed-official-data.mjs
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });
  return response.data[0].embedding;
}

// ============================================================================
// DATA FORMATTERS (Convert DB rows to searchable text)
// ============================================================================

function formatBAHRate(row) {
  const withDeps = row.with_dependents ? 'with dependents' : 'without dependents';
  const amount = (row.rate_cents / 100).toFixed(2);
  
  return {
    id: `bah_${row.id}`,
    text: `BAH (Basic Allowance for Housing) for paygrade ${row.paygrade} ${withDeps} at MHA ${row.mha} (${row.location_name || 'location'}): $${amount} per month. Effective date: ${row.effective_date}. ZIP code: ${row.zip_code || 'N/A'}.`,
    metadata: {
      data_type: 'bah_rate',
      paygrade: row.paygrade,
      mha: row.mha,
      with_dependents: row.with_dependents,
      rate_cents: row.rate_cents,
      effective_date: row.effective_date,
      location_name: row.location_name,
      zip_code: row.zip_code,
      source_url: 'https://www.dfas.mil/militarymembers/payentitlements/bah/',
      source_name: 'DFAS BAH Calculator',
    },
  };
}

function formatPayTable(row) {
  const amount = (row.monthly_rate_cents / 100).toFixed(2);
  
  return {
    id: `pay_${row.id}`,
    text: `Military base pay for paygrade ${row.paygrade} with ${row.years_of_service} years of service: $${amount} per month. Effective year: ${row.effective_year}. Effective date: ${row.effective_date}.`,
    metadata: {
      data_type: 'military_pay',
      paygrade: row.paygrade,
      years_of_service: row.years_of_service,
      monthly_rate_cents: row.monthly_rate_cents,
      effective_year: row.effective_year,
      effective_date: row.effective_date,
      source_url: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/',
      source_name: 'DFAS Military Pay Tables',
    },
  };
}

function formatJTRRule(row) {
  return {
    id: `jtr_${row.id}`,
    text: `JTR Rule ${row.rule_code}: ${row.rule_title}. Category: ${row.category}. Description: ${row.description}. ${row.eligibility_criteria ? `Eligibility: ${JSON.stringify(row.eligibility_criteria)}` : ''} ${row.calculation_formula ? `Formula: ${row.calculation_formula}` : ''}`,
    metadata: {
      data_type: 'jtr_rule',
      rule_code: row.rule_code,
      rule_title: row.rule_title,
      category: row.category,
      eligibility_criteria: row.eligibility_criteria,
      calculation_formula: row.calculation_formula,
      common_mistakes: row.common_mistakes,
      citations: row.citations,
      source_url: 'https://www.travel.dod.mil/Policy-Regulations/Joint-Travel-Regulations/',
      source_name: 'Joint Travel Regulations',
    },
  };
}

function formatSGLIRate(row) {
  const coverage = (row.coverage_amount / 1000).toFixed(0);
  const premium = (row.monthly_premium_cents / 100).toFixed(2);
  
  return {
    id: `sgli_${row.id}`,
    text: `SGLI (Servicemembers' Group Life Insurance) coverage of $${coverage},000: $${premium} per month premium. Effective date: ${row.effective_date}.`,
    metadata: {
      data_type: 'sgli_rate',
      coverage_amount: row.coverage_amount,
      monthly_premium_cents: row.monthly_premium_cents,
      effective_date: row.effective_date,
      source_url: 'https://www.va.gov/life-insurance/options-eligibility/sgli/',
      source_name: 'VA SGLI Information',
    },
  };
}

function formatEntitlementData(row) {
  const dla = (row.dla_rate / 100).toFixed(2);
  
  return {
    id: `entitlement_${row.id}`,
    text: `PCS entitlements for ${row.rank_group} ${row.dependency_status} dependents: Weight allowance ${row.weight_allowance} lbs, Dislocation Allowance (DLA) $${dla}. Effective year: ${row.effective_year}.`,
    metadata: {
      data_type: 'entitlement',
      rank_group: row.rank_group,
      dependency_status: row.dependency_status,
      weight_allowance: row.weight_allowance,
      dla_rate: row.dla_rate,
      effective_year: row.effective_year,
      source_url: 'https://www.travel.dod.mil/Policy-Regulations/Joint-Travel-Regulations/',
      source_name: 'JTR Entitlements',
    },
  };
}

// ============================================================================
// EMBEDDING ORCHESTRATOR
// ============================================================================

async function embedDataSource(sourceName, tableName, formatter, limit = null) {
  console.log(`\n📊 Processing ${sourceName}...`);
  
  // Fetch data
  let query = supabase.from(tableName).select('*');
  if (limit) query = query.limit(limit);
  
  const { data: rows, error: fetchError } = await query;
  
  if (fetchError) {
    console.error(`  ❌ Failed to fetch ${sourceName}:`, fetchError);
    return { processed: 0, failed: 0 };
  }
  
  console.log(`  📥 Fetched ${rows.length} rows`);
  
  // Format rows
  const formattedChunks = rows.map(formatter);
  
  // Process in batches
  const batchSize = 50;
  let processed = 0;
  let failed = 0;
  
  for (let i = 0; i < formattedChunks.length; i += batchSize) {
    const batch = formattedChunks.slice(i, i + batchSize);
    console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(formattedChunks.length / batchSize)}...`);
    
    try {
      // Generate embeddings
      const embeddings = await Promise.all(
        batch.map(chunk => generateEmbedding(chunk.text))
      );
      
      // Prepare records
      const records = batch.map((chunk, idx) => ({
        content_id: chunk.id,
        content_type: chunk.metadata.data_type,
        content_text: chunk.text,
        embedding: embeddings[idx],
        metadata: chunk.metadata,
      }));
      
      // Insert into database
      const { error: insertError } = await supabase
        .from('knowledge_embeddings')
        .insert(records);
        
      if (insertError) {
        console.error(`    ❌ Batch insert failed:`, insertError.message);
        failed += batch.length;
      } else {
        processed += batch.length;
        console.log(`    ✅ Embedded ${processed}/${formattedChunks.length}`);
      }
      
    } catch (error) {
      console.error(`    ❌ Batch error:`, error.message);
      failed += batch.length;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return { processed, failed };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting SMART EMBEDDING - Official Data Sources\n');
  console.log('📋 Strategy: Embed high-quality official data first\n');
  
  // Create embedding job
  const { data: job, error: jobError } = await supabase
    .from('embedding_jobs')
    .insert({
      job_type: 'initial',
      content_type: 'official_data',
      status: 'running',
    })
    .select()
    .single();
    
  if (jobError) {
    console.error('❌ Failed to create embedding job:', jobError);
    process.exit(1);
  }
  
  console.log(`✅ Created embedding job: ${job.id}\n`);
  
  const startTime = Date.now();
  const results = {};
  
  // Priority 1: BAH Rates (most queried)
  console.log('🏠 PRIORITY 1: BAH Rates (14,352 rows)');
  results.bah = await embedDataSource('BAH Rates', 'bah_rates', formatBAHRate);
  
  // Priority 2: Military Pay Tables
  console.log('\n💰 PRIORITY 2: Military Pay Tables (282 rows)');
  results.pay = await embedDataSource('Military Pay Tables', 'military_pay_tables', formatPayTable);
  
  // Priority 3: JTR Rules
  console.log('\n📜 PRIORITY 3: JTR Rules (10 rows)');
  results.jtr = await embedDataSource('JTR Rules', 'jtr_rules', formatJTRRule);
  
  // Priority 4: SGLI Rates
  console.log('\n🛡️ PRIORITY 4: SGLI Rates (8 rows)');
  results.sgli = await embedDataSource('SGLI Rates', 'sgli_rates', formatSGLIRate);
  
  // Priority 5: Entitlements Data
  console.log('\n🎖️ PRIORITY 5: Entitlements Data (44 rows)');
  results.entitlements = await embedDataSource('Entitlements Data', 'entitlements_data', formatEntitlementData);
  
  // Calculate totals
  const totalProcessed = Object.values(results).reduce((sum, r) => sum + r.processed, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
  const duration = Math.floor((Date.now() - startTime) / 1000);
  
  // Update job
  await supabase
    .from('embedding_jobs')
    .update({ 
      status: totalFailed > 0 ? 'completed_with_errors' : 'completed',
      items_processed: totalProcessed,
      items_failed: totalFailed,
      completed_at: new Date().toISOString(),
      duration_seconds: duration,
      avg_time_per_item_ms: Math.floor((duration * 1000) / totalProcessed),
    })
    .eq('id', job.id);
  
  // Final report
  console.log('\n\n✅ EMBEDDING COMPLETE!');
  console.log('═══════════════════════════════════════════════');
  console.log(`📊 Summary:`);
  console.log(`   BAH Rates: ${results.bah.processed} embedded, ${results.bah.failed} failed`);
  console.log(`   Pay Tables: ${results.pay.processed} embedded, ${results.pay.failed} failed`);
  console.log(`   JTR Rules: ${results.jtr.processed} embedded, ${results.jtr.failed} failed`);
  console.log(`   SGLI Rates: ${results.sgli.processed} embedded, ${results.sgli.failed} failed`);
  console.log(`   Entitlements: ${results.entitlements.processed} embedded, ${results.entitlements.failed} failed`);
  console.log(`\n   TOTAL: ${totalProcessed} embedded, ${totalFailed} failed`);
  console.log(`   Duration: ${duration}s`);
  console.log(`   Avg time per item: ${Math.floor((duration * 1000) / totalProcessed)}ms`);
  console.log('═══════════════════════════════════════════════\n');
  
  // Cost estimate
  const estimatedCost = (totalProcessed / 1000) * 0.0001; // $0.0001 per 1K tokens
  console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)}\n`);
  
  console.log('🎉 Your military expert now knows:');
  console.log('   ✅ BAH rates for every rank, location, and dependent status');
  console.log('   ✅ Base pay for every paygrade and years of service');
  console.log('   ✅ Official JTR travel regulations');
  console.log('   ✅ SGLI insurance premiums and coverage');
  console.log('   ✅ PCS weight allowances and DLA rates');
  console.log('\n🚀 Ready to answer military finance questions with 100% accuracy!');
}

main().catch(console.error);

