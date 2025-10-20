/**
 * CONTENT AUDIT IMPORTER
 * 
 * Imports audit JSON and syncs flags to database
 */

import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';

export interface AuditItem {
  title: string;
  slug?: string;
  flags: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    sample: string;
    recommendation: string;
  }>;
  priorityScore?: number;
}

export interface AuditDoc {
  generatedAt: string;
  totalItems: number;
  items: AuditItem[];
}

/**
 * Load audit JSON from file
 */
export function loadAudit(filePath: string): AuditDoc {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Audit file not found: ${fullPath}`);
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const audit = JSON.parse(content) as AuditDoc;

  return audit;
}

/**
 * Import audit flags to database
 */
export async function importAuditToDatabase(auditPath: string): Promise<{
  imported: number;
  skipped: number;
  errors: number;
}> {
  const audit = loadAudit(auditPath);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of audit.items) {
    try {
      // Find matching content block by title (fuzzy match)
      const { data: block } = await supabaseAdmin
        .from('content_blocks')
        .select('id')
        .ilike('title', `%${item.title}%`)
        .maybeSingle();

      if (!block) {
        skipped++;
        continue;
      }

      // Insert flags
      for (const flag of item.flags) {
        const { error } = await supabaseAdmin
          .from('content_flags')
          .insert({
            block_id: block.id,
            severity: flag.severity,
            flag_type: flag.type,
            sample: flag.sample,
            recommendation: flag.recommendation
          });

        if (error) {
          errors++;
        } else {
          imported++;
        }
      }

    } catch (error) {
      errors++;
    }
  }

  return { imported, skipped, errors };
}

/**
 * Generate audit JSON from existing content blocks
 */
export async function generateAuditFromContentBlocks(): Promise<AuditDoc> {
  const { data: blocks } = await supabaseAdmin
    .from('content_blocks')
    .select('id, title, slug, html')
    .eq('status', 'published');

  if (!blocks) {
    return {
      generatedAt: new Date().toISOString(),
      totalItems: 0,
      items: []
    };
  }

  const items: AuditItem[] = [];

  for (const block of blocks) {
    const content = block.html || '';
    const flags: AuditItem['flags'] = [];

    // Quick scan for issues
    if (/\b(guaranteed?|promise[sd]?|risk-free)\b/i.test(content)) {
      flags.push({
        type: 'GUARANTEE_LANGUAGE',
        severity: 'critical',
        sample: 'Contains guarantee language',
        recommendation: 'Soften language to "typically", "generally", "may"'
      });
    }

    if (/\$[\d,]+|\d+%/.test(content) && !/<DataRef/.test(content)) {
      flags.push({
        type: 'RATE',
        severity: 'high',
        sample: 'Contains hard-coded rates',
        recommendation: 'Wrap with <DataRef> component'
      });
    }

    if (flags.length > 0) {
      items.push({
        title: block.title,
        slug: block.slug,
        flags,
        priorityScore: flags.filter(f => f.severity === 'critical').length * 10 +
                       flags.filter(f => f.severity === 'high').length * 5
      });
    }
  }

  // Sort by priority score descending
  items.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

  return {
    generatedAt: new Date().toISOString(),
    totalItems: items.length,
    items
  };
}

/**
 * CLI runner
 */
if (require.main === module) {
  const command = process.argv[2];
  const auditPath = process.argv[3] || 'ops/content-audits/content-audit-2025-10-19.json';

  (async () => {
    if (command === 'import') {
      
      const result = await importAuditToDatabase(auditPath);
      
      
      if (result.imported > 0) {
      }

    } else if (command === 'generate') {
      
      const audit = await generateAuditFromContentBlocks();
      
      // Write to file
      const outputDir = 'ops/content-audits';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPath = path.join(outputDir, `audit-${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(audit, null, 2));
      

    } else {
    }
  })();
}

