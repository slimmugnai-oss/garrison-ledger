import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ADMIN_USER_IDS = ["user_343xVqjkdILtBkaYAJfE5H8Wq0q"];

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

    // Delete TDY Copilot from site_pages
    const { data, error } = await supabase
      .from("site_pages")
      .delete()
      .eq("path", "/dashboard/tdy-voucher")
      .select();

    if (error) {
      console.error("Error deleting TDY Copilot:", error);
      throw error;
    }

    // Get remaining Premium Tools
    const { data: remainingPages, error: fetchError } = await supabase
      .from("site_pages")
      .select("path, title, category")
      .eq("category", "Premium Tools")
      .order("path");

    if (fetchError) {
      console.error("Error fetching remaining pages:", fetchError);
    }

    return NextResponse.json({
      success: true,
      deleted: data,
      remainingPremiumTools: remainingPages,
      message: "TDY Copilot removed from sitemap. Platform now has 4 premium tools.",
    });
  } catch (error) {
    console.error("Error removing TDY Copilot:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

