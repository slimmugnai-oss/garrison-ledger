/**
 * GET all line items for an upload
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { uploadId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uploadId } = params;

    // Verify ownership
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from("les_uploads")
      .select("user_id")
      .eq("id", uploadId)
      .eq("user_id", userId)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json({ error: "Upload not found or unauthorized" }, { status: 404 });
    }

    // Fetch all line items
    const { data, error } = await supabaseAdmin
      .from("les_lines")
      .select("*")
      .eq("upload_id", uploadId)
      .order("section", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[LES Lines Fetch] Error:", error);
      return NextResponse.json({ error: "Failed to fetch line items" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("[LES Lines Fetch] Exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
