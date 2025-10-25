/**
 * UPGRADE PAGE - COMPREHENSIVE REDESIGN (v6.0)
 *
 * Offers both Premium subscription AND Ask Assistant question packs
 * Clean, sophisticated, military-professional aesthetic
 */

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ssot } from "@/lib/ssot";

import BillingPortalButton from "../../components/BillingPortalButton";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Icon from "../../components/ui/Icon";

import UpgradePageClient from "./UpgradePageClient";

export const metadata: Metadata = {
  title: "Upgrade to Premium - Garrison Ledger",
  description:
    "Unlimited access to 5 premium tools or buy Ask Assistant question packs. Choose the plan that fits your needs.",
};

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: { feature?: string };
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === "premium" && entitlement?.status === "active";

  if (isPremium) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <Icon name="Star" className="mx-auto mb-6 h-16 w-16 text-yellow-500" />
            <h1 className="mb-4 text-4xl font-bold text-gray-900">You're Already Premium!</h1>
            <p className="mb-8 text-xl text-gray-600">Enjoy unlimited access to all 5 tools</p>
            <BillingPortalButton />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Pass pricing data from SSOT to client component
  const pricingData = {
    subscription: ssot.pricing.subscription,
    questionPacks: ssot.pricing.questionPacks,
  };

  return (
    <>
      <Header />
      <UpgradePageClient pricingData={pricingData} feature={searchParams.feature} />
      <Footer />
    </>
  );
}
