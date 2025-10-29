/**
 * BASE NAVIGATOR - MAIN UI
 *
 * Family Fit Score for military base neighborhoods
 * Premium feature with free preview (top 3 results)
 */

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import bases from "@/lib/data/bases-seed.json";

import BaseNavigatorClient from "./BaseNavigatorClient";

export async function generateStaticParams() {
  return bases.map((base) => ({
    base: base.code.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ base: string }>;
}): Promise<Metadata> {
  const { base } = await params;
  const baseData = bases.find((b) => b.code.toLowerCase() === base.toLowerCase());

  if (!baseData) {
    return { title: "Base Navigator" };
  }

  return {
    title: `${baseData.name} Navigator | Garrison Ledger`,
    description: `Find the best neighborhoods near ${baseData.name}. Compare schools, housing costs vs BAH, commute times, and weather.`,
  };
}

export default async function BaseNavigatorPage({ params }: { params: Promise<{ base: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { base } = await params;
  const baseCode = base.toUpperCase();

  // Find base data
  const baseData = bases.find((b) => b.code === baseCode);

  if (!baseData) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-4xl px-4">
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <h1 className="mb-4 text-2xl font-bold text-gray-900">Base Not Found</h1>
              <p className="mb-6 text-gray-600">
                Base code <code className="rounded bg-gray-100 px-2 py-1">{baseCode}</code> not
                found.
              </p>
              <Link
                href="/dashboard/navigator"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                ← Browse All Bases
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Check premium status
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

  // Redirect non-premium users to upgrade page
  if (!isPremium) {
    redirect("/dashboard/upgrade?feature=base-navigator");
  }

  // Get user profile for BAH lookup
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("rank, current_base, has_dependents")
    .eq("user_id", user.id)
    .maybeSingle();

  // Query BAH rate if profile is complete
  let bahRateCents: number | null = null;
  let bahSource: "auto" | "manual" = "manual";

  if (profile?.rank && profile?.has_dependents !== null && baseData.mha) {
    // Normalize rank format (E-6 → E06, O-3 → O03, etc.)
    const normalizedRank = profile.rank.replace(/^([EOW])-(\d)$/, "$10$2");

    const { data: bahRate } = await supabase
      .from("bah_rates")
      .select("rate_cents")
      .eq("mha", baseData.mha)
      .eq("paygrade", normalizedRank)
      .eq("with_dependents", profile.has_dependents)
      .eq("effective_date", "2025-01-01")
      .maybeSingle();

    if (bahRate) {
      bahRateCents = bahRate.rate_cents;
      bahSource = "auto";
    }
  }

  // Get user's watchlist for this base (if exists)
  const { data: watchlist } = await supabase
    .from("user_watchlists")
    .select("*")
    .eq("user_id", user.id)
    .eq("base_code", baseCode)
    .maybeSingle();

  return (
    <>
      <Header />
      <BaseNavigatorClient
        base={baseData}
        isPremium={true}
        userProfile={{
          rank: profile?.rank,
          currentBase: profile?.current_base,
          hasDependents: profile?.has_dependents,
        }}
        initialWatchlist={watchlist}
        initialBahCents={bahRateCents}
        bahSource={bahSource}
      />
      <Footer />
    </>
  );
}
