import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo-config";

/**
 * Robots.txt configuration for Garrison Ledger
 * Controls how search engines crawl the site
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NEXT_PUBLIC_ENV === "production";

  if (!isProduction) {
    // Block all crawlers in non-production environments
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      }
    };
  }

  // Production: Allow crawling with sensible restrictions
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/*", // Don't index API routes
          "/dashboard/admin/*", // Don't index admin pages
          "/*?*", // Don't index URLs with query parameters (reduces duplicate content)
        ]
      },
      {
        userAgent: "GPTBot", // OpenAI's crawler
        disallow: "/" // Block AI training crawlers
      },
      {
        userAgent: "CCBot", // Common Crawl
        disallow: "/" // Block AI training crawlers
      },
      {
        userAgent: "Google-Extended", // Google's AI training crawler
        disallow: "/" // Block AI training crawlers
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
