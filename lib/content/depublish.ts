/**
 * CONTENT DEPUBLISHER
 * 
 * Depublishes (sets to draft) content blocks with unresolved critical flags
 */

import { supabaseAdmin } from '@/lib/supabase';

export interface DepublishResult {
  blockId: string;
  title: string;
  criticalFlags: number;
  previousStatus: string;
}

/**
 * Depublish blocks with unresolved critical flags
 */
export async function depublishCriticalBlocks(): Promise<DepublishResult[]> {
  // Get all published blocks with critical flags
  const { data: flaggedBlocks } = await supabaseAdmin
    .from('content_flags')
    .select('block_id, content_blocks!inner(id, title, status)')
    .eq('severity', 'critical')
    .is('resolved_at', null);

  if (!flaggedBlocks || flaggedBlocks.length === 0) {
    return [];
  }

  // Group by block
  const blockFlagCounts = new Map<string, { title: string; count: number; status: string }>();

  for (const flag of flaggedBlocks) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const block = (flag as any).content_blocks;
    if (block.status !== 'published') {
      continue; // Already not published
    }

    const existing = blockFlagCounts.get(block.id);
    if (existing) {
      existing.count++;
    } else {
      blockFlagCounts.set(block.id, {
        title: block.title,
        count: 1,
        status: block.status
      });
    }
  }

  const results: DepublishResult[] = [];

  // Depublish each block
  for (const [blockId, info] of blockFlagCounts.entries()) {
    const { error } = await supabaseAdmin
      .from('content_blocks')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', blockId);

    if (!error) {
      results.push({
        blockId,
        title: info.title,
        criticalFlags: info.count,
        previousStatus: info.status
      });
    }
  }

  return results;
}

/**
 * CLI runner
 */
if (require.main === module) {
  (async () => {

    const results = await depublishCriticalBlocks();

    if (results.length === 0) {
      return;
    }


    for (const result of results) {
    }

  })();
}

