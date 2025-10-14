import type { Metadata } from "next";
import { SignedIn, SignedOut } from '@clerk/nextjs';
import PcsFinancialPlanner from '@/app/components/tools/PcsFinancialPlanner';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { generatePageMeta } from "@/lib/seo-config";

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
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider">
                <span>⭐</span> Premium Tool
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4">
              PCS Financial Planner
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Plan your PCS move finances with confidence. Calculate your budget, estimate PPM profits, 
              and ensure you're financially prepared for your next duty station.
            </p>
          </div>

          <SignedOut>
            <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Tool Access Required</h2>
              <p className="text-gray-600 mb-6">
                Sign in to access the PCS Financial Planner and take control of your move budget.
              </p>
              <a
                href="/sign-in"
                className="inline-flex items-center rounded-xl bg-indigo-600 px-8 py-4 text-white font-bold shadow-lg transition-all hover:bg-indigo-700 hover:-translate-y-[2px] hover:shadow-xl"
              >
                Sign In to Continue
              </a>
            </div>
          </SignedOut>

          <SignedIn>
            <PcsFinancialPlanner />
            
            {/* Educational Content */}
            <div className="mt-16 grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">💰 DLA (Dislocation Allowance)</h3>
                <p className="text-sm text-blue-800 mb-3">
                  A one-time payment to help offset costs of relocating your household. Amount varies by rank and dependents.
                </p>
                <a 
                  href="https://www.dfas.mil/militarymembers/payentitlements/Pay-Tables/DLA/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                >
                  View DLA Rates →
                </a>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-green-900 mb-3">🚚 PPM/DITY Moves</h3>
                <p className="text-sm text-green-800 mb-3">
                  Personally Procured Moves let you handle your own relocation and pocket any savings. Government pays ~95% of what it would cost them.
                </p>
                <a 
                  href="https://www.move.mil/moving-guide/dity-ppm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 text-sm font-semibold underline"
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
            <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-8">
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

