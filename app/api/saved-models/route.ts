import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();
    
    const tool = req.nextUrl.searchParams.get("tool");
    if (!tool) throw Errors.invalidInput("tool parameter is required");

    const { data, error } = await supabase
      .from("saved_models")
      .select("input, output")
      .eq("user_id", userId)
      .eq("tool", tool)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error('[SavedModels] Failed to fetch saved model', error, { userId, tool });
      throw Errors.databaseError("Failed to fetch saved model");
    }

    logger.info('[SavedModels] Saved model fetched', { userId, tool, hasData: !!data });
    return NextResponse.json({ input: data?.input ?? null, output: data?.output ?? null });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { tool, input, output } = await req.json();
    if (!tool || !input) throw Errors.invalidInput("tool and input are required");

    const { error } = await supabase
      .from("saved_models")
      .upsert({
        user_id: userId,
        tool,
        input,
        output: output || null
      }, {
        onConflict: 'user_id,tool'
      });

    if (error) {
      logger.error('[SavedModels] Failed to save model', error, { userId, tool });
      throw Errors.databaseError("Failed to save model");
    }

    logger.info('[SavedModels] Model saved', { userId, tool });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
