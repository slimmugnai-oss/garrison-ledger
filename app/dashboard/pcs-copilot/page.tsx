import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import Icon from "@/app/components/ui/Icon";
import { supabaseAdmin } from "@/lib/supabase/admin";

import SimplifiedPCSClient from "./SimplifiedPCSClient";

export const metadata: Metadata = {
  title: "PCS Copilot | Garrison Ledger",
  description:
    "AI-powered PCS reimbursement assistant with manual entry, real-time validation, and comprehensive JTR compliance.",
};

export default async function PCSCopilotPage() {
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

  // Get user's claims
  const { data: claims } = await supabaseAdmin
    .from("pcs_claims")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("rank, branch, current_base, has_dependents")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-700 py-16 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="Truck" className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">PCS COPILOT</span>
              </div>

              <h1 className="font-lora mb-6 text-5xl font-bold leading-tight">PCS Copilot</h1>

              <p className="mb-8 text-xl leading-relaxed text-blue-100">
                Calculate your official PCS entitlements in 15 minutes. Based on 2025 DFAS rates
                with JTR validation. Professional calculation worksheet for your DD Form 1351-2.
              </p>

              {/* Enhanced Features */}
              <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>15-minute calculation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>100% JTR compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Official 2025 rates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Finance office ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <SimplifiedPCSClient
          initialClaims={claims || []}
          isPremium={isPremium}
          tier={tier}
          userProfile={{
            rank: profile?.rank,
            branch: profile?.branch,
            currentBase: profile?.current_base,
            hasDependents: profile?.has_dependents,
          }}
        />
      </main>
      <Footer />
    </>
  );
}
