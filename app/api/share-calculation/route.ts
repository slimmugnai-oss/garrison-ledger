import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { tool, data } = await req.json();

    if (!tool || !data) {
      throw Errors.invalidInput("Tool and data are required");
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
      logger.error('[ShareCalc] Failed to create share link', error, { userId, tool });
      throw Errors.databaseError("Failed to create share link");
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://garrisonledger.com';
    const shareUrl = `${baseUrl}/tools/${tool}/view/${sharedCalc.id}`;

    logger.info('[ShareCalc] Share link created', { userId, tool, shareId: sharedCalc.id });
    return NextResponse.json({
      success: true,
      shareId: sharedCalc.id,
      url: shareUrl
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// Get shared calculation by ID
export async function GET(req: NextRequest) {
  try {
    const shareId = req.nextUrl.searchParams.get('id');

    if (!shareId) {
      throw Errors.invalidInput("Share ID (id) is required");
    }

    const { data: sharedCalc, error } = await supabase
      .from('shared_calculations')
      .select('*')
      .eq('id', shareId)
      .single();

    if (error || !sharedCalc) {
      logger.warn('[ShareCalc] Share not found', { shareId });
      throw Errors.notFound("Shared calculation");
    }

    // Check if expired
    if (new Date(sharedCalc.expires_at) < new Date()) {
      logger.warn('[ShareCalc] Expired share accessed', { shareId });
      return NextResponse.json(
        { error: "This share link has expired" },
        { status: 410 }
      );
    }

    // Increment view count (fire and forget)
    supabase.rpc('increment_share_view_count', { share_id: shareId }).then(({ error: viewError }) => {
      if (viewError) {
        logger.warn('[ShareCalc] Failed to increment view count', { shareId, error: viewError.message });
      }
    });

    logger.info('[ShareCalc] Share accessed', { shareId, tool: sharedCalc.tool, viewCount: sharedCalc.view_count + 1 });
    return NextResponse.json({
      success: true,
      tool: sharedCalc.tool,
      data: sharedCalc.data,
      createdAt: sharedCalc.created_at,
      viewCount: sharedCalc.view_count + 1
    });
  } catch (error) {
    return errorResponse(error);
  }
}

