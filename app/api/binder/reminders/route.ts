import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { isPremiumServer } from "@/lib/premium";
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

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

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { searchParams } = new URL(req.url);
    const daysAhead = parseInt(searchParams.get("days") || "60");

    // Validate days parameter
    if (daysAhead < 1 || daysAhead > 365) {
      throw Errors.invalidInput("Days must be between 1 and 365");
    }

    const supabase = getAdminClient();

    // Get files with expiration dates in the next N days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data: files, error } = await supabase
      .from("binder_files")
      .select("*")
      .eq("user_id", userId)
      .not("expires_on", "is", null)
      .lte("expires_on", futureDate.toISOString().split("T")[0])
      .gte("expires_on", new Date().toISOString().split("T")[0])
      .order("expires_on", { ascending: true });

    if (error) {
      logger.error('[BinderReminders] Failed to fetch reminders', error, { userId, daysAhead });
      throw Errors.databaseError("Failed to fetch reminders");
    }

    // Check if premium for reminder limits
    const isPremium = await isPremiumServer(userId);
    const reminderLimit = isPremium ? null : 3;

    const limitedFiles = reminderLimit ? files?.slice(0, reminderLimit) : files;

    logger.info('[BinderReminders] Reminders fetched', { 
      userId, 
      total: files?.length || 0,
      returned: limitedFiles?.length || 0,
      isPremium,
      daysAhead
    });

    return NextResponse.json({
      reminders: limitedFiles || [],
      total: files?.length || 0,
      isPremium,
      limit: reminderLimit
    });
  } catch (error) {
    return errorResponse(error);
  }
}

