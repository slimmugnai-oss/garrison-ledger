/**
 * TOOLKIT HTML EXTRACTION
 * Extract atomic blocks from the 5 comprehensive toolkit HTML pages
 */

import { readFile, writeFile } from 'fs/promises';
import * as cheerio from 'cheerio';
import { createClient } from '../lib/supabase-typed.js';

const TOOLKIT_FILES = [
  { file: 'public/pcs-hub.html', domain: 'pcs', name: 'PCS Hub' },
  { file: 'public/career-hub.html', domain: 'career', name: 'Career Hub' },
  { file: 'public/deployment.html', domain: 'deployment', name: 'Deployment Guide' },
  { file: 'public/on-base-shopping.html', domain: 'base-life', name: 'On-Base Shopping' },
  { file: 'public/base-guides.html', domain: 'base-life', name: 'Base Guides' }
];

type AtomicBlock = {
  slug: string;
  title: string;
  summary: string;
  html: string;
  domain: string;
  type: string;
  topics: string[];
  tags: string[];
  source_page: string;
  est_read_min: number;
};

function generateSlug(title: string, domain: string): string {
  return `${domain}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function estimateReadingTime(html: string): number {
  const text = cheerio.load(html).text();
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function cleanHTML(html: string): string {
  const $ = cheerio.load(html);
  // Remove scripts, styles, and other non-content
  $('script, style, noscript').remove();
  return $.html();
}

async function extractFromToolkit() {
  const allBlocks: AtomicBlock[] = [];
  
  for (const toolkit of TOOLKIT_FILES) {
    console.log(`\n📄 Processing: ${toolkit.name}...`);
    
    try {
      const html = await readFile(toolkit.file, 'utf-8');
      const $ = cheerio.load(html);
      
      // Find main content sections (h2, h3, or major article/section tags)
      const sections = $('section[id], article, .card, [class*="section"]').toArray();
      
      console.log(`   Found ${sections.length} potential sections`);
      
      let extracted = 0;
      
      for (const section of sections) {
        const $section = $(section);
        
        // Try to find heading
        const heading = $section.find('h2, h3').first().text().trim();
        
        if (!heading || heading.length < 5) continue;
        if (heading.toLowerCase().includes('advertisement')) continue;
        if (heading.toLowerCase().includes('subscribe')) continue;
        
        // Get section content
        const sectionHTML = $section.html() || '';
        const cleanedHTML = cleanHTML(sectionHTML);
        
        // Skip if too short
        const text = cheerio.load(cleanedHTML).text();
        if (text.length < 200) continue;
        
        // Generate summary (first 200 chars)
        const summary = text.slice(0, 200).trim() + (text.length > 200 ? '...' : '');
        
        // Determine type
        let type = 'guide';
        if (heading.toLowerCase().includes('checklist')) type = 'checklist';
        else if (heading.toLowerCase().includes('calculator')) type = 'calculator';
        else if (heading.toLowerCase().includes('faq') || heading.toLowerCase().includes('questions')) type = 'faq';
        else if (heading.toLowerCase().includes('tips') || heading.toLowerCase().includes('pro')) type = 'pro-tip';
        else if (heading.toLowerCase().includes('timeline')) type = 'checklist';
        
        // Auto-tag based on content
        const topics: string[] = [toolkit.domain];
        const tags: string[] = [toolkit.domain];
        
        if (text.toLowerCase().includes('budget')) {
          topics.push('finance'); tags.push('budget', 'planning');
        }
        if (text.toLowerCase().includes('children') || text.toLowerCase().includes('family')) {
          tags.push('family', 'kids');
        }
        if (text.toLowerCase().includes('oconus') || text.toLowerCase().includes('overseas')) {
          topics.push('oconus'); tags.push('oconus', 'overseas');
        }
        if (text.toLowerCase().includes('efmp')) {
          tags.push('efmp', 'special-needs');
        }
        
        const slug = generateSlug(heading, toolkit.domain);
        const est_read_min = estimateReadingTime(cleanedHTML);
        
        allBlocks.push({
          slug,
          title: heading,
          summary,
          html: cleanedHTML,
          domain: toolkit.domain,
          type,
          topics,
          tags,
          source_page: toolkit.name.toLowerCase().replace(/\s+/g, '-'),
          est_read_min
        });
        
        extracted++;
        console.log(`   ✓ ${heading.slice(0, 60)}... (${est_read_min} min)`);
      }
      
      console.log(`   ✅ Extracted ${extracted} blocks from ${toolkit.name}`);
      
    } catch (error) {
      console.error(`   ❌ Error processing ${toolkit.name}:`, error);
    }
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Total blocks extracted: ${allBlocks.length}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  // Save for review
  await writeFile(
    'research/toolkit-extracted-blocks.json',
    JSON.stringify(allBlocks, null, 2)
  );
  
  console.log('📄 Saved to research/toolkit-extracted-blocks.json');
  
  return allBlocks;
}

/**
 * Ingest into Supabase
 */
async function ingestBlocks(blocks: AtomicBlock[]) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  console.log(`\n📤 Ingesting ${blocks.length} toolkit blocks...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const block of blocks) {
    try {
      const { data: existing } = await (supabase as any)
        .from('content_blocks')
        .select('id')
        .eq('slug', block.slug)
        .maybeSingle();
      
      let error;
      
      if (existing) {
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
        console.log(`  ✅ ${block.slug}`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ ${block.slug}: Exception`);
      errorCount++;
    }
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Successfully ingested: ${successCount} blocks`);
  console.log(`❌ Failed: ${errorCount} blocks`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

// Run
extractFromToolkit()
  .then(blocks => {
    console.log('🎯 Review blocks in research/toolkit-extracted-blocks.json');
    console.log('   Run with --ingest to upload to Supabase\n');
    
    if (process.argv.includes('--ingest')) {
      return ingestBlocks(blocks);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

