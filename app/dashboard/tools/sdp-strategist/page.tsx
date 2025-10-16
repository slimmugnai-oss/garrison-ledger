import type { Metadata } from "next";
import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import SdpStrategist from '@/app/components/tools/SdpStrategist';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "SDP Payout Strategist - Maximize Your Deployment Savings",
  description: "Strategic SDP calculator for deployed service members. Compare payout strategies, model investment scenarios, and turn your 10% deployment savings into long-term wealth.",
  path: "/dashboard/tools/sdp-strategist",
  keywords: ["SDP calculator", "Savings Deposit Program", "deployment savings", "military deployment bonus", "10% interest rate", "deployment payout"]
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
              SDP Payout Strategist
            </h1>
            <p className="text-xl text-body max-w-3xl mx-auto">
              Turn your deployment bonus into a long-term windfall with smart payout strategies.
            </p>
          </div>

          <SignedOut>
            <div className="max-w-2xl mx-auto bg-card rounded-xl p-10 shadow-lg border border-border text-center">
              <Icon name="Calculator" className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary mb-3">Maximize Your SDP Payout</h2>
              <p className="text-lg text-body mb-2">
                Sign in to access this free calculator and strategize your 10% deployment savings
              </p>
              <p className="text-sm text-body mb-6">
                💡 Compare lump sum vs. investment strategies for maximum long-term growth
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
            <SdpStrategist />
            
            {/* Educational Content */}
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              <div className="bg-info-subtle border border-info rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">📚 SDP Basics</h3>
                <ul className="space-y-2 text-info">
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

              <div className="bg-success-subtle border border-success rounded-xl p-6">
                <h3 className="text-xl font-bold text-success mb-3">💡 Investment Strategies</h3>
                <ul className="space-y-2 text-success">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Reinvest SDP payout into TSP for tax-advantaged growth</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Use as emergency fund - 3-6 months expenses</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Pay down high-interest debt first (credit cards, auto loans)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Consider Roth IRA contribution ($7,000 limit for 2024)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-green-900 mb-4">🎯 SDP Pro Tips</h3>
              <div className="grid md:grid-cols-2 gap-6">
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
