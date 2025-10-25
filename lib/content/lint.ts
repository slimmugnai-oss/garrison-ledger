/**
 * CONTENT LINTER
 * 
 * Scans content blocks for compliance issues:
 * - GUARANTEE_LANGUAGE
 * - MISSING_DISCLAIMER
 * - RATE (hard-coded dollar amounts or percentages)
 * - TAX_INFO (tax guidance without disclaimer)
 * - BENEFITS_INFO (benefits info without disclaimer)
 * - SPECIFIC_AMOUNT / SPECIFIC_YEAR
 */

import { supabaseAdmin } from '@/lib/supabase/admin';

export type FlagType = 
  | 'GUARANTEE_LANGUAGE'
  | 'MISSING_DISCLAIMER'
  | 'RATE'
  | 'TAX_INFO'
  | 'BENEFITS_INFO'
  | 'SPECIFIC_AMOUNT'
  | 'SPECIFIC_YEAR';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface LintFlag {
  blockId: string;
  severity: Severity;
  flagType: FlagType;
  sample: string;
  recommendation: string;
  line?: number;
}

export interface LintResult {
  blockId: string;
  title: string;
  flags: LintFlag[];
  totalFlags: number;
  criticalFlags: number;
}

// Prohibited guarantee language patterns
const GUARANTEE_PATTERNS = [
  /\b(guaranteed?|guarantee)\b/gi,
  /\b(promise[sd]?|promising)\b/gi,
  /\b(risk-free|riskfree)\b/gi,
  /\b(surefire|sure-fire)\b/gi,
  /\b(will (always|definitely|certainly))\b/gi,
  /\b(never (fail|lose|risk))\b/gi,
  /\b(can't (lose|fail))\b/gi,
  /\b(no (downside|risk))\b/gi
];

// Money/percentage patterns (should use <DataRef>)
const RATE_PATTERNS = [
  /\$[\d,]+(\.\d{2})?/g,  // $1,500 or $1,500.00
  /\d+(\.\d+)?%/g,        // 6% or 6.5%
];

// Year patterns (should use dynamic refs or AsOf)
const YEAR_PATTERNS = [
  /\b(20(2[3-9]|3[0-9]))\b/g,  // 2023-2039
];

// Disclaimer keywords
const TAX_KEYWORDS = ['tax', 'deduction', 'irs', 'filing', 'taxable'];
const BENEFITS_KEYWORDS = ['tricare', 'va ', 'gi bill', 'benefits', 'entitlement'];
const FINANCIAL_KEYWORDS = ['invest', 'savings', 'tsp', 'retirement', 'fund'];

/**
 * Lint a single content block
 */
export async function lintContentBlock(blockId: string): Promise<LintResult> {
  // Fetch block from DB
  const { data: block } = await supabaseAdmin
    .from('content_blocks')
    .select('*')
    .eq('id', blockId)
    .single();

  if (!block) {
    throw new Error(`Block ${blockId} not found`);
  }

  const flags: LintFlag[] = [];
  const content = block.html || '';
  const lines = content.split('\n');

  // Check for guarantee language
  for (const pattern of GUARANTEE_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const lineNum = findLineNumber(content, match.index || 0);
      flags.push({
        blockId,
        severity: 'critical',
        flagType: 'GUARANTEE_LANGUAGE',
        sample: extractSample(lines, lineNum),
        recommendation: 'Replace with softer language: "typically", "generally", "may", "can"',
        line: lineNum
      });
    }
  }

  // Check for missing disclaimer
  const hasDisclaimer = /<Disclaimer|class="disclaimer"/i.test(content);
  const needsDisclaimer = detectDisclaimerNeeded(content);

  if (needsDisclaimer && !hasDisclaimer) {
    flags.push({
      blockId,
      severity: 'critical',
      flagType: 'MISSING_DISCLAIMER',
      sample: `${block.title} (domain: ${block.domain || 'unknown'})`,
      recommendation: `Add <Disclaimer kind="${needsDisclaimer}" /> before first H2`
    });
  }

  // Check for hard-coded rates
  for (const pattern of RATE_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      // Skip if already wrapped in DataRef or RateBadge
      if (isInsideComponent(content, match.index || 0)) {
        continue;
      }

      const lineNum = findLineNumber(content, match.index || 0);
      flags.push({
        blockId,
        severity: 'high',
        flagType: 'RATE',
        sample: extractSample(lines, lineNum),
        recommendation: 'Wrap with <DataRef> or <RateBadge> for dynamic data',
        line: lineNum
      });
    }
  }

  // Check for specific years
  for (const pattern of YEAR_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (isInsideComponent(content, match.index || 0)) {
        continue;
      }

      const lineNum = findLineNumber(content, match.index || 0);
      flags.push({
        blockId,
        severity: 'medium',
        flagType: 'SPECIFIC_YEAR',
        sample: extractSample(lines, lineNum),
        recommendation: 'Use current year reference or AsOf component',
        line: lineNum
      });
    }
  }

  // Check for tax info without disclaimer
  if (TAX_KEYWORDS.some(kw => content.toLowerCase().includes(kw)) && !hasDisclaimer) {
    flags.push({
      blockId,
      severity: 'high',
      flagType: 'TAX_INFO',
      sample: block.title,
      recommendation: 'Add <Disclaimer kind="tax" />'
    });
  }

  // Check for benefits info without disclaimer
  if (BENEFITS_KEYWORDS.some(kw => content.toLowerCase().includes(kw)) && !hasDisclaimer) {
    flags.push({
      blockId,
      severity: 'high',
      flagType: 'BENEFITS_INFO',
      sample: block.title,
      recommendation: 'Add <Disclaimer kind="benefits" />'
    });
  }

  return {
    blockId,
    title: block.title,
    flags,
    totalFlags: flags.length,
    criticalFlags: flags.filter(f => f.severity === 'critical').length
  };
}

/**
 * Lint all content blocks
 */
export async function lintAllContentBlocks(): Promise<LintResult[]> {
  const { data: blocks } = await supabaseAdmin
    .from('content_blocks')
    .select('id')
    .eq('status', 'published');

  if (!blocks) {
    return [];
  }

  const results: LintResult[] = [];

  for (const block of blocks) {
    const result = await lintContentBlock(block.id);
    results.push(result);
  }

  return results;
}

/**
 * Detect what kind of disclaimer is needed
 */
function detectDisclaimerNeeded(content: string): string | null {
  const lower = content.toLowerCase();

  if (TAX_KEYWORDS.some(kw => lower.includes(kw))) {
    return 'tax';
  }

  if (BENEFITS_KEYWORDS.some(kw => lower.includes(kw))) {
    return 'benefits';
  }

  if (FINANCIAL_KEYWORDS.some(kw => lower.includes(kw))) {
    return 'finance';
  }

  return null;
}

/**
 * Check if position is inside a component tag
 */
function isInsideComponent(content: string, position: number): boolean {
  const before = content.substring(0, position);
  const openTags = ['<DataRef', '<RateBadge', '<AsOf'];

  for (const tag of openTags) {
    const lastOpen = before.lastIndexOf(tag);
    if (lastOpen !== -1) {
      const afterOpen = content.substring(lastOpen);
      const closeTag = afterOpen.indexOf('/>');
      if (closeTag !== -1 && closeTag > (position - lastOpen)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Find line number from character position
 */
function findLineNumber(content: string, position: number): number {
  const upToPosition = content.substring(0, position);
  return upToPosition.split('\n').length;
}

/**
 * Extract sample text around a line
 */
function extractSample(lines: string[], lineNum: number, context = 2): string {
  const start = Math.max(0, lineNum - context - 1);
  const end = Math.min(lines.length, lineNum + context);
  return lines.slice(start, end).join('\n').trim();
}

/**
 * CLI runner
 */
if (require.main === module) {
  (async () => {

    const results = await lintAllContentBlocks();

    const _totalBlocks = results.length;
    const totalFlags = results.reduce((sum, r) => sum + r.totalFlags, 0);
    const _criticalFlags = results.reduce((sum, r) => sum + r.criticalFlags, 0);


    // Show blocks with issues
    const blocksWithIssues = results.filter(r => r.totalFlags > 0);

    if (blocksWithIssues.length === 0) {
      return;
    }


    for (const result of blocksWithIssues) {

      const grouped = result.flags.reduce((acc, flag) => {
        acc[flag.flagType] = (acc[flag.flagType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      for (const [_type, _count] of Object.entries(grouped)) {
      }

    }

    process.exit(totalFlags > 0 ? 1 : 0);
  })();
}

