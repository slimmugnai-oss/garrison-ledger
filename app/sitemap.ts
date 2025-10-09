import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://garrison-ledger.vercel.app";
  const pages = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/disclosures`, lastModified: new Date() },
    { url: `${base}/dashboard`, lastModified: new Date() },
  ];
  return pages;
}

