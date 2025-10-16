import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function GET() {
  const { userId } = await auth();
  
  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get feed items that are pending review or approved
    const { data, error } = await supabaseAdmin
      .from('feed_items')
      .select('*')
      .in('status', ['new', 'needs_review', 'approved_for_conversion'])
      .order('published_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      items: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("[Admin Content Pending] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

