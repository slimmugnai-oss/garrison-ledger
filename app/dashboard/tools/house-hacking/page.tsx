import { SignedIn, SignedOut } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import HouseHack from "@/app/components/tools/HouseHack";
import Icon from "@/app/components/ui/Icon";
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "House Hacking Calculator - VA Loan Cash Flow Estimate",
  description:
    "Free house hacking calculator for military members. Estimate monthly cash flow with VA loans using official PITI calculations. Plan rental property investments with accurate projections.",
  path: "/dashboard/tools/house-hacking",
  keywords: [
    "house hacking",
    "VA loan calculator",
    "military rental property",
    "PCS real estate",
    "military landlord",
    "BAH calculator",
    "rental income",
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
              House Hacking Calculator
            </h1>
            <p className="text-body mx-auto max-w-3xl text-xl">
              Estimate monthly cash flow for rental properties using VA loans with 0% down payment.
            </p>
          </div>

          <SignedOut>
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-10 text-center shadow-lg">
              <Icon name="Calculator" className="mx-auto mb-4 h-16 w-16 text-primary" />
              <h2 className="mb-3 text-3xl font-bold text-primary">Calculate Your Cash Flow</h2>
              <p className="text-body mb-2 text-lg">
                Sign in to access this free calculator and estimate your rental property cash flow
              </p>
              <p className="text-body mb-6 text-sm">
                Project monthly cash flow with VA loan benefits and rental income
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
            <HouseHack />

            {/* Educational Content */}
            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="bg-info-subtle border-info rounded-xl border p-6">
                <h3 className="mb-3 text-xl font-bold text-blue-900">House Hacking Basics</h3>
                <ul className="text-info space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Use VA loan with 0% down payment for primary residence</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Rent out rooms/units while living there to cover mortgage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Convert to full rental property after PCS</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Build equity while tenants pay down mortgage</span>
                  </li>
                </ul>
              </div>

              <div className="bg-success-subtle rounded-xl border border-success p-6">
                <h3 className="mb-3 text-xl font-bold text-success">VA Loan Benefits</h3>
                <ul className="space-y-2 text-success">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>No down payment required (0% down)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>No PMI (private mortgage insurance) required</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Typically lower interest rates than conventional loans</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Can use VA loan multiple times (restore entitlement)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-8">
              <h3 className="mb-4 text-2xl font-bold text-purple-900">House Hacking Pro Tips</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <ul className="space-y-2 text-purple-800">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Look for multi-unit properties (duplex, triplex, fourplex)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Calculate all costs: mortgage, insurance, HOA, maintenance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Research local rental rates before buying</span>
                  </li>
                </ul>
                <ul className="space-y-2 text-purple-800">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Keep 6-12 months reserves for vacancies/repairs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Consider property management companies before PCS</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Track expenses for tax deductions (depreciation, repairs)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Resources */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="bg-info-subtle border-info rounded-xl border p-6">
                <h3 className="mb-3 text-lg font-bold text-blue-900">VA Loan Resources</h3>
                <p className="text-info mb-3 text-sm">
                  Learn more about VA loan benefits and eligibility requirements.
                </p>
                <div className="space-y-2">
                  <a
                    href="https://www.va.gov/housing-assistance/home-loans/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info hover:text-info block text-sm font-semibold underline"
                  >
                    VA Home Loans Overview →
                  </a>
                  <a
                    href="https://www.benefits.va.gov/homeloans/coe.asp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info hover:text-info block text-sm font-semibold underline"
                  >
                    Certificate of Eligibility (COE) →
                  </a>
                </div>
              </div>

              <div className="bg-success-subtle rounded-xl border border-success p-6">
                <h3 className="mb-3 text-lg font-bold text-success">Landlord Resources</h3>
                <p className="mb-3 text-sm text-success">
                  Tools and guides for military landlords managing rental properties.
                </p>
                <div className="space-y-2">
                  <a
                    href="https://www.militarybyowner.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-semibold text-success underline hover:text-success"
                  >
                    MilitaryByOwner (Rental Listings) →
                  </a>
                  <a
                    href="https://www.biggerpockets.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-semibold text-success underline hover:text-success"
                  >
                    BiggerPockets (REI Education) →
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
