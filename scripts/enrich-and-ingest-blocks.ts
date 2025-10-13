/**
 * ENRICH AND INGEST BLOCKS
 * Add rich metadata and upload to Supabase
 */

import { readFile } from 'fs/promises';
import { createClient } from '../lib/supabase-typed.js';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type ExtractedBlock = {
  slug: string;
  title: string;
  summary: string;
  html: string;
  domain: string;
  type: string;
  difficulty: string;
  topics: string[];
  tags: string[];
  source_page: string;
  est_read_min: number;
};

/**
 * Enrich blocks with better topics and tags based on content analysis
 */
function enrichBlock(block: ExtractedBlock): ExtractedBlock {
  const titleLower = block.title.toLowerCase();
  const htmlLower = block.html.toLowerCase();
  const topics = new Set(block.topics);
  const tags = new Set(block.tags);
  
  // TSP enrichment
  if (titleLower.includes('g fund') || htmlLower.includes('government securities')) {
    topics.add('tsp'); topics.add('retirement'); topics.add('g-fund');
    tags.add('tsp'); tags.add('g-fund'); tags.add('safe-harbor'); tags.add('capital-preservation');
  }
  if (titleLower.includes('f fund') || htmlLower.includes('bond')) {
    topics.add('tsp'); topics.add('retirement'); topics.add('f-fund');
    tags.add('tsp'); tags.add('f-fund'); tags.add('bonds'); tags.add('fixed-income');
  }
  if (titleLower.includes('c fund') || htmlLower.includes('s&p 500')) {
    topics.add('tsp'); topics.add('retirement'); topics.add('c-fund');
    tags.add('tsp'); tags.add('c-fund'); tags.add('stocks'); tags.add('sp500');
  }
  if (titleLower.includes('s fund') || htmlLower.includes('small cap')) {
    topics.add('tsp'); topics.add('retirement'); topics.add('s-fund');
    tags.add('tsp'); tags.add('s-fund'); tags.add('small-cap'); tags.add('stocks');
  }
  if (titleLower.includes('i fund') || htmlLower.includes('international')) {
    topics.add('tsp'); topics.add('retirement'); topics.add('i-fund');
    tags.add('tsp'); tags.add('i-fund'); tags.add('international'); tags.add('global');
  }
  if (titleLower.includes('roth') || titleLower.includes('traditional')) {
    topics.add('tsp'); topics.add('tax-planning');
    tags.add('roth'); tags.add('traditional'); tags.add('tax-strategy');
  }
  if (titleLower.includes('combat zone') || htmlLower.includes('tax-exempt pay')) {
    topics.add('deployment'); topics.add('tax-planning');
    tags.add('combat-zone'); tags.add('deployment'); tags.add('tax-free');
  }
  if (titleLower.includes('lifecycle') || titleLower.includes('l fund')) {
    topics.add('tsp'); topics.add('retirement');
    tags.add('l-funds'); tags.add('lifecycle'); tags.add('automatic');
  }
  if (titleLower.includes('tsp loan')) {
    topics.add('tsp'); topics.add('finance');
    tags.add('tsp-loan'); tags.add('borrowing'); tags.add('emergency');
  }
  if (titleLower.includes('catch-up')) {
    topics.add('tsp'); topics.add('retirement');
    tags.add('catch-up'); tags.add('50-plus'); tags.add('retirement-boost');
  }
  
  // Real estate enrichment
  if (titleLower.includes('house hacking') || htmlLower.includes('rental income')) {
    topics.add('real-estate'); topics.add('house-hacking');
    tags.add('house-hacking'); tags.add('rental-income'); tags.add('passive-income');
    block.domain = 'finance';
  }
  if (titleLower.includes('va loan') || htmlLower.includes('certificate of eligibility')) {
    topics.add('real-estate'); topics.add('va-loan');
    tags.add('va-loan'); tags.add('zero-down'); tags.add('home-buying');
    block.domain = 'finance';
  }
  if (titleLower.includes('landlord') || htmlLower.includes('property management')) {
    topics.add('real-estate'); topics.add('landlording');
    tags.add('landlord'); tags.add('property-management'); tags.add('rental');
    block.domain = 'finance';
  }
  if (titleLower.includes('tax') && htmlLower.includes('rental')) {
    topics.add('real-estate'); topics.add('tax-planning');
    tags.add('rental-taxes'); tags.add('depreciation'); tags.add('schedule-e');
    block.domain = 'finance';
  }
  
  // MyCAA enrichment
  if (titleLower.includes('mycaa') || htmlLower.includes('career advancement account')) {
    topics.add('career'); topics.add('education'); topics.add('mycaa');
    tags.add('mycaa'); tags.add('military-spouse'); tags.add('scholarship'); tags.add('education');
    block.domain = 'career';
  }
  if (titleLower.includes('certification') || htmlLower.includes('portable career')) {
    topics.add('career'); topics.add('education');
    tags.add('certifications'); tags.add('portable-career'); tags.add('remote-work');
    block.domain = 'career';
  }
  
  // SDP enrichment
  if (titleLower.includes('sdp') || titleLower.includes('savings deposit')) {
    topics.add('deployment'); topics.add('sdp'); topics.add('finance');
    tags.add('sdp'); tags.add('deployment'); tags.add('10-percent'); tags.add('savings');
    block.domain = 'deployment';
  }
  if (titleLower.includes('deployment') || htmlLower.includes('combat zone')) {
    topics.add('deployment');
    tags.add('deployment'); tags.add('pre-deployment'); tags.add('reintegration');
    block.domain = 'deployment';
  }
  
  // PCS enrichment
  if (titleLower.includes('pcs') || htmlLower.includes('permanent change')) {
    topics.add('pcs'); topics.add('relocation');
    tags.add('pcs'); tags.add('moving'); tags.add('relocation');
    block.domain = 'pcs';
  }
  
  return {
    ...block,
    topics: Array.from(topics),
    tags: Array.from(tags)
  };
}

/**
 * Ingest enriched blocks into Supabase
 */
async function ingestBlocks() {
  console.log('📚 Loading extracted blocks...');
  
  const blocksPath = 'research/extracted-blocks.json';
  const blocksData = await readFile(blocksPath, 'utf-8');
  const blocks: ExtractedBlock[] = JSON.parse(blocksData);
  
  console.log(`✅ Loaded ${blocks.length} blocks`);
  console.log('\n🔧 Enriching with topics and tags...');
  
  const enrichedBlocks = blocks.map(enrichBlock);
  
  console.log('✅ Enrichment complete');
  console.log('\n📤 Ingesting into Supabase...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const block of enrichedBlocks) {
    try {
      // Check if exists first
      const { data: existing } = await (supabase as any)
        .from('content_blocks')
        .select('id')
        .eq('slug', block.slug)
        .maybeSingle();
      
      let error;
      
      if (existing) {
        // Update existing
        const result = await (supabase as any)
          .from('content_blocks')
          .update({
            title: block.title,
            summary: block.summary,
            html: block.html,
            type: block.type,
            topics: block.topics,
            tags: block.tags,
            source_page: block.source_page,
            est_read_min: block.est_read_min,
            block_type: block.type,
          })
          .eq('slug', block.slug);
        error = result.error;
      } else {
        // Insert new
        const result = await (supabase as any)
          .from('content_blocks')
          .insert({
            slug: block.slug,
            title: block.title,
            summary: block.summary,
            html: block.html,
            type: block.type,
            topics: block.topics,
            tags: block.tags,
            source_page: block.source_page,
            est_read_min: block.est_read_min,
            block_type: block.type,
            hlevel: 2,
            horder: 0,
          });
        error = result.error;
      }
      
      if (error) {
        console.error(`  ❌ ${block.slug}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ ${block.slug} (${block.topics.length} topics, ${block.tags.length} tags)`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ ${block.slug}: Exception`, err);
      errorCount++;
    }
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Successfully ingested: ${successCount} blocks`);
  console.log(`❌ Failed: ${errorCount} blocks`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  if (successCount > 0) {
    console.log('🎉 Research blocks are now live in Supabase!');
    console.log('   View them in your content_blocks table');
    console.log('   GPT-4o can now use them for personalized plans\n');
  }
}

// Run
ingestBlocks().catch(console.error);

