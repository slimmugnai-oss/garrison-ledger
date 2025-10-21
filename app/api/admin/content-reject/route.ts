import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { feedItemId } = body;

    // Update status to news_only (rejected for conversion)
    const { error } = await supabaseAdmin
      .from('feed_items')
      .update({ status: 'news_only' })
      .eq('id', feedItemId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Item marked as news only',
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

