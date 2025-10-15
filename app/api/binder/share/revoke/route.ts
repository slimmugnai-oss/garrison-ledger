import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { shareId?: string; token?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { shareId, token } = body;

  if (!shareId && !token) {
    return NextResponse.json(
      { error: "Missing shareId or token" },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // Soft delete by setting revoked_at
  let query = supabase
    .from("binder_shares")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (shareId) {
    query = query.eq("id", shareId);
  } else if (token) {
    query = query.eq("token", token);
  }

  const { error } = await query;

  if (error) {
    console.error("Error revoking share:", error);
    return NextResponse.json(
      { error: "Failed to revoke share link" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

