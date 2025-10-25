import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Icon from "@/app/components/ui/Icon";
import PCSCopilotClient from "./PCSCopilotClient";

export const metadata: Metadata = {
  title: "PCS Money Copilot | Garrison Ledger",
  description:
    "AI-powered PCS reimbursement assistant. Upload receipts, get instant estimates, catch errors before finance does.",
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
    .select("rank, branch, current_base")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-700 py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="Truck" className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">MAXIMIZE PCS PROFIT</span>
              </div>

              <h1 className="font-lora mb-6 text-5xl font-bold leading-tight">PCS Money Copilot</h1>

              <p className="mb-8 text-xl leading-relaxed text-blue-100">
                Turn your PCS move into profit. Upload receipts, track reimbursements, and catch
                errors before finance does.
              </p>

              {/* Trust Badges */}
              <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>DITY move optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Receipt auto-categorization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Real-time claim tracking</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <PCSCopilotClient
          initialClaims={claims || []}
          isPremium={isPremium}
          tier={tier}
          userProfile={{
            rank: profile?.rank,
            branch: profile?.branch,
            currentBase: profile?.current_base,
          }}
        />
      </main>
      <Footer />
    </>
  );
}
