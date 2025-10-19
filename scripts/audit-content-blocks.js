/**
 * CONTENT BLOCKS ACCURACY AUDIT SCRIPT
 * 
 * This script audits all 410 content blocks for:
 * 1. Factual accuracy (military regulations, numbers, dates)
 * 2. Legitimate sources
 * 3. Outdated information
 * 4. Misleading claims
 * 5. Missing disclaimers
 * 
 * Usage: node scripts/audit-content-blocks.js
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error loading .env.local:', error.message);
    return {};
  }
}

const env = loadEnvFile();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Patterns that indicate potentially outdated or inaccurate info
const RED_FLAGS = {
  // Specific dates that might be outdated
  SPECIFIC_YEARS: /\b(2019|2020|2021|2022|2023)\b/g,
  
  // Specific dollar amounts that change frequently
  SPECIFIC_AMOUNTS: /\$\d{1,3}(,\d{3})*(\.\d{2})?\s*(per|monthly|annually|BAH|TSP|contribution)/gi,
  
  // Regulatory references that might be outdated
  REGULATIONS: /\b(DoDI|DoDD|AFI|AR|OPNAV|MCO|COMDTINST)\s*[\d-]+/gi,
  
  // Interest rates or percentages that change
  RATES: /\b\d+(\.\d+)?%\s*(interest|rate|APR|yield|return)/gi,
  
  // Phrases that might indicate guarantees or promises
  GUARANTEES: /\b(guaranteed|promise|always|never|definitely|certainly)\b/gi,
  
  // Tax info that changes annually
  TAX_INFO: /\b(tax bracket|tax rate|standard deduction|tax credit)\b/gi,
  
  // Benefits that might have changed
  BENEFITS: /\b(TSP match|BRS|High-3|GI Bill|SGLI|TRICARE)\b/gi,
};

// Categories that require extra scrutiny
const HIGH_RISK_DOMAINS = [
  'finance', // Financial advice must be accurate
  'taxes',   // Tax info changes annually
  'benefits', // Military benefits change
  'regulations' // Regulations get updated
];

// Check for missing critical disclaimers
const REQUIRED_DISCLAIMERS = {
  'finance': ['not financial advice', 'consult', 'advisor'],
  'taxes': ['tax professional', 'CPA', 'tax advisor'],
  'legal': ['legal advice', 'attorney', 'lawyer'],
  'medical': ['medical advice', 'doctor', 'physician']
};

async function auditContentBlocks() {
  console.log('🔍 Starting Content Blocks Accuracy Audit...\n');
  
  // Load all content blocks
  const { data: blocks, error } = await supabase
    .from('content_blocks')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('❌ Error loading content blocks:', error);
    return;
  }
  
  console.log(`📊 Loaded ${blocks.length} content blocks for audit\n`);
  
  const auditResults = {
    totalBlocks: blocks.length,
    flaggedBlocks: [],
    statistics: {
      withSpecificYears: 0,
      withSpecificAmounts: 0,
      withRegulations: 0,
      withRates: 0,
      withGuarantees: 0,
      withTaxInfo: 0,
      withBenefits: 0,
      missingDisclaimers: 0,
      highRiskDomains: 0,
      noSourceAttribution: 0,
      oldContent: 0
    },
    recommendations: []
  };
  
  // Audit each block
  for (const block of blocks) {
    const flags = [];
    const content = block.text_content || '';
    const html = block.html || '';
    const fullContent = `${content} ${html}`.toLowerCase();
    
    // Check for specific years
    const yearMatches = content.match(RED_FLAGS.SPECIFIC_YEARS);
    if (yearMatches) {
      auditResults.statistics.withSpecificYears++;
      flags.push({
        severity: 'medium',
        type: 'SPECIFIC_YEAR',
        details: `Contains specific year(s): ${yearMatches.join(', ')}`,
        recommendation: 'Verify if this information is still current'
      });
    }
    
    // Check for specific dollar amounts
    const amountMatches = content.match(RED_FLAGS.SPECIFIC_AMOUNTS);
    if (amountMatches) {
      auditResults.statistics.withSpecificAmounts++;
      flags.push({
        severity: 'high',
        type: 'SPECIFIC_AMOUNT',
        details: `Contains specific amounts: ${amountMatches.slice(0, 3).join(', ')}${amountMatches.length > 3 ? '...' : ''}`,
        recommendation: 'Verify current rates and amounts from official sources'
      });
    }
    
    // Check for regulatory references
    const regMatches = content.match(RED_FLAGS.REGULATIONS);
    if (regMatches) {
      auditResults.statistics.withRegulations++;
      flags.push({
        severity: 'high',
        type: 'REGULATION',
        details: `References regulation(s): ${regMatches.join(', ')}`,
        recommendation: 'Verify regulation is current and cite the version/date'
      });
    }
    
    // Check for interest rates
    const rateMatches = content.match(RED_FLAGS.RATES);
    if (rateMatches) {
      auditResults.statistics.withRates++;
      flags.push({
        severity: 'high',
        type: 'RATE',
        details: `Contains rate/percentage: ${rateMatches.slice(0, 2).join(', ')}`,
        recommendation: 'Rates change frequently - verify current rates'
      });
    }
    
    // Check for guarantees/promises
    const guaranteeMatches = content.match(RED_FLAGS.GUARANTEES);
    if (guaranteeMatches && guaranteeMatches.length > 2) {
      auditResults.statistics.withGuarantees++;
      flags.push({
        severity: 'critical',
        type: 'GUARANTEE',
        details: `Uses guarantee language: ${guaranteeMatches.length} instances`,
        recommendation: 'Avoid absolute guarantees - add appropriate disclaimers'
      });
    }
    
    // Check for tax information
    const taxMatches = content.match(RED_FLAGS.TAX_INFO);
    if (taxMatches) {
      auditResults.statistics.withTaxInfo++;
      flags.push({
        severity: 'high',
        type: 'TAX_INFO',
        details: `Contains tax information: ${taxMatches.slice(0, 2).join(', ')}`,
        recommendation: 'Tax info changes annually - verify current year accuracy'
      });
    }
    
    // Check for benefits info
    const benefitsMatches = content.match(RED_FLAGS.BENEFITS);
    if (benefitsMatches) {
      auditResults.statistics.withBenefits++;
      flags.push({
        severity: 'medium',
        type: 'BENEFITS',
        details: `Contains benefits info: ${benefitsMatches.slice(0, 2).join(', ')}`,
        recommendation: 'Military benefits change - verify with current regulations'
      });
    }
    
    // Check for required disclaimers
    const domain = block.domain?.toLowerCase() || '';
    if (REQUIRED_DISCLAIMERS[domain]) {
      const hasDisclaimer = REQUIRED_DISCLAIMERS[domain].some(term => 
        fullContent.includes(term.toLowerCase())
      );
      if (!hasDisclaimer) {
        auditResults.statistics.missingDisclaimers++;
        flags.push({
          severity: 'critical',
          type: 'MISSING_DISCLAIMER',
          details: `Missing required disclaimer for ${domain} content`,
          recommendation: `Add disclaimer mentioning: ${REQUIRED_DISCLAIMERS[domain].join(', ')}`
        });
      }
    }
    
    // Check if high-risk domain
    if (HIGH_RISK_DOMAINS.includes(domain)) {
      auditResults.statistics.highRiskDomains++;
    }
    
    // Check for source attribution
    if (!fullContent.includes('source') && !fullContent.includes('according to')) {
      if (domain === 'finance' || domain === 'benefits' || domain === 'regulations') {
        auditResults.statistics.noSourceAttribution++;
        flags.push({
          severity: 'medium',
          type: 'NO_SOURCE',
          details: 'No clear source attribution',
          recommendation: 'Add source references for credibility and verification'
        });
      }
    }
    
    // Check if content is old (created more than 1 year ago)
    const createdDate = new Date(block.created_at);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (createdDate < oneYearAgo) {
      auditResults.statistics.oldContent++;
      flags.push({
        severity: 'low',
        type: 'OLD_CONTENT',
        details: `Created ${Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 / 365))} year(s) ago`,
        recommendation: 'Review for accuracy - content is over 1 year old'
      });
    }
    
    // If block has flags, add to results
    if (flags.length > 0) {
      auditResults.flaggedBlocks.push({
        id: block.id,
        title: block.title,
        domain: block.domain,
        difficulty_level: block.difficulty_level,
        created_at: block.created_at,
        content_rating: block.content_rating,
        flags: flags
      });
    }
  }
  
  // Sort flagged blocks by severity
  auditResults.flaggedBlocks.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const aMax = Math.min(...a.flags.map(f => severityOrder[f.severity]));
    const bMax = Math.min(...b.flags.map(f => severityOrder[f.severity]));
    return aMax - bMax;
  });
  
  // Generate recommendations
  if (auditResults.statistics.withSpecificAmounts > 50) {
    auditResults.recommendations.push({
      priority: 'HIGH',
      recommendation: `${auditResults.statistics.withSpecificAmounts} blocks contain specific dollar amounts that may be outdated`,
      action: 'Create a quarterly review process to update financial figures'
    });
  }
  
  if (auditResults.statistics.withRegulations > 20) {
    auditResults.recommendations.push({
      priority: 'HIGH',
      recommendation: `${auditResults.statistics.withRegulations} blocks reference military regulations`,
      action: 'Add regulation version/date and create annual review process'
    });
  }
  
  if (auditResults.statistics.missingDisclaimers > 0) {
    auditResults.recommendations.push({
      priority: 'CRITICAL',
      recommendation: `${auditResults.statistics.missingDisclaimers} blocks missing required disclaimers`,
      action: 'Add appropriate disclaimers immediately for legal protection'
    });
  }
  
  if (auditResults.statistics.withGuarantees > 20) {
    auditResults.recommendations.push({
      priority: 'CRITICAL',
      recommendation: `${auditResults.statistics.withGuarantees} blocks use guarantee/promise language`,
      action: 'Review and soften language to avoid false promises'
    });
  }
  
  if (auditResults.statistics.noSourceAttribution > 30) {
    auditResults.recommendations.push({
      priority: 'MEDIUM',
      recommendation: `${auditResults.statistics.noSourceAttribution} blocks lack source attribution`,
      action: 'Add source references for credibility and fact-checking'
    });
  }
  
  if (auditResults.statistics.oldContent > 100) {
    auditResults.recommendations.push({
      priority: 'MEDIUM',
      recommendation: `${auditResults.statistics.oldContent} blocks are over 1 year old`,
      action: 'Implement quarterly content refresh process'
    });
  }
  
  // Generate report
  console.log('📊 AUDIT SUMMARY\n');
  console.log(`Total Blocks Audited: ${auditResults.totalBlocks}`);
  console.log(`Blocks Flagged: ${auditResults.flaggedBlocks.length} (${Math.round(auditResults.flaggedBlocks.length / auditResults.totalBlocks * 100)}%)\n`);
  
  console.log('🚩 FLAGS BY CATEGORY:');
  console.log(`  Specific Years: ${auditResults.statistics.withSpecificYears}`);
  console.log(`  Specific Amounts: ${auditResults.statistics.withSpecificAmounts}`);
  console.log(`  Regulations: ${auditResults.statistics.withRegulations}`);
  console.log(`  Rates/Percentages: ${auditResults.statistics.withRates}`);
  console.log(`  Guarantee Language: ${auditResults.statistics.withGuarantees}`);
  console.log(`  Tax Information: ${auditResults.statistics.withTaxInfo}`);
  console.log(`  Benefits Info: ${auditResults.statistics.withBenefits}`);
  console.log(`  Missing Disclaimers: ${auditResults.statistics.missingDisclaimers}`);
  console.log(`  No Source Attribution: ${auditResults.statistics.noSourceAttribution}`);
  console.log(`  Old Content (>1 year): ${auditResults.statistics.oldContent}`);
  console.log(`  High-Risk Domains: ${auditResults.statistics.highRiskDomains}\n`);
  
  if (auditResults.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:\n');
    auditResults.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority}] ${rec.recommendation}`);
      console.log(`   Action: ${rec.action}\n`);
    });
  }
  
  // Save detailed report
  const reportPath = './CONTENT_AUDIT_REPORT.json';
  fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
  console.log(`\n✅ Detailed audit report saved to: ${reportPath}`);
  
  // Create priority action list
  const criticalBlocks = auditResults.flaggedBlocks.filter(b => 
    b.flags.some(f => f.severity === 'critical')
  );
  
  if (criticalBlocks.length > 0) {
    console.log(`\n⚠️  CRITICAL: ${criticalBlocks.length} blocks require immediate attention:`);
    criticalBlocks.slice(0, 10).forEach((block, i) => {
      console.log(`\n${i + 1}. "${block.title}" (${block.domain})`);
      block.flags.filter(f => f.severity === 'critical').forEach(flag => {
        console.log(`   🚨 ${flag.type}: ${flag.details}`);
        console.log(`      → ${flag.recommendation}`);
      });
    });
  }
  
  console.log('\n✅ Audit complete!\n');
}

// Run audit
auditContentBlocks().catch(console.error);

