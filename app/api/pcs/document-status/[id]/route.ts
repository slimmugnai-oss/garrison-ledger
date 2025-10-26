import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * PCS DOCUMENT STATUS POLLING
 * 
 * Allows clients to poll for OCR processing status after document upload
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = params.id;

    // Fetch document status
    const { data: document, error } = await supabaseAdmin
      .from("pcs_claim_documents")
      .select("id, ocr_status, normalized_data, updated_at")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        ocrStatus: document.ocr_status,
        normalizedData: document.normalized_data,
        updatedAt: document.updated_at,
      },
    });
  } catch (error) {
    console.error("[DocumentStatus] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document status" },
      { status: 500 }
    );
  }
}
