import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '../../components/Header';
import PaymentButton from '../../components/PaymentButton';
import BillingPortalButton from '../../components/BillingPortalButton';
import Testimonials from '../../components/ui/Testimonials';
import ComparisonTable from '../../components/ui/ComparisonTable';
import Link from 'next/link';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "Upgrade to Premium - Unlock Full Military Life Planning",
  description: "Get unlimited access to all TSP, SDP, and house hacking calculators, personalized action plans, and priority support. $9.99/month or $99/year.",
  path: "/dashboard/upgrade",
  keywords: ["premium military planning", "TSP calculator premium", "military life planning subscription", "upgrade account"]
});

export default async function UpgradePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check if user is already premium
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();
  
  const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            {isPremium ? (
              <>
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full text-lg font-black text-gray-900 shadow-lg mb-4">
                  ⭐ You&apos;re Already Premium!
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Manage Your Subscription
                </h1>
                <p className="text-xl text-gray-600">
                  Update billing, view invoices, or modify your plan
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Upgrade to Premium
                </h1>
                <p className="text-xl text-gray-600">
                  Unlock advanced tools for comprehensive military life planning
                </p>
              </>
            )}
          </div>

          {/* Free Tier - What You Already Get */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-md p-8 border-2 border-green-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  ✓ Free Forever Tier
                </h3>
                <p className="text-gray-700">What you&apos;re already enjoying at no cost (forever!)</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">5 Resource Hub Pages</div>
                    <p className="text-sm text-gray-600">PCS, Career, Deployment, Shopping, Base Guides</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Personal Assessment</div>
                    <p className="text-sm text-gray-600">Comprehensive financial situation questionnaire</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Action Plan Preview</div>
                    <p className="text-sm text-gray-600">See your personalized recommendations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Tool Previews</div>
                    <p className="text-sm text-gray-600">Limited access to TSP, SDP, House Hacking calculators</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Trusted by Military Families Worldwide
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-blue-600 mb-1">$2.4M+</div>
                <p className="text-sm text-gray-600">Retirement savings projected</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-green-600 mb-1">1,200+</div>
                <p className="text-sm text-gray-600">Active military families</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-purple-600 mb-1">847</div>
                <p className="text-sm text-gray-600">PCS moves planned this month</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-amber-600 mb-1">4.8★</div>
                <p className="text-sm text-gray-600">Average user rating</p>
              </div>
            </div>
          </div>

          {/* Upgrade Headline */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Unlock Everything for $9.99/Month</h2>
            <p className="text-xl text-gray-600">Less than a Starbucks coffee. Potentially worth thousands in savings.</p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className={`rounded-2xl shadow-lg p-8 border-2 ${isPremium ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-white border-gray-200'}`}>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Monthly Plan
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$9.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Everything in Free, plus:</p>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">TSP Modeler</div>
                      <p className="text-sm text-gray-600">Unlimited retirement projections with all fund allocations</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">SDP Strategist</div>
                      <p className="text-sm text-gray-600">Deployment savings calculator with 10% guaranteed returns</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">House Hacking Calculator</div>
                      <p className="text-sm text-gray-600">Multi-unit property ROI with BAH optimization</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">PCS Financial Planner</div>
                      <p className="text-sm text-gray-600">Budget calculator + PPM profit estimator</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">On-Base Savings Calculator</div>
                      <p className="text-sm text-gray-600">Commissary & Exchange annual savings tracker</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Salary & Relocation Calculator</div>
                      <p className="text-sm text-gray-600">Job offer comparison across 25+ military cities</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Intel Library (400+ Blocks)</div>
                      <p className="text-sm text-gray-600">Searchable database of expert military life content</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Unlimited Plan Regeneration</div>
                      <p className="text-sm text-gray-600">Update strategic plan as life changes</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Priority Support</div>
                      <p className="text-sm text-gray-600">Email support with 24-hour response time</p>
                    </div>
                  </li>
                </ul>
                {isPremium ? (
                  <button 
                    disabled
                    className="w-full bg-gray-400 text-gray-600 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Current Plan Active
                  </button>
                ) : (
                  <PaymentButton 
                    priceId="price_1SHdWQQnBqVFfU8hW2UE3je8"
                    buttonText="Start Monthly Plan"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold"
                  />
                )}
              </div>
            </div>

            {/* Annual Plan */}
            <div className={`rounded-2xl shadow-lg p-8 border-2 relative ${isPremium ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-white border-purple-500'}`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-black shadow-lg">
                  ⭐ MOST POPULAR · BEST VALUE
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Annual Plan
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/year</span>
                </div>
                <div className="mb-6">
                  <span className="text-lg text-green-600 font-semibold">
                    Save $20.88 per year!
                  </span>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Everything in Free, plus:</p>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">All 6 Premium Calculators</div>
                      <p className="text-sm text-gray-600">TSP, SDP, House Hacking, PCS, Savings, Salary</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Intel Library (400+ Blocks)</div>
                      <p className="text-sm text-gray-600">Searchable database of expert content</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Unlimited Strategic Plans</div>
                      <p className="text-sm text-gray-600">AI-personalized roadmaps, regenerate anytime</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Priority Support</div>
                      <p className="text-sm text-gray-600">24-hour email response time</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 text-xl mt-0.5">★</span>
                    <div>
                      <div className="text-purple-900 font-bold">Save $20.88 = 2 FREE Months!</div>
                      <p className="text-sm text-purple-600">17% discount vs. monthly billing</p>
                    </div>
                  </li>
                </ul>
                {isPremium ? (
                  <button 
                    disabled
                    className="w-full bg-gray-400 text-gray-600 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Current Plan Active
                  </button>
                ) : (
                  <PaymentButton 
                    priceId="price_1SHdWpQnBqVFfU8hPGQ3hLqK"
                    buttonText="Start Annual Plan"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Billing Management & Support */}
          <div className="mt-12 text-center space-y-4">
            <BillingPortalButton />
            <div className="text-sm text-gray-600">
              Already a subscriber? Manage your subscription, update payment method, or view invoices.
            </div>
            <div className="text-sm">
              <Link href="/dashboard/support/refund" className="text-blue-600 hover:text-blue-700 underline">
                Request a refund (7-day guarantee)
              </Link>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-16 mb-16">
            <Testimonials />
          </div>

          {/* Comparison Table */}
          <div className="mt-16 mb-16">
            <ComparisonTable />
          </div>

          {/* Features Showcase */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              All 6 Premium Calculators Included
            </h2>
            <p className="text-center text-lg text-gray-600 mb-10">
              Each calculator would cost $200+ from a financial advisor. Get all 6 for $9.99/month.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">📈</div>
                <h3 className="text-lg font-bold mb-2">TSP Modeler</h3>
                <p className="text-sm text-gray-600">Project retirement growth with custom fund allocations</p>
              </div>
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="text-lg font-bold mb-2">SDP Strategist</h3>
                <p className="text-sm text-gray-600">Calculate 10% deployment savings returns</p>
              </div>
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">🏡</div>
                <h3 className="text-lg font-bold mb-2">House Hacking</h3>
                <p className="text-sm text-gray-600">Multi-unit property ROI analysis</p>
              </div>
              <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">🚚</div>
                <h3 className="text-lg font-bold mb-2">PCS Planner</h3>
                <p className="text-sm text-gray-600">Budget & PPM profit calculator</p>
              </div>
              <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">🛒</div>
                <h3 className="text-lg font-bold mb-2">On-Base Savings</h3>
                <p className="text-sm text-gray-600">Commissary & Exchange calculator</p>
              </div>
              <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">💼</div>
                <h3 className="text-lg font-bold mb-2">Salary Calculator</h3>
                <p className="text-sm text-gray-600">Job offer comparison tool</p>
              </div>
            </div>
          </div>

          {/* FAQ Section - Reduce Objections */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-gray-600">
                  Yes! No contracts or commitments. Cancel with one click from your billing portal.
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Do you really offer refunds?
                </h3>
                <p className="text-gray-600">
                  Absolutely. If you&apos;re not satisfied within 7 days, we&apos;ll refund 100% - no questions asked. We&apos;re confident you&apos;ll love the tools.
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What if I PCS to a deployment or remote location?
                </h3>
                <p className="text-gray-600">
                  All tools work offline once loaded. We&apos;re also adding downloadable PDF reports soon. Plus, you can pause your subscription anytime and resume when you&apos;re back.
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Is my financial information secure?
                </h3>
                <p className="text-gray-600">
                  Yes. We use bank-level encryption and never store sensitive data. All calculations happen in your browser. We&apos;re SOC 2 compliant and take security seriously.
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What makes this better than free calculators online?
                </h3>
                <p className="text-gray-600">
                  Our tools are military-specific. We understand BAH, DLA, TSP, SDP, and the unique aspects of military compensation. Generic calculators don&apos;t account for deployment savings, PPM moves, or tax-free shopping benefits.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          {!isPremium && (
            <div className="mt-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-12 text-white text-center shadow-2xl">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Plan Smarter?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join 1,200+ military families using our premium tools to optimize their finances and future
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="bg-white/20 backdrop-blur border border-white/30 rounded-xl p-4">
                  <div className="text-3xl font-black mb-1">$9.99/mo</div>
                  <div className="text-sm text-indigo-200">or $99/year (save 17%)</div>
                </div>
                <div className="flex flex-col gap-2">
                  <PaymentButton 
                    priceId="price_1SHdWpQnBqVFfU8hPGQ3hLqK"
                    buttonText="Start Annual Plan ($99) →"
                    className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-4 rounded-xl font-black text-lg shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
                  />
                  <p className="text-xs text-indigo-200">🛡️ 7-Day Money-Back Guarantee</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
