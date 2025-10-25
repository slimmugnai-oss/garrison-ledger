import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

    const { data: flags, error } = await supabase.from("feature_flags").select("*").order("name");

    if (error) throw error;

    return NextResponse.json({ flags: flags || [] });
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { flag_key, enabled } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("feature_flags")
      .update({
        enabled,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("flag_key", flag_key);

    if (error) throw error;

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_user_id: userId,
      action_type: enabled ? "enable_feature_flag" : "disable_feature_flag",
      target_type: "system",
      target_id: flag_key,
      details: { enabled },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating feature flag:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
