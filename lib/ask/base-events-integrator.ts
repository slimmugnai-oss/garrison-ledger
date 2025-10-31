/**
 * BASE EVENTS INTEGRATION
 *
 * Integrates MWR (Morale, Welfare, Recreation) calendars and base events
 * Location-aware filtering based on user's current base
 * Provides event recommendations in Ask responses
 */

import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface BaseEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  baseId: string;
  baseName: string;
  category: "mwr" | "community" | "family" | "sports" | "recreation" | "support";
  cost: string; // "Free", "$5", "$20/family", etc.
  registrationUrl?: string;
  isRecurring: boolean;
}

/**
 * Get base events for specific base
 */
export async function getBaseEvents(
  baseId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }
): Promise<BaseEvent[]> {
  try {
    logger.info(`[BaseEvents] Fetching events for base ${baseId}`);

    // In production: Query base_events table (to be created) or integrate with MWR calendars
    // For Phase 2: Placeholder with example events

    const exampleEvents: BaseEvent[] = [
      {
        id: "event-1",
        title: "Family Movie Night at MWR",
        description: "Free family movie night every Friday. Popcorn and drinks provided.",
        eventDate: "2025-11-07",
        location: "MWR Community Center",
        baseId,
        baseName: "Fort Bragg",
        category: "family",
        cost: "Free",
        isRecurring: true,
      },
      {
        id: "event-2",
        title: "Financial Planning Workshop",
        description: "Free workshop covering TSP, budgeting, and deployment savings strategies.",
        eventDate: "2025-11-15",
        location: "Education Center",
        baseId,
        baseName: "Fort Bragg",
        category: "support",
        cost: "Free",
        registrationUrl: "https://example.com/register",
        isRecurring: false,
      },
      {
        id: "event-3",
        title: "Youth Sports League Sign-Up",
        description: "Soccer, basketball, baseball leagues for ages 5-15. Season starts Dec 1.",
        eventDate: "2025-11-10",
        location: "Youth Center",
        baseId,
        baseName: "Fort Bragg",
        category: "sports",
        cost: "$25/season",
        registrationUrl: "https://example.com/youth-sports",
        isRecurring: false,
      },
    ];

    return exampleEvents;
  } catch (error) {
    logger.error("[BaseEvents] Failed to fetch events:", error);
    return [];
  }
}

/**
 * Get event recommendations based on user situation
 */
export function recommendEvents(
  events: BaseEvent[],
  userContext?: {
    has_dependents?: boolean;
    interests?: string[];
    needs_financial_help?: boolean;
  }
): BaseEvent[] {
  if (!userContext) return events;

  const recommended = events.filter((event) => {
    // Family events if user has dependents
    if (userContext.has_dependents && event.category === "family") {
      return true;
    }

    // Sports/recreation for fitness enthusiasts
    if (userContext.interests?.includes("fitness") && event.category === "sports") {
      return true;
    }

    // Support events if user needs help
    if (userContext.needs_financial_help && event.category === "support") {
      return true;
    }

    // Free events always relevant
    if (event.cost.toLowerCase() === "free") {
      return true;
    }

    return false;
  });

  return recommended.slice(0, 5); // Top 5 recommendations
}

