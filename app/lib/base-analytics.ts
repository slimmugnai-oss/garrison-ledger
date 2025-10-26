/**
 * BASE GUIDE ANALYTICS TRACKING
 *
 * Tracks user interactions with base guides for insights and optimization.
 * Uses Supabase for storage (can be replaced with your analytics provider).
 */

import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Use admin client for server-side analytics
function getSupabaseClient() {
  return supabaseAdmin;
}

// Track when a user views a base (clicks on map or card)
export async function trackBaseView(baseId: string, baseName: string, userId?: string) {
  try {
    const supabase = getSupabaseClient();

    await supabase.from("base_guide_analytics").insert({
      event_type: "base_view",
      base_id: baseId,
      base_name: baseName,
      user_id: userId || null,
      timestamp: new Date().toISOString(),
    });

    // Also track in localStorage for quick access (client-side only)
    if (typeof window !== "undefined") {
      const recentViews = JSON.parse(localStorage.getItem("recent_base_views") || "[]");
      const newView = {
        baseId,
        baseName,
        timestamp: Date.now(),
      };

      // Keep only last 5 views
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = [newView, ...recentViews.filter((v: any) => v.baseId !== baseId)].slice(0, 5);
      localStorage.setItem("recent_base_views", JSON.stringify(updated));
    }
  } catch (err) {
    // Non-critical: localStorage may be disabled - continue without tracking
    logger.debug("[BaseAnalytics] Failed to save recent view", {
      error: err instanceof Error ? err.message : "Unknown",
      baseId,
    });
  }
}

// Track search queries
export async function trackBaseSearch(query: string, resultsCount: number, userId?: string) {
  try {
    const supabase = getSupabaseClient();

    await supabase.from("base_guide_analytics").insert({
      event_type: "search",
      search_query: query,
      results_count: resultsCount,
      user_id: userId || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Non-critical: Analytics failure shouldn't block user flow
    logger.debug("[BaseAnalytics] Failed to track search", {
      error: err instanceof Error ? err.message : "Unknown",
      query,
    });
  }
}

// Track filter usage
export async function trackFilterUsage(filterType: string, filterValue: string, userId?: string) {
  try {
    const supabase = getSupabaseClient();

    await supabase.from("base_guide_analytics").insert({
      event_type: "filter",
      filter_type: filterType,
      filter_value: filterValue,
      user_id: userId || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Non-critical: Analytics failure shouldn't block user flow
    logger.debug("[BaseAnalytics] Failed to track filter", {
      error: err instanceof Error ? err.message : "Unknown",
      filterType,
    });
  }
}

// Track when user clicks through to external guide
export async function trackGuideClickthrough(
  baseId: string,
  baseName: string,
  url: string,
  userId?: string
) {
  try {
    const supabase = getSupabaseClient();

    await supabase.from("base_guide_analytics").insert({
      event_type: "guide_clickthrough",
      base_id: baseId,
      base_name: baseName,
      external_url: url,
      user_id: userId || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Non-critical: Analytics failure shouldn't block user flow
    logger.debug("[BaseAnalytics] Failed to track clickthrough", {
      error: err instanceof Error ? err.message : "Unknown",
      baseId,
    });
  }
}

// Get recent views from localStorage
export function getRecentViews() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem("recent_base_views") || "[]");
  } catch {
    return [];
  }
}

// Get comparison list from localStorage
export function getComparisonList() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem("base_comparison") || "[]");
  } catch {
    return [];
  }
}

// Add base to comparison (max 3)
export function addToComparison(baseId: string, baseName: string, branch: string) {
  if (typeof window === "undefined") {
    return { success: false, message: "Client-side only" };
  }

  try {
    const current = getComparisonList();

    // Check if already in list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (current.some((b: any) => b.baseId === baseId)) {
      return { success: false, message: "Base already in comparison" };
    }

    // Check max limit
    if (current.length >= 3) {
      return { success: false, message: "Maximum 3 bases can be compared" };
    }

    const updated = [...current, { baseId, baseName, branch }];
    localStorage.setItem("base_comparison", JSON.stringify(updated));

    return { success: true, count: updated.length };
  } catch {
    return { success: false, message: "Failed to add base" };
  }
}

// Remove base from comparison
export function removeFromComparison(baseId: string) {
  if (typeof window === "undefined") {
    return { success: false };
  }

  try {
    const current = getComparisonList();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = current.filter((b: any) => b.baseId !== baseId);
    localStorage.setItem("base_comparison", JSON.stringify(updated));

    return { success: true, count: updated.length };
  } catch {
    return { success: false };
  }
}

// Clear all comparisons
export function clearComparison() {
  if (typeof window === "undefined") {
    return { success: false };
  }

  try {
    localStorage.setItem("base_comparison", JSON.stringify([]));
    return { success: true };
  } catch {
    return { success: false };
  }
}
