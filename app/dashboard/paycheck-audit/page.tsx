/**
 * LES & PAYCHECK AUDITOR
 *
 * Upload LES PDF → Parse → Compare vs expected pay → Generate flags
 * Premium feature: Unlimited audits (free: 1/month)
 */

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { LesAuditAlwaysOn } from "@/app/components/les/LesAuditAlwaysOn";
import ProfileIncompletePrompt from "@/app/components/les/ProfileIncompletePrompt";
import Icon from "@/app/components/ui/Icon";
import { getUserTier } from "@/lib/auth/subscription";
import Link from "next/link";

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

  // Premium-only feature gate
  const isPremium = tier === "premium" || tier === "staff";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-700 py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="DollarSign" className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">CATCH PAY ERRORS</span>
              </div>

              <h1 className="font-lora mb-6 text-5xl font-bold leading-tight">
                LES & Paycheck Auditor
              </h1>

              <p className="mb-8 text-xl leading-relaxed text-blue-100">
                Upload your LES and verify every dollar. Catch BAH errors, missing allowances, and
                underpayments before they cost you.
              </p>

              {/* Trust Badges */}
              <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Official DFAS pay tables</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Line-by-line verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Instant error detection</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        {!isPremium ? (
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 p-12 text-center shadow-lg">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
                <Icon name="Lock" className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                LES Auditor is a Premium Feature
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-700">
                Professional-grade pay auditing with dynamic line item management, support for all
                special pays, and comprehensive error detection.
              </p>
              <div className="mb-8 rounded-lg bg-white p-6 text-left shadow-sm">
                <h3 className="mb-4 font-semibold text-gray-900">Premium Features:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <span>Upload unlimited LES documents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <span>Dynamic line item editor (add any pay type)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <span>Support for all special pays (SDAP, Flight Pay, etc.)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <span>Complete audit results with variance analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <span>Save and export audit history</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/upgrade?feature=les-auditor"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Icon name="Crown" className="h-5 w-5" />
                Upgrade to Premium
              </Link>
              <p className="mt-4 text-sm text-gray-600">$9.99/month or $99/year • Cancel anytime</p>
            </div>
          </div>
        ) : !profileComplete ? (
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
      </main>
      <Footer />
    </>
  );
}
