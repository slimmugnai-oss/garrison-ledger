import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, statSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

const ADMIN_USER_IDS = ["user_343xVqjkdILtBkaYAJfE5H8Wq0q"];

// Map routes to file paths
const routeToFilePath: Record<string, string> = {
  "/": "app/page.tsx",
  "/dashboard": "app/dashboard/page.tsx",
  "/dashboard/binder": "app/dashboard/binder/page.tsx",
  "/dashboard/settings": "app/dashboard/settings/page.tsx",
  "/dashboard/profile/setup": "app/dashboard/profile/setup/page.tsx",
  "/dashboard/paycheck-audit": "app/dashboard/paycheck-audit/page.tsx",
  "/dashboard/pcs-copilot": "app/dashboard/pcs-copilot/page.tsx",
  "/dashboard/navigator": "app/dashboard/navigator/page.tsx",
  "/dashboard/tdy-voucher": "app/dashboard/tdy-voucher/page.tsx",
  "/dashboard/intel": "app/dashboard/intel/page.tsx",
  "/dashboard/tools/tsp-modeler": "app/dashboard/tools/tsp-modeler/page.tsx",
  "/dashboard/tools/sdp-strategist": "app/dashboard/tools/sdp-strategist/page.tsx",
  "/dashboard/tools/house-hacking": "app/dashboard/tools/house-hacking/page.tsx",
  "/dashboard/tools/pcs-planner": "app/dashboard/tools/pcs-planner/page.tsx",
  "/dashboard/tools/on-base-savings": "app/dashboard/tools/on-base-savings/page.tsx",
  "/dashboard/tools/salary-calculator": "app/dashboard/tools/salary-calculator/page.tsx",
  "/dashboard/listening-post": "app/dashboard/listening-post/page.tsx",
  "/dashboard/directory": "app/dashboard/directory/page.tsx",
  "/dashboard/referrals": "app/dashboard/referrals/page.tsx",
  "/pcs-hub": "app/pcs-hub/page.tsx",
  "/career-hub": "app/career-hub/page.tsx",
  "/deployment": "app/deployment/page.tsx",
  "/on-base-shopping": "app/on-base-shopping/page.tsx",
  "/dashboard/upgrade": "app/dashboard/upgrade/page.tsx",
  "/contact": "app/contact/page.tsx",
  "/dashboard/support": "app/dashboard/support/page.tsx",
  "/disclosures": "app/disclosures/page.tsx",
  "/privacy": "app/privacy/page.tsx",
  "/privacy/cookies": "app/privacy/cookies/page.tsx",
  "/privacy/do-not-sell": "app/privacy/do-not-sell/page.tsx",
  "/dashboard/admin": "app/dashboard/admin/page.tsx",
  "/dashboard/admin/briefing": "app/dashboard/admin/briefing/page.tsx",
};

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

    let updated = 0;
    let skipped = 0;

    for (const [route, filePath] of Object.entries(routeToFilePath)) {
      try {
        const fullPath = join(process.cwd(), filePath);

        if (!existsSync(fullPath)) {
          skipped++;
          continue;
        }

        const content = readFileSync(fullPath, "utf-8");
        const stats = statSync(fullPath);
        const hash = createHash("sha256").update(content).digest("hex");

        // Extract component name
        const componentMatch = content.match(/export default function (\w+)/);
        const componentName = componentMatch ? componentMatch[1] : null;

        // Extract API endpoints
        const apiMatches = content.matchAll(/fetch\(['"](\/api\/[^'"]+)['"]/g);
        const apiEndpoints = [...new Set([...apiMatches].map((m) => m[1]))];

        // Extract database tables
        const tableMatches = content.matchAll(/\.from\(['"](\w+)['"]\)/g);
        const databaseTables = [...new Set([...tableMatches].map((m) => m[1]))];

        // Extract external services
        const externalServices: string[] = [];
        if (content.includes("openweathermap") || content.includes("OpenWeather")) {
          externalServices.push("OpenWeatherMap");
        }
        if (content.includes("greatschools") || content.includes("GreatSchools")) {
          externalServices.push("GreatSchools");
        }
        if (content.includes("zillow") || content.includes("Zillow")) {
          externalServices.push("Zillow");
        }
        if (
          content.includes("gemini") ||
          content.includes("Gemini") ||
          content.includes("google.generativeai")
        ) {
          externalServices.push("Google Gemini AI");
        }
        if (content.includes("stripe") || content.includes("Stripe")) {
          externalServices.push("Stripe");
        }
        if (content.includes("clerk") || content.includes("Clerk")) {
          externalServices.push("Clerk");
        }

        // Update in database
        const { error } = await supabase
          .from("site_pages")
          .update({
            file_path: filePath,
            file_hash: hash,
            component_name: componentName,
            api_endpoints: apiEndpoints,
            database_tables: databaseTables,
            external_services: externalServices,
            last_updated: stats.mtime.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("path", route);

        if (error) {
          skipped++;
        } else {
          updated++;
        }
      } catch (err) {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      total: Object.keys(routeToFilePath).length,
    });
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

