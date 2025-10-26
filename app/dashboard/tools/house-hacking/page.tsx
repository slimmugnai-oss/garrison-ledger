import type { Metadata } from "next";
import Link from 'next/link';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import HouseHack from '@/app/components/tools/HouseHack';
import Icon from '@/app/components/ui/Icon';
import { generatePageMeta } from "@/lib/seo-config";
import { SignedIn, SignedOut } from '@clerk/nextjs';

export const metadata: Metadata = generatePageMeta({
  title: "House Hacking Calculator - VA Loan Cash Flow Analysis",
  description: "Military house hacking ROI calculator. Analyze rental income potential, calculate cash flow with VA loan scenarios, and turn your next PCS into a wealth-building opportunity.",
  path: "/dashboard/tools/house-hacking",
  keywords: ["house hacking", "VA loan calculator", "military rental property", "PCS real estate", "military landlord", "BAH calculator", "rental income"]
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
              House Hacking Calculator
            </h1>
            <p className="text-xl text-body max-w-3xl mx-auto">
              VA loan screen to estimate cash flow potential and turn your next PCS into a wealth-building opportunity.
            </p>
          </div>

          <SignedOut>
            <div className="max-w-2xl mx-auto bg-card rounded-xl p-10 shadow-lg border border-border text-center">
              <Icon name="Calculator" className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary mb-3">Analyze Your House Hacking Potential</h2>
              <p className="text-lg text-body mb-2">
                Sign in to access this free calculator and estimate your rental property cash flow
              </p>
              <p className="text-sm text-body mb-6">
                💡 Calculate ROI with 0% down VA loans and BAH optimization strategies
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
            <HouseHack />
            
            {/* Educational Content */}
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              <div className="bg-info-subtle border border-info rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">🏠 House Hacking Basics</h3>
                <ul className="space-y-2 text-info">
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

              <div className="bg-success-subtle border border-success rounded-xl p-6">
                <h3 className="text-xl font-bold text-success mb-3">💡 VA Loan Benefits</h3>
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
            <div className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-purple-900 mb-4">🎯 House Hacking Pro Tips</h3>
              <div className="grid md:grid-cols-2 gap-6">
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
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-info-subtle border border-info rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">VA Loan Resources</h3>
                <p className="text-sm text-info mb-3">
                  Learn more about VA loan benefits and eligibility requirements.
                </p>
                <div className="space-y-2">
                  <a 
                    href="https://www.va.gov/housing-assistance/home-loans/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-info hover:text-info text-sm font-semibold underline"
                  >
                    VA Home Loans Overview →
                  </a>
                  <a 
                    href="https://www.benefits.va.gov/homeloans/coe.asp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-info hover:text-info text-sm font-semibold underline"
                  >
                    Certificate of Eligibility (COE) →
                  </a>
                </div>
              </div>

              <div className="bg-success-subtle border border-success rounded-xl p-6">
                <h3 className="text-lg font-bold text-success mb-3">Landlord Resources</h3>
                <p className="text-sm text-success mb-3">
                  Tools and guides for military landlords managing rental properties.
                </p>
                <div className="space-y-2">
                  <a 
                    href="https://www.militarybyowner.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-success hover:text-success text-sm font-semibold underline"
                  >
                    MilitaryByOwner (Rental Listings) →
                  </a>
                  <a 
                    href="https://www.biggerpockets.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-success hover:text-success text-sm font-semibold underline"
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
