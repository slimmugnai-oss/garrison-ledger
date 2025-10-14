import type { Metadata } from "next";
import { SignedIn, SignedOut } from '@clerk/nextjs';
import OnBaseSavingsCalculator from '@/app/components/tools/OnBaseSavingsCalculator';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "On-Base Savings Calculator - Commissary & Exchange Tax Savings",
  description: "Calculate your annual savings from shopping at the Commissary and Exchange. Estimate tax savings, MILITARY STAR rewards, and more. Military family financial planning made easy.",
  path: "/dashboard/tools/on-base-savings",
  keywords: ["commissary savings", "exchange tax savings", "military shopping", "MILITARY STAR", "on base shopping calculator", "military family budget"]
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
              On-Base Savings Calculator
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Discover how much you can save annually by shopping at the Commissary and Exchange. 
              Calculate tax savings, track smart shopping habits, and maximize your military benefits.
            </p>
          </div>

          <SignedOut>
            <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Tool Access Required</h2>
              <p className="text-gray-600 mb-6">
                Sign in to access the On-Base Savings Calculator and start maximizing your military shopping benefits.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center rounded-xl bg-indigo-600 px-8 py-4 text-white font-bold shadow-lg transition-all hover:bg-indigo-700 hover:-translate-y-[2px] hover:shadow-xl"
              >
                Sign In to Continue
              </Link>
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

