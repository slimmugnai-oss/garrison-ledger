/**
 * PREMIUM GUIDES EMBEDDING SCRIPT
 * 
 * Embeds high-quality premium military guides into vector database
 * Source: content/premium-guides/*.md
 * Target: knowledge_embeddings table
 * 
 * Run: npm run rag:embed-premium-guides
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync } from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

// Verify environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chunking utility
function chunkGuide(guideContent, guideTitle, category) {
  const chunks = [];
  
  // Split by ## headers (sections)
  const sections = guideContent.split(/^## /m).filter(s => s.trim());
  
  // First section is metadata + BLUF
  const metadataSection = sections[0];
  const blufMatch = metadataSection.match(/## BLUF[^\n]*\n\n([^\n]+(?:\n(?!##)[^\n]+)*)/);
  
  if (blufMatch) {
    chunks.push({
      id: `${guideTitle.toLowerCase().replace(/\s+/g, '-')}_bluf`,
      text: `${guideTitle}\n\nBLUF: ${blufMatch[1]}`,
      section: 'BLUF',
    });
  }
  
  // Process remaining sections
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n');
    const sectionTitle = lines[0].trim();
    const sectionContent = lines.slice(1).join('\n').trim();
    
    // Skip very short sections
    if (sectionContent.length < 200) continue;
    
    // If section is long, chunk it further
    if (sectionContent.length > 1500) {
      const paragraphs = sectionContent.split('\n\n');
      let currentChunk = '';
      let chunkIndex = 0;
      
      for (const para of paragraphs) {
        if ((currentChunk + para).length > 1200) {
          if (currentChunk) {
            chunks.push({
              id: `${guideTitle.toLowerCase().replace(/\s+/g, '-')}_${sectionTitle.toLowerCase().replace(/\s+/g, '-')}_${chunkIndex}`,
              text: `${guideTitle} - ${sectionTitle}\n\n${currentChunk}`,
              section: sectionTitle,
            });
            chunkIndex++;
          }
          currentChunk = para;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + para;
        }
      }
      
      if (currentChunk) {
        chunks.push({
          id: `${guideTitle.toLowerCase().replace(/\s+/g, '-')}_${sectionTitle.toLowerCase().replace(/\s+/g, '-')}_${chunkIndex}`,
          text: `${guideTitle} - ${sectionTitle}\n\n${currentChunk}`,
          section: sectionTitle,
        });
      }
    } else {
      // Section is reasonable length, keep whole
      chunks.push({
        id: `${guideTitle.toLowerCase().replace(/\s+/g, '-')}_${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`,
        text: `${guideTitle} - ${sectionTitle}\n\n${sectionContent}`,
        section: sectionTitle,
      });
    }
  }
  
  return chunks.map(chunk => ({
    ...chunk,
    metadata: {
      guide_title: guideTitle,
      category: category,
      section: chunk.section,
      content_type: 'premium_guide',
      source: 'garrison_ledger',
    },
  }));
}

// Generate embedding
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });
  return response.data[0].embedding;
}

// Main embedding function
async function embedPremiumGuides() {
  console.log('🚀 Starting PREMIUM GUIDE EMBEDDING\n');
  
  const guidesDir = join(__dirname, '../content/premium-guides');
  const guideFiles = readdirSync(guidesDir).filter(f => f.endsWith('.md') && !f.includes('OUTLINES'));
  
  console.log(`📚 Found ${guideFiles.length} premium guides\n`);
  
  // Create embedding job
  const { data: job, error: jobError } = await supabase
    .from('embedding_jobs')
    .insert({
      job_type: 'initial',
      content_type: 'premium_guides',
      status: 'running',
      items_total: guideFiles.length,
    })
    .select()
    .single();
  
  if (jobError) {
    console.error('❌ Failed to create embedding job:', jobError);
    process.exit(1);
  }
  
  console.log(`✅ Created embedding job: ${job.id}\n`);
  
  let totalChunks = 0;
  let totalEmbedded = 0;
  let totalFailed = 0;
  
  for (const file of guideFiles) {
    const guideTitle = file.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    console.log(`📖 Processing: ${guideTitle}`);
    
    try {
      // Read guide
      const guidePath = join(guidesDir, file);
      const guideContent = readFileSync(guidePath, 'utf-8');
      
      // Extract category from frontmatter
      const categoryMatch = guideContent.match(/\*\*Category:\*\* (.+)/);
      const category = categoryMatch ? categoryMatch[1].trim() : 'Unknown';
      
      // Chunk guide
      const chunks = chunkGuide(guideContent, guideTitle, category);
      totalChunks += chunks.length;
      
      console.log(`  📊 Generated ${chunks.length} chunks`);
      
      // Generate embeddings in batches
      const batchSize = 10;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        
        try {
          const embeddings = await Promise.all(
            batch.map(chunk => generateEmbedding(chunk.text))
          );
          
          // Insert into database
          const records = batch.map((chunk, idx) => ({
            content_id: chunk.id,
            content_type: 'premium_guide',
            content_text: chunk.text,
            embedding: embeddings[idx],
            metadata: chunk.metadata,
          }));
          
          const { error: insertError } = await supabase
            .from('knowledge_embeddings')
            .insert(records);
          
          if (insertError) {
            console.error(`    ❌ Batch insert failed:`, insertError);
            totalFailed += batch.length;
          } else {
            totalEmbedded += batch.length;
            console.log(`    ✅ Embedded ${Math.min(i + batchSize, chunks.length)}/${chunks.length} chunks`);
          }
        } catch (error) {
          console.error(`    ❌ Batch processing failed:`, error.message);
          totalFailed += batch.length;
        }
      }
      
      console.log(`  ✅ ${guideTitle} complete\n`);
      
      // Update job progress
      await supabase
        .from('embedding_jobs')
        .update({ 
          items_processed: guideFiles.indexOf(file) + 1,
        })
        .eq('id', job.id);
        
    } catch (error) {
      console.error(`  ❌ Failed to process ${guideTitle}:`, error.message);
      totalFailed++;
    }
  }
  
  // Complete job
  await supabase
    .from('embedding_jobs')
    .update({
      status: 'completed',
      items_processed: guideFiles.length,
      items_failed: totalFailed,
      completed_at: new Date().toISOString(),
    })
    .eq('id', job.id);
  
  console.log('\n✅ PREMIUM GUIDE EMBEDDING COMPLETE!');
  console.log('═══════════════════════════════════════════════');
  console.log(`📚 Guides processed: ${guideFiles.length}`);
  console.log(`📊 Total chunks: ${totalChunks}`);
  console.log(`✅ Successfully embedded: ${totalEmbedded}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`💰 Estimated cost: $${((totalChunks * 800) / 1000000 * 0.02).toFixed(4)}`);
  console.log('═══════════════════════════════════════════════\n');
  
  console.log('🎉 Your military expert now has comprehensive knowledge!');
}

// Run
embedPremiumGuides().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
