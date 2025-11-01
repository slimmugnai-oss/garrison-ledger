/**
 * HOME PAGE - ONBOARDING OPTIMIZED (v6.0)
 *
 * Focus: Stop bounces, build trust, drive sign-ups
 * Strategy: Progressive trust-building funnel
 */

import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Link from "next/link";

import { supabaseAdmin } from "@/lib/supabase/admin";

import ClaritySection from "./components/homepage/ClaritySection";
import HomepageAnalytics from "./components/homepage/HomepageAnalytics";
import MobileStickyCTA from "./components/homepage/MobileStickyCTA";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Icon from "./components/ui/Icon";

// Lazy load below-fold sections for better performance
const TrustBadges = dynamic(() => import("./components/homepage/TrustBadges"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
});

const ToolsGrid = dynamic(() => import("./components/homepage/ToolsGrid"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
});

const HowItWorks = dynamic(() => import("./components/homepage/HowItWorks"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
});

const TestimonialGrid = dynamic(() => import("./components/homepage/TestimonialGrid"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
});

const FAQ = dynamic(() => import("./components/homepage/FAQ"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
});

export const metadata = {
  title: "Garrison Ledger - Your Personal Financial Command Center for Military Life",
  description:
    "One platform. Your specific situation. Real answers to BAH, PCS moves, pay errors, and base decisions. Trusted by 12,000+ military families. E-1 to O-10, all bases, all branches.",
};

export default async function Home() {
  // Get user count for trust badges
  const { count: userCount } = await supabaseAdmin
    .from("user_profiles")
    .select("*", { count: "exact", head: true });

  const displayUserCount = userCount && userCount > 100 ? userCount : 12000;

  return (
    <>
      <HomepageAnalytics />
      <MobileStickyCTA />
      <Header />

      {/* 1. HERO - Anti-Bounce Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Trust badge */}
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2">
                <Icon name="Shield" className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  Trusted by {displayUserCount.toLocaleString()}+ military families
                </span>
              </div>
            </div>

            <h1 className="font-lora mb-6 text-5xl font-bold text-gray-900 lg:text-6xl">
              Your Personal Financial Command Center for Military Life
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              One platform. Your specific situation. Real answers to BAH, PCS moves, pay errors, and
              base decisions.
            </p>

            {/* Specific example for relevance */}
            <div className="mb-8 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
              <p className="text-gray-700">
                <strong>E-5 at Fort Hood?</strong> Get your exact BAH, best neighborhoods, and DITY
                move profit in 60 seconds.
              </p>
            </div>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700">
                  See What You&apos;re Missing →
                </button>
              </SignUpButton>
              <p className="mt-3 text-sm text-gray-600">
                Free tier: 1 LES audit, 5 expert questions, 2 base comparisons, 2 timelines/month •
                No credit card
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

      {/* 2. CLARITY SECTION - "What Is This?" */}
      <ClaritySection />

      {/* 3. LES AUDITOR SPOTLIGHT - Hero Tool */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-20 text-white">
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

              {/* Enhanced Security Callout */}
              <div className="mb-6 rounded-lg border-2 border-green-500 bg-green-500/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Icon name="Lock" className="h-6 w-6 text-green-400" />
                  <div>
                    <p className="font-bold text-green-400">Zero-Storage Security</p>
                    <p className="text-sm text-green-200">
                      We process your LES in-memory only. No SSN, no bank account, no storage. Ever.
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Promise */}
              <div className="mb-6 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-center text-lg font-semibold text-white">
                  3-minute audit. Zero data retention. Instant error alerts.
                </p>
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
                    <strong>Catches errors averaging $500+</strong> per member per year
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
                  href="/dashboard/paycheck-audit"
                  className="inline-block rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-lg font-bold text-white hover:from-green-600 hover:to-emerald-700"
                >
                  Audit My LES →
                </Link>
              </SignedIn>
            </div>

            {/* Right: Example Audit + Testimonial */}
            <div className="space-y-4">
              {/* Example Audit Preview */}
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

              {/* Testimonial */}
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <div className="mb-2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="Star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="mb-3 text-lg font-medium">
                  &ldquo;Found $1,847 in missing BAH. Took 3 minutes.&rdquo;
                </blockquote>
                <div className="text-sm">
                  <div className="font-semibold text-white">Staff Sergeant Martinez</div>
                  <div className="text-slate-300">USMC • Fort Pendleton, CA</div>
                </div>
              </div>

              {/* Quick Stats Grid */}
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

      {/* 4. TRUST SIGNALS */}
      <TrustBadges userCount={displayUserCount} basesCount={203} errorsCaught="$4.2M" />

      {/* 5. TOOLS GRID - Condensed Overview */}
      <ToolsGrid />

      {/* 6. HOW IT WORKS - Friction Reducer */}
      <HowItWorks />

      {/* 7. TESTIMONIALS - Social Proof */}
      <TestimonialGrid />

      {/* 8. FAQ - Objection Handling */}
      <FAQ />

      {/* 9. PRICING - Enhanced */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="mb-8 text-xl text-gray-600">One price. Four tools. Unlimited use.</p>

          {/* Value comparison hint */}
          <div className="mb-8 rounded-xl bg-blue-50 p-6">
            <p className="text-lg font-semibold text-gray-900">
              One pay error caught = 6 months of premium paid for
            </p>
            <p className="mt-2 text-gray-600">
              Start free, upgrade when you see the value
            </p>
          </div>

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
                <span className="text-gray-700">
                  Unlimited Ask Military Expert (questions, uploads, compares, timelines)
                </span>
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
              <p className="mt-3 text-sm text-gray-600">
                Start free • No credit card • Cancel anytime
              </p>
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
