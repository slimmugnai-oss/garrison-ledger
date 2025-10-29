/**
 * HOME PAGE - TOOLS-FIRST (v5.0)
 *
 * Clear value prop: 4 premium tools for military finance
 */

import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

import { supabaseAdmin } from "@/lib/supabase/admin";

import Footer from "./components/Footer";
import Header from "./components/Header";
import Icon from "./components/ui/Icon";

export const metadata = {
  title: "Garrison Ledger - Military Financial Intelligence Platform",
  description:
    "4 premium tools for military families: LES Auditor catches pay errors automatically, Base Navigator finds your perfect neighborhood, PCS Copilot maximizes DITY profit, Ask Assistant answers military finance questions with official data.",
};

export default async function Home() {
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

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-lora mb-6 text-5xl font-bold text-gray-900 lg:text-6xl">
              Military Financial Intelligence Platform
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              4 premium tools built for military families. Audit your pay. Navigate bases. Track
              moves. Get expert answers. Always-current intel.
            </p>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700">
                  Start Free Account →
                </button>
              </SignUpButton>
              <p className="mt-3 text-sm text-gray-600">
                Free tier includes: 5 Ask Assistant questions/month, 1 LES audit/month, basic
                calculators
              </p>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
              >
                Go to Dashboard →
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Military Expert Spotlight - New Section */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Headline + Copy */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="Sparkles" className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">
                  NEW: Expert Mode Active
                </span>
              </div>

              <h2 className="font-lora mb-6 text-5xl font-bold leading-tight">
                Your 24/7 Military Life Expert
              </h2>

              <p className="mb-6 text-xl leading-relaxed text-slate-200">
                Stop Googling. Stop waiting for Facebook responses. Get instant, expert answers to
                ANY military life question—financial, PCS, deployment, career, benefits, base life.
              </p>

              <ul className="mb-8 space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
                  <span>
                    <strong>{knowledgeSourcesFormatted} knowledge sources</strong> + official
                    DFAS/VA/TSP data
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
                  <span>
                    <strong>Personalized to YOUR situation</strong> (rank, base, family status)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
                  <span>
                    <strong>Instant answers in ~2 seconds</strong> with step-by-step guidance
                  </span>
                </li>
              </ul>

              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 text-lg font-bold text-gray-900 hover:from-yellow-500 hover:to-orange-600">
                    Ask Your First Question Free →
                  </button>
                </SignUpButton>
                <p className="mt-3 text-sm text-slate-300">
                  5 free questions/month • No credit card required
                </p>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard/ask"
                  className="inline-block rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 text-lg font-bold text-gray-900 hover:from-yellow-500 hover:to-orange-600"
                >
                  Ask Our Military Expert →
                </Link>
              </SignedIn>
            </div>

            {/* Right: Example Questions Preview */}
            <div className="space-y-4">
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <p className="mb-2 text-sm font-semibold text-yellow-300">Example Question:</p>
                <p className="mb-3 text-lg font-medium">
                  "What's my BAH as an E-5 at Fort Hood with dependents?"
                </p>
                <div className="rounded-md bg-white/20 p-3 text-sm">
                  <p className="font-semibold text-yellow-400">Expert Answer:</p>
                  <p className="mt-1 text-slate-100">
                    "Your BAH at Fort Hood (Killeen, TX MHA) as an E-5 with dependents is{" "}
                    <strong>$1,773/month</strong> (2025 rates). This covers a 3BR house in Killeen
                    ($1,400-1,600/mo), leaving $200-300 for utilities..."
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  💰 "How does SDP work?"
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  🚚 "DITY move profit tips?"
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  🎖️ "Should I take the SRB?"
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  🏠 "On-base vs off-base?"
                </div>
              </div>

              <p className="text-center text-sm text-slate-300">
                + deployment, career, benefits, base life, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LES Auditor Spotlight */}
      <section className="mt-px bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Headline + Copy */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="Shield" className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">CATCH PAY ERRORS</span>
              </div>

              <h2 className="font-lora mb-6 text-5xl font-bold leading-tight">
                Your Personal Pay Guard
              </h2>

              <p className="mb-6 text-xl leading-relaxed text-slate-200">
                Stop losing money to pay errors. Automatic auditing catches BAH mistakes, COLA
                discrepancies, and missing allowances before they cost you thousands.
              </p>

              {/* Zero Storage Security Highlight */}
              <div className="mb-6 rounded-lg border-2 border-green-500 bg-green-500/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Icon name="Shield" className="h-6 w-6 text-green-400" />
                  <div>
                    <p className="font-bold text-green-400">Military-Grade Security</p>
                    <p className="text-sm text-green-200">
                      We delete your LES immediately after processing. Zero SSN or bank account
                      storage.
                    </p>
                  </div>
                </div>
              </div>

              <ul className="mb-8 space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
                  <span>
                    <strong>16,368 BAH rates</strong> verified and auto-populated
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
                  <span>
                    <strong>Catches $500+ errors average</strong> per member per year
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
                  <span>
                    <strong>3-minute audit process</strong> with instant error alerts
                  </span>
                </li>
              </ul>

              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-lg font-bold text-white hover:from-green-600 hover:to-emerald-700">
                    Audit My LES Free →
                  </button>
                </SignUpButton>
                <p className="mt-3 text-sm text-slate-300">
                  1 free audit/month • No credit card required
                </p>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard/les-auditor"
                  className="inline-block rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-lg font-bold text-white hover:from-green-600 hover:to-emerald-700"
                >
                  Audit My LES →
                </Link>
              </SignedIn>
            </div>

            {/* Right: Example Audit Preview */}
            <div className="space-y-4">
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <p className="mb-2 text-sm font-semibold text-green-300">Example Audit Result:</p>
                <p className="mb-3 text-lg font-medium">E-5 @ Fort Bragg, NC (2025)</p>
                <div className="rounded-md bg-white/20 p-3 text-sm">
                  <p className="font-semibold text-green-400">⚠️ Error Detected:</p>
                  <p className="mt-1 text-slate-100">
                    Expected BAH: <strong className="text-green-400">$1,959</strong>
                    <br />
                    Your LES shows: <strong className="text-red-400">$1,812</strong>
                    <br />
                    <strong className="text-yellow-400">Missing: $147/month → $1,764/year</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  ✓ BAH verified
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  ✓ BAS correct
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  ✓ COLA matched
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  ✓ Tax withholdings
                </div>
              </div>

              <p className="text-center text-sm text-slate-300">
                Automatic error detection across all pay components
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PCS Copilot Spotlight */}
      <section className="mt-px bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Headline + Copy */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="Truck" className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">MAXIMIZE DITY PROFIT</span>
              </div>

              <h2 className="font-lora mb-6 text-5xl font-bold leading-tight">
                Your PCS Money Machine
              </h2>

              <p className="mb-6 text-xl leading-relaxed text-slate-200">
                Stop leaving money on the table. Track every DITY move expense, maximize your
                profit, and turn your PCS into a $2,000+ payday.
              </p>

              <ul className="mb-8 space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-orange-400" />
                  <span>
                    <strong>Average $2,400 profit</strong> per DITY move
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-orange-400" />
                  <span>
                    <strong>Receipt tracking built-in</strong> with photo capture
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-orange-400" />
                  <span>
                    <strong>Official JTR weight tables</strong> for accurate payments
                  </span>
                </li>
              </ul>

              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-8 py-4 text-lg font-bold text-white hover:from-orange-600 hover:to-red-700">
                    Start My PCS →
                  </button>
                </SignUpButton>
                <p className="mt-3 text-sm text-slate-300">
                  Free for all members • Track unlimited moves
                </p>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard/pcs-copilot"
                  className="inline-block rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-8 py-4 text-lg font-bold text-white hover:from-orange-600 hover:to-red-700"
                >
                  Start My PCS →
                </Link>
              </SignedIn>
            </div>

            {/* Right: Example Expense Tracker */}
            <div className="space-y-4">
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <p className="mb-2 text-sm font-semibold text-orange-300">Example PCS Profits:</p>
                <p className="mb-3 text-lg font-medium">Fort Hood → Fort Bragg (8,500 lbs)</p>
                <div className="rounded-md bg-white/20 p-3 text-sm">
                  <p className="font-semibold text-orange-400">💰 Profit Breakdown:</p>
                  <p className="mt-1 text-slate-100">
                    Gov't Reimbursement: <strong className="text-green-400">$3,847</strong>
                    <br />
                    Your Expenses: <strong className="text-red-400">$1,210</strong>
                    <br />
                    <strong className="text-yellow-400">Net Profit: $2,637</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  🚚 Fuel costs
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  🏨 Hotels
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  📦 Boxes
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  💪 Movers
                </div>
              </div>

              <p className="text-center text-sm text-slate-300">
                Track every expense to maximize your reimbursement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Base Navigator Spotlight */}
      <section className="mt-px bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Headline + Copy */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="MapPin" className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">FIND YOUR PERFECT BASE</span>
              </div>

              <h2 className="font-lora mb-6 text-5xl font-bold leading-tight">
                Your Next Assignment Intel
              </h2>

              <p className="mb-6 text-xl leading-relaxed text-slate-200">
                Stop guessing where to live. Get real-time housing costs, school ratings, and
                neighborhood insights for 203 military bases worldwide.
              </p>

              <ul className="mb-8 space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-blue-400" />
                  <span>
                    <strong>203 bases ranked</strong> with full cost breakdowns
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-blue-400" />
                  <span>
                    <strong>Live housing prices</strong> from Zillow integration
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-blue-400" />
                  <span>
                    <strong>Real school ratings</strong> from GreatSchools.org
                  </span>
                </li>
              </ul>

              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 px-8 py-4 text-lg font-bold text-white hover:from-blue-600 hover:to-cyan-700">
                    Explore Bases Free →
                  </button>
                </SignUpButton>
                <p className="mt-3 text-sm text-slate-300">Free tier: 5 base searches/month</p>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard/base-navigator"
                  className="inline-block rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 px-8 py-4 text-lg font-bold text-white hover:from-blue-600 hover:to-cyan-700"
                >
                  Explore Bases →
                </Link>
              </SignedIn>
            </div>

            {/* Right: Example Base Comparison */}
            <div className="space-y-4">
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <p className="mb-2 text-sm font-semibold text-blue-300">Example Base Intel:</p>
                <p className="mb-3 text-lg font-medium">Fort Bragg, NC (Rank #12)</p>
                <div className="rounded-md bg-white/20 p-3 text-sm">
                  <p className="font-semibold text-blue-400">📊 Key Stats:</p>
                  <p className="mt-1 text-slate-100">
                    Avg 3BR Rent: <strong className="text-blue-400">$1,450/mo</strong>
                    <br />
                    Top Schools: <strong className="text-green-400">9/10 rating</strong>
                    <br />
                    <strong className="text-yellow-400">BAH Coverage: 100%</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  🏠 Housing
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  🎓 Schools
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  🌤️ Weather
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
                  💰 Cost of living
                </div>
              </div>

              <p className="text-center text-sm text-slate-300">
                Real-time data from Zillow, GreatSchools, and Google Weather
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="mb-8 text-xl text-gray-600">One price. Four tools. Unlimited use.</p>

          <div className="mx-auto max-w-md rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
            <div className="mb-6">
              <div className="mb-2 text-5xl font-bold text-gray-900">
                $9.99<span className="text-2xl text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">or $99/year (save $20)</p>
            </div>

            <ul className="mb-8 space-y-3 text-left">
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Unlimited LES audits</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">50 Ask Our Military Expert questions/month</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Full Base Navigator rankings</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Unlimited PCS tracking & calculations</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">All calculators & tools</span>
              </li>
            </ul>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="w-full rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700">
                  Start Free Account →
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard/upgrade"
                className="block w-full rounded-lg bg-blue-600 px-8 py-4 text-center text-lg font-semibold text-white hover:bg-blue-700"
              >
                Upgrade Now →
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
