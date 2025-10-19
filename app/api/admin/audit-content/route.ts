import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for full audit

/**
 * CONTENT BLOCKS ACCURACY AUDIT API
 * 
 * GET /api/admin/audit-content
 * 
 * Audits all content blocks for accuracy, outdated info, and missing disclaimers
 */

const RED_FLAGS = {
  SPECIFIC_YEARS: /\b(2019|2020|2021|2022|2023|2024)\b/g,
  SPECIFIC_AMOUNTS: /\$\d{1,3}(,\d{3})*(\.\d{2})?\s*(per|monthly|annually|BAH|TSP|contribution|limit)/gi,
  REGULATIONS: /\b(DoDI|DoDD|AFI|AR|OPNAV|MCO|COMDTINST)\s*[\d-]+/gi,
  RATES: /\b\d+(\.\d+)?%\s*(interest|rate|APR|yield|return|match|contribution)/gi,
  GUARANTEES: /\b(guaranteed|promise|always works|never fails|definitely|certainly will|100% sure)\b/gi,
  TAX_INFO: /\b(tax bracket|tax rate|standard deduction|tax credit|IRS)\b/gi,
  BENEFITS: /\b(TSP match|BRS|High-3|GI Bill|SGLI|TRICARE|BAH rate)\b/gi,
};

export async function GET(req: NextRequest) {
  try {
    console.log('[Content Audit] Starting audit...');
    
    // Load all content blocks
    const { data: blocks, error } = await supabaseAdmin
      .from('content_blocks')
      .select('id, title, domain, text_content, html, difficulty_level, created_at, content_rating, tags, topics')
      .order('content_rating', { ascending: false });
    
    if (error) {
      console.error('[Content Audit] Error loading blocks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`[Content Audit] Loaded ${blocks.length} content blocks`);
    
    const results = {
      auditDate: new Date().toISOString(),
      total: blocks.length,
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
        noDisclaimer: 0,
      },
      recommendations: [] as any[]
    };
    
    for (const block of blocks) {
      const content = (block.text_content || '') + ' ' + (block.html || '');
      const flags = [];
      
      // Check each pattern
      const yearMatches = content.match(RED_FLAGS.SPECIFIC_YEARS);
      if (yearMatches && yearMatches.length > 0) {
        results.stats.specificYears++;
        flags.push({ 
          severity: 'medium',
          type: 'SPECIFIC_YEAR', 
          count: yearMatches.length, 
          samples: yearMatches.slice(0, 3).join(', '),
          recommendation: 'Verify this information is still current'
        });
      }
      
      const amountMatches = content.match(RED_FLAGS.SPECIFIC_AMOUNTS);
      if (amountMatches && amountMatches.length > 0) {
        results.stats.specificAmounts++;
        flags.push({ 
          severity: 'high',
          type: 'SPECIFIC_AMOUNT', 
          count: amountMatches.length, 
          samples: amountMatches.slice(0, 3).join(', '),
          recommendation: 'Verify current rates from official sources (DFAS, TSP.gov)'
        });
      }
      
      const regMatches = content.match(RED_FLAGS.REGULATIONS);
      if (regMatches && regMatches.length > 0) {
        results.stats.regulations++;
        flags.push({ 
          severity: 'high',
          type: 'REGULATION', 
          count: regMatches.length, 
          samples: regMatches.join(', '),
          recommendation: 'Verify regulation is current and cite version/date'
        });
      }
      
      const rateMatches = content.match(RED_FLAGS.RATES);
      if (rateMatches && rateMatches.length > 0) {
        results.stats.rates++;
        flags.push({ 
          severity: 'high',
          type: 'RATE', 
          count: rateMatches.length, 
          samples: rateMatches.slice(0, 2).join(', '),
          recommendation: 'Rates change frequently - verify current rates'
        });
      }
      
      const guaranteeMatches = content.match(RED_FLAGS.GUARANTEES);
      if (guaranteeMatches && guaranteeMatches.length > 1) {
        results.stats.guarantees++;
        flags.push({ 
          severity: 'critical',
          type: 'GUARANTEE_LANGUAGE', 
          count: guaranteeMatches.length, 
          samples: guaranteeMatches.join(', '),
          recommendation: 'Remove absolute guarantees - add appropriate disclaimers'
        });
      }
      
      const taxMatches = content.match(RED_FLAGS.TAX_INFO);
      if (taxMatches && taxMatches.length > 0) {
        results.stats.taxInfo++;
        flags.push({ 
          severity: 'high',
          type: 'TAX_INFO', 
          count: taxMatches.length, 
          samples: taxMatches.slice(0, 2).join(', '),
          recommendation: 'Tax info changes annually - verify 2025 accuracy'
        });
      }
      
      const benefitsMatches = content.match(RED_FLAGS.BENEFITS);
      if (benefitsMatches && benefitsMatches.length > 0) {
        results.stats.benefits++;
        flags.push({ 
          severity: 'medium',
          type: 'BENEFITS_INFO', 
          count: benefitsMatches.length, 
          samples: benefitsMatches.slice(0, 2).join(', '),
          recommendation: 'Verify with current military regulations'
        });
      }
      
      // Check for disclaimers on finance content
      const isFinance = block.domain === 'finance' || block.tags?.includes('finance');
      const hasDisclaimer = content.toLowerCase().includes('not financial advice') || 
                           content.toLowerCase().includes('consult') ||
                           content.toLowerCase().includes('advisor');
      
      if (isFinance && !hasDisclaimer) {
        results.stats.noDisclaimer++;
        flags.push({
          severity: 'critical',
          type: 'MISSING_DISCLAIMER',
          recommendation: 'Add "This is educational information only, not financial advice" disclaimer'
        });
      }
      
      // Check age
      const created = new Date(block.created_at);
      const monthsOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsOld > 12) {
        results.stats.oldContent++;
        flags.push({ 
          severity: 'low',
          type: 'OLD_CONTENT', 
          monthsOld: Math.round(monthsOld),
          recommendation: 'Review for accuracy - content is over 1 year old'
        });
      }
      
      if (flags.length > 0) {
        // Calculate priority score
        const criticalCount = flags.filter((f: any) => f.severity === 'critical').length;
        const highCount = flags.filter((f: any) => f.severity === 'high').length;
        const priorityScore = (criticalCount * 100) + (highCount * 10) + flags.length;
        
        results.flagged.push({
          id: block.id,
          title: block.title,
          domain: block.domain,
          rating: block.content_rating,
          created: block.created_at,
          flags,
          priorityScore
        });
      }
    }
    
    // Sort by priority
    results.flagged.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Generate recommendations
    if (results.stats.guarantees > 0) {
      results.recommendations.push({
        priority: 'CRITICAL',
        category: 'Guarantee Language',
        count: results.stats.guarantees,
        action: `Review ${results.stats.guarantees} blocks using guarantee language. Soften language to avoid false promises. Military audience values honesty over hype.`
      });
    }
    
    if (results.stats.noDisclaimer > 0) {
      results.recommendations.push({
        priority: 'CRITICAL',
        category: 'Missing Disclaimers',
        count: results.stats.noDisclaimer,
        action: `Add financial advice disclaimers to ${results.stats.noDisclaimer} finance blocks immediately for legal protection.`
      });
    }
    
    if (results.stats.specificAmounts > 50) {
      results.recommendations.push({
        priority: 'HIGH',
        category: 'Specific Dollar Amounts',
        count: results.stats.specificAmounts,
        action: `${results.stats.specificAmounts} blocks contain specific amounts. Create quarterly review process to update financial figures with current DFAS/TSP data.`
      });
    }
    
    if (results.stats.regulations > 20) {
      results.recommendations.push({
        priority: 'HIGH',
        category: 'Military Regulations',
        count: results.stats.regulations,
        action: `${results.stats.regulations} blocks reference regulations. Add version/date citations and create annual verification process.`
      });
    }
    
    if (results.stats.taxInfo > 30) {
      results.recommendations.push({
        priority: 'HIGH',
        category: 'Tax Information',
        count: results.stats.taxInfo,
        action: `${results.stats.taxInfo} blocks contain tax info. Verify all information is current for 2025 tax year. Tax info changes annually.`
      });
    }
    
    if (results.stats.oldContent > 100) {
      results.recommendations.push({
        priority: 'MEDIUM',
        category: 'Old Content',
        count: results.stats.oldContent,
        action: `${results.stats.oldContent} blocks are over 1 year old. Implement quarterly content refresh process focusing on high-traffic blocks.`
      });
    }
    
    console.log('[Content Audit] Complete');
    console.log(`[Content Audit] Flagged ${results.flagged.length} of ${results.total} blocks (${Math.round(results.flagged.length / results.total * 100)}%)`);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('[Content Audit] Error:', error);
    return NextResponse.json({ 
      error: "Audit failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

