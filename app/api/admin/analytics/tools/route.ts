import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_USER_IDS = ["user_343xVqjkdILtBkaYAJfE5H8Wq0q"];

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // LES Auditor usage
    const { count: lesUploads } = await supabase
      .from("les_uploads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    const { count: lesSuccess } = await supabase
      .from("les_uploads")
      .select("*", { count: "exact", head: true })
      .eq("parsed_ok", true)
      .gte("created_at", thirtyDaysAgo.toISOString());

    // PCS Copilot usage
    const { count: pcsAnalytics } = await supabase
      .from("pcs_analytics")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // TDY Copilot usage
    const { count: tdyTrips } = await supabase
      .from("tdy_trips")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Calculator usage
    const { count: calcUsage } = await supabase
      .from("calculator_usage_log")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Document Binder uploads
    const { count: binderUploads } = await supabase
      .from("binder_files")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    const toolsData = [
      {
        name: "LES Auditor",
        usage: lesUploads || 0,
        successRate:
          lesUploads && lesUploads > 0 ? (((lesSuccess || 0) / lesUploads) * 100).toFixed(1) : "0",
        category: "Premium Tools",
      },
      {
        name: "PCS Copilot",
        usage: pcsAnalytics || 0,
        successRate: "100",
        category: "Premium Tools",
      },
      {
        name: "TDY Copilot",
        usage: tdyTrips || 0,
        successRate: "100",
        category: "Premium Tools",
      },
      {
        name: "Calculators",
        usage: calcUsage || 0,
        successRate: "100",
        category: "Free Tools",
      },
      {
        name: "Document Binder",
        usage: binderUploads || 0,
        successRate: "100",
        category: "Premium Tools",
      },
    ];

    return NextResponse.json({ toolsData });
  } catch (error) {
    console.error("Error fetching tools analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
