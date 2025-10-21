/**
 * CONTENT AUTO-FIX
 * 
 * Applies safe automatic fixes to content:
 * 1. Inject missing disclaimers
 * 2. Soften guarantee language
 * 3. Wrap obvious rates with comments (manual DataRef needed)
 */

import { supabaseAdmin } from '@/lib/supabase';
import { lintContentBlock as _lintContentBlock } from './lint';

export interface AutoFixResult {
  blockId: string;
  title: string;
  fixesApplied: number;
  changes: string[];
}

/**
 * Apply safe auto-fixes to a content block
 */
export async function autofixContentBlock(blockId: string): Promise<AutoFixResult> {
  // Get block
  const { data: block } = await supabaseAdmin
    .from('content_blocks')
    .select('*')
    .eq('id', blockId)
    .single();

  if (!block) {
    throw new Error(`Block ${blockId} not found`);
  }

  let content = block.html || '';
  const changes: string[] = [];

  // 1. Soften guarantee language
  const guaranteeReplacements: Record<string, string> = {
    'guaranteed': 'typically',
    'guarantee': 'generally provides',
    'guarantees': 'typically provides',
    'promised': 'designed to provide',
    'promises': 'aims to provide',
    'risk-free': 'low-risk',
    'riskfree': 'low-risk',
    'surefire': 'proven',
    'sure-fire': 'proven',
    'will always': 'generally will',
    'will definitely': 'typically will',
    'will certainly': 'often will',
    'never fail': 'rarely fail',
    'never lose': 'historically has not lost',
    "can't lose": 'has low risk',
    "can't fail": 'is designed to succeed',
    'no downside': 'minimal downside',
    'no risk': 'low risk'
  };

  for (const [bad, good] of Object.entries(guaranteeReplacements)) {
    const regex = new RegExp(`\\b${bad}\\b`, 'gi');
    if (regex.test(content)) {
      content = content.replace(regex, good);
      changes.push(`Softened "${bad}" → "${good}"`);
    }
  }

  // 2. Inject missing disclaimer
  const needsDisclaimer = detectDisclaimerType(content);
  const hasDisclaimer = /<Disclaimer|class="disclaimer"/i.test(content);

  if (needsDisclaimer && !hasDisclaimer) {
    // Find first H2 and insert disclaimer before it
    const h2Match = content.match(/<h2|## /i);
    if (h2Match && h2Match.index) {
      const disclaimer = `\n<Disclaimer kind="${needsDisclaimer}" />\n\n`;
      content = content.substring(0, h2Match.index) + disclaimer + content.substring(h2Match.index);
      changes.push(`Added <Disclaimer kind="${needsDisclaimer}" />`);
    }
  }

  // 3. Add data-ref comments for hard-coded rates
  const ratePattern = /(\$[\d,]+(?:\.\d{2})?|\d+(?:\.\d+)?%)/g;
  let match;
  const rateMatches: Array<{ value: string; index: number }> = [];

  while ((match = ratePattern.exec(content)) !== null) {
    // Skip if already in a DataRef or comment
    if (isInsideComponent(content, match.index) || isInsideComment(content, match.index)) {
      continue;
    }

    rateMatches.push({ value: match[1], index: match.index });
  }

  // Process in reverse order to preserve indices
  for (const rate of rateMatches.reverse()) {
    const comment = `<!-- TODO: Replace with <DataRef source="?" field="?" /> - ${rate.value} -->`;
    const insertion = rate.index + rate.value.length;
    content = content.substring(0, insertion) + comment + content.substring(insertion);
    changes.push(`Added TODO comment for rate: ${rate.value}`);
  }

  // 4. Update block in database
  if (changes.length > 0) {
    await supabaseAdmin
      .from('content_blocks')
      .update({
        html: content,
        last_autofixed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', blockId);
  }

  return {
    blockId,
    title: block.title,
    fixesApplied: changes.length,
    changes
  };
}

/**
 * Auto-fix all content blocks
 */
export async function autofixAllContentBlocks(): Promise<AutoFixResult[]> {
  const { data: blocks } = await supabaseAdmin
    .from('content_blocks')
    .select('id')
    .eq('status', 'published');

  if (!blocks) {
    return [];
  }

  const results: AutoFixResult[] = [];

  for (const block of blocks) {
    const result = await autofixContentBlock(block.id);
    if (result.fixesApplied > 0) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Detect what disclaimer type is needed
 */
function detectDisclaimerType(content: string): string | null {
  const lower = content.toLowerCase();

  const keywords = {
    tax: ['tax', 'deduction', 'irs', 'filing', 'taxable'],
    benefits: ['tricare', 'va ', 'gi bill', 'benefits', 'entitlement'],
    finance: ['invest', 'savings', 'tsp', 'retirement', 'fund'],
    legal: ['contract', 'legal', 'attorney', 'liability', 'regulation']
  };

  for (const [type, kws] of Object.entries(keywords)) {
    if (kws.some(kw => lower.includes(kw))) {
      return type;
    }
  }

  return null;
}

/**
 * Check if inside component
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
 * Check if inside HTML comment
 */
function isInsideComment(content: string, position: number): boolean {
  const before = content.substring(0, position);
  const lastCommentOpen = before.lastIndexOf('<!--');
  const lastCommentClose = before.lastIndexOf('-->');

  return lastCommentOpen > lastCommentClose;
}

/**
 * CLI runner
 */
if (require.main === module) {
  (async () => {

    const results = await autofixAllContentBlocks();

    const _totalBlocks = results.length;
    const _totalFixes = results.reduce((sum, r) => sum + r.fixesApplied, 0);


    if (_totalBlocks === 0) {
      return;
    }


    for (const result of results) {
      for (const _change of result.changes) {
      }
    }

  })();
}

