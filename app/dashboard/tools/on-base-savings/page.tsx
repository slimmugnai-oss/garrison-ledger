import { SignedIn, SignedOut } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import OnBaseSavingsCalculator from "@/app/components/tools/OnBaseSavingsCalculator";
import Icon from "@/app/components/ui/Icon";
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "On-Base Savings Calculator - Commissary & Exchange Estimate",
  description:
    "Free on-base savings calculator for military families. Estimate Commissary and Exchange savings using published DeCA/AAFES rates. Calculate your annual on-base shopping benefits.",
  path: "/dashboard/tools/on-base-savings",
  keywords: [
    "commissary savings calculator",
    "exchange tax savings",
    "military shopping benefits",
    "MILITARY STAR savings",
    "on base annual savings",
    "military family budget calculator",
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
              On-Base Savings Calculator
            </h1>
            <p className="text-body mx-auto max-w-3xl text-xl">
              Estimate your annual Commissary and Exchange savings using published DeCA and AAFES
              rates.
            </p>
          </div>

          <SignedOut>
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-10 text-center shadow-lg">
              <Icon name="Calculator" className="mx-auto mb-4 h-16 w-16 text-primary" />
              <h2 className="mb-3 text-3xl font-bold text-primary">Estimate Your Savings</h2>
              <p className="text-body mb-2 text-lg">
                Sign in to access this free calculator and estimate your on-base shopping benefits
              </p>
              <p className="text-body mb-6 text-sm">
                Calculate potential savings from Commissary and Exchange shopping
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
            <OnBaseSavingsCalculator />

            {/* Educational Content */}
            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="bg-info-subtle border-info rounded-xl border p-6">
                <h3 className="mb-3 text-xl font-bold text-blue-900">Commissary Shopping Tips</h3>
                <ul className="text-info space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Shop on Tuesday-Thursday mornings for best selection and shortest lines
                    </span>
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

              <div className="bg-success-subtle rounded-xl border border-success p-6">
                <h3 className="mb-3 text-xl font-bold text-success">Exchange Benefits</h3>
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
