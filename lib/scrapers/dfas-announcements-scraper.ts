/**
 * DFAS ANNOUNCEMENTS SCRAPER
 *
 * Scrapes DFAS.mil for:
 * - BAH rate updates
 * - Military pay raises
 * - Policy announcements
 * - Tax updates (FICA, Medicare)
 *
 * Runs: Daily via cron job
 * Stores: dynamic_feeds table (type: 'dfas_announcement')
 */

import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface DFASAnnouncement {
  title: string;
  url: string;
  publishedDate: string;
  category: "bah_update" | "pay_raise" | "tax_update" | "policy_change" | "other";
  summary: string;
  impact: "high" | "medium" | "low";
  affectedPopulation: string; // "All service members", "E-1 to E-5", "OCONUS only", etc.
}

/**
 * Scrape DFAS announcements
 * In production: Use Cheerio or Puppeteer to scrape DFAS.mil
 * For now: Placeholder with manual tracking
 */
export async function scrapeDFASAnnouncements(): Promise<DFASAnnouncement[]> {
  logger.info("[DFAS Scraper] Starting DFAS announcements scrape");

  try {
    // In production: Actual web scraping
    // const response = await fetch("https://www.dfas.mil/news");
    // const html = await response.text();
    // const $ = cheerio.load(html);
    // Extract announcements from HTML...

    // For Phase 2: Placeholder with known important announcements
    const announcements: DFASAnnouncement[] = [
      {
        title: "2025 BAH Rates Published",
        url: "https://www.dfas.mil/militarymembers/payentitlements/bah",
        publishedDate: "2025-01-01",
        category: "bah_update",
        summary: "Updated BAH rates for 2025. Most locations increased 4-6%.",
        impact: "high",
        affectedPopulation: "All service members receiving BAH",
      },
      {
        title: "2025 Military Pay Raise: 5.2%",
        url: "https://www.dfas.mil/militarymembers/payentitlements/pay-tables",
        publishedDate: "2025-01-01",
        category: "pay_raise",
        summary: "2025 military pay tables reflect 5.2% across-the-board increase.",
        impact: "high",
        affectedPopulation: "All active duty service members",
      },
      {
        title: "FICA Tax Rate Unchanged for 2025",
        url: "https://www.irs.gov/taxtopics/tc751",
        publishedDate: "2024-11-01",
        category: "tax_update",
        summary: "Social Security tax remains 6.2%, Medicare remains 1.45% for 2025.",
        impact: "low",
        affectedPopulation: "All taxpayers",
      },
    ];

    logger.info(`[DFAS Scraper] Found ${announcements.length} announcements`);

    return announcements;
  } catch (error) {
    logger.error("[DFAS Scraper] Scrape failed:", error);
    return [];
  }
}

/**
 * Process and store DFAS announcements
 */
export async function processDFASAnnouncements(): Promise<{
  processed: number;
  new: number;
  updated: number;
}> {
  try {
    const announcements = await scrapeDFASAnnouncements();

    let newCount = 0;
    let updatedCount = 0;

    for (const announcement of announcements) {
      // Check if announcement already exists
      const { data: existing } = await supabaseAdmin
        .from("dynamic_feeds")
        .select("id")
        .eq("feed_type", "dfas_announcement")
        .eq("source_url", announcement.url)
        .single();

      if (existing) {
        // Update existing
        await supabaseAdmin
          .from("dynamic_feeds")
          .update({
            title: announcement.title,
            summary: announcement.summary,
            metadata: {
              category: announcement.category,
              impact: announcement.impact,
              affectedPopulation: announcement.affectedPopulation,
            },
            last_checked: new Date().toISOString(),
          })
          .eq("id", existing.id);

        updatedCount++;
      } else {
        // Insert new
        await supabaseAdmin.from("dynamic_feeds").insert({
          feed_type: "dfas_announcement",
          source_name: "DFAS",
          source_url: announcement.url,
          title: announcement.title,
          summary: announcement.summary,
          published_at: announcement.publishedDate,
          metadata: {
            category: announcement.category,
            impact: announcement.impact,
            affectedPopulation: announcement.affectedPopulation,
          },
          is_active: true,
        });

        newCount++;
      }
    }

    logger.info(`[DFAS Scraper] Processed ${announcements.length} announcements`, {
      new: newCount,
      updated: updatedCount,
    });

    return {
      processed: announcements.length,
      new: newCount,
      updated: updatedCount,
    };
  } catch (error) {
    logger.error("[DFAS Scraper] Processing failed:", error);
    throw error;
  }
}

