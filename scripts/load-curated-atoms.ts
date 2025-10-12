// Load manually curated atoms directly into database
import { createClient } from '@supabase/supabase-js';
import { CURATED_ATOMS } from '../lib/content/curated-atoms';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SB = createClient(SUPABASE_URL, SUPABASE_KEY);

function textOnly(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function loadCuratedAtoms() {
  console.log('🚀 Loading Curated Atomic Content\n');
  console.log(`Processing ${Object.keys(CURATED_ATOMS).length} hand-crafted atoms...\n`);
  
  let successCount = 0;
  
  for (const [atomId, atom] of Object.entries(CURATED_ATOMS)) {
    const text = textOnly(atom.html);
    const summary = text.split('. ').slice(0, 2).join('. ') + '.';
    const wordCount = text.split(/\s+/).length;
    
    // Determine source from atom ID prefix
    let source = 'pcs-hub';
    if (atomId.includes('deployment') || atomId.includes('homefront') || atomId.includes('reintegration')) {
      source = 'deployment';
    } else if (atomId.includes('career') || atomId.includes('mycaa') || atomId.includes('resume') || atomId.includes('entrepreneur') || atomId.includes('federal') || atomId.includes('portable') || atomId.includes('license') || atomId.includes('cert')) {
      source = 'career-hub';
    } else if (atomId.includes('les') || atomId.includes('tsp') || atomId.includes('emergency') || atomId.includes('commissary') || atomId.includes('shopping') || atomId.includes('scra')) {
      source = 'on-base-shopping';
    }
    
    const { error } = await SB.from('content_blocks').upsert({
      source_page: source,
      slug: atomId,
      title: atom.title,
      html: atom.html,
      text_content: text,
      summary,
      block_type: atom.type,
      type: atom.type,
      tags: atom.tags,
      topics: atom.topics,
      horder: 0,
      est_read_min: Math.max(1, Math.ceil(wordCount / 220)),
    }, { onConflict: 'source_page,slug' });
    
    if (error) {
      console.error(`❌ Failed to load ${atomId}:`, error.message);
    } else {
      console.log(`✅ ${atomId} (${atom.type}) - ${wordCount} words`);
      successCount++;
    }
  }
  
  console.log(`\n📊 Summary: ${successCount} of ${Object.keys(CURATED_ATOMS).length} atoms loaded successfully\n`);
  console.log('✅ Curated Content Load Complete!');
}

loadCuratedAtoms().catch(console.error);

