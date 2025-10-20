/**
 * CONTENT PREVIEW UTILITIES
 * 
 * Clean extraction of titles and BLUF from Markdown content blocks
 * Strips all Markdown formatting for crisp, professional card displays
 */

import removeMd from 'remove-markdown';

export type Preview = {
  title: string;
  bluf: string; // plain text, no markdown
};

const MAX_LEN = 200;

/**
 * Truncate string at word boundary without cutting words
 */
function truncateWords(s: string, max = MAX_LEN): string {
  if (!s) return '';
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const last = cut.lastIndexOf(' ');
  return (last > 120 ? cut.slice(0, last) : cut) + '…';
}

/**
 * Extract clean title and BLUF from Markdown content
 * 
 * Strategy:
 * 1. Title: First H1/H2 heading if present
 * 2. BLUF: Line containing "**BLUF:**" or first paragraph after title
 * 3. Strip all Markdown formatting
 * 4. Truncate at word boundaries
 */
export function extractTitleAndBluf(markdown: string): Preview {
  if (!markdown) return { title: '', bluf: '' };

  const lines = markdown.split(/\r?\n/).map(l => l.trim());
  let title = '';
  let bluf = '';

  // 1) Extract title from first H1/H2 line
  const hIdx = lines.findIndex(l => /^#{1,2}\s+/.test(l));
  if (hIdx >= 0) {
    title = lines[hIdx].replace(/^#{1,2}\s+/, '').trim();
  }

  // 2) Extract BLUF line if present
  const blufIdx = lines.findIndex(l => /\*\*BLUF:\*\*/i.test(l));
  if (blufIdx >= 0) {
    bluf = lines[blufIdx]
      .replace(/\*\*BLUF:\*\*/i, '')
      .trim();
  }

  // 3) Otherwise use first non-heading paragraph after title
  if (!bluf) {
    const start = hIdx >= 0 ? hIdx + 1 : 0;
    const para = lines.slice(start).find(l =>
      l && !/^#{1,6}\s+/.test(l) && !/^>/.test(l) && !/^[-*+]\s/.test(l)
    );
    if (para) bluf = para;
  }

  // 4) Strip all Markdown formatting and truncate
  const cleanTitle = truncateWords(removeMd(title || ''));
  const cleanBluf = truncateWords(removeMd(bluf || ''));

  return { title: cleanTitle, bluf: cleanBluf };
}

/**
 * Normalize tags by removing leading # and trimming
 */
export function normalizeTags(tags?: string[]): string[] {
  if (!tags) return [];
  return tags.map(t => t.replace(/^#/, '').trim()).filter(Boolean);
}

/**
 * Format verification date for display
 */
export function formatVerificationDate(dateString: string | null): string {
  if (!dateString) return 'Not verified';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

