import type { Metadata } from "next";
import Link from 'next/link';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import TspModeler from '@/app/components/tools/TspModeler';
import Icon from '@/app/components/ui/Icon';
import { generatePageMeta } from "@/lib/seo-config";
import { SignedIn, SignedOut } from '@clerk/nextjs';

export const metadata: Metadata = generatePageMeta({
  title: "TSP Allocation Modeler - Optimize Your Thrift Savings Plan",
  description: "Interactive TSP calculator for military members. Model different fund allocations, compare BRS scenarios, and project long-term retirement growth with historical data analysis.",
  path: "/dashboard/tools/tsp-modeler",
  keywords: ["TSP calculator", "Thrift Savings Plan", "military TSP", "BRS calculator", "retirement planning", "TSP allocation", "C fund S fund"]
});

export default function Page() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          {/* Hero Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700 uppercase tracking-wider mb-4">
              ✓ Free Tool
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-3">
              TSP Allocation Modeler
            </h1>
            <p className="text-xl text-body max-w-3xl mx-auto">
              Model different fund allocations, compare scenarios, and project your long-term retirement growth.
            </p>
          </div>

          <SignedOut>
            <div className="max-w-2xl mx-auto bg-card rounded-xl p-10 shadow-lg border border-border text-center">
              <Icon name="Calculator" className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary mb-3">Ready to Model Your TSP?</h2>
              <p className="text-lg text-body mb-2">
                Sign in to access this free calculator and optimize your retirement allocation
              </p>
              <p className="text-sm text-body mb-6">
                💡 See exactly how different fund mixes impact your 30-year projections
              </p>
              <Link
                href="/sign-in"
                className="btn-primary inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 mb-4"
              >
                Sign In to Get Started
              </Link>
              <p className="text-sm text-muted">
                Free account • No credit card required
              </p>
            </div>
          </SignedOut>

          <SignedIn>
            <TspModeler />
            
            {/* Educational Content */}
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              <div className="bg-info-subtle border border-info rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">📚 Understanding TSP Funds</h3>
                <ul className="space-y-2 text-info">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>C Fund:</strong> Tracks S&P 500, large-cap US stocks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>S Fund:</strong> Small/mid-cap US stocks, higher growth potential</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>I Fund:</strong> International stocks, geographic diversification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>G Fund:</strong> Government securities, stable but low returns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>F Fund:</strong> Bond index, more stable than stocks</span>
                  </li>
                </ul>
              </div>

              <div className="bg-success-subtle border border-success rounded-xl p-6">
                <h3 className="text-xl font-bold text-success mb-3">💡 BRS Matching Tips</h3>
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
            <div className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">🎯 TSP Strategy Tips</h3>
              <div className="grid md:grid-cols-2 gap-6">
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
