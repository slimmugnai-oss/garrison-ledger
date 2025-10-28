import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { supabaseAdmin } from "@/lib/supabase/admin";

import PCSUnifiedWizard from "@/app/components/pcs/PCSUnifiedWizard";

export const metadata: Metadata = {
  title: "Edit PCS Claim | Garrison Ledger",
  description: "Edit your PCS claim and update entitlements.",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPCSClaimPage({ params }: PageProps) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Check premium status
  const { data: entitlement } = await supabaseAdmin
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const tier = entitlement?.tier || "free";
  const isPremium = tier === "premium" && entitlement?.status === "active";

  // PREMIUM-ONLY FEATURE: Block free users completely
  if (!isPremium) {
    redirect("/dashboard/upgrade?feature=pcs-copilot");
  }

  // Verify claim exists and belongs to user
  const { data: claim, error } = await supabaseAdmin
    .from("pcs_claims")
    .select("id, claim_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !claim) {
    redirect("/dashboard/pcs-copilot");
  }

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("rank, branch, current_base, has_dependents")
    .eq("user_id", user.id)
    .maybeSingle();

  const userProfile = {
    rank: profile?.rank || "E-4",
    branch: profile?.branch || "Army",
    currentBase: profile?.current_base || "",
    hasDependents: profile?.has_dependents || false,
  };

  return (
    <div className="min-h-screen bg-background">
      <PCSUnifiedWizard userProfile={userProfile} editClaimId={id} />
    </div>
  );
}
