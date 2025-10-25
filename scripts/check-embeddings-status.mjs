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

async function checkEmbeddingsStatus() {
  console.log('📊 EMBEDDINGS STATUS CHECK\n');
  
  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('knowledge_embeddings')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ Failed to get count:', countError);
    return;
  }
  
  console.log(`✅ Total embeddings: ${totalCount}\n`);
  
  // Get breakdown by content type
  const { data: breakdown, error: breakdownError } = await supabase
    .from('knowledge_base_stats')
    .select('*');
  
  if (breakdownError) {
    console.error('❌ Failed to get breakdown:', breakdownError);
    return;
  }
  
  console.log('📈 Breakdown by content type:');
  breakdown.forEach(row => {
    console.log(`  ${row.content_type}: ${row.chunk_count} chunks`);
  });
  
  console.log('\n✅ Knowledge base ready for RAG retrieval!');
}

checkEmbeddingsStatus();
