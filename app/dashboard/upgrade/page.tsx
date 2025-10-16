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
                  You&apos;re Already Premium!
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
                  Free Forever Tier
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
                    <div className="font-semibold text-gray-900">All 6 Calculator Tools</div>
                    <p className="text-sm text-gray-600">TSP, SDP, House Hacking, PCS, Annual Savings, Career Analyzer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Intel Library (410+ articles)</div>
                    <p className="text-sm text-gray-600">5 articles per day - unlimited with premium</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">AI Explainer Previews</div>
                    <p className="text-sm text-gray-600">First 2-3 sentences - full analysis with premium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
              What Our Platform Delivers
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-blue-600 mb-1">6</div>
                <p className="text-sm text-gray-600">Premium financial calculators</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-green-600 mb-1">400+</div>
                <p className="text-sm text-gray-600">Expert content blocks</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-purple-600 mb-1">25+</div>
                <p className="text-sm text-gray-600">Military cities supported</p>
              </div>
            </div>
          </div>

          {/* Upgrade Headline with Loss Aversion */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              <span className="text-red-600">Don&apos;t Miss Out:</span> Unlock Everything for Less Than $0.33/Day
            </h2>
            <p className="text-xl text-gray-600">
              Less than a single coffee. Could help you save <strong className="text-green-600">$5,000+/year</strong> in optimized military benefits.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className={`rounded-2xl shadow-lg p-8 border-2 ${isPremium ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-white border-gray-200'}`}>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Monthly Plan
                </h3>
                <div className="mb-2">
                  <span className="text-2xl text-gray-400 line-through">$29.99</span>
                </div>
                <div className="mb-2">
                  <span className="text-5xl font-black text-blue-600">$9.99</span>
                  <span className="text-gray-600 text-xl">/month</span>
                </div>
                <div className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold mb-4">
                  SAVE 67% - Limited Time
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Everything in Free, plus:</p>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Full AI-Curated Plan</div>
                      <p className="text-sm text-gray-600">All 8-10 expert content blocks (free shows only 2)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Complete Executive Summary</div>
                      <p className="text-sm text-gray-600">Full personalized analysis (free shows preview only)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Unlimited Assessments</div>
                      <p className="text-sm text-gray-600">3 per day vs 1 per week for free users</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Unlimited Intel Library</div>
                      <p className="text-sm text-gray-600">410+ articles (free limited to 5/day)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Full AI Calculator Explanations</div>
                      <p className="text-sm text-gray-600">Complete AI analysis (free shows preview only)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Bookmarking & Ratings</div>
                      <p className="text-sm text-gray-600">Save favorites and rate content quality</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Priority Support</div>
                      <p className="text-sm text-gray-600">24-hour response time</p>
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
                    buttonText="Unlock Full Access Now"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  />
                )}
              </div>
            </div>

            {/* Annual Plan - VISUALLY DOMINANT */}
            <div className={`rounded-2xl shadow-2xl p-10 border-4 relative transform scale-105 ${isPremium ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-500'}`}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg">
                  ⭐ MOST POPULAR - 83% CHOOSE THIS
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                  Annual Plan
                </h3>
                <div className="mb-2">
                  <span className="text-2xl text-gray-400 line-through">$359.88</span>
                  <span className="text-sm text-gray-500 ml-2">(monthly × 12)</span>
                </div>
                <div className="mb-2">
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">$99</span>
                  <span className="text-gray-600 text-xl">/year</span>
                </div>
                <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-base font-black mb-4 shadow-lg">
                  SAVE $260.88 (72% OFF)
                </div>
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 mb-6">
                  <p className="text-sm font-bold text-yellow-900">
                    🔥 Only <span className="text-red-600">$8.25/month</span> when paid annually
                  </p>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Everything in Free, plus:</p>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Full AI-Curated Plan</div>
                      <p className="text-sm text-gray-600">All 8-10 expert content blocks (free shows only 2)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Complete Executive Summary</div>
                      <p className="text-sm text-gray-600">Full personalized analysis (free shows preview only)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Unlimited Assessments</div>
                      <p className="text-sm text-gray-600">3 per day vs 1 per week for free users</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Unlimited Intel Library</div>
                      <p className="text-sm text-gray-600">410+ articles (free limited to 5/day)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Full AI Calculator Explanations</div>
                      <p className="text-sm text-gray-600">Complete AI analysis (free shows preview only)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Bookmarking & Ratings</div>
                      <p className="text-sm text-gray-600">Save favorites and rate content quality</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-gray-900 font-semibold">Priority Support</div>
                      <p className="text-sm text-gray-600">24-hour response time</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-purple-900 font-bold">Save 2 months per year</div>
                      <p className="text-sm text-purple-600">Pay for 10, get 12 months</p>
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
                    buttonText="🔥 Get Best Value - Save $260!"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-5 px-6 rounded-xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
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

          {/* Testimonials - Military Spouses Only */}
          <div className="mt-16 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Real Results from Military Families
            </h2>
            <p className="text-center text-lg text-gray-600 mb-10">
              See how military spouses are using our tools to make smarter financial decisions
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                <p className="text-gray-700 mb-4">&ldquo;The PCS calculator helped us budget perfectly for our move. We actually saved money instead of going over.&rdquo;</p>
                <div className="text-sm font-semibold text-gray-900">Jennifer M.</div>
                <div className="text-xs text-gray-500">Military Spouse • Fort Hood</div>
              </div>
              <div className="bg-white border-2 border-green-200 rounded-xl p-6">
                <p className="text-gray-700 mb-4">&ldquo;Finally found a retirement calculator that understands military pay. Much clearer than generic tools online.&rdquo;</p>
                <div className="text-sm font-semibold text-gray-900">Sarah K.</div>
                <div className="text-xs text-gray-500">Military Spouse • San Diego</div>
              </div>
              <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
                <p className="text-gray-700 mb-4">&ldquo;The AI-curated plan gave us a clear path forward for our financial goals. Worth every penny.&rdquo;</p>
                <div className="text-sm font-semibold text-gray-900">Amanda R.</div>
                <div className="text-xs text-gray-500">Military Spouse • Norfolk</div>
              </div>
            </div>
          </div>

          {/* Free vs Premium Comparison */}
          <div className="mt-16 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
              Free vs Premium Comparison
            </h2>
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free Forever</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-purple-900 bg-purple-50">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Resource Toolkit Pages</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓ All 5 Hubs</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓ All 5 Hubs</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">AI Plan Generation</td>
                      <td className="px-6 py-4 text-center text-gray-400">Not Available</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓ 1x per day</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">Intel Directory</td>
                      <td className="px-6 py-4 text-center text-gray-400">Not Available</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓ Full Access</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Premium Calculators</td>
                      <td className="px-6 py-4 text-center text-gray-400">Previews Only</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓ All 6 Tools</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">Support</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">Email</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓ Priority Email</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Features Showcase */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Professional-Grade Financial Tools
            </h2>
            <p className="text-center text-lg text-gray-600 mb-10">
              Access sophisticated calculators designed specifically for military families. Get the insights you need to make confident financial decisions.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">TSP Modeler</h3>
                <p className="text-sm text-gray-600">Project retirement growth with custom fund allocations</p>
              </div>
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">SDP Strategist</h3>
                <p className="text-sm text-gray-600">Calculate 10% deployment savings returns</p>
              </div>
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">House Hacking</h3>
                <p className="text-sm text-gray-600">Multi-unit property ROI analysis</p>
              </div>
              <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">PCS Planner</h3>
                <p className="text-sm text-gray-600">Budget & PPM profit calculator</p>
              </div>
              <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">On-Base Savings</h3>
                <p className="text-sm text-gray-600">Commissary & Exchange calculator</p>
              </div>
              <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
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
                  All tools work offline once loaded. Plus, you can pause your subscription anytime and resume when you&apos;re back.
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
                Get instant access to all premium tools and calculators
              </p>
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-black mb-2">$99/year</div>
                  <div className="text-lg text-indigo-200 mb-4">Save 2 months vs. monthly</div>
                  <div className="text-sm text-indigo-300 mb-6">
                    Less than $8.25/month • Cancel anytime
                  </div>
                </div>
                <PaymentButton 
                  priceId="price_1SHdWpQnBqVFfU8hPGQ3hLqK"
                  buttonText="Start Annual Plan"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-5 rounded-xl font-black text-xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
