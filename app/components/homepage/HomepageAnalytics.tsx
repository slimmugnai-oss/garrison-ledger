"use client";

import { useEffect, useRef } from "react";

/**
 * Homepage Analytics Tracker
 * Tracks scroll depth, section views, CTA clicks, and time on page
 */
export default function HomepageAnalytics() {
  const scrollDepthTracked = useRef<Set<number>>(new Set());
  const sectionsTracked = useRef<Set<string>>(new Set());
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    // Track scroll depth
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      // Track at 25%, 50%, 75%, 100% milestones
      const milestones = [25, 50, 75, 100];
      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !scrollDepthTracked.current.has(milestone)) {
          scrollDepthTracked.current.add(milestone);
          trackEvent("homepage_scroll_depth", {
            depth_percent: milestone,
            time_elapsed_seconds: Math.round((Date.now() - startTime.current) / 1000),
          });
        }
      });

      // Track section views using Intersection Observer would be better,
      // but for simplicity we'll use scroll depth as proxy
      const sections = [
        { name: "hero", minDepth: 0, maxDepth: 15 },
        { name: "clarity", minDepth: 15, maxDepth: 30 },
        { name: "les_auditor", minDepth: 30, maxDepth: 50 },
        { name: "trust_badges", minDepth: 50, maxDepth: 60 },
        { name: "tools_grid", minDepth: 60, maxDepth: 75 },
        { name: "how_it_works", minDepth: 75, maxDepth: 85 },
        { name: "testimonials", minDepth: 85, maxDepth: 95 },
        { name: "faq", minDepth: 95, maxDepth: 98 },
        { name: "pricing", minDepth: 98, maxDepth: 100 },
      ];

      sections.forEach((section) => {
        if (
          scrollPercent >= section.minDepth &&
          scrollPercent <= section.maxDepth &&
          !sectionsTracked.current.has(section.name)
        ) {
          sectionsTracked.current.add(section.name);
          trackEvent("homepage_section_viewed", {
            section: section.name,
            time_elapsed_seconds: Math.round((Date.now() - startTime.current) / 1000),
          });
        }
      });
    };

    // Track time on page before leaving
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);
      trackEvent("homepage_time_on_page", {
        seconds: timeOnPage,
        max_scroll_depth: Math.max(...Array.from(scrollDepthTracked.current), 0),
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Initial scroll check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null; // This component doesn't render anything
}

/**
 * Track CTA clicks (call this from CTA buttons)
 */
export function trackCTAClick(location: string, ctaText: string) {
  trackEvent("homepage_cta_clicked", {
    location,
    cta_text: ctaText,
  });
}

/**
 * Track tool interest (call when user clicks on a tool card)
 */
export function trackToolInterest(toolName: string) {
  trackEvent("homepage_tool_interest", {
    tool_name: toolName,
  });
}

/**
 * Generic event tracker
 */
function trackEvent(event: string, properties: Record<string, string | number | boolean>) {
  // Send to analytics API
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      properties,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    // Silently fail - analytics shouldn't break UX
  });
}

