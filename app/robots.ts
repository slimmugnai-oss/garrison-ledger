import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NEXT_PUBLIC_ENV === "production";
  return {
    rules: [
      {
        userAgent: "*",
        allow: isProd ? "/" : "",
        disallow: isProd ? "" : "/"
      }
    ],
    sitemap: isProd ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://garrison-ledger.vercel.app"}/sitemap.xml` : undefined
  };
}

