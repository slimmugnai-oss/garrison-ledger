import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "PCS Hub - Complete Military Moving Guide & Financial Planning",
  description: "Master your military PCS move with our comprehensive guide. Calculate moving costs, explore house hacking opportunities, get timeline checklists, and maximize your relocation benefits.",
  path: "/pcs-hub",
  keywords: [
    "military PCS",
    "PCS planning",
    "military moving guide",
    "house hacking military",
    "VA loan real estate",
    "PCS budget calculator",
    "military relocation",
    "PCS checklist",
    "OCONUS move"
  ]
});

export default function PCSHub() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Your Complete PCS Planning Hub
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto">
                Turn every military move into an opportunity. Master the logistics, optimize your finances, and build wealth through strategic housing decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Introduction */}
          <section className="prose prose-lg max-w-none mb-16">
            <p className="text-xl text-gray-700 leading-relaxed">
              A Permanent Change of Station (PCS) is one of the most significant events in military life—and one of the most expensive. The average military family moves every 2-3 years, and each move costs thousands of dollars, disrupts careers, and challenges family stability. But with the right strategy, a PCS can also be a wealth-building opportunity.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mt-4">
              This guide covers everything you need to know: from creating a bulletproof moving budget to turning your next house into a rental property that pays you for years after you PCS again.
            </p>
          </section>

          {/* CTA: Get Personalized Plan */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-16 shadow-xl">
            <h3 className="text-3xl font-bold text-white mb-4">📋 Get Your Personalized PCS Action Plan</h3>
            <p className="text-indigo-100 text-lg mb-6">
              Every PCS is different. Tell us about your timeline, family situation, and goals, and we'll build a customized checklist and financial roadmap specifically for your move.
            </p>
            <a 
              href="/dashboard/assessment?utm_source=pcs_hub&utm_medium=cta_box&utm_campaign=assessment"
              className="inline-block bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all hover:-translate-y-1 shadow-lg"
            >
              Take 2-Minute Assessment →
            </a>
          </div>

          {/* Section 1: PCS Timeline */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">📅 Your PCS Timeline</h2>
            <p className="text-lg text-gray-700 mb-6">
              The key to a smooth PCS is starting early. Here's the ideal timeline from orders to arrival.
            </p>
            
            <div className="space-y-6">
              <div className="bg-gray-50 border-l-4 border-indigo-600 p-6 rounded-r-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">6-9 Months Before (Orders in Hand)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ Review orders and understand entitlements</li>
                  <li>✅ Create a detailed PCS budget</li>
                  <li>✅ Research housing market at new location</li>
                  <li>✅ Decide: on-base, rent, or buy?</li>
                  <li>✅ If buying: Get pre-approved for VA loan</li>
                  <li>✅ Start purging unnecessary items</li>
                </ul>
              </div>

              <div className="bg-gray-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">3-4 Months Before</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ Schedule PPM or household goods move</li>
                  <li>✅ Notify landlord (if renting)</li>
                  <li>✅ Research schools at new location</li>
                  <li>✅ Update medical records and prescriptions</li>
                  <li>✅ Begin house hunting (if buying)</li>
                </ul>
              </div>

              <div className="bg-gray-50 border-l-4 border-indigo-500 p-6 rounded-r-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">1-2 Months Before</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ Finalize housing arrangements</li>
                  <li>✅ Schedule vehicle shipment (if OCONUS)</li>
                  <li>✅ Update insurance policies</li>
                  <li>✅ Forward mail through USPS</li>
                  <li>✅ Cancel/transfer utilities</li>
                  <li>✅ Pack "essentials" box for first week</li>
                </ul>
              </div>

              <div className="bg-gray-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Week of Move</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ Final walkthrough of current home</li>
                  <li>✅ Keep important documents with you (orders, medical, financial)</li>
                  <li>✅ Take photos/video of HHG before shipment</li>
                  <li>✅ Get travel voucher/advance if needed</li>
                </ul>
              </div>

              <div className="bg-gray-50 border-l-4 border-indigo-400 p-6 rounded-r-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">First 30 Days at New Location</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ In-process at new installation</li>
                  <li>✅ Update ID cards and vehicle registration</li>
                  <li>✅ Enroll children in school</li>
                  <li>✅ Establish new medical care</li>
                  <li>✅ Submit PCS expense claims</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: PCS Budget & Finances */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">💰 PCS Budget Planning</h2>
            <p className="text-lg text-gray-700 mb-6">
              A PCS will cost you money upfront, but with proper planning, you can minimize expenses and even make money through a Personally Procured Move (PPM) or house hacking.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Typical PCS Expenses</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Before You Move:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Security deposit on new rental: <strong>$1,500-$3,000</strong></li>
                    <li>• Pet deposits/fees: <strong>$200-$500</strong></li>
                    <li>• Travel costs (gas, lodging, meals): <strong>$500-$2,000</strong></li>
                    <li>• Storage fees (if needed): <strong>$100-$300/month</strong></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">After You Arrive:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Utility setup fees: <strong>$100-$300</strong></li>
                    <li>• Furniture (if needed): <strong>$1,000-$5,000</strong></li>
                    <li>• Vehicle registration: <strong>$50-$200</strong></li>
                    <li>• Initial groceries/supplies: <strong>$300-$600</strong></li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Total out-of-pocket:</strong> $3,750 - $11,900 (most families spend $5,000-$7,000)
              </p>
            </div>

            <p className="text-lg text-gray-700 mb-4">
              Creating a detailed PCS budget is your first line of defense against unexpected costs. <a href="/dashboard/tools/house-hacking?utm_source=pcs_hub&utm_medium=inline_link&utm_campaign=budget" className="text-indigo-600 font-semibold underline hover:text-indigo-800">Use our interactive calculator</a> to model different scenarios and see exactly where your money will go.
            </p>
          </section>

          {/* CTA: House Hacking Calculator */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-16 shadow-xl">
            <h3 className="text-3xl font-bold text-white mb-4">🏡 Calculate Your House Hacking Potential</h3>
            <p className="text-indigo-100 text-lg mb-6">
              Turning your next PCS into a wealth-building opportunity starts with the numbers. Our interactive calculator shows you exactly how much rental income you could generate, your cash flow breakdown, and long-term ROI using your VA loan benefits.
            </p>
            <a 
              href="/dashboard/tools/house-hacking?utm_source=pcs_hub&utm_medium=cta_box&utm_campaign=real_estate"
              className="inline-block bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all hover:-translate-y-1 shadow-lg"
            >
              Launch House Hacking Calculator →
            </a>
          </div>

          {/* Section 3: Housing Decisions */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">🏠 On-Base vs. Off-Base vs. Buying</h2>
            <p className="text-lg text-gray-700 mb-6">
              This is the most important financial decision of your PCS. Let's break down each option.
            </p>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Option 1: On-Base Housing</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-green-700 mb-2">✅ Pros:</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• No out-of-pocket costs (BAH goes to housing)</li>
                      <li>• Close to work (save on commute)</li>
                      <li>• Utilities often included</li>
                      <li>• Built-in community support</li>
                      <li>• No landlord hassles</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-700 mb-2">❌ Cons:</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Zero equity building</li>
                      <li>• Lose full BAH (no pocketing difference)</li>
                      <li>• Less privacy/autonomy</li>
                      <li>• May require long waitlist</li>
                      <li>• Can't customize or improve</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Option 2: Rent Off-Base</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-green-700 mb-2">✅ Pros:</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Pocket BAH difference (if rent is lower)</li>
                      <li>• Choose your neighborhood/schools</li>
                      <li>• More privacy and flexibility</li>
                      <li>• Easier to find pet-friendly options</li>
                      <li>• No long-term commitment</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-700 mb-2">❌ Cons:</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Still building zero equity</li>
                      <li>• Upfront costs (deposit, utilities)</li>
                      <li>• Landlord restrictions/issues</li>
                      <li>• Longer commute often required</li>
                      <li>• Rent can increase yearly</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border border-indigo-200 rounded-xl p-6 bg-indigo-50 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Option 3: Buy with VA Loan (Recommended for Wealth Building)</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-green-700 mb-2">✅ Pros:</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• <strong>Build equity</strong> every month</li>
                      <li>• <strong>$0 down payment</strong> with VA loan</li>
                      <li>• No PMI (save $100-$200/mo)</li>
                      <li>• <strong>House hack</strong> for rental income</li>
                      <li>• Keep as rental after next PCS</li>
                      <li>• Tax deductions (mortgage interest, property tax)</li>
                      <li>• Long-term wealth building</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-700 mb-2">❌ Cons:</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Upfront closing costs ($3,000-$7,000)</li>
                      <li>• Maintenance responsibility</li>
                      <li>• Market risk (if values drop)</li>
                      <li>• Requires planning to sell or rent</li>
                      <li>• Less flexibility to move early</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-indigo-600">
                  <p className="text-gray-800 font-semibold">
                    💡 <strong>Pro Tip:</strong> Many military families overlook the wealth-building potential of each PCS. <a href="/dashboard/tools/house-hacking?utm_source=pcs_hub&utm_medium=inline_link&utm_campaign=house_hack" className="text-indigo-600 font-bold underline hover:text-indigo-800">Calculate your house hacking ROI</a> to see if turning your next home into a rental property makes sense for your situation.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Widget: PCS Readiness Check */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 mb-16 hover:border-indigo-600 transition-colors">
            <h4 className="text-2xl font-bold text-gray-900 mb-4">✅ Your PCS Readiness Check</h4>
            <p className="text-gray-700 mb-6">Are you financially prepared for your move?</p>
            <div className="bg-white p-6 rounded-lg border-l-4 border-indigo-600 mb-6">
              <div className="space-y-3">
                <div className="text-gray-700">☐ Have you calculated your estimated moving costs?</div>
                <div className="text-gray-700">☐ Do you know your housing budget at the new location?</div>
                <div className="text-gray-700">☐ Have you considered house hacking opportunities?</div>
                <div className="text-gray-700">☐ Is your emergency fund topped up for the move?</div>
              </div>
            </div>
            <a 
              href="/dashboard/assessment?utm_source=pcs_hub&utm_medium=widget&utm_campaign=readiness_check"
              className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all hover:-translate-y-1"
            >
              Get Your Complete PCS Plan →
            </a>
          </div>

          {/* Section 4: OCONUS Moves */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">🌍 OCONUS PCS: Moving Overseas</h2>
            <p className="text-lg text-gray-700 mb-6">
              An overseas PCS adds unique challenges—and opportunities. Here's what you need to know.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Key OCONUS Considerations</h3>
              <ul className="space-y-3 text-gray-700">
                <li><strong>🗓️ Timeline:</strong> Add 2-3 extra months for passport processing, international shipping, and command sponsorship approval</li>
                <li><strong>💰 COLA:</strong> You'll receive Cost of Living Allowance to offset higher prices—research the rate for your location</li>
                <li><strong>🏠 Housing:</strong> On-base often fills fast; off-base requires understanding local rental markets and lease laws</li>
                <li><strong>🚗 Vehicles:</strong> Decide which vehicles to ship (usually only 1 allowed), sell, or store stateside</li>
                <li><strong>🏫 Schools:</strong> Research DoDEA schools vs. local international schools vs. homeschooling options</li>
                <li><strong>💳 Banking:</strong> Set up international banking or ensure your U.S. bank has good overseas access</li>
              </ul>
            </div>

            <p className="text-gray-700">
              <strong>Popular OCONUS locations:</strong> Germany, Japan, South Korea, Italy, United Kingdom. Each has unique perks (and challenges) for military families.
            </p>
          </section>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-10 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Master Your Next PCS?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Get your personalized PCS action plan, timeline, and financial strategy in under 2 minutes.
            </p>
            <a 
              href="/dashboard/assessment?utm_source=pcs_hub&utm_medium=cta_box&utm_campaign=final"
              className="inline-block bg-white text-purple-600 font-bold px-10 py-5 rounded-xl text-lg hover:bg-gray-50 transition-all hover:-translate-y-1 shadow-xl"
            >
              Start Your Free Assessment →
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

