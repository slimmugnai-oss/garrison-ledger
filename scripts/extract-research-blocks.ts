/**
 * ATOMIC BLOCK EXTRACTION - FROM RESEARCH
 * Transforms deep research markdown into structured atomic content blocks
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { createClient } from '../lib/supabase-typed.js';

type AtomicBlock = {
  slug: string;
  title: string;
  summary: string;
  html: string;
  domain: string;
  category: string;
  type: string;
  difficulty: string;
  topics: string[];
  tags: string[];
  source_page: string;
  est_read_min: number;
};

/**
 * Convert markdown section to HTML
 */
function markdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italics
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.trim().startsWith('*') || para.trim().startsWith('-')) {
      // List item
      const items = para.split('\n').filter(l => l.trim());
      const listItems = items.map(item => {
        const clean = item.replace(/^[\*\-]\s+/, '');
        return `  <li>${clean}</li>`;
      }).join('\n');
      return `<ul>\n${listItems}\n</ul>`;
    } else if (para.trim().match(/^\d+\./)) {
      // Numbered list
      const items = para.split('\n').filter(l => l.trim());
      const listItems = items.map(item => {
        const clean = item.replace(/^\d+\.\s+/, '');
        return `  <li>${clean}</li>`;
      }).join('\n');
      return `<ol>\n${listItems}\n</ol>`;
    } else if (para.trim()) {
      return `<p>${para.trim()}</p>`;
    }
    return '';
  }).filter(Boolean).join('\n\n');
  
  return html;
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract atomic blocks from research markdown
 */
async function extractBlocks() {
  const researchPath = path.join(process.cwd(), 'research', 'military-financial-deep-dive.md');
  const content = await readFile(researchPath, 'utf-8');
  
  const blocks: AtomicBlock[] = [];
  
  // Split by ### sections (these are our atomic blocks)
  const sections = content.split(/###\s+/);
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n');
    const title = lines[0].replace(/\*\*/g, '').replace(/Section \d+\.\d+:\s+/, '').trim();
    
    if (!title) continue;
    
    // Get content (everything after title)
    const bodyLines = lines.slice(1).join('\n').trim();
    
    // Generate summary (first 150 chars or first paragraph)
    const firstPara = bodyLines.split('\n\n')[0].replace(/\*\*/g, '').slice(0, 200);
    const summary = firstPara.length > 197 ? firstPara.slice(0, 197) + '...' : firstPara;
    
    // Convert to HTML
    const html = markdownToHTML(bodyLines);
    
    // Determine domain and category from title/content
    let domain = 'finance';
    let category = 'guide';
    let type = 'guide';
    let difficulty = 'intermediate';
    const topics: string[] = [];
    const tags: string[] = [];
    
    // Smart categorization
    const titleLower = title.toLowerCase();
    const contentLower = bodyLines.toLowerCase();
    
    if (titleLower.includes('tsp') || titleLower.includes('thrift savings')) {
      domain = 'finance';
      topics.push('tsp', 'retirement');
      tags.push('tsp', 'retirement', 'brs');
    }
    if (titleLower.includes('roth') || titleLower.includes('traditional')) {
      topics.push('tax-planning');
      tags.push('roth', 'traditional', 'taxes');
    }
    if (titleLower.includes('real estate') || titleLower.includes('house hacking') || titleLower.includes('va loan')) {
      domain = 'finance';
      topics.push('real-estate', 'house-hacking');
      tags.push('va-loan', 'house-hacking', 'rental-property');
    }
    if (titleLower.includes('mycaa')) {
      domain = 'career';
      topics.push('education', 'mycaa');
      tags.push('mycaa', 'military-spouse', 'career');
    }
    if (titleLower.includes('sdp') || titleLower.includes('savings deposit')) {
      domain = 'deployment';
      topics.push('sdp', 'deployment');
      tags.push('sdp', 'deployment', 'savings');
    }
    if (titleLower.includes('pcs') || titleLower.includes('relocation')) {
      domain = 'pcs';
      topics.push('pcs', 'relocation');
      tags.push('pcs', 'moving');
    }
    
    // Type classification
    if (titleLower.includes('guide') || titleLower.includes('masterclass')) {
      type = 'guide';
    } else if (titleLower.includes('deep dive') || titleLower.includes('analysis')) {
      type = 'guide';
      difficulty = 'advanced';
    } else if (titleLower.includes('checklist') || titleLower.includes('worksheet')) {
      type = 'checklist';
    } else if (titleLower.includes('comparison') || titleLower.includes('vs')) {
      type = 'comparison';
    } else if (titleLower.includes('case study') || titleLower.includes('example')) {
      type = 'case-study';
    }
    
    // Estimate reading time
    const wordCount = bodyLines.split(/\s+/).length;
    const est_read_min = Math.ceil(wordCount / 200);
    
    const slug = generateSlug(title);
    
    blocks.push({
      slug,
      title,
      summary,
      html,
      domain,
      category: 'planning',
      type,
      difficulty,
      topics,
      tags,
      source_page: 'research-deep-dive',
      est_read_min
    });
    
    console.log(`✓ Extracted: ${title} (${wordCount} words, ${est_read_min} min read)`);
  }
  
  console.log(`\n✅ Extracted ${blocks.length} atomic blocks from research`);
  
  // Save to JSON for review
  await writeFile(
    'research/extracted-blocks.json',
    JSON.stringify(blocks, null, 2)
  );
  
  console.log('📄 Saved to research/extracted-blocks.json for review');
  
  return blocks;
}

/**
 * Ingest blocks into Supabase
 */
async function ingestBlocks(blocks: AtomicBlock[]) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  console.log(`\n📤 Ingesting ${blocks.length} blocks into Supabase...`);
  
  for (const block of blocks) {
    const { error } = await (supabase as any)
      .from('content_blocks')
      .upsert({
        slug: block.slug,
        title: block.title,
        summary: block.summary,
        html: block.html,
        type: block.type,
        topics: block.topics,
        tags: block.tags,
        source_page: block.source_page,
        est_read_min: block.est_read_min,
        // Additional fields for rich metadata
        block_type: block.type,
        hlevel: 2,
        horder: 0,
      }, {
        onConflict: 'slug'
      });
    
    if (error) {
      console.error(`  ❌ Failed to ingest ${block.slug}:`, error.message);
    } else {
      console.log(`  ✓ Ingested: ${block.slug}`);
    }
  }
  
  console.log(`\n✅ Ingestion complete!`);
}

// Run extraction
extractBlocks()
  .then(blocks => {
    console.log('\n🎯 Review the extracted blocks in research/extracted-blocks.json');
    console.log('   If they look good, run with --ingest flag to upload to Supabase');
    
    // Check for --ingest flag
    if (process.argv.includes('--ingest')) {
      return ingestBlocks(blocks);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

