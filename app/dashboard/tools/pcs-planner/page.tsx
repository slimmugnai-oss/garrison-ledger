import { SignedIn, SignedOut } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import PcsFinancialPlanner from "@/app/components/tools/PcsFinancialPlanner";
import Icon from "@/app/components/ui/Icon";
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "PCS Budget Calculator - Estimate Your Move Costs",
  description:
    "Free PCS budget calculator for military members. Estimate move costs and income using official DLA rates from DTMO. Plan your military move with accurate entitlement calculations.",
  path: "/dashboard/tools/pcs-planner",
  keywords: [
    "PCS calculator",
    "PCS budget",
    "military move budget",
    "DLA calculator",
    "PCS financial planning",
    "military moving costs",
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
              PCS Budget Calculator
            </h1>
            <p className="text-body mx-auto max-w-3xl text-xl">
              Estimate your PCS move budget using official entitlement rates from DTMO and DFAS.
            </p>
          </div>

          <SignedOut>
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-10 text-center shadow-lg">
              <Icon name="Calculator" className="mx-auto mb-4 h-16 w-16 text-primary" />
              <h2 className="mb-3 text-3xl font-bold text-primary">Calculate Your PCS Budget</h2>
              <p className="text-body mb-2 text-lg">
                Sign in to access this free calculator and estimate your PCS move costs
              </p>
              <p className="text-body mb-6 text-sm">
                Estimate income and expenses using official DoD entitlement rates
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
            <PcsFinancialPlanner />

            {/* Educational Content */}
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              <div className="bg-info-subtle border-info rounded-xl border p-6">
                <h3 className="mb-3 text-lg font-bold text-blue-900">
                  DLA (Dislocation Allowance)
                </h3>
                <p className="text-info mb-3 text-sm">
                  A one-time payment to help offset costs of relocating your household. Amount
                  varies by rank and dependents.
                </p>
                <a
                  href="https://www.dfas.mil/militarymembers/payentitlements/Pay-Tables/DLA/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-info hover:text-info text-sm font-semibold underline"
                >
                  View DLA Rates →
                </a>
              </div>

              <div className="bg-success-subtle rounded-xl border border-success p-6">
                <h3 className="mb-3 text-lg font-bold text-success">Travel Allowances</h3>
                <p className="mb-3 text-sm text-success">
                  Per diem, mileage (MALT), and other travel allowances help cover costs during your
                  move. Rates vary by location.
                </p>
                <a
                  href="https://www.defensetravel.dod.mil/site/perdiemCalc.cfm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-success underline hover:text-success"
                >
                  Per Diem Calculator →
                </a>
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
                <h3 className="mb-3 text-lg font-bold text-purple-900">TMO Resources</h3>
                <p className="mb-3 text-sm text-purple-800">
                  Your Transportation Office (TMO) is your primary resource for official move
                  guidance, weight tickets, and reimbursement.
                </p>
                <a
                  href="https://www.militaryonesource.mil/moving-housing/moving/planning-your-move/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-purple-600 underline hover:text-purple-800"
                >
                  Find Your TMO →
                </a>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-8">
              <h3 className="mb-4 text-2xl font-bold text-indigo-900">
                Pro Tips for PCS Financial Success
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <ul className="space-y-2 text-indigo-800">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>
                      Keep ALL receipts - even for items you think might not be reimbursable
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Get weigh tickets before AND after loading for PPM moves</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Build in a 20% buffer for unexpected expenses</span>
                  </li>
                </ul>
                <ul className="space-y-2 text-indigo-800">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Check if your new location has higher housing deposit requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Per diem rates vary by location - verify current rates at TMO</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Consider timing - end-of-month moves may affect BAH and pay</span>
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
