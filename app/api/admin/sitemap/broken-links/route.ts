import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { load } from "cheerio";

const ADMIN_USER_IDS = ["user_343xVqjkdILtBkaYAJfE5H8Wq0q"];

interface BrokenLink {
  sourcePage: string;
  sourceTitle: string;
  brokenLink: string;
  linkText: string;
  statusCode: number | null;
  errorMessage: string;
}

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all pages
    const { data: pages } = await supabase.from("site_pages").select("id, path, title");

    if (!pages) {
      return NextResponse.json({ error: "No pages found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.familymedia.com";
    const brokenLinks: BrokenLink[] = [];
    const internalLinks = new Set<string>();

    // Scan each page for links
    for (const page of pages) {
      try {
        const fullUrl = `${baseUrl}${page.path}`;
        
        // Fetch the page HTML
        const response = await fetch(fullUrl, {
          headers: { "User-Agent": "Garrison-Ledger-Link-Checker/1.0" },
        });

        if (!response.ok) continue;

        const html = await response.text();
        const $ = load(html);

        // Find all internal links
        $("a[href]").each((_, element) => {
          const href = $(element).attr("href");
          const linkText = $(element).text().trim();

          if (!href) return;

          // Only check internal links
          if (href.startsWith("/") && !href.startsWith("//")) {
            // Clean the link (remove hash and query params for checking)
            const cleanLink = href.split("?")[0].split("#")[0];
            internalLinks.add(cleanLink);

            // Store for checking
            if (!brokenLinks.find((bl) => bl.sourcePage === page.path && bl.brokenLink === cleanLink)) {
              brokenLinks.push({
                sourcePage: page.path,
                sourceTitle: page.title,
                brokenLink: cleanLink,
                linkText: linkText || href,
                statusCode: null,
                errorMessage: "",
              });
            }
          }
        });
      } catch (error) {
        console.error(`Error scanning ${page.path}:`, error);
      }
    }

    // Check each unique link
    const uniqueLinks = [...new Set(brokenLinks.map((bl) => bl.brokenLink))];
    const linkStatus = new Map<string, { status: number | null; error: string }>();

    for (const link of uniqueLinks) {
      try {
        const fullUrl = `${baseUrl}${link}`;
        const response = await fetch(fullUrl, {
          method: "HEAD",
          headers: { "User-Agent": "Garrison-Ledger-Link-Checker/1.0" },
        });

        linkStatus.set(link, {
          status: response.status,
          error: response.ok ? "" : `HTTP ${response.status} ${response.statusText}`,
        });
      } catch (error) {
        linkStatus.set(link, {
          status: null,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Filter to only broken links
    const actuallyBroken = brokenLinks
      .map((bl) => {
        const status = linkStatus.get(bl.brokenLink);
        return {
          ...bl,
          statusCode: status?.status || null,
          errorMessage: status?.error || "",
        };
      })
      .filter((bl) => bl.statusCode !== 200 && bl.statusCode !== 301 && bl.statusCode !== 302);

    return NextResponse.json({
      scanned: pages.length,
      totalLinks: uniqueLinks.length,
      brokenLinks: actuallyBroken,
      brokenCount: actuallyBroken.length,
    });
  } catch (error) {
    console.error("Error scanning for broken links:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

