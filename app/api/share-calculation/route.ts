import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tool, data } = await req.json();

    if (!tool || !data) {
      return NextResponse.json(
        { error: "Tool and data are required" },
        { status: 400 }
      );
    }

    // Create shared calculation
    const { data: sharedCalc, error } = await supabase
      .from('shared_calculations')
      .insert({
        user_id: userId,
        tool,
        data
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create share link" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://garrisonledger.com';
    const shareUrl = `${baseUrl}/tools/${tool}/view/${sharedCalc.id}`;

    return NextResponse.json({
      success: true,
      shareId: sharedCalc.id,
      url: shareUrl
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get shared calculation by ID
export async function GET(req: NextRequest) {
  const shareId = req.nextUrl.searchParams.get('id');

  if (!shareId) {
    return NextResponse.json(
      { error: "Share ID is required" },
      { status: 400 }
    );
  }

  try {
    const { data: sharedCalc, error } = await supabase
      .from('shared_calculations')
      .select('*')
      .eq('id', shareId)
      .single();

    if (error || !sharedCalc) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(sharedCalc.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This share link has expired" },
        { status: 410 }
      );
    }

    // Increment view count
    await supabase.rpc('increment_share_view_count', { share_id: shareId });

    return NextResponse.json({
      success: true,
      tool: sharedCalc.tool,
      data: sharedCalc.data,
      createdAt: sharedCalc.created_at,
      viewCount: sharedCalc.view_count + 1
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

