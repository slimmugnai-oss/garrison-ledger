import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_USER_IDS = ["user_343xVqjkdILtBkaYAJfE5H8Wq0q"];

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pageId, checkAll } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (checkAll) {
      // Check all pages
      const { data: pages } = await supabase.from("site_pages").select("id, path");

      const results = [];

      for (const page of pages || []) {
        const result = await checkPageHealth(page.path, page.id, supabase);
        results.push(result);
      }

      return NextResponse.json({
        checked: results.length,
        results,
      });
    } else if (pageId) {
      // Check specific page
      const { data: page } = await supabase
        .from("site_pages")
        .select("id, path")
        .eq("id", pageId)
        .single();

      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }

      const result = await checkPageHealth(page.path, page.id, supabase);

      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "pageId or checkAll required" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error checking health:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function checkPageHealth(
  path: string,
  pageId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
) {
  const startTime = Date.now();
  let status: "pass" | "fail" | "warning" = "pass";
  let healthStatus: "healthy" | "warning" | "error" = "healthy";
  let errorMessage = "";

  try {
    // Build full URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.familymedia.com";
    const fullUrl = `${baseUrl}${path}`;

    // Fetch the page
    const response = await fetch(fullUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": "Garrison-Ledger-Health-Check/1.0",
      },
    });

    const responseTime = Date.now() - startTime;

    // Determine health status based on response
    if (!response.ok) {
      status = "fail";
      healthStatus = "error";
      errorMessage = `HTTP ${response.status} ${response.statusText}`;
    } else if (responseTime > 5000) {
      status = "warning";
      healthStatus = "error";
      errorMessage = "Response time > 5s";
    } else if (responseTime > 2000) {
      status = "warning";
      healthStatus = "warning";
      errorMessage = "Response time 2-5s";
    }

    // Update page health
    await supabase
      .from("site_pages")
      .update({
        health_status: healthStatus,
        response_time_ms: responseTime,
        last_audit: new Date().toISOString(),
      })
      .eq("id", pageId);

    // Log health check
    await supabase.from("page_health_checks").insert({
      page_id: pageId,
      check_type: "availability",
      status,
      response_time_ms: responseTime,
      error_message: errorMessage || null,
      details: {
        status_code: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      },
    });

    return {
      path,
      status,
      healthStatus,
      responseTime,
      errorMessage: errorMessage || null,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Update page as error
    await supabase
      .from("site_pages")
      .update({
        health_status: "error",
        response_time_ms: responseTime,
        last_audit: new Date().toISOString(),
      })
      .eq("id", pageId);

    // Log failed check
    await supabase.from("page_health_checks").insert({
      page_id: pageId,
      check_type: "availability",
      status: "fail",
      response_time_ms: responseTime,
      error_message: error instanceof Error ? error.message : "Unknown error",
      details: { error: String(error) },
    });

    return {
      path,
      status: "fail" as const,
      healthStatus: "error" as const,
      responseTime,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

