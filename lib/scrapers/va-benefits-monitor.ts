/**
 * VA BENEFITS MONITOR
 * 
 * Monitors VA.gov for benefit updates:
 * - Disability compensation rate changes
 * - New benefits announced
 * - Policy updates affecting veterans
 * - Claims processing improvements
 * - Regional office announcements
 * 
 * Sources:
 * - VA.gov press releases
 * - VA News RSS feeds
 * - Benefits.va.gov updates
 * 
 * Updates: Daily cron job
 * Storage: dynamic_feeds table (type: 'va_update')
 */

import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface VAUpdate {
  title: string;
  url: string;
  date: string;
  category: string;
  summary: string;
  source: 'press_release' | 'rss' | 'benefits_page';
}

/**
 * Scrape VA.gov press releases
 */
export async function scrapeVAPressReleases(): Promise<VAUpdate[]> {
  try {
    console.log('[VA Monitor] Scraping VA press releases...');

    const pressReleasesUrl = 'https://news.va.gov/news/';
    
    const response = await fetch(pressReleasesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GarrisonLedger/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`VA press releases fetch failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const updates: VAUpdate[] = [];

    // Parse press release items
    $('.news-item, article, .post').each((_, element) => {
      const $el = $(element);
      
      const title = $el.find('h2, h3, .title').first().text().trim();
      const relativeUrl = $el.find('a').first().attr('href');
      const dateText = $el.find('.date, time, .published').first().text().trim();
      const summaryText = $el.find('p, .excerpt, .summary').first().text().trim();

      if (title && relativeUrl) {
        const fullUrl = relativeUrl.startsWith('http') 
          ? relativeUrl 
          : `https://news.va.gov${relativeUrl}`;

        const category = categorizeVAUpdate(title, summaryText);

        updates.push({
          title,
          url: fullUrl,
          date: parseVADate(dateText) || new Date().toISOString(),
          category,
          summary: summaryText || '',
          source: 'press_release',
        });
      }
    });

    console.log(`[VA Monitor] Found ${updates.length} press releases`);
    return updates;
  } catch (error) {
    console.error('[VA Monitor] Press release scrape error:', error);
    return [];
  }
}

/**
 * Parse VA RSS feed
 */
export async function parseVARSSFeed(): Promise<VAUpdate[]> {
  try {
    console.log('[VA Monitor] Parsing VA RSS feed...');

    // VA News RSS feed
    const rssUrl = 'https://www.va.gov/rss/rss.xml';
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GarrisonLedger/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`VA RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    
    const updates: VAUpdate[] = [];

    // Parse RSS items
    $('item').each((_, element) => {
      const $el = $(element);
      
      const title = $el.find('title').text().trim();
      const url = $el.find('link').text().trim();
      const dateText = $el.find('pubDate').text().trim();
      const summary = $el.find('description').text().trim();

      if (title && url) {
        const category = categorizeVAUpdate(title, summary);

        updates.push({
          title,
          url,
          date: parseVADate(dateText) || new Date().toISOString(),
          category,
          summary,
          source: 'rss',
        });
      }
    });

    console.log(`[VA Monitor] Found ${updates.length} RSS items`);
    return updates;
  } catch (error) {
    console.error('[VA Monitor] RSS parse error:', error);
    return [];
  }
}

/**
 * Check VA Benefits page for updates
 */
export async function checkVABenefitsPage(): Promise<VAUpdate[]> {
  try {
    console.log('[VA Monitor] Checking VA Benefits page...');

    const benefitsUrl = 'https://www.va.gov/disability/compensation-rates/veteran-rates/';
    
    const response = await fetch(benefitsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GarrisonLedger/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`VA Benefits page fetch failed: ${response.status}`);
    }

    const html = await response.text();
    
    // Check for "last updated" date and compare with database
    const lastUpdatedMatch = html.match(/Last updated:\s*([^<]+)/i) ||
                            html.match(/Updated:\s*([^<]+)/i);

    if (lastUpdatedMatch) {
      const lastUpdatedDate = lastUpdatedMatch[1].trim();
      
      // Check if this update is new
      const { data: existingUpdate } = await supabase
        .from('dynamic_feeds')
        .select('id')
        .eq('source', 'va')
        .eq('category', 'DISABILITY_RATES')
        .eq('metadata->>last_updated', lastUpdatedDate)
        .single();

      if (!existingUpdate) {
        return [{
          title: 'VA Disability Compensation Rates Updated',
          url: benefitsUrl,
          date: new Date().toISOString(),
          category: 'DISABILITY_RATES',
          summary: `VA disability compensation rates page was updated on ${lastUpdatedDate}. Check for new rates.`,
          source: 'benefits_page',
        }];
      }
    }

    return [];
  } catch (error) {
    console.error('[VA Monitor] Benefits page check error:', error);
    return [];
  }
}

/**
 * Categorize VA update by keywords
 */
function categorizeVAUpdate(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();

  if (text.includes('disability') && (text.includes('rate') || text.includes('compensation'))) {
    return 'DISABILITY_RATES';
  }
  if (text.includes('claim') || text.includes('claims')) return 'CLAIMS_PROCESSING';
  if (text.includes('healthcare') || text.includes('medical')) return 'HEALTHCARE';
  if (text.includes('education') || text.includes('gi bill')) return 'EDUCATION';
  if (text.includes('pension') || text.includes('retirement')) return 'PENSION';
  if (text.includes('housing') || text.includes('home loan')) return 'HOUSING';
  if (text.includes('employment') || text.includes('vocational')) return 'EMPLOYMENT';
  
  return 'GENERAL';
}

/**
 * Parse various VA date formats
 */
function parseVADate(dateText: string): string | null {
  if (!dateText) return null;

  try {
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
 * Save VA updates to database
 */
export async function saveVAUpdates(updates: VAUpdate[]): Promise<void> {
  try {
    console.log(`[VA Monitor] Saving ${updates.length} updates to database...`);

    for (const update of updates) {
      // Check if already exists (by URL)
      const { data: existing } = await supabase
        .from('dynamic_feeds')
        .select('id')
        .eq('url', update.url)
        .eq('source', 'va')
        .single();

      if (existing) {
        console.log(`[VA Monitor] Skipping duplicate: ${update.title}`);
        continue;
      }

      // Insert new update
      const { error } = await supabase
        .from('dynamic_feeds')
        .insert({
          source: 'va',
          url: update.url,
          title: update.title,
          description: update.summary,
          published_at: update.date,
          category: update.category,
          active: true,
          metadata: {
            scrape_date: new Date().toISOString(),
            category: update.category,
            source_type: update.source,
          },
        });

      if (error) {
        console.error(`[VA Monitor] Error saving update:`, error);
      } else {
        console.log(`[VA Monitor] ✅ Saved: ${update.title}`);
      }
    }

    console.log('[VA Monitor] ✅ Save complete');
  } catch (error) {
    console.error('[VA Monitor] Save error:', error);
    throw error;
  }
}

/**
 * Main execution function (called by cron job)
 */
export async function runVAMonitor(): Promise<void> {
  console.log('[VA Monitor] ========== STARTING VA MONITOR ==========');
  
  try {
    // Gather updates from all sources
    const [pressReleases, rssUpdates, benefitsUpdates] = await Promise.all([
      scrapeVAPressReleases(),
      parseVARSSFeed(),
      checkVABenefitsPage(),
    ]);

    const allUpdates = [...pressReleases, ...rssUpdates, ...benefitsUpdates];

    if (allUpdates.length > 0) {
      await saveVAUpdates(allUpdates);
    } else {
      console.log('[VA Monitor] ℹ️ No new updates found');
    }

    console.log('[VA Monitor] ========== MONITOR COMPLETE ==========');
  } catch (error) {
    console.error('[VA Monitor] ❌ MONITOR FAILED:', error);
    throw error;
  }
}

/**
 * Get latest VA updates from database
 */
export async function getLatestVAUpdates(limit = 10, category?: string) {
  let query = supabase
    .from('dynamic_feeds')
    .select('*')
    .eq('source', 'va')
    .eq('active', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[VA Monitor] Error fetching updates:', error);
    return [];
  }

  return data || [];
}
