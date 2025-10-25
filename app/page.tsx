/**
 * HOME PAGE - TOOLS-FIRST (v5.0)
 *
 * Clear value prop: 4 premium tools for military finance
 */

import Header from "./components/Header";
import Footer from "./components/Footer";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Icon from "./components/ui/Icon";
import AnimatedCard from "./components/ui/AnimatedCard";

export const metadata = {
  title: "Garrison Ledger - Military Financial Intelligence Platform",
  description:
    "5 premium tools for military families: LES Auditor catches pay errors automatically, Base Navigator finds your perfect neighborhood, PCS Copilot maximizes DITY profit, TDY Copilot builds vouchers fast, Ask Assistant answers military finance questions with official data.",
};

export default function Home() {
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
              5 premium tools built for military families. Audit your pay. Navigate bases. Build
              vouchers. Track moves. Always-current intel.
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
      <section className="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Headline + Copy */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="Sparkles" className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">NEW: Expert Mode Active</span>
              </div>

              <h2 className="font-lora mb-6 text-5xl font-bold leading-tight">
                Your 24/7 Military Life Expert
              </h2>

              <p className="mb-6 text-xl leading-relaxed text-blue-100">
                Stop Googling. Stop waiting for Facebook responses. Get instant, expert answers to ANY military life question—financial, PCS, deployment, career, benefits, base life.
              </p>

              <ul className="mb-8 space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
                  <span><strong>1,410 knowledge sources</strong> + official DFAS/VA/TSP data</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
                  <span><strong>Personalized to YOUR situation</strong> (rank, base, family status)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
                  <span><strong>Instant answers in ~2 seconds</strong> with step-by-step guidance</span>
                </li>
              </ul>

              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 text-lg font-bold text-gray-900 hover:from-yellow-500 hover:to-orange-600">
                    Ask Your First Question Free →
                  </button>
                </SignUpButton>
                <p className="mt-3 text-sm text-blue-200">
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
                <p className="mb-2 text-sm font-semibold text-blue-200">Example Question:</p>
                <p className="mb-3 text-lg font-medium">"What's my BAH as an E-5 at Fort Hood with dependents?"</p>
                <div className="rounded-md bg-white/20 p-3 text-sm">
                  <p className="font-semibold text-yellow-400">Expert Answer:</p>
                  <p className="mt-1 text-blue-50">
                    "Your BAH at Fort Hood (Killeen, TX MHA) as an E-5 with dependents is <strong>$1,773/month</strong> (2025 rates). This covers a 3BR house in Killeen ($1,400-1,600/mo), leaving $200-300 for utilities..."
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

              <p className="text-center text-sm text-blue-300">
                + deployment, career, benefits, base life, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Premium Tools */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-lora mb-4 text-4xl font-bold text-gray-900">5 Premium Tools</h2>
            <p className="text-xl text-gray-600">Everything you need to master military finances</p>
          </div>

          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* LES Auditor */}
            <AnimatedCard>
              <div className="h-full rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Icon name="DollarSign" className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">LES Auditor</h3>
                <p className="mb-3 text-sm text-gray-700">Catch pay errors. Verify BAH/BAS/COLA.</p>
                <div className="text-xs font-semibold text-green-700">
                  Members find $500+ errors
                </div>
              </div>
            </AnimatedCard>

            {/* PCS Copilot */}
            <AnimatedCard delay={0.1}>
              <div className="h-full rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <Icon name="Truck" className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">PCS Copilot</h3>
                <p className="mb-3 text-sm text-gray-700">
                  Maximize DITY move profit. Track expenses.
                </p>
                <div className="text-xs font-semibold text-orange-700">
                  Avg $2,400 profit per PCS
                </div>
              </div>
            </AnimatedCard>

            {/* Base Navigator */}
            <AnimatedCard delay={0.2}>
              <div className="h-full rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Icon name="MapPin" className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Base Navigator</h3>
                <p className="mb-3 text-sm text-gray-700">
                  Find perfect neighborhood. Schools + rent.
                </p>
                <div className="text-xs font-semibold text-blue-700">203 bases ranked</div>
              </div>
            </AnimatedCard>

            {/* TDY Copilot */}
            <AnimatedCard delay={0.3}>
              <div className="h-full rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Icon name="File" className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">TDY Copilot</h3>
                <p className="mb-3 text-sm text-gray-700">Build travel vouchers in 20 min.</p>
                <div className="text-xs font-semibold text-purple-700">Save 2+ hours per trip</div>
              </div>
            </AnimatedCard>

            {/* Ask Our Military Expert */}
            <AnimatedCard delay={0.4}>
              <div className="h-full rounded-lg border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6 shadow-lg">
                {/* NEW Badge */}
                <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-2 py-1 text-xs font-bold text-white">
                  <Icon name="Sparkles" className="h-3 w-3" />
                  EXPERT MODE
                </div>

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
                  <Icon name="MessageCircle" className="h-6 w-6 text-white" />
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-900">Ask Our Military Expert</h3>

                <p className="mb-3 text-sm text-gray-700">
                  <strong>24/7 military life advisor.</strong> Financial, PCS, deployment, career, benefits—instant expert answers.
                </p>

                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-indigo-700">📊 1,410 knowledge sources</div>
                  <div className="font-semibold text-indigo-700">⚡ ~2 sec response time</div>
                  <div className="font-semibold text-indigo-700">⭐ 9.2/10 answer quality</div>
                </div>
              </div>
            </AnimatedCard>
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
                <span className="text-gray-700">Unlimited TDY receipts & vouchers</span>
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
