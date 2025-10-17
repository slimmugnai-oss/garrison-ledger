#!/usr/bin/env node

/**
 * Content Quality Audit Script
 * 
 * This script analyzes all 410 content blocks for:
 * 1. Formatting issues (broken markdown, malformed HTML)
 * 2. Quality metrics (readability, military relevance)
 * 3. Structure consistency
 * 4. Action items and next steps
 * 
 * Usage: node scripts/audit-content-quality.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Content Quality Metrics
class ContentQualityAnalyzer {
  constructor() {
    this.issues = [];
    this.metrics = {
      total: 0,
      highQuality: 0,
      needsWork: 0,
      lowQuality: 0,
      formattingIssues: 0,
      missingActionItems: 0,
      militaryRelevance: 0
    };
  }

  analyzeContent(block) {
    const issues = [];
    let qualityScore = 100;

    // 1. Check for broken markdown tables
    if (this.hasBrokenMarkdownTable(block.html)) {
      issues.push('BROKEN_MARKDOWN_TABLE');
      qualityScore -= 30;
    }

    // 2. Check for malformed HTML
    if (this.hasMalformedHTML(block.html)) {
      issues.push('MALFORMED_HTML');
      qualityScore -= 20;
    }

    // 3. Check for superscript references without proper formatting
    if (this.hasUnformattedReferences(block.html)) {
      issues.push('UNFORMATTED_REFERENCES');
      qualityScore -= 15;
    }

    // 4. Check for military relevance
    const militaryScore = this.calculateMilitaryRelevance(block);
    if (militaryScore < 0.7) {
      issues.push('LOW_MILITARY_RELEVANCE');
      qualityScore -= 25;
    }

    // 5. Check for action items
    if (!this.hasActionItems(block)) {
      issues.push('NO_ACTION_ITEMS');
      qualityScore -= 20;
    }

    // 6. Check for proper structure
    if (!this.hasProperStructure(block)) {
      issues.push('POOR_STRUCTURE');
      qualityScore -= 15;
    }

    // 7. Check readability
    const readabilityScore = this.calculateReadability(block);
    if (readabilityScore < 0.6) {
      issues.push('POOR_READABILITY');
      qualityScore -= 10;
    }

    return {
      id: block.id,
      title: block.title,
      qualityScore: Math.max(0, qualityScore),
      issues,
      militaryRelevance: militaryScore,
      readability: readabilityScore,
      hasActionItems: this.hasActionItems(block),
      wordCount: this.getWordCount(block.html)
    };
  }

  hasBrokenMarkdownTable(html) {
    // Check for malformed markdown tables like in the SGLI example
    const tableRegex = /\|.*\|.*\|/g;
    const matches = html.match(tableRegex);
    
    if (!matches) return false;
    
    // Check for broken pipe separators
    return matches.some(match => {
      // Look for patterns like "| :---- | :---- |:- ||" (extra pipes)
      return match.includes('||') || match.includes('| :---- | :---- |:-');
    });
  }

  hasMalformedHTML(html) {
    // Check for unclosed tags, malformed attributes, etc.
    const openTags = html.match(/<[^\/][^>]*>/g) || [];
    const closeTags = html.match(/<\/[^>]*>/g) || [];
    
    // Simple check for obvious malformed HTML
    return html.includes('< ') || html.includes(' >') || html.includes('<<') || html.includes('>>');
  }

  hasUnformattedReferences(html) {
    // Check for superscript numbers without proper formatting
    const superscriptRegex = /[0-9]+(?![^<]*<\/sup>)/g;
    const matches = html.match(superscriptRegex);
    
    if (!matches) return false;
    
    // Check if any numbers appear to be references but aren't formatted
    return matches.some(num => {
      const numStr = num.toString();
      // References are usually 1-2 digits and appear after periods or at end of sentences
      return numStr.length <= 2 && (html.includes(numStr + '.') || html.includes(numStr + ','));
    });
  }

  calculateMilitaryRelevance(block) {
    const militaryKeywords = [
      'military', 'veteran', 'service member', 'active duty', 'reserve', 'guard',
      'deployment', 'pcs', 'base', 'commissary', 'exchange', 'bah', 'oah',
      'tsp', 'sdp', 'sgli', 'vgli', 'gi bill', 'va loan', 'tricare',
      'retirement', 'pension', 'duty station', 'assignment', 'orders',
      'combat', 'deployment', 'separation', 'transition'
    ];

    const text = (block.title + ' ' + block.html).toLowerCase();
    const matches = militaryKeywords.filter(keyword => text.includes(keyword));
    
    return matches.length / militaryKeywords.length;
  }

  hasActionItems(block) {
    const actionKeywords = [
      'action item', 'next step', 'to do', 'checklist', 'apply now',
      'calculate', 'compare', 'review', 'update', 'contact', 'file',
      'submit', 'register', 'enroll', 'plan', 'budget'
    ];

    const text = (block.title + ' ' + block.html).toLowerCase();
    return actionKeywords.some(keyword => text.includes(keyword));
  }

  hasProperStructure(block) {
    const html = block.html.toLowerCase();
    
    // Check for headings, lists, or structured content
    const hasHeadings = html.includes('<h1>') || html.includes('<h2>') || html.includes('<h3>');
    const hasLists = html.includes('<ul>') || html.includes('<ol>') || html.includes('<li>');
    const hasTables = html.includes('<table>') || html.includes('|');
    const hasParagraphs = html.includes('<p>');
    
    return hasHeadings || hasLists || hasTables || hasParagraphs;
  }

  calculateReadability(block) {
    // Simple readability score based on sentence length and complexity
    const text = block.html.replace(/<[^>]*>/g, ' '); // Remove HTML tags
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Simple readability formula (lower is better)
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgWordLength / 100);
    
    // Convert to 0-1 scale where 1 is most readable
    return Math.max(0, Math.min(1, score / 100));
  }

  getWordCount(html) {
    const text = html.replace(/<[^>]*>/g, ' ');
    return text.split(/\s+/).filter(w => w.length > 0).length;
  }

  generateReport(analyses) {
    console.log('\n🎯 CONTENT QUALITY AUDIT REPORT');
    console.log('================================\n');

    // Overall metrics
    this.metrics.total = analyses.length;
    this.metrics.highQuality = analyses.filter(a => a.qualityScore >= 80).length;
    this.metrics.needsWork = analyses.filter(a => a.qualityScore >= 60 && a.qualityScore < 80).length;
    this.metrics.lowQuality = analyses.filter(a => a.qualityScore < 60).length;
    this.metrics.formattingIssues = analyses.filter(a => a.issues.includes('BROKEN_MARKDOWN_TABLE') || a.issues.includes('MALFORMED_HTML')).length;
    this.metrics.missingActionItems = analyses.filter(a => a.issues.includes('NO_ACTION_ITEMS')).length;
    this.metrics.militaryRelevance = analyses.filter(a => a.militaryRelevance >= 0.7).length;

    console.log(`📊 OVERALL METRICS:`);
    console.log(`   Total Blocks: ${this.metrics.total}`);
    console.log(`   High Quality (80-100): ${this.metrics.highQuality} (${(this.metrics.highQuality/this.metrics.total*100).toFixed(1)}%)`);
    console.log(`   Needs Work (60-79): ${this.metrics.needsWork} (${(this.metrics.needsWork/this.metrics.total*100).toFixed(1)}%)`);
    console.log(`   Low Quality (<60): ${this.metrics.lowQuality} (${(this.metrics.lowQuality/this.metrics.total*100).toFixed(1)}%)`);
    console.log(`   Formatting Issues: ${this.metrics.formattingIssues}`);
    console.log(`   Missing Action Items: ${this.metrics.missingActionItems}`);
    console.log(`   High Military Relevance: ${this.metrics.militaryRelevance}`);

    // Top issues
    const issueCounts = {};
    analyses.forEach(analysis => {
      analysis.issues.forEach(issue => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    });

    console.log(`\n🚨 TOP ISSUES:`);
    Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([issue, count]) => {
        console.log(`   ${issue}: ${count} blocks`);
      });

    // Low quality blocks
    const lowQuality = analyses.filter(a => a.qualityScore < 60);
    if (lowQuality.length > 0) {
      console.log(`\n❌ LOW QUALITY BLOCKS (Score < 60):`);
      lowQuality.slice(0, 10).forEach(block => {
        console.log(`   ${block.title} (Score: ${block.qualityScore.toFixed(1)})`);
      });
      if (lowQuality.length > 10) {
        console.log(`   ... and ${lowQuality.length - 10} more`);
      }
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      issueCounts,
      analyses: analyses.sort((a, b) => a.qualityScore - b.qualityScore)
    };

    const reportPath = path.join(__dirname, '..', 'docs', 'content-quality-audit.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    return report;
  }
}

async function main() {
  console.log('🔍 Starting Content Quality Audit...\n');

  try {
    // Fetch all content blocks
    const { data: blocks, error } = await supabase
      .from('content_blocks')
      .select('id, title, html, source_page, tags, type')
      .order('created_at');

    if (error) {
      console.error('❌ Error fetching content blocks:', error);
      process.exit(1);
    }

    console.log(`📚 Found ${blocks.length} content blocks to analyze\n`);

    // Analyze each block
    const analyzer = new ContentQualityAnalyzer();
    const analyses = blocks.map(block => analyzer.analyzeContent(block));

    // Generate report
    const report = analyzer.generateReport(analyses);

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    console.log(`   1. Fix ${this.metrics.formattingIssues} blocks with formatting issues`);
    console.log(`   2. Add action items to ${this.metrics.missingActionItems} blocks`);
    console.log(`   3. Consider removing ${this.metrics.lowQuality} low-quality blocks`);
    console.log(`   4. Improve military relevance in ${blocks.length - this.metrics.militaryRelevance} blocks`);

    console.log('\n✅ Audit complete!');

  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ContentQualityAnalyzer };
