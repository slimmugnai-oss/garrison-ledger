/**
 * VA BENEFITS MONITOR
 *
 * Monitors VA.gov for:
 * - Disability compensation rate increases
 * - New benefit programs
 * - Policy changes affecting veterans
 * - COLA adjustments
 *
 * Runs: Weekly via cron
 * Stores: dynamic_feeds table (type: 'va_update')
 */

import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface VAUpdate {
  title: string;
  url: string;
  publishedDate: string;
  updateType: "rate_increase" | "new_benefit" | "policy_change" | "cola_adjustment";
  summary: string;
  impact: "all_veterans" | "specific_rating" | "specific_condition";
  effectiveDate: string;
}

/**
 * Monitor VA benefits for changes
 */
export async function monitorVABenefits(): Promise<VAUpdate[]> {
  logger.info("[VA Monitor] Checking for VA benefit updates");

  try {
    // In production: Scrape VA.gov news, parse announcements
    // const response = await fetch("https://www.va.gov/opa/pressrel");
    // const html = await response.text();
    // Parse press releases for benefit updates...

    // For Phase 2: Placeholder with known 2025 updates
    const updates: VAUpdate[] = [
      {
        title: "2025 VA Disability Compensation Rates (COLA Increase)",
        url: "https://www.va.gov/disability/compensation-rates/veteran-rates",
        publishedDate: "2024-12-01",
        updateType: "cola_adjustment",
        summary:
          "VA disability compensation rates increased 3.2% for 2025. 100% rating: $3,737/month (up from $3,621).",
        impact: "all_veterans",
        effectiveDate: "2025-01-01",
      },
      {
        title: "PACT Act Expands Presumptive Conditions",
        url: "https://www.va.gov/resources/the-pact-act-and-your-va-benefits",
        publishedDate: "2024-08-01",
        updateType: "new_benefit",
        summary:
          "PACT Act adds 20+ presumptive conditions for burn pit exposure. Veterans can file claims without proving service connection.",
        impact: "all_veterans",
        effectiveDate: "2024-08-09",
      },
    ];

    logger.info(`[VA Monitor] Found ${updates.length} VA updates`);

    return updates;
  } catch (error) {
    logger.error("[VA Monitor] Monitoring failed:", error);
    return [];
  }
}

/**
 * Process and store VA updates
 */
export async function processVAUpdates(): Promise<{
  processed: number;
  new: number;
}> {
  try {
    const updates = await monitorVABenefits();

    let newCount = 0;

    for (const update of updates) {
      // Check if update already tracked
      const { data: existing } = await supabaseAdmin
        .from("dynamic_feeds")
        .select("id")
        .eq("feed_type", "va_update")
        .eq("source_url", update.url)
        .eq("published_at", update.publishedDate)
        .single();

      if (!existing) {
        // Insert new update
        await supabaseAdmin.from("dynamic_feeds").insert({
          feed_type: "va_update",
          source_name: "Department of Veterans Affairs",
          source_url: update.url,
          title: update.title,
          summary: update.summary,
          published_at: update.publishedDate,
          metadata: {
            updateType: update.updateType,
            impact: update.impact,
            effectiveDate: update.effectiveDate,
          },
          is_active: true,
        });

        newCount++;
      }
    }

    logger.info(`[VA Monitor] Processed ${updates.length} updates`, {
      new: newCount,
    });

    return {
      processed: updates.length,
      new: newCount,
    };
  } catch (error) {
    logger.error("[VA Monitor] Processing failed:", error);
    throw error;
  }
}

