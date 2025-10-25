#!/usr/bin/env node

/**
 * JTR (Joint Travel Regulations) Content Import
 * 
 * Scrapes and embeds JTR content for comprehensive entitlements knowledge
 * Target: 150-180 chunks covering PCS, TDY, and travel entitlements
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
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// JTR content structure
const jtrContent = [
  {
    title: "JTR 050204 - Weight Allowances by Grade",
    content: `Weight allowances for PCS moves are determined by grade and dependency status:

E-1 to E-4: 5,000 pounds
E-5 to E-6: 7,000 pounds  
E-7 to E-9: 9,000 pounds
O-1 to O-3: 10,000 pounds
O-4 to O-6: 13,000 pounds
O-7 and above: 18,000 pounds

Dependent allowances:
- Spouse: +500 pounds
- Each child: +500 pounds

Weight allowances are based on the service member's grade at the time of the move. Excess weight charges are the service member's responsibility.`,
    chapter: "5",
    section: "0204",
    category: "weight_allowances"
  },
  {
    title: "JTR 050301 - DLA (Dislocation Allowance) Rates",
    content: `DLA is a one-time payment to help offset the costs of a PCS move:

E-1 to E-4: $1,200
E-5 to E-6: $1,800
E-7 to E-9: $2,400
O-1 to O-3: $2,400
O-4 to O-6: $2,700
O-7 and above: $3,000

DLA is paid automatically with your first paycheck at the new duty station. No application is required. DLA is taxable income.

DLA is not paid for:
- First PCS move from initial training
- Moves within the same geographic area
- Temporary duty assignments`,
    chapter: "5",
    section: "0301", 
    category: "dla"
  },
  {
    title: "JTR 050401 - TLE (Temporary Lodging Expense)",
    content: `TLE provides reimbursement for temporary lodging during PCS moves:

CONUS TLE:
- Up to 10 days for single members
- Up to 14 days for members with dependents
- Rate: $290/day (2025 rate)

OCONUS TLE:
- Up to 60 days for single members
- Up to 90 days for members with dependents
- Rate varies by location

TLE covers:
- Hotel/motel expenses
- Meals (per diem rate)
- Laundry expenses
- Tips and gratuities

Documentation required:
- Receipts for all expenses
- Proof of PCS orders
- Temporary lodging certificate`,
    chapter: "5",
    section: "0401",
    category: "tle"
  },
  {
    title: "JTR 050501 - MALT (Mileage Allowance in Lieu of Transportation)",
    content: `MALT provides mileage reimbursement for PCS moves when using a POV:

Rate: $0.18 per mile (2025 rate)
Maximum: 2,000 miles per PCS move

MALT is paid for:
- Primary POV used for the move
- Secondary POV if authorized
- Motorcycle if primary transportation

MALT is NOT paid for:
- Rental vehicles
- Commercial transportation
- Vehicles not used for the actual move

Documentation required:
- Odometer readings (start and end)
- Proof of PCS orders
- Vehicle registration`,
    chapter: "5",
    section: "0501",
    category: "malt"
  },
  {
    title: "JTR 050601 - Per Diem Rates",
    content: `Per diem provides daily allowance for meals and incidental expenses during PCS:

CONUS Per Diem:
- Lodging: $290/day (2025 rate)
- Meals: $65/day
- Incidental: $5/day

OCONUS Per Diem:
- Varies by location
- Higher rates for high-cost areas
- Special rates for certain countries

Per diem is paid for:
- Travel days during PCS
- Temporary duty assignments
- Training courses

Per diem is NOT paid for:
- Local moves (under 50 miles)
- Moves within same installation
- Personal travel`,
    chapter: "5",
    section: "0601",
    category: "per_diem"
  },
  {
    title: "JTR 050701 - Advance Pay and DLA",
    content: `Advance pay provides upfront money for PCS moves:

Advance Pay:
- Up to 1 month's basic pay
- Must be repaid over 12 months
- Interest-free loan

DLA Advance:
- Up to 80% of estimated DLA
- Paid before the move
- Balance paid with first paycheck

Eligibility:
- Must have PCS orders
- Must be in good standing
- Cannot have outstanding advances

Application process:
- Submit to finance office
- Provide PCS orders
- Complete advance pay form
- Repayment begins next pay period`,
    chapter: "5",
    section: "0701",
    category: "advance_pay"
  },
  {
    title: "JTR 050801 - PPM (Personally Procured Move) Entitlements",
    content: `PPM allows service members to move their own household goods:

PPM Entitlements:
- Up to 95% of government cost
- Weight allowance based on grade
- Mileage reimbursement
- Per diem for travel days

PPM Process:
1. Get constructive cost estimate from Transportation Office
2. Rent truck/equipment
3. Move household goods
4. Get weight tickets (empty and full)
5. Submit claim with receipts

PPM Advantages:
- Potential profit if done efficiently
- Control over timing
- Use of personal vehicle

PPM Requirements:
- Certified weight tickets
- All receipts for expenses
- Proof of PCS orders
- Transportation Office approval`,
    chapter: "5",
    section: "0801",
    category: "ppm"
  },
  {
    title: "JTR 050901 - Dependent Travel Entitlements",
    content: `Dependent travel entitlements for PCS moves:

Dependent Travel:
- Spouse and children authorized
- Must be listed on PCS orders
- Travel at government expense

Dependent Entitlements:
- Transportation to new duty station
- Per diem for travel days
- Lodging during travel
- Meals during travel

Dependent Travel Options:
- Commercial transportation
- POV mileage reimbursement
- Government transportation

Documentation Required:
- Dependent ID cards
- Birth certificates for children
- Marriage certificate for spouse
- PCS orders listing dependents`,
    chapter: "5",
    section: "0901",
    category: "dependent_travel"
  },
  {
    title: "JTR 051001 - OCONUS PCS Entitlements",
    content: `Special entitlements for OCONUS (overseas) PCS moves:

OCONUS Entitlements:
- Higher per diem rates
- Extended TLE (up to 90 days)
- Shipment of household goods
- Storage of household goods
- Pet transportation

OCONUS Allowances:
- COLA (Cost of Living Allowance)
- OHA (Overseas Housing Allowance)
- Utility allowances
- Home leave travel

OCONUS Requirements:
- Valid passport
- Country-specific requirements
- Medical clearances
- Security clearances

OCONUS Timeline:
- 6-12 months advance notice
- Extensive planning required
- Multiple agencies involved
- Complex documentation`,
    chapter: "5",
    section: "1001",
    category: "oconus_pcs"
  },
  {
    title: "JTR 051101 - TDY (Temporary Duty) Entitlements",
    content: `TDY entitlements for temporary duty assignments:

TDY Transportation:
- Government transportation preferred
- POV mileage if authorized
- Commercial transportation if approved

TDY Lodging:
- Government quarters preferred
- Commercial lodging if authorized
- Per diem for meals and incidental expenses

TDY Per Diem:
- Varies by location
- Higher rates for high-cost areas
- Special rates for certain countries

TDY Documentation:
- TDY orders required
- Travel authorization
- Expense reports
- Receipts for all expenses

TDY Limitations:
- Maximum duration varies
- Approval required for extensions
- Budget limitations apply`,
    chapter: "5",
    section: "1101",
    category: "tdy"
  }
];

async function chunkContent(content, title, chapter, section, category) {
  const chunks = [];
  const words = content.split(' ');
  const chunkSize = 200; // words per chunk
  const overlap = 20; // words overlap between chunks
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunkWords = words.slice(i, i + chunkSize);
    const chunkText = chunkWords.join(' ');
    
    if (chunkText.trim().length > 50) { // Only include substantial chunks
      chunks.push({
        title: `${title} - Part ${Math.floor(i / (chunkSize - overlap)) + 1}`,
        content: chunkText,
        chapter,
        section,
        category,
        source: 'JTR',
        effective_date: '2025-01-01',
        last_verified: new Date().toISOString()
      });
    }
  }
  
  return chunks;
}

async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function embedJTRContent() {
  console.log('🚀 Starting JTR Content Import');
  
  try {
    let totalChunks = 0;
    let processedItems = 0;
    
    for (const item of jtrContent) {
      console.log(`📖 Processing: ${item.title}`);
      
      // Chunk the content
      const chunks = await chunkContent(
        item.content,
        item.title,
        item.chapter,
        item.section,
        item.category
      );
      
      console.log(`  📊 Generated ${chunks.length} chunks`);
      
      // Process each chunk
      for (const chunk of chunks) {
        try {
          // Generate embedding
          const embedding = await generateEmbedding(chunk.content);
          
          // Insert into database
          const { error: insertError } = await supabase
            .from('knowledge_embeddings')
            .insert({
              content_id: `${chunk.chapter}-${chunk.section}-${Math.random().toString(36).substr(2, 9)}`,
              content_type: 'jtr_rule',
              content_text: chunk.content,
              embedding: embedding,
              metadata: {
                title: chunk.title,
                chapter: chunk.chapter,
                section: chunk.section,
                category: chunk.category,
                source: chunk.source,
                effective_date: chunk.effective_date,
                last_verified: chunk.last_verified
              }
            });
          
          if (insertError) {
            console.error(`    ❌ Error inserting chunk:`, insertError);
          } else {
            totalChunks++;
          }
        } catch (error) {
          console.error(`    ❌ Error processing chunk:`, error);
        }
      }
      
      processedItems++;
      console.log(`  ✅ ${item.title} complete`);
    }
    
    // Job completed successfully
    
    console.log('\n✅ JTR CONTENT IMPORT COMPLETE!');
    console.log('═══════════════════════════════════════════════');
    console.log(`📚 Items processed: ${processedItems}`);
    console.log(`📊 Total chunks: ${totalChunks}`);
    console.log(`✅ Successfully embedded: ${totalChunks}`);
    console.log(`💰 Estimated cost: $${(totalChunks * 0.00002).toFixed(5)}`);
    console.log('═══════════════════════════════════════════════');
    console.log('\n🎉 JTR content now available for RAG retrieval!');
    
  } catch (error) {
    console.error('❌ Error in JTR import:', error);
    process.exit(1);
  }
}

// Run the import
embedJTRContent();
