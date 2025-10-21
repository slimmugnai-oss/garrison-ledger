import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
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
  supabase: SupabaseClient
): Promise<{ processed: number; new: number; errors: string[] }> {
  let processed = 0;
  let newItems = 0;
  const errors: string[] = [];
  
  try {
    
    // Try to fetch and parse the feed with better error handling
    let feedData;
    try {
      feedData = await parser.parseURL(source.url);
    } catch (error) {
      // If parsing fails, try to get raw content and clean it
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      let xmlContent = await response.text();
      
      // Clean up common XML issues
      xmlContent = xmlContent
        .replace(/^\s*[\u0000-\u001F\u007F-\u009F]+/, '') // Remove control characters at start
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove all control characters
        .trim();
      
      // Try parsing the cleaned content
      feedData = await parser.parseString(xmlContent);
    }
    
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
      const insertData = {
        source_id: source.id,
        url: item.link,
        title: item.title || 'Untitled',
        summary,
        raw_html: sanitized,
        tags: allTags,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        status: 'new'
      };
      const { error: insertError } = await supabase.from("feed_items").insert(insertData);
      
      if (!insertError) {
        newItems++;
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
  supabase: SupabaseClient
): Promise<{ processed: number; new: number; errors: string[] }> {
  let processed = 0;
  let newItems = 0;
  const errors: string[] = [];
  
  try {
    
    // Fetch the index page with realistic browser headers
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
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
    
    
    for (const link of links) {
      processed++;
      
      // Check if exists
      const { data: existing } = await supabase
        .from("feed_items")
        .select("id")
        .eq("url", link)
        .maybeSingle();
      
      if (existing) {
        continue;
      }
      
      // Fetch article page
      try {
        const articleResponse = await fetch(link, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: AbortSignal.timeout(15000) // 15s timeout per article
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
        const insertData = {
          source_id: source.id,
          url: link,
          title: title.slice(0, 500),
          summary: summary.slice(0, 500),
          raw_html: content,
          tags: allTags,
          published_at: new Date().toISOString(),
          status: 'new'
        };
        const { error: insertError } = await supabase.from("feed_items").insert(insertData);
        
        if (!insertError) {
          newItems++;
        } else {
          errors.push(`${link}: ${insertError.message}`);
        }
        
        // Rate limit: wait 2s between article fetches to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (articleError) {
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
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Load feed sources from JSON file
  let sources: FeedSource[] = [];
  try {
    const sourcesPath = path.join(process.cwd(), 'public', 'feed-sources.json');
    const sourcesData = await readFile(sourcesPath, 'utf-8');
    sources = JSON.parse(sourcesData);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load feed sources" }, { status: 500 });
  }
  
  const parser = new Parser({
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    customFields: {
      feed: ['title', 'description', 'link'],
      item: ['title', 'link', 'pubDate', 'content', 'contentSnippet', 'summary']
    }
  });
  
  let totalProcessed = 0;
  let totalNew = 0;
  const allErrors: string[] = [];
  
  // Process each source based on type with rate limiting
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    try {
      let result;
      
      if (source.type === 'rss') {
        result = await processRSSFeed(source, parser, supabase);
      } else if (source.type === 'web_scrape') {
        result = await processWebScrape(source, supabase);
      } else {
        continue;
      }
      
      totalProcessed += result.processed;
      totalNew += result.new;
      allErrors.push(...result.errors);
      
      // Rate limit: wait 3s between sources to be respectful
      if (i < sources.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
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
