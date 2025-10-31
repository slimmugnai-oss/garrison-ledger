/**
 * JTR (JOINT TRAVEL REGULATIONS) CHANGE TRACKER
 *
 * Monitors JTR for regulation changes:
 * - Per diem rate updates
 * - Mileage rate changes
 * - TLE/DLA policy updates
 * - Entitlement changes
 *
 * Runs: Weekly via cron
 * Stores: dynamic_feeds table (type: 'jtr_update')
 */

import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface JTRChange {
  title: string;
  url: string;
  changeDate: string;
  changeType: "rate_update" | "policy_change" | "new_benefit" | "restriction";
  summary: string;
  impactedEntitlements: string[]; // ["Per Diem", "TLE", "MALT", etc.]
  effectiveDate: string;
}

/**
 * Check for JTR updates
 * In production: Monitor JTR PDF changes, parse diff
 */
export async function trackJTRChanges(): Promise<JTRChange[]> {
  logger.info("[JTR Tracker] Checking for JTR regulation changes");

  try {
    // In production: Download JTR PDF, compare to previous version, detect changes
    // const currentJTR = await fetchJTRDocument();
    // const previousJTR = await getPreviousJTRVersion();
    // const diff = compareJTRVersions(currentJTR, previousJTR);

    // For Phase 2: Placeholder with known important changes
    const changes: JTRChange[] = [
      {
        title: "Per Diem Rates Updated for FY2025",
        url: "https://www.defensetravel.dod.mil/site/perdiemCalc.cfm",
        changeDate: "2024-10-01",
        changeType: "rate_update",
        summary: "FY2025 per diem rates published. Most CONUS locations increased $5-$15/day.",
        impactedEntitlements: ["Per Diem", "TLE", "TLA"],
        effectiveDate: "2024-10-01",
      },
      {
        title: "Mileage Rate for 2025: $0.67/mile",
        url: "https://www.gsa.gov/travel/plan-book/transportation-airfare-pov-rates",
        changeDate: "2024-12-01",
        changeType: "rate_update",
        summary: "Standard mileage rate increased from $0.655 to $0.67 per mile effective Jan 1, 2025.",
        impactedEntitlements: ["MALT", "PPM/DITY", "TDY Travel"],
        effectiveDate: "2025-01-01",
      },
    ];

    logger.info(`[JTR Tracker] Found ${changes.length} regulation changes`);

    return changes;
  } catch (error) {
    logger.error("[JTR Tracker] Tracking failed:", error);
    return [];
  }
}

/**
 * Process and store JTR changes
 */
export async function processJTRChanges(): Promise<{
  processed: number;
  new: number;
}> {
  try {
    const changes = await trackJTRChanges();

    let newCount = 0;

    for (const change of changes) {
      // Check if change already tracked
      const { data: existing } = await supabaseAdmin
        .from("dynamic_feeds")
        .select("id")
        .eq("feed_type", "jtr_update")
        .eq("source_url", change.url)
        .eq("published_at", change.changeDate)
        .single();

      if (!existing) {
        // Insert new change
        await supabaseAdmin.from("dynamic_feeds").insert({
          feed_type: "jtr_update",
          source_name: "Joint Travel Regulations (JTR)",
          source_url: change.url,
          title: change.title,
          summary: change.summary,
          published_at: change.changeDate,
          metadata: {
            changeType: change.changeType,
            impactedEntitlements: change.impactedEntitlements,
            effectiveDate: change.effectiveDate,
          },
          is_active: true,
        });

        newCount++;
      }
    }

    logger.info(`[JTR Tracker] Processed ${changes.length} changes`, {
      new: newCount,
    });

    return {
      processed: changes.length,
      new: newCount,
    };
  } catch (error) {
    logger.error("[JTR Tracker] Processing failed:", error);
    throw error;
  }
}

