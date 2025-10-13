import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
import TurndownService from "turndown";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60 seconds for feed processing

/**
 * RSS FEED SOURCES
 * Add or remove feeds here to control what content is ingested
 */
const RSS_FEEDS = [
  {
    id: "military_times",
    url: "https://www.militarytimes.com/arc/outboundfeeds/rss/category/pay-benefits/",
    tags: ["military-pay", "benefits", "official-news"]
  },
  {
    id: "stars_and_stripes",
    url: "https://www.stripes.com/rss/news",
    tags: ["military-news", "lifestyle"]
  },
  // Add more feeds as needed
  // {
  //   id: "military_spouse",
  //   url: "https://militaryspouse.com/feed/",
  //   tags: ["spouse", "career", "family"]
  // },
];

/**
 * Sanitize HTML content
 * Removes scripts, styles, and dangerous elements
 */
function sanitizeHTML(html: string): string {
  const $ = cheerio.load(html);
  
  // Remove dangerous elements
  $('script, style, iframe, object, embed').remove();
  
  // Remove tracking pixels and ads
  $('img[width="1"], img[height="1"], .ad, .advertisement').remove();
  
  // Clean up attributes
  $('*').each((_, el) => {
    const element = $(el);
    // Keep only safe attributes
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
 * Convert HTML to clean markdown
 */
function htmlToMarkdown(html: string): string {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });
  
  return turndown.turndown(html);
}

/**
 * Extract keywords from text for auto-tagging
 */
function extractKeywords(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase();
  const keywords: string[] = [];
  
  // Military-specific keyword patterns
  const patterns: Record<string, string[]> = {
    'pcs': ['pcs', 'permanent change', 'relocation', 'moving', 'orders'],
    'tsp': ['tsp', 'thrift savings', 'retirement', 'brs', 'blended retirement'],
    'deployment': ['deployment', 'deployed', 'combat zone', 'hardship duty'],
    'bah': ['bah', 'housing allowance', 'bas', 'basic allowance'],
    'career': ['career', 'employment', 'job', 'resume', 'mycaa'],
    'va-loan': ['va loan', 'va home', 'certificate of eligibility'],
    'scra': ['scra', 'servicemembers civil relief'],
    'commissary': ['commissary', 'exchange', 'shopette', 'aafes'],
    'oconus': ['oconus', 'overseas', 'germany', 'japan', 'korea', 'italy'],
  };
  
  Object.entries(patterns).forEach(([tag, terms]) => {
    if (terms.some(term => text.includes(term))) {
      keywords.push(tag);
    }
  });
  
  return keywords.length > 0 ? keywords : ['general'];
}

/**
 * Main ingestion handler
 */
export async function GET(req: NextRequest) {
  // Verify this is a cron job or authorized request
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'GarrisonLedger/1.0 (+https://app.familymedia.com)'
    }
  });
  
  let totalProcessed = 0;
  let totalNew = 0;
  let errors: string[] = [];
  
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`[Feed Ingest] Processing: ${feed.id}`);
      
      const feedData = await parser.parseURL(feed.url);
      
      for (const item of feedData.items.slice(0, 10)) { // Process latest 10 items per feed
        if (!item.link) continue;
        
        totalProcessed++;
        
        // Check if URL already exists (dedup)
        const { data: existing } = await supabase
          .from("feed_items")
          .select("id")
          .eq("url", item.link)
          .maybeSingle();
        
        if (existing) {
          console.log(`[Feed Ingest] Skipping duplicate: ${item.link}`);
          continue;
        }
        
        // Extract and clean content
        const rawHTML = item.content || item.contentSnippet || item.summary || '';
        const sanitized = sanitizeHTML(rawHTML);
        const summary = item.contentSnippet?.slice(0, 500) || item.summary?.slice(0, 500) || '';
        
        // Auto-suggest tags
        const autoTags = extractKeywords(item.title || '', summary);
        const allTags = [...new Set([...feed.tags, ...autoTags])];
        
        // Insert into feed_items
        const { error: insertError } = await supabase
          .from("feed_items")
          .insert({
            source_id: feed.id,
            url: item.link,
            title: item.title || 'Untitled',
            summary,
            raw_html: sanitized,
            tags: allTags,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            status: 'new'
          });
        
        if (insertError) {
          console.error(`[Feed Ingest] Insert error for ${item.link}:`, insertError);
          errors.push(`${item.link}: ${insertError.message}`);
        } else {
          totalNew++;
          console.log(`[Feed Ingest] ✓ New item: ${item.title}`);
        }
      }
      
    } catch (error) {
      console.error(`[Feed Ingest] Error processing ${feed.id}:`, error);
      errors.push(`${feed.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return NextResponse.json({
    success: true,
    processed: totalProcessed,
    new: totalNew,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString()
  });
}

