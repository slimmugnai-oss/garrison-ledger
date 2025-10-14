import type { Metadata } from "next";
import { SignedIn, SignedOut } from '@clerk/nextjs';
import SalaryRelocationCalculator from '@/app/components/tools/SalaryRelocationCalculator';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "Salary & Relocation Calculator - Cost of Living Comparison",
  description: "Compare job offers across different cities with our cost of living calculator. Perfect for military transitions, spouse careers, and civilian job offers. Adjust salaries for location differences.",
  path: "/dashboard/tools/salary-calculator",
  keywords: ["salary calculator", "cost of living calculator", "job offer comparison", "military transition", "military spouse career", "relocation salary"]
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
              Salary & Relocation Calculator
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Compare job offers across different cities with cost-of-living adjustments. 
              Make informed career decisions for transitions, spouse employment, or civilian opportunities.
            </p>
          </div>

          <SignedOut>
            <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Tool Access Required</h2>
              <p className="text-gray-600 mb-6">
                Sign in to access the Salary & Relocation Calculator and make smarter career decisions.
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
            <SalaryRelocationCalculator />
            
            {/* Use Cases */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Perfect For:</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">🎖️</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Military Transition</h3>
                  <p className="text-gray-600 text-sm">
                    Comparing civilian job offers as you transition out? Understand how salaries translate across different locations before accepting an offer.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Military Spouse Career</h3>
                  <p className="text-gray-600 text-sm">
                    Remote work opening up new opportunities? See how your current salary compares to offers in high or low cost-of-living areas.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">📍</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">PCS Planning</h3>
                  <p className="text-gray-600 text-sm">
                    Moving to a new duty station? Understand how the local economy and cost of living will affect your family&apos;s budget and lifestyle.
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">💡 Smart Career Move Tips</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-indigo-800 mb-2">Consider Beyond Salary:</h4>
                  <ul className="space-y-1 text-sm text-indigo-700">
                    <li>• Healthcare benefits and costs</li>
                    <li>• State income tax differences</li>
                    <li>• Retirement contributions (401k match, etc.)</li>
                    <li>• Work-from-home flexibility</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-indigo-800 mb-2">Military Family Factors:</h4>
                  <ul className="space-y-1 text-sm text-indigo-700">
                    <li>• BAH vs. civilian housing costs</li>
                    <li>• On-base facilities accessibility</li>
                    <li>• Military-friendly employer culture</li>
                    <li>• Remote work during PCS moves</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">📊 Cost of Living Data</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Want more detailed cost breakdowns? Check these resources for housing, transportation, and daily expenses.
                </p>
                <div className="space-y-2">
                  <a 
                    href="https://www.nerdwallet.com/cost-of-living-calculator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                  >
                    NerdWallet COL Calculator →
                  </a>
                  <a 
                    href="https://www.bestplaces.net/cost-of-living/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                  >
                    BestPlaces Cost of Living →
                  </a>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-green-900 mb-3">🎯 Transition Resources</h3>
                <p className="text-sm text-green-800 mb-3">
                  Transitioning from military to civilian career? These resources can help you navigate the process.
                </p>
                <div className="space-y-2">
                  <a 
                    href="https://www.dol.gov/agencies/vets/programs/tap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-green-600 hover:text-green-800 text-sm font-semibold underline"
                  >
                    TAP (Transition Assistance) →
                  </a>
                  <a 
                    href="https://www.hiringourheroes.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-green-600 hover:text-green-800 text-sm font-semibold underline"
                  >
                    Hiring Our Heroes →
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

