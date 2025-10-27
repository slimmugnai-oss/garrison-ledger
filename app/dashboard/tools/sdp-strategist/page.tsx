import { SignedIn, SignedOut } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import SdpStrategist from "@/app/components/tools/SdpStrategist";
import Icon from "@/app/components/ui/Icon";
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "SDP Calculator - Calculate Your Deployment Savings Returns",
  description:
    "Official SDP calculator for deployed service members. Calculate your Savings Deposit Program returns based on 10 USC § 1035. Free calculator with accurate estimates and data provenance.",
  path: "/dashboard/tools/sdp-strategist",
  keywords: [
    "SDP calculator",
    "Savings Deposit Program",
    "deployment savings",
    "military deployment",
    "10% interest rate",
    "SDP payout calculator",
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
              SDP Calculator
            </h1>
            <p className="text-body mx-auto max-w-3xl text-xl">
              Calculate your Savings Deposit Program returns with official 10% APR based on federal
              law.
            </p>
          </div>

          <SignedOut>
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-10 text-center shadow-lg">
              <Icon name="Calculator" className="mx-auto mb-4 h-16 w-16 text-primary" />
              <h2 className="mb-3 text-3xl font-bold text-primary">Calculate Your SDP Returns</h2>
              <p className="text-body mb-2 text-lg">
                Sign in to access this free calculator and estimate your deployment savings returns
              </p>
              <p className="text-body mb-6 text-sm">
                Calculate your guaranteed 10% annual return based on official DoD regulations
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
            <SdpStrategist />

            {/* Educational Content */}
            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="bg-info-subtle border-info rounded-xl border p-6">
                <h3 className="mb-3 text-xl font-bold text-blue-900">SDP Basics</h3>
                <ul className="text-info space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Earn guaranteed 10% annual return while deployed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Maximum deposit: $10,000 per deployment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Interest accrues for up to 90 days after return</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Completely tax-free earnings in combat zones</span>
                  </li>
                </ul>
              </div>

              <div className="bg-success-subtle rounded-xl border border-success p-6">
                <h3 className="mb-3 text-xl font-bold text-success">Program Benefits</h3>
                <ul className="space-y-2 text-success">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Guaranteed 10% return - higher than most savings accounts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>No market risk - rate is fixed by federal law</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Tax-free earnings when deposited in combat zones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Automatic payout after deployment ends</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="mt-8 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-8">
              <h3 className="mb-4 text-2xl font-bold text-green-900">SDP Pro Tips</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Deposit max $10K as early in deployment as possible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Interest compounds monthly at 10% annual rate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Payout arrives 120 days after deployment ends</span>
                  </li>
                </ul>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Combat zone tax exclusion applies to all income</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Available only in designated hostile fire/imminent danger zones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Coordinate with finance office before deployment</span>
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
