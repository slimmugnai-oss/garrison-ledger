import { SignedIn, SignedOut } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import TspModeler from "@/app/components/tools/TspModeler";
import Icon from "@/app/components/ui/Icon";
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "TSP Calculator - Model Your Thrift Savings Plan Growth",
  description:
    "Free TSP calculator for military members. Model fund allocations and project retirement growth using official TSP historical performance data. Compare custom allocations vs lifecycle funds.",
  path: "/dashboard/tools/tsp-modeler",
  keywords: [
    "TSP calculator",
    "Thrift Savings Plan",
    "military TSP",
    "BRS calculator",
    "retirement planning",
    "TSP allocation",
    "C fund S fund",
  ],
});

export default function Page() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          {/* Hero Header */}
          <div className="mb-8 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-700">
              ✓ Free Tool
            </span>
            <h1 className="mb-3 font-serif text-4xl font-bold text-primary md:text-5xl">
              TSP Calculator
            </h1>
            <p className="text-body mx-auto max-w-3xl text-xl">
              Model fund allocations and project your retirement growth using official TSP
              historical data.
            </p>
          </div>

          <SignedOut>
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-10 text-center shadow-lg">
              <Icon name="Calculator" className="mx-auto mb-4 h-16 w-16 text-primary" />
              <h2 className="mb-3 text-3xl font-bold text-primary">Calculate Your TSP Growth</h2>
              <p className="text-body mb-2 text-lg">
                Sign in to access this free calculator and model your retirement projections
              </p>
              <p className="text-body mb-6 text-sm">
                Project your TSP balance using official historical performance data
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
            <TspModeler />

            {/* Educational Content */}
            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="bg-info-subtle border-info rounded-xl border p-6">
                <h3 className="mb-3 text-xl font-bold text-blue-900">Understanding TSP Funds</h3>
                <ul className="text-info space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>C Fund:</strong> Tracks S&P 500, large-cap US stocks
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>S Fund:</strong> Small/mid-cap US stocks, higher growth potential
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>I Fund:</strong> International stocks, geographic diversification
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>G Fund:</strong> Government securities, stable but low returns
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>F Fund:</strong> Bond index, more stable than stocks
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-success-subtle rounded-xl border border-success p-6">
                <h3 className="mb-3 text-xl font-bold text-success">BRS Matching Tips</h3>
                <ul className="space-y-2 text-success">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Contribute at least 5% to get full DoD match</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Government auto-contributes 1% even if you contribute 0%</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Matching funds vest after 2 years of service</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Roth TSP contributions grow tax-free in retirement</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-8">
              <h3 className="mb-4 text-2xl font-bold text-indigo-900">TSP Strategy Tips</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <ul className="space-y-2 text-indigo-800">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Younger members can afford more risk (C/S/I funds)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Rebalance annually to maintain target allocation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Consider Lifecycle funds for automatic rebalancing</span>
                  </li>
                </ul>
                <ul className="space-y-2 text-indigo-800">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Max contribution: $23,000/year (2024 limit)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Combat zone contributions don&apos;t count toward limit</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Review and adjust allocation after major life events</span>
                  </li>
                </ul>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
      <Footer />
    </>
  );
}
