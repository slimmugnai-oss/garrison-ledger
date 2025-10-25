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

    const { data: configs, error } = await supabase
      .from("system_config")
      .select("*")
      .order("category, key");

    if (error) throw error;

    return NextResponse.json({ configs: configs || [] });
  } catch (error) {
    console.error("Error fetching system config:", error);
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
    const { key, value } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("system_config")
      .update({
        value,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("key", key);

    if (error) throw error;

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_user_id: userId,
      action_type: "update_system_config",
      target_type: "system",
      target_id: key,
      details: { value },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating system config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
