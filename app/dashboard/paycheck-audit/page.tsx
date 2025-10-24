/**
 * LES & PAYCHECK AUDITOR
 *
 * Upload LES PDF → Parse → Compare vs expected pay → Generate flags
 * Premium feature: Unlimited audits (free: 1/month)
 */

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { LesAuditAlwaysOn } from "@/app/components/les/LesAuditAlwaysOn";
import ProfileIncompletePrompt from "@/app/components/les/ProfileIncompletePrompt";
import { getUserTier } from "@/lib/auth/subscription";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LES & Paycheck Auditor | Garrison Ledger",
  description:
    "Catch pay errors before you do. Upload your LES, verify BAH/BAS/COLA, detect underpayments.",
};

export default async function PaycheckAuditPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get subscription tier
  const tier = await getUserTier(user.id);
  console.log("[PaycheckAuditPage] User ID:", user.id, "Tier:", tier);

  // Debug: Check if user email matches staff bypass
  const { data: staffProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();
  console.log("[PaycheckAuditPage] Staff profile email:", staffProfile?.email);

  // Get user profile (for BAH/grade context)
  const { data: profile } = await supabase
    .from("user_profiles")
    .select(
      "rank, current_base, has_dependents, paygrade, mha_code, mha_code_override, years_of_service"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  // Check profile completeness (need computed fields for audit)
  const missingFields: string[] = [];
  if (!profile?.rank) missingFields.push("rank");
  if (!profile?.current_base) missingFields.push("current_base");
  if (profile?.has_dependents === null || profile?.has_dependents === undefined) {
    missingFields.push("has_dependents");
  }

  // Also check computed fields needed by backend
  if (!profile?.paygrade) missingFields.push("paygrade");
  const mhaCode = profile?.mha_code_override || profile?.mha_code;
  if (!mhaCode) missingFields.push("mha_code");

  const profileComplete = missingFields.length === 0;

  return (
    <>
      <Header />
      {!profileComplete ? (
        <ProfileIncompletePrompt missingFields={missingFields} />
      ) : (
        <LesAuditAlwaysOn
          tier={tier}
          userProfile={{
            paygrade: profile?.paygrade,
            yos: profile?.years_of_service,
            mhaCode: mhaCode,
            hasDependents: profile?.has_dependents,
          }}
        />
      )}
      <Footer />
    </>
  );
}
