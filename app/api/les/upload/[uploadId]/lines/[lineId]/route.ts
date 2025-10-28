/**
 * LES LINE ITEM CRUD API
 *
 * UPDATE and DELETE endpoints for individual line items
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

// PATCH: Update a line item
export async function PATCH(
  req: NextRequest,
  { params }: { params: { uploadId: string; lineId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uploadId, lineId } = params;
    const body = await req.json();

    // Verify ownership of upload
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from("les_uploads")
      .select("user_id")
      .eq("id", uploadId)
      .eq("user_id", userId)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json({ error: "Upload not found or unauthorized" }, { status: 404 });
    }

    // Update line item
    const { data, error } = await supabaseAdmin
      .from("les_lines")
      .update({
        line_code: body.line_code,
        description: body.description,
        amount_cents: body.amount_cents,
        section: body.section,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lineId)
      .eq("upload_id", uploadId)
      .select()
      .single();

    if (error) {
      console.error("[LES Line Update] Error:", error);
      return NextResponse.json({ error: "Failed to update line item" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[LES Line Update] Exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a line item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { uploadId: string; lineId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uploadId, lineId } = params;

    // Verify ownership of upload
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from("les_uploads")
      .select("user_id")
      .eq("id", uploadId)
      .eq("user_id", userId)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json({ error: "Upload not found or unauthorized" }, { status: 404 });
    }

    // Delete line item
    const { error } = await supabaseAdmin
      .from("les_lines")
      .delete()
      .eq("id", lineId)
      .eq("upload_id", uploadId);

    if (error) {
      console.error("[LES Line Delete] Error:", error);
      return NextResponse.json({ error: "Failed to delete line item" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LES Line Delete] Exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
