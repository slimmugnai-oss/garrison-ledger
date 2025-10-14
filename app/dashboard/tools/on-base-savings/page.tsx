import type { Metadata } from "next";
import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import OnBaseSavingsCalculator from '@/app/components/tools/OnBaseSavingsCalculator';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { generatePageMeta } from "@/lib/seo-config";

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
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider">
                <span>⭐</span> Premium Tool
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4">
              Annual Savings Command Center
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Your strategic dashboard for maximizing on-base shopping benefits. 
              Get granular breakdowns of Commissary and Exchange savings with real-time calculations.
            </p>
          </div>

          <SignedOut>
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 shadow-2xl border-2 border-green-400">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Strategic Savings Dashboard</h2>
              <p className="text-lg text-gray-700 mb-2">
                Get granular breakdowns of exactly where your savings come from
              </p>
              <p className="text-sm text-gray-600 mb-6">
                💡 Most families save <strong className="text-green-600">$2,000-4,000/year</strong> - find your number
              </p>
              <div className="bg-green-50 border-2 border-green-400 rounded-lg p-3 mb-6">
                <p className="text-sm font-semibold text-green-800">
                  🛡️ 7-Day Money-Back Guarantee · Free Forever Tier Available
                </p>
              </div>
              <p className="text-3xl font-black text-gray-900 mb-6">
                $9.99<span className="text-lg font-normal text-gray-600">/month</span>
              </p>
              <Link
                href="/sign-in"
                className="inline-block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 mb-4"
              >
                Start Free, Upgrade Anytime →
              </Link>
              <p className="text-xs text-gray-500">
                No credit card required for free tier · Less than a coffee per week for premium
              </p>
            </div>
          </SignedOut>

          <SignedIn>
            <OnBaseSavingsCalculator />
            
            {/* Educational Content */}
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">💡 Commissary Shopping Tips</h3>
                <ul className="space-y-2 text-blue-800">
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

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-900 mb-3">🏪 Exchange Benefits</h3>
                <ul className="space-y-2 text-green-800">
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

