/**
 * ADMIN ENDPOINT: Backfill missing profiles from Clerk
 *
 * Checks for users in user_profiles who are missing from profiles table
 * and creates the missing records by fetching email from Clerk
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(_req: NextRequest) {
  try {
    // Check if user is authenticated and is staff
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is staff (has @slimmugnai.com or @garrisonledger.com email)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();

    const isStaff =
      profile?.email?.endsWith("@slimmugnai.com") ||
      profile?.email?.endsWith("@garrisonledger.com");

    if (!isStaff) {
      return NextResponse.json({ error: "Forbidden - Staff only" }, { status: 403 });
    }

    // Find users in user_profiles who are missing from profiles
    const { data: _missingUsers, error: queryError } = await supabaseAdmin.rpc(
      "get_missing_profiles",
      {}
    );

    if (queryError) {
      // Fallback: manual query
      const { data: userProfiles } = await supabaseAdmin.from("user_profiles").select("user_id");

      const { data: existingProfiles } = await supabaseAdmin.from("profiles").select("id");

      const existingIds = new Set(existingProfiles?.map((p) => p.id) || []);
      const missing = userProfiles?.filter((up) => !existingIds.has(up.user_id)) || [];

      console.log("[BackfillProfiles] Missing users:", missing.length);

      // Fetch emails from Clerk and create profiles
      const clerk = await clerkClient();
      const results = [];

      for (const { user_id } of missing) {
        try {
          const clerkUser = await clerk.users.getUser(user_id);
          const email = clerkUser.emailAddresses[0]?.emailAddress;

          if (!email) {
            console.warn("[BackfillProfiles] No email for user:", user_id);
            results.push({ user_id, status: "no_email", email: null });
            continue;
          }

          // Insert into profiles table
          const { error: insertError } = await supabaseAdmin
            .from("profiles")
            .insert([{ id: user_id, email }]);

          if (insertError) {
            console.error("[BackfillProfiles] Insert failed:", user_id, insertError);
            results.push({ user_id, status: "error", email, error: insertError.message });
          } else {
            console.log("[BackfillProfiles] Created profile:", user_id, email.split("@")[1]);
            results.push({ user_id, status: "created", email: email.split("@")[1] });
          }
        } catch (clerkError) {
          console.error("[BackfillProfiles] Clerk fetch failed:", user_id, clerkError);
          results.push({ user_id, status: "clerk_error", error: String(clerkError) });
        }
      }

      return NextResponse.json({
        success: true,
        processed: results.length,
        results,
      });
    }

    return NextResponse.json({ success: true, message: "No missing profiles found" });
  } catch (error) {
    console.error("[BackfillProfiles] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
