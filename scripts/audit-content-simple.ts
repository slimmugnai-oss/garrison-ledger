/**
 * CONTENT BLOCKS ACCURACY AUDIT SCRIPT
 * 
 * This script audits all content blocks for accuracy and trustworthiness
 * 
 * Usage: tsx scripts/audit-content-simple.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Get environment variables directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Run: NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node ...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Red flag patterns
const RED_FLAGS = {
  SPECIFIC_YEARS: /\b(2019|2020|2021|2022|2023|2024)\b/g,
  SPECIFIC_AMOUNTS: /\$\d{1,3}(,\d{3})*(\.\d{2})?\s*(per|monthly|annually|BAH|TSP|contribution|limit)/gi,
  REGULATIONS: /\b(DoDI|DoDD|AFI|AR|OPNAV|MCO|COMDTINST)\s*[\d-]+/gi,
  RATES: /\b\d+(\.\d+)?%\s*(interest|rate|APR|yield|return|match|contribution)/gi,
  GUARANTEES: /\b(guaranteed|promise|always works|never fails|definitely|certainly will|100% sure)\b/gi,
  TAX_INFO: /\b(tax bracket|tax rate|standard deduction|tax credit|IRS)\b/gi,
  BENEFITS: /\b(TSP match|BRS|High-3|GI Bill|SGLI|TRICARE|BAH rate)\b/gi,
};

async function runAudit() {
  console.log('🔍 Starting Content Blocks Accuracy Audit...\n');
  
  try {
    const { data: blocks, error } = await supabase
      .from('content_blocks')
      .select('id, title, domain, text_content, html, difficulty_level, created_at, content_rating')
      .order('content_rating', { ascending: false });
    
    if (error) throw error;
    
    console.log(`📊 Loaded ${blocks?.length || 0} content blocks\n`);
    
    const results = {
      total: blocks?.length || 0,
      flagged: [] as any[],
      stats: {
        specificYears: 0,
        specificAmounts: 0,
        regulations: 0,
        rates: 0,
        guarantees: 0,
        taxInfo: 0,
        benefits: 0,
        oldContent: 0,
      }
    };
    
    for (const block of blocks || []) {
      const content = block.text_content || '';
      const flags = [];
      
      // Check each pattern
      const yearMatches = content.match(RED_FLAGS.SPECIFIC_YEARS);
      if (yearMatches) {
        results.stats.specificYears++;
        flags.push({ type: 'YEAR', count: yearMatches.length, samples: yearMatches.slice(0, 3) });
      }
      
      const amountMatches = content.match(RED_FLAGS.SPECIFIC_AMOUNTS);
      if (amountMatches) {
        results.stats.specificAmounts++;
        flags.push({ type: 'AMOUNT', count: amountMatches.length, samples: amountMatches.slice(0, 2) });
      }
      
      const regMatches = content.match(RED_FLAGS.REGULATIONS);
      if (regMatches) {
        results.stats.regulations++;
        flags.push({ type: 'REGULATION', count: regMatches.length, samples: regMatches });
      }
      
      const rateMatches = content.match(RED_FLAGS.RATES);
      if (rateMatches) {
        results.stats.rates++;
        flags.push({ type: 'RATE', count: rateMatches.length, samples: rateMatches.slice(0, 2) });
      }
      
      const guaranteeMatches = content.match(RED_FLAGS.GUARANTEES);
      if (guaranteeMatches && guaranteeMatches.length > 1) {
        results.stats.guarantees++;
        flags.push({ type: 'GUARANTEE', count: guaranteeMatches.length, samples: guaranteeMatches });
      }
      
      const taxMatches = content.match(RED_FLAGS.TAX_INFO);
      if (taxMatches) {
        results.stats.taxInfo++;
        flags.push({ type: 'TAX', count: taxMatches.length, samples: taxMatches.slice(0, 2) });
      }
      
      const benefitsMatches = content.match(RED_FLAGS.BENEFITS);
      if (benefitsMatches) {
        results.stats.benefits++;
        flags.push({ type: 'BENEFITS', count: benefitsMatches.length, samples: benefitsMatches.slice(0, 2) });
      }
      
      // Check age
      const created = new Date(block.created_at);
      const monthsOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsOld > 12) {
        results.stats.oldContent++;
        flags.push({ type: 'OLD', monthsOld: Math.round(monthsOld) });
      }
      
      if (flags.length > 0) {
        results.flagged.push({
          id: block.id,
          title: block.title,
          domain: block.domain,
          rating: block.content_rating,
          flags
        });
      }
    }
    
    // Print results
    console.log('📊 AUDIT SUMMARY\n');
    console.log(`Total Blocks: ${results.total}`);
    console.log(`Flagged: ${results.flagged.length} (${Math.round(results.flagged.length / results.total * 100)}%)\n`);
    
    console.log('🚩 FLAGS BY CATEGORY:');
    console.log(`  Specific Years (2019-2024): ${results.stats.specificYears}`);
    console.log(`  Specific Dollar Amounts: ${results.stats.specificAmounts}`);
    console.log(`  Military Regulations: ${results.stats.regulations}`);
    console.log(`  Interest Rates/Percentages: ${results.stats.rates}`);
    console.log(`  Guarantee Language: ${results.stats.guarantees}`);
    console.log(`  Tax Information: ${results.stats.taxInfo}`);
    console.log(`  Benefits References: ${results.stats.benefits}`);
    console.log(`  Old Content (>1 year): ${results.stats.oldContent}\n`);
    
    // Top issues
    console.log('🚨 TOP 20 BLOCKS REQUIRING ATTENTION:\n');
    results.flagged
      .sort((a, b) => b.flags.length - a.flags.length)
      .slice(0, 20)
      .forEach((block, i) => {
        console.log(`${i + 1}. "${block.title}" (${block.domain})`);
        console.log(`   Rating: ${block.rating} | Flags: ${block.flags.length}`);
        block.flags.forEach((flag: any) => {
          if (flag.samples) {
            console.log(`   - ${flag.type}: ${flag.samples.join(', ')}`);
          } else {
            console.log(`   - ${flag.type}: ${flag.monthsOld} months old`);
          }
        });
        console.log('');
      });
    
    // Save full report
    fs.writeFileSync('CONTENT_AUDIT_REPORT.json', JSON.stringify(results, null, 2));
    console.log('✅ Full audit report saved to: CONTENT_AUDIT_REPORT.json\n');
    
    // Recommendations
    console.log('💡 RECOMMENDATIONS:\n');
    if (results.stats.specificAmounts > 50) {
      console.log(`⚠️  HIGH: ${results.stats.specificAmounts} blocks have specific dollar amounts`);
      console.log('   → Create quarterly review process to update financial figures\n');
    }
    if (results.stats.guarantees > 0) {
      console.log(`🚨 CRITICAL: ${results.stats.guarantees} blocks use guarantee language`);
      console.log('   → Review immediately and soften language to avoid false promises\n');
    }
    if (results.stats.taxInfo > 30) {
      console.log(`⚠️  HIGH: ${results.stats.taxInfo} blocks contain tax information`);
      console.log('   → Verify all tax info is current for 2025 tax year\n');
    }
    if (results.stats.oldContent > 100) {
      console.log(`⚠️  MEDIUM: ${results.stats.oldContent} blocks are over 1 year old`);
      console.log('   → Implement quarterly content refresh process\n');
    }
    
    console.log('✅ Audit complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runAudit();

