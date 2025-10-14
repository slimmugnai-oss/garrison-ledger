import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '../../components/Header';
import PaymentButton from '../../components/PaymentButton';
import BillingPortalButton from '../../components/BillingPortalButton';
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
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-md p-8 border-2 border-gray-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Free Preview
                </h3>
                <p className="text-gray-600">What you&apos;re already enjoying at no cost</p>
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

          {/* Upgrade Headline */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Unlock Full Access</h2>
            <p className="text-lg text-gray-600">Get unlimited use of all premium tools and features</p>
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
                      <div className="text-gray-900 font-semibold">Unlimited TSP Modeling</div>
                      <p className="text-sm text-gray-600">Full allocation optimizer with growth projections</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Complete SDP Analysis</div>
                      <p className="text-sm text-gray-600">Strategic payout calculator with ROI scenarios</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Full House Hacking Tool</div>
                      <p className="text-sm text-gray-600">Complete cash flow and rental income analysis</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Advanced Action Plans</div>
                      <p className="text-sm text-gray-600">Full access to all 19 curated content blocks</p>
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
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Save 17%
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
                      <div className="text-gray-900 font-semibold">All Premium Tools</div>
                      <p className="text-sm text-gray-600">Unlimited access to TSP, SDP, House Hacking</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Complete Action Plans</div>
                      <p className="text-sm text-gray-600">All 19 curated content blocks unlocked</p>
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
                      <div className="text-purple-900 font-bold">Save $20.88/Year</div>
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

          {/* Features Comparison */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              What You Get with Premium
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">TSP Optimizer</h3>
                <p className="text-gray-600">Model different fund allocations and project retirement growth with historical data.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">SDP Strategist</h3>
                <p className="text-gray-600">Calculate deployment savings and compare payout strategies for maximum wealth building.</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">House Hacking ROI</h3>
                <p className="text-gray-600">Analyze rental income potential and turn your next PCS into a wealth opportunity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
