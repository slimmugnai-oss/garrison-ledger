/**
 * DASHBOARD - TOOLS-FIRST (v5.0)
 *
 * Clean, focused dashboard highlighting 4 premium tools
 * Removes all assessment/plan clutter
 */

import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ensureUserExists } from "@/lib/ensure-user-exists";
import { supabaseAdmin } from "@/lib/supabase/admin";

import ProfileSummaryWidget from "../components/dashboard/ProfileSummaryWidget";
import Footer from "../components/Footer";
import Header from "../components/Header";
import AnimatedCard from "../components/ui/AnimatedCard";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";

export const metadata: Metadata = {
  title: "Dashboard - Garrison Ledger",
  description:
    "Your military financial intelligence command center. Access 4 premium tools: LES Auditor, PCS Copilot, Base Navigator, and Ask Assistant.",
};

export default async function Dashboard() {
  const user = await ensureUserExists();
  if (!user) redirect("/sign-in");

  // Check premium status
  const { data: entitlement } = await supabaseAdmin
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === "premium" && entitlement?.status === "active";

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const profileComplete = profile?.profile_completed || false;

  // Get usage stats
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);

  const { count: lesUploads } = await supabaseAdmin
    .from("les_uploads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", firstDayOfMonth.toISOString());

  // Get knowledge sources count
  const { count: knowledgeSources } = await supabaseAdmin
    .from("knowledge_embeddings")
    .select("*", { count: "exact", head: true });

  const knowledgeSourcesFormatted = knowledgeSources
    ? new Intl.NumberFormat("en-US").format(knowledgeSources)
    : "2,300+";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="font-lora mb-2 text-4xl font-bold text-gray-900">
              Welcome back, {user.firstName || "Service Member"}
            </h1>
            <p className="text-lg text-gray-600">
              Your military financial intelligence command center
            </p>
          </div>

          {/* Premium Badge */}
          {isPremium && (
            <div className="mb-8 rounded-lg border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-6">
              <div className="flex items-center gap-3">
                <Icon name="Star" className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Premium Member</h3>
                  <p className="text-sm text-yellow-800">Unlimited access to all 4 premium tools</p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Summary Widget */}
          <div className="mb-12">
            <ProfileSummaryWidget
              profile={profile || {}}
              userName={user.firstName || "Service Member"}
            />
          </div>

          {/* 4 Premium Tools - Hero Section */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">Your Premium Tools</h2>

            {/* 2x2 Grid Layout */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              {/* LES Auditor */}
              <AnimatedCard delay={0}>
                <Link
                  href="/dashboard/paycheck-audit"
                  className="block h-full rounded-lg border-2 border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex h-full flex-col">
                    {/* Badge */}
                    <div className="mb-3">
                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-1 text-xs font-bold text-white">
                          <Icon name="CheckCircle" className="h-3 w-3" />
                          PREMIUM ACTIVE
                        </span>
                      ) : (
                        <Badge variant="warning">
                          <Icon name="Lock" className="mr-1 inline h-3 w-3" />
                          Limited
                        </Badge>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                      <Icon name="DollarSign" className="h-8 w-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-xl font-bold text-gray-900">LES Auditor</h3>

                    {/* Description */}
                    <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-700">
                      <strong>Automated pay verification.</strong> Compare your LES against official
                      2025 DFAS rates. Flags discrepancies in BAH, BAS, COLA, taxes, and deductions
                      with JTR-cited validation checks.
                    </p>

                    {/* Stats */}
                    <div className="mt-auto space-y-2 border-t border-green-200 pt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>🔍 10+ validation checks</span>
                        <span>⚡ Instant results</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-green-700">
                          ✓ Official DFAS rates
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          {isPremium ? "Unlimited audits" : `${lesUploads || 0}/1 free`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>

              {/* Base Navigator */}
              <AnimatedCard delay={0.1}>
                <Link
                  href="/dashboard/navigator"
                  className="block h-full rounded-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-6 transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex h-full flex-col">
                    {/* Badge */}
                    <div className="mb-3">
                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1 text-xs font-bold text-white">
                          <Icon name="MapPin" className="h-3 w-3" />
                          PREMIUM ACTIVE
                        </span>
                      ) : (
                        <Badge variant="warning">
                          <Icon name="Lock" className="mr-1 inline h-3 w-3" />
                          Preview
                        </Badge>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                      <Icon name="MapPin" className="h-8 w-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-xl font-bold text-gray-900">Base Navigator</h3>

                    {/* Description */}
                    <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-700">
                      <strong>Base intelligence made simple.</strong> Compare neighborhoods near
                      major installations with school ratings, rental market data, weather, and
                      commute insights.
                    </p>

                    {/* Stats */}
                    <div className="mt-auto space-y-2 border-t border-blue-200 pt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>🗺️ 64 bases covered</span>
                        <span>📊 Cached data (30-day)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-700">
                          🏫 School ratings included
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          {isPremium ? "Full rankings" : "Top 3 previews"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>

              {/* PCS Copilot */}
              <AnimatedCard delay={0.2}>
                <Link
                  href="/dashboard/pcs-copilot"
                  className="block h-full rounded-lg border-2 border-orange-300 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex h-full flex-col">
                    {/* Badge */}
                    <div className="mb-3">
                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 px-3 py-1 text-xs font-bold text-white">
                          <Icon name="Shield" className="h-3 w-3" />
                          PREMIUM ACTIVE
                        </span>
                      ) : (
                        <Badge variant="warning">
                          <Icon name="Lock" className="mr-1 inline h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 shadow-lg">
                      <Icon name="Truck" className="h-8 w-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-xl font-bold text-gray-900">PCS Copilot</h3>

                    {/* Description */}
                    <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-700">
                      <strong>Track PCS reimbursements & entitlements.</strong> Calculate DLA,
                      mileage, per diem, and DITY reimbursements using official 2025 JTR rates and
                      automated validation.
                    </p>

                    {/* Stats */}
                    <div className="mt-auto space-y-2 border-t border-orange-200 pt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>📋 JTR 2025 compliant</span>
                        <span>⚡ Auto-calculates</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-orange-700">
                          💰 Track all entitlements
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          {isPremium ? "Unlimited claims" : "Premium only"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>

              {/* Ask Our Military Expert */}
              <AnimatedCard delay={0.3}>
                <Link
                  href="/dashboard/ask"
                  className="block h-full rounded-lg border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6 transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex h-full flex-col">
                    {/* Badge: "NEW EXPERT MODE" */}
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-xs font-bold text-white">
                        <Icon name="Sparkles" className="h-3 w-3" />
                        EXPERT MODE ACTIVE
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                      <Icon name="MessageCircle" className="h-8 w-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                      Ask Our Military Expert
                    </h3>

                    {/* Description */}
                    <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-700">
                      <strong>All-knowing military advisor.</strong> Ask questions, upload documents 
                      (LES, orders, contracts), compare bases, generate PCS/deployment timelines. 
                      Covers finance, career, relationships, mental health, and transition planning.
                    </p>

                    {/* Stats Row */}
                    <div className="mt-auto space-y-2 border-t border-indigo-200 pt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>📊 {knowledgeSourcesFormatted} knowledge sources</span>
                        <span>⚡ ~2 sec response</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-700">
                          ⭐⭐⭐⭐⭐ 98% helpful rating
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          {isPremium ? "∞ Unlimited" : "5Q+1U+2C+2T/mo"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">Recent Activity</h2>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="space-y-4">
                {/* LES Audits This Month */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <Icon name="DollarSign" className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">LES Audits</div>
                      <div className="text-sm text-gray-600">This month</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{lesUploads || 0}</div>
                    <div className="text-xs text-gray-500">
                      {isPremium ? "Unlimited" : "1 free/month"}
                    </div>
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Icon name="User" className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Profile</div>
                      <div className="text-sm text-gray-600">Setup status</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {profileComplete ? "100%" : "Incomplete"}
                    </div>
                    {!profileComplete && (
                      <Link
                        href="/dashboard/profile/setup"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Complete now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculators */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">Financial Calculators</h2>

            <div className="grid gap-4 md:grid-cols-3">
              {/* TSP Calculator */}
              <Link
                href="/dashboard/tools/tsp-modeler"
                className="group rounded-lg border-2 border-blue-200 bg-white p-6 transition-all hover:scale-105 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
                    <Icon name="TrendingUp" className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    RETIREMENT
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">TSP Calculator</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Model fund allocations and project retirement growth
                </p>
                <div className="text-xs font-semibold text-blue-600">
                  See your retirement projection →
                </div>
              </Link>

              {/* SDP Calculator */}
              <Link
                href="/dashboard/tools/sdp-strategist"
                className="group rounded-lg border-2 border-green-200 bg-white p-6 transition-all hover:scale-105 hover:border-green-300 hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200">
                    <Icon name="DollarSign" className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    DEPLOYMENT
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">SDP Calculator</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Calculate deployment savings returns with 10% APY
                </p>
                <div className="text-xs font-semibold text-green-600">
                  Maximize deployment savings →
                </div>
              </Link>

              {/* House Hacking Calculator */}
              <Link
                href="/dashboard/tools/house-hacking"
                className="group rounded-lg border-2 border-purple-200 bg-white p-6 transition-all hover:scale-105 hover:border-purple-300 hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200">
                    <Icon name="Home" className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                    INVESTING
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">House Hacking Calculator</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Estimate VA loan rental cash flow potential
                </p>
                <div className="text-xs font-semibold text-purple-600">Calculate cash flow →</div>
              </Link>

              {/* PCS Budget Calculator */}
              <Link
                href="/dashboard/tools/pcs-planner"
                className="group rounded-lg border-2 border-orange-200 bg-white p-6 transition-all hover:scale-105 hover:border-orange-300 hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200">
                    <Icon name="Truck" className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                    PCS
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">PCS Budget Calculator</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Estimate move costs using official JTR rates
                </p>
                <div className="text-xs font-semibold text-orange-600">Plan your move budget →</div>
              </Link>

              {/* On-Base Savings */}
              <Link
                href="/dashboard/tools/on-base-savings"
                className="group rounded-lg border-2 border-indigo-200 bg-white p-6 transition-all hover:scale-105 hover:border-indigo-300 hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 group-hover:bg-indigo-200">
                    <Icon name="Shield" className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    SAVINGS
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">On-Base Savings</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Estimate commissary and exchange savings annually
                </p>
                <div className="text-xs font-semibold text-indigo-600">
                  Calculate your savings →
                </div>
              </Link>

              {/* Career Comparison Calculator */}
              <Link
                href="/dashboard/tools/salary-calculator"
                className="group rounded-lg border-2 border-cyan-200 bg-white p-6 transition-all hover:scale-105 hover:border-cyan-300 hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 group-hover:bg-cyan-200">
                    <Icon name="Calculator" className="h-6 w-6 text-cyan-600" />
                  </div>
                  <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700">
                    CAREER
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">Career Comparison</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Compare job offers with COL and tax adjustments
                </p>
                <div className="text-xs font-semibold text-cyan-600">
                  Compare offers accurately →
                </div>
              </Link>
            </div>
          </div>

          {/* Upgrade Prompt (Free Users Only) */}
          {!isPremium && (
            <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center">
              <Icon name="Star" className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Unlock Unlimited Access</h3>
              <p className="mx-auto mb-6 max-w-2xl text-gray-700">
                Upgrade to Premium for unlimited LES audits, full Base Navigator rankings, unlimited
                PCS tracking, and more.
              </p>
              <Link
                href="/dashboard/upgrade"
                className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
              >
                Upgrade to Premium - $9.99/month →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
