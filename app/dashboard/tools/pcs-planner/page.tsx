import type { Metadata } from "next";
import Link from 'next/link';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import PcsFinancialPlanner from '@/app/components/tools/PcsFinancialPlanner';
import Icon from '@/app/components/ui/Icon';
import { generatePageMeta } from "@/lib/seo-config";
import { SignedIn, SignedOut } from '@clerk/nextjs';

export const metadata: Metadata = generatePageMeta({
  title: "PCS Financial Planner - Budget Calculator & PPM Profit Estimator",
  description: "Plan your PCS finances with our comprehensive calculator. Estimate move costs, PPM profits, and budget for your military move. Track income, expenses, and maximize your PCS benefits.",
  path: "/dashboard/tools/pcs-planner",
  keywords: ["PCS calculator", "PPM profit calculator", "military move budget", "DITY move calculator", "PCS financial planning", "military moving costs"]
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
              PCS Financial Planner
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-body">
              Plan your PCS move finances with confidence. Calculate your budget, estimate PPM profits, 
              and ensure you&apos;re financially prepared for your next duty station.
            </p>
          </div>

          <SignedOut>
            <div className="max-w-2xl mx-auto bg-card rounded-xl p-10 shadow-lg border border-border text-center">
              <Icon name="Calculator" className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary mb-3">Ready to Plan Your PCS?</h2>
              <p className="text-lg text-body mb-2">
                Sign in to access this free calculator and maximize your PCS finances
              </p>
              <p className="text-sm text-body mb-6">
                💡 Our PPM calculator has helped members profit <strong className="text-success">$1,500-3,000</strong> per move
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
            <PcsFinancialPlanner />
            
            {/* Educational Content */}
            <div className="mt-16 grid md:grid-cols-3 gap-6">
              <div className="bg-info-subtle border border-info rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">💰 DLA (Dislocation Allowance)</h3>
                <p className="text-sm text-info mb-3">
                  A one-time payment to help offset costs of relocating your household. Amount varies by rank and dependents.
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

              <div className="bg-success-subtle border border-success rounded-xl p-6">
                <h3 className="text-lg font-bold text-success mb-3">🚚 PPM/DITY Moves</h3>
                <p className="text-sm text-success mb-3">
                  Personally Procured Moves let you handle your own relocation and pocket any savings. Government pays ~95% of what it would cost them.
                </p>
                <a 
                  href="https://www.move.mil/moving-guide/dity-ppm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-success hover:text-success text-sm font-semibold underline"
                >
                  Learn About PPM →
                </a>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-purple-900 mb-3">📋 TMO Resources</h3>
                <p className="text-sm text-purple-800 mb-3">
                  Your Transportation Office (TMO) is your primary resource for official move guidance, weight tickets, and reimbursement.
                </p>
                <a 
                  href="https://www.militaryonesource.mil/moving-housing/moving/planning-your-move/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 text-sm font-semibold underline"
                >
                  Find Your TMO →
                </a>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">💡 Pro Tips for PCS Financial Success</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-indigo-800">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Keep ALL receipts - even for items you think might not be reimbursable</span>
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

