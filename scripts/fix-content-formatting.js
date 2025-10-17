#!/usr/bin/env node

/**
 * Content Formatting Fix Script
 * 
 * This script fixes common formatting issues in content blocks:
 * 1. Broken markdown tables
 * 2. Unformatted superscript references
 * 3. Malformed HTML
 * 4. Missing structure elements
 * 
 * Usage: node scripts/fix-content-formatting.js
 */

// Example content with formatting issues (like the SGLI block)
const exampleContent = `The transition from SGLI to VGLI represents more than just a change in name; it is a fundamental shift in the nature of the insurance product itself. The table below highlights the key differences between the two programs.

| Feature | Servicemembers' Group Life Insurance (SGLI) | Veterans' Group Life Insurance (VGLI) | | :---- | :---- | :---- | | Target Audience | Active Duty, Guard, and Reserve Members | Separated Veterans | | Enrollment | Automatic upon entry to service (Opt-out) | Application required within 1 year and 120 days of separation | | Maximum Coverage | $500,000 | $500,000 (cannot exceed SGLI amount at separation) | | Premium Basis | Flat rate, regardless of age, health, or tobacco use | Based on age (premiums increase in 5-year brackets) | | Medical Underwriting | None | None if application is submitted within 240 days of separation | | Program Funding | Subsidized by the Department of Defense (war risk covered) | Self-funded through premiums collected from policyholders |

The shift from SGLI's flat-rate premium to VGLI's age-banded structure is not arbitrary; it reflects a change from a subsidized military benefit to a self-sufficient group insurance product. The remarkably low cost of SGLI is possible because the government bears the financial burden of claims resulting from the unique hazards of military operations.9 This ensures that a service member pays a premium comparable to what a civilian might pay for a similar group policy, without being penalized for their occupation.

Upon separation from service, the veteran is no longer exposed to these specific military risks, and the government subsidy ends. VGLI must therefore collect enough in premiums from its members to cover all future claims. The most equitable way to do this in a group setting is to base premiums on age, which is the primary predictor of mortality risk. However, VGLI retains one crucial characteristic of a group plan: it pools risk across all its members. This means it does not charge higher rates for tobacco users or for individuals with most pre-existing health conditions, a key distinction from commercial insurance policies that use detailed medical underwriting to assign individual risk-based pricing.13 Grasping this transition—from a subsidized benefit to a non-subsidized but still broadly risk-pooled insurance product—is essential for any veteran weighing their post-service life insurance options.

## Section 2: A Deep Dive into Coverage and Costs

A thorough understanding of your life insurance options requires a detailed look at the numbers: the coverage amounts available to you and your family, and the precise costs associated with that protection. This section provides the specific premium tables for SGLI, FSGLI, and VGLI, allowing you to accurately assess your current costs and forecast your future expenses.`;

class ContentFormatter {
  constructor() {
    this.fixes = [];
  }

  fixContent(html) {
    let fixed = html;
    const originalLength = fixed.length;

    // 1. Fix broken markdown tables
    fixed = this.fixMarkdownTables(fixed);

    // 2. Fix superscript references
    fixed = this.fixSuperscriptReferences(fixed);

    // 3. Fix malformed HTML
    fixed = this.fixMalformedHTML(fixed);

    // 4. Add proper structure
    fixed = this.addStructure(fixed);

    // 5. Add action items if missing
    fixed = this.addActionItems(fixed);

    const changes = fixed.length !== originalLength;
    return { content: fixed, changed: changes };
  }

  fixMarkdownTables(html) {
    // Fix the specific issue in the SGLI example
    let fixed = html;

    // Pattern: | Feature | SGLI | VGLI | | :---- | :---- | :---- | | Target Audience | ...
    // Should be: | Feature | SGLI | VGLI |
    //            | :---- | :---- | :---- |
    //            | Target Audience | ...

    const brokenTableRegex = /(\| [^|]+\| [^|]+\| [^|]+\|)\s*(\| :---- \| :---- \| :---- \|)\s*(\| [^|]+\| [^|]+\| [^|]+\|)/g;
    
    fixed = fixed.replace(brokenTableRegex, (match, header, separator, firstRow) => {
      this.fixes.push('FIXED_BROKEN_MARKDOWN_TABLE');
      return `${header}\n${separator}\n${firstRow}`;
    });

    // Fix extra pipes in table separators
    fixed = fixed.replace(/\| :---- \| :---- \|:- \|\|/g, '| :---- | :---- | :---- |');
    this.fixes.push('FIXED_EXTRA_PIPES');

    return fixed;
  }

  fixSuperscriptReferences(html) {
    let fixed = html;

    // Fix unformatted superscript references like "operations.9" -> "operations.<sup>9</sup>"
    const superscriptRegex = /([.!?])(\d{1,2})(?![^<]*<\/sup>)(?=\s|$)/g;
    
    fixed = fixed.replace(superscriptRegex, (match, punctuation, number) => {
      this.fixes.push('FIXED_SUPERSCRIPT_REFERENCE');
      return `${punctuation}<sup>${number}</sup>`;
    });

    return fixed;
  }

  fixMalformedHTML(html) {
    let fixed = html;

    // Fix common HTML issues
    fixed = fixed.replace(/< /g, '<');
    fixed = fixed.replace(/ >/g, '>');
    fixed = fixed.replace(/<< /g, '<');
    fixed = fixed.replace(/ >>/g, '>');

    if (fixed !== html) {
      this.fixes.push('FIXED_MALFORMED_HTML');
    }

    return fixed;
  }

  addStructure(html) {
    let fixed = html;

    // Add proper heading structure if missing
    if (!fixed.includes('<h1>') && !fixed.includes('<h2>') && !fixed.includes('##')) {
      // Extract first sentence as potential heading
      const firstSentence = fixed.split('.')[0];
      if (firstSentence.length > 10 && firstSentence.length < 100) {
        const remaining = fixed.substring(firstSentence.length + 1);
        fixed = `## ${firstSentence}\n\n${remaining}`;
        this.fixes.push('ADDED_HEADING_STRUCTURE');
      }
    }

    // Ensure proper paragraph breaks
    fixed = fixed.replace(/\n\n+/g, '\n\n');

    return fixed;
  }

  addActionItems(html) {
    let fixed = html;

    // Check if content already has action items
    const actionKeywords = [
      'action item', 'next step', 'to do', 'checklist', 'apply now',
      'calculate', 'compare', 'review', 'update', 'contact', 'file',
      'submit', 'register', 'enroll', 'plan', 'budget'
    ];

    const hasActions = actionKeywords.some(keyword => 
      fixed.toLowerCase().includes(keyword)
    );

    if (!hasActions) {
      // Add action items based on content type
      if (fixed.toLowerCase().includes('sgli') || fixed.toLowerCase().includes('vgli')) {
        const actionItems = `
## 📋 Action Items

- **Review your current SGLI coverage** - Log into milConnect to verify your current amount
- **Calculate VGLI costs** - Use our VGLI Premium Calculator to estimate future expenses
- **Compare options** - Research private life insurance alternatives before separation
- **Set reminders** - Mark your separation date + 1 year + 120 days for VGLI application deadline

## 🔗 Related Resources

- [VGLI Premium Calculator](/dashboard/tools/vgli-calculator)
- [Life Insurance Comparison Tool](/dashboard/tools/life-insurance-comparison)
- [Separation Checklist](/dashboard/library?domain=transition)
`;

        fixed += actionItems;
        this.fixes.push('ADDED_ACTION_ITEMS');
      }
    }

    return fixed;
  }

  generateReport() {
    console.log('\n🔧 CONTENT FORMATTING FIXES APPLIED:');
    console.log('====================================\n');

    const fixCounts = {};
    this.fixes.forEach(fix => {
      fixCounts[fix] = (fixCounts[fix] || 0) + 1;
    });

    Object.entries(fixCounts).forEach(([fix, count]) => {
      console.log(`✅ ${fix}: ${count} times`);
    });

    console.log(`\n📊 Total fixes applied: ${this.fixes.length}`);
  }
}

// Test the formatter with the example content
function testFormatter() {
  console.log('🧪 Testing Content Formatter with SGLI Example...\n');

  const formatter = new ContentFormatter();
  const result = formatter.fixContent(exampleContent);

  console.log('📝 BEFORE (Sample):');
  console.log('==================');
  console.log(exampleContent.substring(0, 300) + '...\n');

  console.log('✨ AFTER (Sample):');
  console.log('==================');
  console.log(result.content.substring(0, 300) + '...\n');

  console.log(`🔄 Content changed: ${result.changed ? 'YES' : 'NO'}`);

  formatter.generateReport();

  return result;
}

// Show the fixed table structure
function showTableFix() {
  console.log('\n📊 TABLE FIXING EXAMPLE:');
  console.log('========================\n');

  const brokenTable = `| Feature | SGLI | VGLI | | :---- | :---- | :---- | | Target Audience | Active Duty | Veterans |`;

  const formatter = new ContentFormatter();
  const fixed = formatter.fixMarkdownTables(brokenTable);

  console.log('❌ BEFORE (Broken):');
  console.log(brokenTable);
  console.log('\n✅ AFTER (Fixed):');
  console.log(fixed);
}

if (require.main === module) {
  testFormatter();
  showTableFix();
}

module.exports = { ContentFormatter };
