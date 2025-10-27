import { SignedIn, SignedOut } from '@clerk/nextjs';
import type { Metadata } from "next";
import Link from 'next/link';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import CareerOpportunityAnalyzer from '@/app/components/tools/CareerOpportunityAnalyzer';
import Icon from '@/app/components/ui/Icon';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "Career Opportunity Analyzer - Complete Compensation Comparison",
  description: "Compare job offers with total compensation analysis including salary, bonuses, retirement match, state taxes, and cost of living. Make smarter career decisions with real-time financial insights for military transitions and spouse careers.",
  path: "/dashboard/tools/salary-calculator",
  keywords: ["career opportunity analyzer", "salary calculator", "total compensation calculator", "cost of living calculator", "job offer comparison", "military transition", "military spouse career", "relocation salary", "state income tax comparison"]
});

export default function Page() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.04),transparent_60%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Hero Header */}
          <div className="mb-12 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700 uppercase tracking-wider">
                ✓ Free Tool
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black tracking-tight text-primary mb-4">
              Career Opportunity Analyzer
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-body">
              Compare job offers with complete financial analysis including total compensation, state taxes, and cost of living. 
              Get real-time insights to make smarter career decisions.
            </p>
          </div>

          <SignedOut>
            <div className="max-w-2xl mx-auto bg-card rounded-xl p-10 shadow-lg border border-border text-center">
              <Icon name="Calculator" className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary mb-3">Compare Career Opportunities</h2>
              <p className="text-lg text-body mb-2">
                Sign in to access this free calculator with complete financial analysis across 70+ military cities
              </p>
              <p className="text-sm text-body mb-6">
                Make informed career decisions worth <strong className="text-success">$15K+ in lifetime earnings</strong>
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
            <CareerOpportunityAnalyzer />
            
            {/* Use Cases */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-primary text-center mb-8">Perfect For:</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-surface border border-subtle rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-primary mb-2">Military Transition</h3>
                  <p className="text-body text-sm">
                    Comparing civilian job offers as you transition out? Understand how salaries translate across different locations before accepting an offer.
                  </p>
                </div>

                <div className="bg-surface border border-subtle rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-primary mb-2">Military Spouse Career</h3>
                  <p className="text-body text-sm">
                    Remote work opening up new opportunities? See how your current salary compares to offers in high or low cost-of-living areas.
                  </p>
                </div>

                <div className="bg-surface border border-subtle rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-primary mb-2">PCS Planning</h3>
                  <p className="text-body text-sm">
                    Moving to a new duty station? Understand how the local economy and cost of living will affect your family&apos;s budget and lifestyle.
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-12 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">Smart Career Move Tips</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-indigo-800 mb-2">Now Includes:</h4>
                  <ul className="space-y-1 text-sm text-indigo-700">
                    <li>✓ Total compensation (salary + bonus + retirement)</li>
                    <li>✓ State income tax comparisons</li>
                    <li>✓ Cost of living adjustments for 70+ cities</li>
                    <li>✓ Real-time financial verdict with insights</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-indigo-800 mb-2">Military Family Factors:</h4>
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
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-info-subtle border border-info rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">Cost of Living Data</h3>
                <p className="text-sm text-info mb-3">
                  Want more detailed cost breakdowns? Check these resources for housing, transportation, and daily expenses.
                </p>
                <div className="space-y-2">
                  <a 
                    href="https://www.nerdwallet.com/cost-of-living-calculator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-info hover:text-info text-sm font-semibold underline"
                  >
                    NerdWallet COL Calculator →
                  </a>
                  <a 
                    href="https://www.bestplaces.net/cost-of-living/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-info hover:text-info text-sm font-semibold underline"
                  >
                    BestPlaces Cost of Living →
                  </a>
                </div>
              </div>

              <div className="bg-success-subtle border border-success rounded-xl p-6">
                <h3 className="text-lg font-bold text-success mb-3">Transition Resources</h3>
                <p className="text-sm text-success mb-3">
                  Transitioning from military to civilian career? These resources can help you navigate the process.
                </p>
                <div className="space-y-2">
                  <a 
                    href="https://www.dol.gov/agencies/vets/programs/tap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-success hover:text-success text-sm font-semibold underline"
                  >
                    TAP (Transition Assistance) →
                  </a>
                  <a 
                    href="https://www.hiringourheroes.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-success hover:text-success text-sm font-semibold underline"
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

