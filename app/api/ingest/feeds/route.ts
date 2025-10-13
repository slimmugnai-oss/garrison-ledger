/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 60;

type FeedSource = {
  id: string;
  type: 'rss' | 'web_scrape';
  url: string;
  tags: string[];
  selector?: string;
};

/**
 * Sanitize HTML content
 */
function sanitizeHTML(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, iframe, object, embed').remove();
  $('img[width="1"], img[height="1"], .ad, .advertisement').remove();
  $('*').each((_, el) => {
    const element = $(el);
    const allowedAttrs = ['href', 'src', 'alt', 'title', 'class'];
    const attrs = element.attr();
    if (attrs) {
      Object.keys(attrs).forEach(attr => {
        if (!allowedAttrs.includes(attr)) {
          element.removeAttr(attr);
        }
      });
    }
  });
  return $.html();
}

/**
 * Extract keywords from text
 */
function extractKeywords(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase();
  const keywords: string[] = [];
  
  const patterns: Record<string, string[]> = {
    'pcs': ['pcs', 'permanent change', 'relocation', 'moving', 'orders'],
    'tsp': ['tsp', 'thrift savings', 'retirement', 'brs'],
    'deployment': ['deployment', 'deployed', 'combat zone'],
    'bah': ['bah', 'housing allowance', 'bas'],
    'career': ['career', 'employment', 'job', 'mycaa'],
    'va-loan': ['va loan', 'va home'],
    'commissary': ['commissary', 'exchange', 'aafes'],
    'oconus': ['oconus', 'overseas', 'germany', 'japan', 'korea'],
  };
  
  Object.entries(patterns).forEach(([tag, terms]) => {
    if (terms.some(term => text.includes(term))) {
      keywords.push(tag);
    }
  });
  
  return keywords.length > 0 ? keywords : ['general'];
}

/**
 * Process RSS feed
 */
async function processRSSFeed(
  source: FeedSource,
  parser: Parser,
  supabase: ReturnType<typeof createClient>
): Promise<{ processed: number; new: number; errors: string[] }> {
  let processed = 0;
  let newItems = 0;
  const errors: string[] = [];
  
  try {
    console.log(`[RSS] Processing: ${source.id}`);
    const feedData = await parser.parseURL(source.url);
    
    for (const item of feedData.items.slice(0, 10)) {
      if (!item.link) continue;
      
      processed++;
      
      // Check if exists
      const { data: existing } = await supabase
        .from("feed_items")
        .select("id")
        .eq("url", item.link)
        .maybeSingle();
      
      if (existing) continue;
      
      // Prepare content
      const rawHTML = item.content || item.contentSnippet || item.summary || '';
      const sanitized = sanitizeHTML(rawHTML);
      const summary = item.contentSnippet?.slice(0, 500) || item.summary?.slice(0, 500) || '';
      const autoTags = extractKeywords(item.title || '', summary);
      const allTags = [...new Set([...source.tags, ...autoTags])];
      
      // Insert
      const { error: insertError } = await supabase
        .from("feed_items")
        .insert({
          source_id: source.id,
          url: item.link,
          title: item.title || 'Untitled',
          summary,
          raw_html: sanitized,
          tags: allTags,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          status: 'new'
        });
      
      if (!insertError) {
        newItems++;
        console.log(`[RSS] ✓ New: ${item.title}`);
      } else {
        errors.push(`${item.link}: ${insertError.message}`);
      }
    }
  } catch (error) {
    errors.push(`${source.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return { processed, new: newItems, errors };
}

/**
 * Process web scrape source
 */
async function processWebScrape(
  source: FeedSource,
  supabase: ReturnType<typeof createClient>
): Promise<{ processed: number; new: number; errors: string[] }> {
  let processed = 0;
  let newItems = 0;
  const errors: string[] = [];
  
  try {
    console.log(`[Scrape] Processing: ${source.id}`);
    
    // Fetch the index page
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'GarrisonLedger/1.0 (+https://app.familymedia.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Find article links using provided selector or fallback
    const selector = source.selector || 'article a, .post a, .entry a';
    const links = $(selector)
      .map((_, el) => {
        let href = $(el).attr('href');
        if (!href) return null;
        
        // Make absolute URL if relative
        if (href.startsWith('/')) {
          const base = new URL(source.url);
          href = `${base.protocol}//${base.host}${href}`;
        }
        
        // Only process URLs from same domain
        if (!href.startsWith('http')) return null;
        
        return href;
      })
      .get()
      .filter(Boolean)
      .filter((url, index, self) => self.indexOf(url) === index) // Unique
      .slice(0, 10); // Limit to 10 per scrape
    
    console.log(`[Scrape] Found ${links.length} links on ${source.id}`);
    
    for (const link of links) {
      processed++;
      
      // Check if exists
      const { data: existing } = await supabase
        .from("feed_items")
        .select("id")
        .eq("url", link)
        .maybeSingle();
      
      if (existing) {
        console.log(`[Scrape] Skipping duplicate: ${link}`);
        continue;
      }
      
      // Fetch article page
      try {
        const articleResponse = await fetch(link, {
          headers: {
            'User-Agent': 'GarrisonLedger/1.0 (+https://app.familymedia.com)'
          },
          signal: AbortSignal.timeout(10000) // 10s timeout per article
        });
        
        if (!articleResponse.ok) continue;
        
        const articleHTML = await articleResponse.text();
        const article$ = cheerio.load(articleHTML);
        
        // Extract title
        const title = article$('h1').first().text().trim() ||
                     article$('title').first().text().trim() ||
                     article$('meta[property="og:title"]').attr('content') ||
                     'Untitled Article';
        
        // Extract summary
        const summary = article$('meta[name="description"]').attr('content') ||
                       article$('meta[property="og:description"]').attr('content') ||
                       article$('p').first().text().trim().slice(0, 500) ||
                       '';
        
        // Extract main content (try multiple selectors)
        let content = article$('article').first().html() ||
                     article$('.entry-content').first().html() ||
                     article$('.post-content').first().html() ||
                     article$('main').first().html() ||
                     '';
        
        content = sanitizeHTML(content);
        
        // Auto-tag
        const autoTags = extractKeywords(title, summary);
        const allTags = [...new Set([...source.tags, ...autoTags])];
        
        // Insert
        const { error: insertError } = await supabase
          .from("feed_items")
          .insert({
            source_id: source.id,
            url: link,
            title: title.slice(0, 500),
            summary: summary.slice(0, 500),
            raw_html: content,
            tags: allTags,
            published_at: new Date().toISOString(),
            status: 'new'
          });
        
        if (!insertError) {
          newItems++;
          console.log(`[Scrape] ✓ New: ${title}`);
        } else {
          errors.push(`${link}: ${insertError.message}`);
        }
        
        // Rate limit: wait 1s between article fetches
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (articleError) {
        console.error(`[Scrape] Failed to fetch article ${link}:`, articleError);
        // Continue to next article
      }
    }
    
  } catch (error) {
    errors.push(`${source.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return { processed, new: newItems, errors };
}

/**
 * Main ingestion handler
 */
export async function GET(req: NextRequest) {
  // Verify authorization
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: 'public' },
      auth: { persistSession: false }
    }
  ) as any; // Type override for custom tables not in generated types
  
  // Load feed sources from JSON file
  let sources: FeedSource[] = [];
  try {
    const sourcesPath = path.join(process.cwd(), 'public', 'feed-sources.json');
    const sourcesData = await readFile(sourcesPath, 'utf-8');
    sources = JSON.parse(sourcesData);
  } catch (error) {
    console.error('[Ingest] Failed to load feed-sources.json:', error);
    return NextResponse.json({ error: "Failed to load feed sources" }, { status: 500 });
  }
  
  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'GarrisonLedger/1.0 (+https://app.familymedia.com)'
    }
  });
  
  let totalProcessed = 0;
  let totalNew = 0;
  const allErrors: string[] = [];
  
  // Process each source based on type
  for (const source of sources) {
    try {
      let result;
      
      if (source.type === 'rss') {
        result = await processRSSFeed(source, parser, supabase);
      } else if (source.type === 'web_scrape') {
        result = await processWebScrape(source, supabase);
      } else {
        console.warn(`[Ingest] Unknown source type: ${source.type}`);
        continue;
      }
      
      totalProcessed += result.processed;
      totalNew += result.new;
      allErrors.push(...result.errors);
      
    } catch (error) {
      console.error(`[Ingest] Fatal error processing ${source.id}:`, error);
      allErrors.push(`${source.id}: Fatal error`);
    }
  }
  
  return NextResponse.json({
    success: true,
    processed: totalProcessed,
    new: totalNew,
    sources: sources.length,
    errors: allErrors.length > 0 ? allErrors : undefined,
    timestamp: new Date().toISOString()
  });
}
