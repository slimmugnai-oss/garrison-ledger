import { readFile } from 'fs/promises';
import { createClient } from '../lib/supabase-typed.js';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: tsx process-research-file.ts <path-to-md-file>');
  process.exit(1);
}

async function processFile() {
  const content = await readFile(filePath, 'utf-8');
  const sections = content.split(/###\s+/);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  let count = 0;
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n');
    const title = lines[0].replace(/\*\*/g, '').replace(/Section \d+\.\d+:\s+/, '').trim();
    
    if (!title || title.length < 5) continue;
    
    const body = lines.slice(1).join('\n').trim();
    if (body.length < 100) continue;
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const summary = body.split('\n\n')[0].replace(/\*\*/g, '').slice(0, 200) + '...';
    
    const { error } = await (supabase as any).from('content_blocks').insert({
      slug, title, summary,
      html: body.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>'),
      type: 'guide',
      topics: [],
      tags: [],
      source_page: 'research',
      est_read_min: Math.ceil(body.split(/\s+/).length / 200),
      block_type: 'guide',
      hlevel: 2,
      horder: 0
    });
    
    if (!error) {
      count++;
      console.log(`  ✅ ${title.slice(0, 60)}`);
    }
  }
  
  console.log(`\n✅ Ingested ${count} blocks from ${filePath.split('/').pop()}\n`);
}

processFile().catch(console.error);
