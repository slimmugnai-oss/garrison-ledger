import { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo-config";

/**
 * Dynamic sitemap generation for Garrison Ledger
 * Automatically updates when pages change
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const lastModified = now.toISOString();

  // Public pages (no auth required)
  const publicPages = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/sign-in`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/sign-up`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy/cookies`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/privacy/do-not-sell`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/disclosures`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  // Hub pages (high-value content)
  const hubPages = [
    {
      url: `${SITE_URL}/pcs-hub`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/career-hub`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/deployment`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/on-base-shopping`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/base-guides`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  // Protected pages (auth required) - lower priority, still indexed for SEO
  const protectedPages = [
    {
      url: `${SITE_URL}/dashboard`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/dashboard/tools/tsp-modeler`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/dashboard/tools/sdp-strategist`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/dashboard/tools/house-hacking`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/dashboard/tools/salary-calculator`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/dashboard/tools/pcs-planner`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/dashboard/tools/on-base-savings`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/dashboard/upgrade`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/dashboard/ask`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ];

  return [...publicPages, ...hubPages, ...protectedPages];
}
