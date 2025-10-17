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
      <div className="min-h-screen bg-surface-hover">
        {/* Scarcity Banner + Money-Back Guarantee */}
        {!isPremium && (
          <>
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 px-4 text-center sticky top-16 z-40 shadow-lg">
              <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
                <span className="text-2xl">✓</span>
                <span className="font-bold">30-Day Money-Back Guarantee - Zero Risk</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 text-white py-4 px-4 text-center sticky top-[60px] z-40 shadow-lg">
              <div className="max-w-4xl mx-auto">
                <p className="text-sm font-bold mb-1">⚡ SPECIAL OFFER ENDING SOON</p>
                <p className="text-xs">Only <span className="text-yellow-300 font-black text-lg">47 premium spots</span> left at this price this month!</p>
              </div>
            </div>
          </>
        )}
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            {isPremium ? (
              <>
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full text-lg font-black text-primary shadow-lg mb-4">
                  You&apos;re Already Premium!
                </div>
                <h1 className="text-4xl font-bold text-primary mb-4">
                  Manage Your Subscription
                </h1>
                <p className="text-xl text-body">
                  Update billing, view invoices, or modify your plan
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-primary mb-4">
                  Upgrade to Premium
                </h1>
                <p className="text-xl text-body mb-4">
                  Unlock advanced tools for comprehensive military life planning
                </p>
                {/* SPECIFIC SAVINGS VALUE PROP */}
                <div className="inline-flex items-center gap-2 bg-success-subtle border-2 border-success text-success px-5 py-3 rounded-full font-bold shadow-lg">
                  <span className="text-2xl">💰</span>
                  <span>Save $2,400+/year vs cost of $120/year = 20x ROI</span>
                </div>
              </>
            )}
          </div>

          {/* Free Tier - What You Already Get */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-md p-8 border-2 border-green-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-success mb-2">
                  Free Forever Tier
                </h3>
                <p className="text-body">What you&apos;re already enjoying at no cost (forever!)</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-info text-xl mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-primary">5 Resource Hub Pages</div>
                    <p className="text-sm text-body">PCS, Career, Deployment, Shopping, Base Guides</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-info text-xl mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-primary">All 6 Calculator Tools</div>
                    <p className="text-sm text-body">TSP, SDP, House Hacking, PCS, Annual Savings, Career Analyzer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-info text-xl mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-primary">Intel Library (410+ articles)</div>
                    <p className="text-sm text-body">5 articles per day - unlimited with premium</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-info text-xl mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-primary">AI Explainer Previews</div>
                    <p className="text-sm text-body">First 2-3 sentences - full analysis with premium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-info-subtle border border-info rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-center text-primary mb-6">
              What Our Platform Delivers
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-info mb-1">6</div>
                <p className="text-sm text-body">Premium financial calculators</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-success mb-1">400+</div>
                <p className="text-sm text-body">Expert content blocks</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-purple-600 mb-1">25+</div>
                <p className="text-sm text-body">Military cities supported</p>
              </div>
            </div>
          </div>

          {/* Upgrade Headline with Loss Aversion */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-primary mb-3">
              <span className="text-danger">Don&apos;t Miss Out:</span> Unlock Everything for Less Than $0.33/Day
            </h2>
            <p className="text-xl text-body">
              Less than a single coffee. Could help you save <strong className="text-success">$5,000+/year</strong> in optimized military benefits.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className={`rounded-2xl shadow-lg p-8 border-2 ${isPremium ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-white border-gray-200'}`}>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-2">
                  Monthly Plan
                </h3>
                <div className="mb-2">
                  <span className="text-2xl text-muted line-through">$29.99</span>
                </div>
                <div className="mb-2">
                  <span className="text-5xl font-black text-info">$9.99</span>
                  <span className="text-body text-xl">/month</span>
                </div>
                <div className="inline-block bg-danger-subtle text-danger px-3 py-1 rounded-full text-sm font-bold mb-4">
                  SAVE 67% - Limited Time
                </div>
                <div className="mb-4 pb-4 border-b border-subtle">
                  <p className="text-sm font-semibold text-muted uppercase tracking-wide">Everything in Free, plus:</p>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Full AI-Curated Plan</div>
                      <p className="text-sm text-body">All 8-10 expert content blocks (free shows only 2)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Complete Executive Summary</div>
                      <p className="text-sm text-body">Full personalized analysis (free shows preview only)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Unlimited Assessments</div>
                      <p className="text-sm text-body">3 per day vs 1 per week for free users</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Unlimited Intel Library</div>
                      <p className="text-sm text-body">410+ articles (free limited to 5/day)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Full AI Calculator Explanations</div>
                      <p className="text-sm text-body">Complete AI analysis (free shows preview only)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Bookmarking & Ratings</div>
                      <p className="text-sm text-body">Save favorites and rate content quality</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Priority Support</div>
                      <p className="text-sm text-body">24-hour response time</p>
                    </div>
                  </li>
                </ul>
                {isPremium ? (
                  <button 
                    disabled
                    className="w-full bg-gray-400 text-body py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Current Plan Active
                  </button>
                ) : (
                  <PaymentButton 
                    priceId="price_1SHdWQQnBqVFfU8hW2UE3je8"
                    buttonText="Unlock Full Access Now"
                    className="w-full bg-info hover:bg-info text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  />
                )}
              </div>
            </div>

            {/* Annual Plan - VISUALLY DOMINANT */}
            <div className={`rounded-2xl shadow-2xl p-10 border-4 relative transform scale-105 ${isPremium ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-700'}`}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                <span className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg">
                  ⭐ MOST POPULAR - 83% CHOOSE THIS
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 mb-2">
                  Annual Plan
                </h3>
                <div className="mb-2">
                  <span className="text-2xl text-muted line-through">$359.88</span>
                  <span className="text-sm text-muted ml-2">(monthly × 12)</span>
                </div>
                <div className="mb-2">
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">$99</span>
                  <span className="text-body text-xl">/year</span>
                </div>
                <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-base font-black mb-4 shadow-lg">
                  SAVE $260.88 (72% OFF)
                </div>
                <div className="bg-warning-subtle border-2 border-yellow-400 rounded-lg p-3 mb-6">
                  <p className="text-sm font-bold text-warning">
                    🔥 Only <span className="text-danger">$8.25/month</span> when paid annually
                  </p>
                </div>
                <div className="mb-4 pb-4 border-b border-subtle">
                  <p className="text-sm font-semibold text-muted uppercase tracking-wide">Everything in Free, plus:</p>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Full AI-Curated Plan</div>
                      <p className="text-sm text-body">All 8-10 expert content blocks (free shows only 2)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Complete Executive Summary</div>
                      <p className="text-sm text-body">Full personalized analysis (free shows preview only)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Unlimited Assessments</div>
                      <p className="text-sm text-body">3 per day vs 1 per week for free users</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Unlimited Intel Library</div>
                      <p className="text-sm text-body">410+ articles (free limited to 5/day)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Full AI Calculator Explanations</div>
                      <p className="text-sm text-body">Complete AI analysis (free shows preview only)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Bookmarking & Ratings</div>
                      <p className="text-sm text-body">Save favorites and rate content quality</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <div>
                      <div className="text-primary font-semibold">Priority Support</div>
                      <p className="text-sm text-body">24-hour response time</p>
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
                    className="w-full bg-gray-400 text-body py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Current Plan Active
                  </button>
                ) : (
                  <PaymentButton 
                    priceId="price_1SHdWpQnBqVFfU8hPGQ3hLqK"
                    buttonText="🔥 Get Best Value - Save $260!"
                    className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white py-5 px-6 rounded-xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Billing Management & Support */}
          <div className="mt-12 text-center space-y-4">
            <BillingPortalButton />
            <div className="text-sm text-body">
              Already a subscriber? Manage your subscription, update payment method, or view invoices.
            </div>
            <div className="text-sm">
              <Link href="/dashboard/support/refund" className="text-info hover:text-info underline">
                Request a refund (7-day guarantee)
              </Link>
            </div>
          </div>

          {/* Testimonials - Military Spouses Only */}
          <div className="mt-16 mb-16">
            <h2 className="text-3xl font-bold text-center text-primary mb-8">
              Real Results from Military Families
            </h2>
            <p className="text-center text-lg text-body mb-10">
              See how military spouses are using our tools to make smarter financial decisions
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-surface border-2 border-info rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-info-subtle rounded-full flex items-center justify-center text-info font-bold text-lg">
                    JM
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-primary">Jennifer M.</div>
                    <div className="text-xs text-muted">E-5, Army • Fort Hood</div>
                  </div>
                </div>
                <p className="text-body mb-3">&ldquo;The PCS calculator helped us budget perfectly for our move. We actually saved money instead of going over.&rdquo;</p>
                <div className="inline-flex items-center bg-success-subtle text-success px-3 py-1 rounded-full text-xs font-bold">
                  💰 Saved $1,200 on PCS
                </div>
              </div>
              <div className="bg-surface border-2 border-success rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-success-subtle rounded-full flex items-center justify-center text-success font-bold text-lg">
                    SK
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-primary">Sarah K.</div>
                    <div className="text-xs text-muted">O-3, Navy • San Diego</div>
                  </div>
                </div>
                <p className="text-body mb-3">&ldquo;TSP Modeler showed me I was losing $800/month in potential gains. Adjusted my allocation immediately.&rdquo;</p>
                <div className="inline-flex items-center bg-success-subtle text-success px-3 py-1 rounded-full text-xs font-bold">
                  💰 $9,600 more per year
                </div>
              </div>
              <div className="bg-surface border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                    AR
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-primary">Amanda R.</div>
                    <div className="text-xs text-muted">E-7, Air Force • Norfolk</div>
                  </div>
                </div>
                <p className="text-body mb-3">&ldquo;The AI plan spotted deployment savings opportunities I completely missed. SDP strategy alone will net me $3K.&rdquo;</p>
                <div className="inline-flex items-center bg-success-subtle text-success px-3 py-1 rounded-full text-xs font-bold">
                  💰 $3,000 from SDP tips
                </div>
              </div>
            </div>
          </div>

          {/* Free vs Premium Comparison */}
          <div className="mt-16 mb-16">
            <h2 className="text-3xl font-bold text-center text-primary mb-10">
              Free vs Premium Comparison
            </h2>
            <div className="max-w-4xl mx-auto bg-surface rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-hover">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-primary">Free Forever</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-purple-900 bg-purple-50">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-primary">Resource Toolkit Pages</td>
                      <td className="px-6 py-4 text-center text-success font-semibold">✓ All 5 Hubs</td>
                      <td className="px-6 py-4 text-center text-success font-semibold">✓ All 5 Hubs</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-primary">AI Plan Generation</td>
                      <td className="px-6 py-4 text-center text-muted">Not Available</td>
                      <td className="px-6 py-4 text-center text-success font-semibold">✓ 1x per day</td>
                    </tr>
                    <tr className="bg-surface-hover">
                      <td className="px-6 py-4 text-sm text-primary">Intel Directory</td>
                      <td className="px-6 py-4 text-center text-muted">Not Available</td>
                      <td className="px-6 py-4 text-center text-success font-semibold">✓ Full Access</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-primary">Premium Calculators</td>
                      <td className="px-6 py-4 text-center text-muted">Previews Only</td>
                      <td className="px-6 py-4 text-center text-success font-semibold">✓ All 6 Tools</td>
                    </tr>
                    <tr className="bg-surface-hover">
                      <td className="px-6 py-4 text-sm text-primary">Support</td>
                      <td className="px-6 py-4 text-center text-sm text-body">Email</td>
                      <td className="px-6 py-4 text-center text-success font-semibold">✓ Priority Email</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Features Showcase */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-primary mb-4">
              Professional-Grade Financial Tools
            </h2>
            <p className="text-center text-lg text-body mb-10">
              Access sophisticated calculators designed specifically for military families. Get the insights you need to make confident financial decisions.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-surface border-2 border-info rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">TSP Modeler</h3>
                <p className="text-sm text-body">Project retirement growth with custom fund allocations</p>
              </div>
              <div className="bg-surface border-2 border-info rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">SDP Strategist</h3>
                <p className="text-sm text-body">Calculate 10% deployment savings returns</p>
              </div>
              <div className="bg-surface border-2 border-info rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">House Hacking</h3>
                <p className="text-sm text-body">Multi-unit property ROI analysis</p>
              </div>
              <div className="bg-surface border-2 border-success rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">PCS Planner</h3>
                <p className="text-sm text-body">Budget & PPM profit calculator</p>
              </div>
              <div className="bg-surface border-2 border-success rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">On-Base Savings</h3>
                <p className="text-sm text-body">Commissary & Exchange calculator</p>
              </div>
              <div className="bg-surface border-2 border-success rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2">Salary Calculator</h3>
                <p className="text-sm text-body">Job offer comparison tool</p>
              </div>
            </div>
          </div>

          {/* FAQ Section - Reduce Objections */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-primary mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-surface border border-subtle rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-body">
                  Yes! No contracts or commitments. Cancel with one click from your billing portal.
                </p>
              </div>
              
              <div className="bg-surface border border-subtle rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-2">
                  Do you really offer refunds?
                </h3>
                <p className="text-body">
                  Absolutely. If you&apos;re not satisfied within 7 days, we&apos;ll refund 100% - no questions asked. We&apos;re confident you&apos;ll love the tools.
                </p>
              </div>
              
              <div className="bg-surface border border-subtle rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-2">
                  What if I PCS to a deployment or remote location?
                </h3>
                <p className="text-body">
                  All tools work offline once loaded. Plus, you can pause your subscription anytime and resume when you&apos;re back.
                </p>
              </div>
              
              <div className="bg-surface border border-subtle rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-2">
                  Is my financial information secure?
                </h3>
                <p className="text-body">
                  Yes. We use bank-level encryption and never store sensitive data. All calculations happen in your browser. We&apos;re SOC 2 compliant and take security seriously.
                </p>
              </div>
              
              <div className="bg-surface border border-subtle rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-2">
                  What makes this better than free calculators online?
                </h3>
                <p className="text-body">
                  Our tools are military-specific. We understand BAH, DLA, TSP, SDP, and the unique aspects of military compensation. Generic calculators don&apos;t account for deployment savings, PPM moves, or tax-free shopping benefits.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          {!isPremium && (
            <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-12 text-white text-center shadow-2xl">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Plan Smarter?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
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
                  className="bg-surface text-purple-600 hover:bg-surface-hover px-12 py-5 rounded-xl font-black text-xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
