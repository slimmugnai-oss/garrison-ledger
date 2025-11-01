/**
 * CRON JOB SCHEDULER FOR SCRAPERS
 * 
 * Manages automated scraper execution:
 * - DFAS: Daily at 6 AM EST (check for announcements)
 * - JTR: Weekly on Monday at 8 AM EST (check for regulation updates)
 * - VA: Daily at 7 AM EST (check for benefit updates)
 * 
 * Uses Vercel Cron or standalone Node.js scheduler
 */

import { runDFASScraper } from './dfas-announcements-scraper';
import { runJTRTracker } from './jtr-change-tracker';
import { runVAMonitor } from './va-benefits-monitor';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Log scraper execution to database
 */
async function logScraperRun(
  scraperName: string,
  status: 'success' | 'failure',
  details?: { itemsFound?: number; error?: string }
) {
  try {
    await supabase.from('scraper_logs').insert({
      scraper_name: scraperName,
      status,
      items_found: details?.itemsFound || 0,
      error_message: details?.error,
      executed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron Scheduler] Error logging scraper run:', error);
  }
}

/**
 * Run DFAS scraper (Daily)
 */
export async function executeDFASCron() {
  console.log('[Cron Scheduler] ===== EXECUTING DFAS CRON =====');
  
  try {
    await runDFASScraper();
    await logScraperRun('dfas', 'success');
    
    return { success: true, scraper: 'dfas' };
  } catch (error) {
    console.error('[Cron Scheduler] DFAS cron failed:', error);
    await logScraperRun('dfas', 'failure', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return { success: false, scraper: 'dfas', error };
  }
}

/**
 * Run JTR tracker (Weekly)
 */
export async function executeJTRCron() {
  console.log('[Cron Scheduler] ===== EXECUTING JTR CRON =====');
  
  try {
    await runJTRTracker();
    await logScraperRun('jtr', 'success');
    
    return { success: true, scraper: 'jtr' };
  } catch (error) {
    console.error('[Cron Scheduler] JTR cron failed:', error);
    await logScraperRun('jtr', 'failure', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return { success: false, scraper: 'jtr', error };
  }
}

/**
 * Run VA monitor (Daily)
 */
export async function executeVACron() {
  console.log('[Cron Scheduler] ===== EXECUTING VA CRON =====');
  
  try {
    await runVAMonitor();
    await logScraperRun('va', 'success');
    
    return { success: true, scraper: 'va' };
  } catch (error) {
    console.error('[Cron Scheduler] VA cron failed:', error);
    await logScraperRun('va', 'failure', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return { success: false, scraper: 'va', error };
  }
}

/**
 * Run all scrapers (for testing or manual execution)
 */
export async function executeAllScrapers() {
  console.log('[Cron Scheduler] ===== EXECUTING ALL SCRAPERS =====');
  
  const results = await Promise.allSettled([
    executeDFASCron(),
    executeJTRCron(),
    executeVACron(),
  ]);

  const summary = {
    total: results.length,
    successful: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
    details: results,
  };

  console.log('[Cron Scheduler] ===== EXECUTION COMPLETE =====');
  console.log(JSON.stringify(summary, null, 2));

  return summary;
}

/**
 * Get scraper execution history
 */
export async function getScraperHistory(scraperName?: string, limit = 50) {
  let query = supabase
    .from('scraper_logs')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(limit);

  if (scraperName) {
    query = query.eq('scraper_name', scraperName);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Cron Scheduler] Error fetching history:', error);
    return [];
  }

  return data || [];
}

/**
 * Get scraper statistics
 */
export async function getScraperStats() {
  try {
    const { data, error } = await supabase
      .from('scraper_logs')
      .select('scraper_name, status')
      .gte('executed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    if (error) {
      console.error('[Cron Scheduler] Error fetching stats:', error);
      return null;
    }

    const stats = {
      dfas: { success: 0, failure: 0, total: 0 },
      jtr: { success: 0, failure: 0, total: 0 },
      va: { success: 0, failure: 0, total: 0 },
    };

    data?.forEach((log) => {
      const scraper = log.scraper_name as 'dfas' | 'jtr' | 'va';
      if (stats[scraper]) {
        stats[scraper].total++;
        if (log.status === 'success') {
          stats[scraper].success++;
        } else {
          stats[scraper].failure++;
        }
      }
    });

    // Calculate success rates
    return {
      dfas: {
        ...stats.dfas,
        successRate: stats.dfas.total > 0 
          ? ((stats.dfas.success / stats.dfas.total) * 100).toFixed(1)
          : '0',
      },
      jtr: {
        ...stats.jtr,
        successRate: stats.jtr.total > 0 
          ? ((stats.jtr.success / stats.jtr.total) * 100).toFixed(1)
          : '0',
      },
      va: {
        ...stats.va,
        successRate: stats.va.total > 0 
          ? ((stats.va.success / stats.va.total) * 100).toFixed(1)
          : '0',
      },
    };
  } catch (error) {
    console.error('[Cron Scheduler] Error calculating stats:', error);
    return null;
  }
}

