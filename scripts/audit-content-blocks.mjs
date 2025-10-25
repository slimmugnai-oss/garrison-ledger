import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function auditContentBlocks() {
  console.log('🔍 AUDITING 410 CONTENT BLOCKS\n');
  
  const { data: blocks, error } = await supabase
    .from('content_blocks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching blocks:', error);
    return;
  }
  
  console.log(`📊 Total blocks: ${blocks.length}\n`);
  
  // Quality scoring
  const scored = blocks.map(block => {
    let score = 0;
    let reasons = [];
    
    // Positive signals
    if (block.body?.length > 500) { score += 2; reasons.push('+length'); }
    if (block.body?.includes('step') || block.body?.includes('Step')) { score += 2; reasons.push('+actionable'); }
    if (block.category === 'strategies' || block.category === 'tactics') { score += 3; reasons.push('+strategy'); }
    if (block.expert_level === 'advanced') { score += 2; reasons.push('+expert'); }
    if (block.metadata?.source_url) { score += 1; reasons.push('+sourced'); }
    if (block.body?.match(/\d+/g)?.length > 3) { score += 1; reasons.push('+numbers'); }
    
    // Negative signals
    if (block.body?.length < 200) { score -= 3; reasons.push('-short'); }
    if (block.body?.toLowerCase().includes('motivat')) { score -= 2; reasons.push('-motivational'); }
    if (!block.body?.includes('.')) { score -= 2; reasons.push('-poorly-formatted'); }
    if (block.title?.toLowerCase().includes('basic')) { score -= 1; reasons.push('-basic'); }
    
    return {
      id: block.id,
      title: block.title,
      category: block.category,
      expert_level: block.expert_level,
      body_length: block.body?.length || 0,
      score,
      reasons: reasons.join(', '),
      body_preview: block.body?.substring(0, 150) + '...'
    };
  });
  
  // Sort by score
  scored.sort((a, b) => b.score - a.score);
  
  // Categories
  const highQuality = scored.filter(b => b.score >= 5);
  const mediumQuality = scored.filter(b => b.score >= 2 && b.score < 5);
  const lowQuality = scored.filter(b => b.score < 2);
  
  console.log('📈 QUALITY DISTRIBUTION:\n');
  console.log(`  🟢 HIGH QUALITY (score ≥5): ${highQuality.length} blocks`);
  console.log(`  🟡 MEDIUM QUALITY (2-4): ${mediumQuality.length} blocks`);
  console.log(`  🔴 LOW QUALITY (<2): ${lowQuality.length} blocks\n`);
  
  console.log('🏆 TOP 20 HIGH-QUALITY BLOCKS:\n');
  highQuality.slice(0, 20).forEach((block, idx) => {
    console.log(`${idx + 1}. [Score: ${block.score}] ${block.title}`);
    console.log(`   Category: ${block.category} | Length: ${block.body_length} chars`);
    console.log(`   Signals: ${block.reasons}`);
    console.log(`   Preview: ${block.body_preview}\n`);
  });
  
  console.log('💡 RECOMMENDATION:\n');
  console.log(`  ✅ EMBED: ${highQuality.length} high-quality blocks`);
  console.log(`  ⚠️  REVIEW: ${mediumQuality.length} medium-quality blocks (selective)`);
  console.log(`  ❌ SKIP: ${lowQuality.length} low-quality blocks\n`);
  
  console.log(`📊 Estimated embedding cost for ${highQuality.length} blocks:`);
  console.log(`   Tokens: ~${highQuality.length * 800} tokens`);
  console.log(`   Cost: ~$${((highQuality.length * 800) / 1000000 * 0.02).toFixed(4)}\n`);
}

auditContentBlocks();
