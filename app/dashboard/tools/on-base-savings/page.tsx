import type { Metadata } from "next";
import Link from 'next/link';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import OnBaseSavingsCalculator from '@/app/components/tools/OnBaseSavingsCalculator';
import Icon from '@/app/components/ui/Icon';
import { generatePageMeta } from "@/lib/seo-config";
import { SignedIn, SignedOut } from '@clerk/nextjs';

export const metadata: Metadata = generatePageMeta({
  title: "Annual Savings Command Center - Commissary & Exchange Calculator",
  description: "Strategic savings calculator for military families. Calculate exact Commissary and Exchange savings with granular breakdowns. See your total annual on-base shopping benefits in one powerful dashboard.",
  path: "/dashboard/tools/on-base-savings",
  keywords: ["commissary savings calculator", "exchange tax savings", "military shopping benefits", "MILITARY STAR savings", "on base annual savings", "military family budget calculator"]
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
              Annual Savings Command Center
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-body">
              Your strategic dashboard for maximizing on-base shopping benefits. 
              Get granular breakdowns of Commissary and Exchange savings with real-time calculations.
            </p>
          </div>

          <SignedOut>
            <div className="max-w-2xl mx-auto bg-card rounded-xl p-10 shadow-lg border border-border text-center">
              <Icon name="Calculator" className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary mb-3">Calculate Your Annual Savings</h2>
              <p className="text-lg text-body mb-2">
                Sign in to access this free calculator and discover your exact on-base savings
              </p>
              <p className="text-sm text-body mb-6">
                💡 Most families save <strong className="text-success">$2,000-4,000/year</strong> - find your number
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
            <OnBaseSavingsCalculator />
            
            {/* Educational Content */}
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              <div className="bg-info-subtle border border-info rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">💡 Commissary Shopping Tips</h3>
                <ul className="space-y-2 text-info">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Shop on Tuesday-Thursday mornings for best selection and shortest lines</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>The 5% surcharge funds commissary operations and improvements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Baggers work for tips - customary to tip $2-5 per cart</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Case lot sales offer 10-30% additional savings on bulk items</span>
                  </li>
                </ul>
              </div>

              <div className="bg-success-subtle border border-success rounded-xl p-6">
                <h3 className="text-xl font-bold text-success mb-3">🏪 Exchange Benefits</h3>
                <ul className="space-y-2 text-success">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Tax-free shopping saves you your local sales tax rate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>MILITARY STAR® card offers 5¢/gal fuel discount</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Exchange earnings fund MWR programs and facilities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Price match guarantee with local retailers (check store policy)</span>
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

