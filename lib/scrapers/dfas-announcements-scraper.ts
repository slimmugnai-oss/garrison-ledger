/**
 * DFAS ANNOUNCEMENTS SCRAPER (REAL DATA CONNECTION)
 * 
 * Scrapes DFAS.mil for official announcements:
 * - Pay table updates
 * - BAH rate changes
 * - BAS rate updates
 * - Retirement pay announcements
 * - Important policy changes
 * 
 * Updates: Daily cron job
 * Storage: dynamic_feeds table (type: 'dfas_announcement')
 */

import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DFASAnnouncement {
  title: string;
  url: string;
  date: string;
  category: string;
  summary: string;
}

/**
 * Main scraper function - fetches DFAS announcements
 */
export async function scrapeDFASAnnouncements(): Promise<DFASAnnouncement[]> {
  try {
    console.log('[DFAS Scraper] Starting scrape of DFAS.mil...');

    // DFAS News & Updates page
    const dfasNewsUrl = 'https://www.dfas.mil/news';
    
    const response = await fetch(dfasNewsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GarrisonLedger/1.0; +https://garrisonledger.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`DFAS fetch failed: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const announcements: DFASAnnouncement[] = [];

    // Parse news articles
    $('.news-item, .article-item, .post-item').each((_, element) => {
      const $el = $(element);
      
      const title = $el.find('h2, h3, .title, .headline').first().text().trim();
      const relativeUrl = $el.find('a').first().attr('href');
      const dateText = $el.find('.date, .publish-date, time').first().text().trim();
      const summaryText = $el.find('p, .summary, .excerpt').first().text().trim();

      if (title && relativeUrl) {
        const fullUrl = relativeUrl.startsWith('http') 
          ? relativeUrl 
          : `https://www.dfas.mil${relativeUrl}`;

        const category = categorizeDFASAnnouncement(title, summaryText);

        announcements.push({
          title,
          url: fullUrl,
          date: parseDate(dateText) || new Date().toISOString(),
          category,
          summary: summaryText || '',
        });
      }
    });

    console.log(`[DFAS Scraper] Found ${announcements.length} announcements`);
    return announcements;
  } catch (error) {
    console.error('[DFAS Scraper] Error:', error);
    throw error;
  }
}

/**
 * Categorize announcement by keywords
 */
function categorizeDFASAnnouncement(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();

  if (text.includes('pay table') || text.includes('military pay')) return 'PAY_UPDATE';
  if (text.includes('bah') || text.includes('housing allowance')) return 'BAH_UPDATE';
  if (text.includes('bas') || text.includes('subsistence')) return 'BAS_UPDATE';
  if (text.includes('retirement') || text.includes('retiree')) return 'RETIREMENT';
  if (text.includes('tax') || text.includes('w-2') || text.includes('1099')) return 'TAX';
  if (text.includes('policy') || text.includes('regulation')) return 'POLICY';
  
  return 'GENERAL';
}

/**
 * Parse various date formats from DFAS
 */
function parseDate(dateText: string): string | null {
  if (!dateText) return null;

  try {
    // Common formats: "January 15, 2025", "01/15/2025", "2025-01-15"
    const date = new Date(dateText);
    
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // Parsing failed
  }

  return null;
}

/**
 * Save announcements to database (dynamic_feeds table)
 */
export async function saveDFASAnnouncements(announcements: DFASAnnouncement[]): Promise<void> {
  try {
    console.log(`[DFAS Scraper] Saving ${announcements.length} announcements to database...`);

    for (const announcement of announcements) {
      // Check if already exists (by URL)
      const { data: existing } = await supabase
        .from('dynamic_feeds')
        .select('id')
        .eq('url', announcement.url)
        .eq('source', 'dfas')
        .single();

      if (existing) {
        console.log(`[DFAS Scraper] Skipping duplicate: ${announcement.title}`);
        continue;
      }

      // Insert new announcement
      const { error } = await supabase
        .from('dynamic_feeds')
        .insert({
          source: 'dfas',
          url: announcement.url,
          title: announcement.title,
          description: announcement.summary,
          published_at: announcement.date,
          category: announcement.category,
          active: true,
          metadata: {
            scrape_date: new Date().toISOString(),
            category: announcement.category,
          },
        });

      if (error) {
        console.error(`[DFAS Scraper] Error saving announcement:`, error);
      } else {
        console.log(`[DFAS Scraper] ✅ Saved: ${announcement.title}`);
      }
    }

    console.log('[DFAS Scraper] ✅ Save complete');
  } catch (error) {
    console.error('[DFAS Scraper] Save error:', error);
    throw error;
  }
}

/**
 * Main execution function (called by cron job)
 */
export async function runDFASScraper(): Promise<void> {
  console.log('[DFAS Scraper] ========== STARTING DFAS SCRAPER ==========');
  
  try {
    const announcements = await scrapeDFASAnnouncements();
    
    if (announcements.length > 0) {
      await saveDFASAnnouncements(announcements);
    } else {
      console.log('[DFAS Scraper] ⚠️ No announcements found (may need selector update)');
    }

    console.log('[DFAS Scraper] ========== SCRAPER COMPLETE ==========');
  } catch (error) {
    console.error('[DFAS Scraper] ❌ SCRAPER FAILED:', error);
    throw error;
  }
}

/**
 * Get latest DFAS announcements from database
 */
export async function getLatestDFASAnnouncements(limit = 10) {
  const { data, error } = await supabase
    .from('dynamic_feeds')
    .select('*')
    .eq('source', 'dfas')
    .eq('active', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[DFAS Scraper] Error fetching announcements:', error);
    return [];
  }

  return data || [];
}
