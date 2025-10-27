import { SignedIn, SignedOut } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import CareerOpportunityAnalyzer from "@/app/components/tools/CareerOpportunityAnalyzer";
import Icon from "@/app/components/ui/Icon";
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "Career Comparison Calculator - Total Compensation Estimate",
  description:
    "Free career comparison calculator for military members and spouses. Compare job offers with cost of living and tax adjustments. Estimate purchasing power differences between locations.",
  path: "/dashboard/tools/salary-calculator",
  keywords: [
    "career comparison calculator",
    "salary calculator",
    "total compensation calculator",
    "cost of living calculator",
    "job offer comparison",
    "military transition",
    "military spouse career",
    "relocation salary",
    "state income tax comparison",
  ],
});

export default function Page() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.04),transparent_60%)]" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          {/* Hero Header */}
          <div className="mb-12 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-700">
                ✓ Free Tool
              </span>
            </div>
            <h1 className="mb-4 font-serif text-5xl font-black tracking-tight text-primary md:text-6xl">
              Career Comparison Calculator
            </h1>
            <p className="text-body mx-auto max-w-3xl text-xl">
              Compare job offers by analyzing total compensation, taxes, and cost of living
              differences.
            </p>
          </div>

          <SignedOut>
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-10 text-center shadow-lg">
              <Icon name="Calculator" className="mx-auto mb-4 h-16 w-16 text-primary" />
              <h2 className="mb-3 text-3xl font-bold text-primary">Compare Career Opportunities</h2>
              <p className="text-body mb-2 text-lg">
                Sign in to access this free calculator and compare job offers
              </p>
              <p className="text-body mb-6 text-sm">
                Analyze compensation differences adjusted for location and taxes
              </p>
              <Link
                href="/sign-in"
                className="btn-primary mb-4 inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                Sign In to Get Started
              </Link>
              <p className="text-sm text-muted">Free account • No credit card required</p>
            </div>
          </SignedOut>

          <SignedIn>
            <CareerOpportunityAnalyzer />

            {/* Use Cases */}
            <div className="mt-16">
              <h2 className="mb-8 text-center text-2xl font-bold text-primary">Use Cases:</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-surface border-subtle rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg">
                  <h3 className="mb-2 text-lg font-bold text-primary">Military Transition</h3>
                  <p className="text-body text-sm">
                    Comparing civilian job offers as you transition out? Understand how salaries
                    translate across different locations before accepting an offer.
                  </p>
                </div>

                <div className="bg-surface border-subtle rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg">
                  <h3 className="mb-2 text-lg font-bold text-primary">Military Spouse Career</h3>
                  <p className="text-body text-sm">
                    Remote work opening up new opportunities? See how your current salary compares
                    to offers in high or low cost-of-living areas.
                  </p>
                </div>

                <div className="bg-surface border-subtle rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg">
                  <h3 className="mb-2 text-lg font-bold text-primary">PCS Planning</h3>
                  <p className="text-body text-sm">
                    Moving to a new duty station? Understand how the local economy and cost of
                    living will affect your family&apos;s budget and lifestyle.
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-12 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-8">
              <h3 className="mb-4 text-2xl font-bold text-indigo-900">Smart Career Move Tips</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-bold text-indigo-800">Now Includes:</h4>
                  <ul className="space-y-1 text-sm text-indigo-700">
                    <li>✓ Total compensation (salary + bonus + retirement)</li>
                    <li>✓ State income tax comparisons</li>
                    <li>✓ Cost of living adjustments for 70+ cities</li>
                    <li>✓ Real-time financial verdict with insights</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-bold text-indigo-800">Military Family Factors:</h4>
                  <ul className="space-y-1 text-sm text-indigo-700">
                    <li>• BAH vs. civilian housing costs</li>
                    <li>• On-base facilities accessibility</li>
                    <li>• Military-friendly employer culture</li>
                    <li>• Remote work during PCS moves</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="bg-info-subtle border-info rounded-xl border p-6">
                <h3 className="mb-3 text-lg font-bold text-blue-900">Cost of Living Data</h3>
                <p className="text-info mb-3 text-sm">
                  Want more detailed cost breakdowns? Check these resources for housing,
                  transportation, and daily expenses.
                </p>
                <div className="space-y-2">
                  <a
                    href="https://www.nerdwallet.com/cost-of-living-calculator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info hover:text-info block text-sm font-semibold underline"
                  >
                    NerdWallet COL Calculator →
                  </a>
                  <a
                    href="https://www.bestplaces.net/cost-of-living/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info hover:text-info block text-sm font-semibold underline"
                  >
                    BestPlaces Cost of Living →
                  </a>
                </div>
              </div>

              <div className="bg-success-subtle rounded-xl border border-success p-6">
                <h3 className="mb-3 text-lg font-bold text-success">Transition Resources</h3>
                <p className="mb-3 text-sm text-success">
                  Transitioning from military to civilian career? These resources can help you
                  navigate the process.
                </p>
                <div className="space-y-2">
                  <a
                    href="https://www.dol.gov/agencies/vets/programs/tap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-semibold text-success underline hover:text-success"
                  >
                    TAP (Transition Assistance) →
                  </a>
                  <a
                    href="https://www.hiringourheroes.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-semibold text-success underline hover:text-success"
                  >
                    Hiring Our Heroes →
                  </a>
                </div>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
      <Footer />
    </>
  );
}
