import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PaymentButton from '../../components/PaymentButton';
import BillingPortalButton from '../../components/BillingPortalButton';
import Link from 'next/link';
import Icon from '../../components/ui/Icon';
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

  // Check user's current tier
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();
  
  const currentTier = entitlement?.tier || 'free';
  const isPremium = currentTier === 'premium' && entitlement?.status === 'active';
  const isPro = currentTier === 'pro' && entitlement?.status === 'active';
  const isPaid = isPremium || isPro;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Subtle background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />
        
        {/* Trust Banners - Only for non-paid users */}
        {!isPaid && (
          <>
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 px-4 text-center sticky top-16 z-30 shadow-lg">
              <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
                <Icon name="Shield" className="w-5 h-5" />
                <span className="font-bold text-sm sm:text-base">7-Day Money-Back Guarantee</span>
              </div>
            </div>
          </>
        )}
        
        <div className="mobile-container py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            {isPaid ? (
              <>
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full text-base sm:text-lg font-black text-slate-900 shadow-lg mb-4">
                  <Icon name="Star" className="w-5 h-5 mr-2" />
                  {isPro ? "You're a Pro Member!" : "You're Premium!"}
                </div>
                <h1 className="mobile-heading text-3xl sm:text-4xl md:text-5xl font-serif font-black text-text-headings mb-4">
                  Manage Your Subscription
                </h1>
                <p className="text-lg sm:text-xl text-text-body max-w-2xl mx-auto">
                  Update billing, view invoices, or modify your plan
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
                  <Icon name="TrendingUp" className="w-4 h-4" />
                  <span>Join 500+ Military Families</span>
                </div>
                <h1 className="mobile-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black text-text-headings mb-4 sm:mb-6">
                  Unlock Your Complete
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
                    Military Life Command Center
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-text-body mb-6 sm:mb-8 max-w-3xl mx-auto">
                  Everything you need to master military finances, from PCS moves to TSP optimization
                </p>
                {/* Value Prop */}
                <div className="inline-flex items-center gap-3 bg-success-subtle border-2 border-success text-success px-5 py-3 rounded-full font-bold shadow-lg mobile-safe">
                  <span className="text-sm sm:text-base break-words">Save $2,400+/year vs $120/year = 20x ROI</span>
                </div>
              </>
            )}
          </div>

          {/* Free Tier - What Everyone Gets */}
          <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
            <div className="mobile-card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 mb-3">
                  <Icon name="Gift" className="w-6 h-6 text-success" />
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-success">
                    Free Forever Tier
                  </h3>
                </div>
                <p className="text-text-body">What everyone gets at no cost (forever!)</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <div className="min-w-0">
                    <div className="font-semibold text-text-headings">5 Resource Hub Pages</div>
                    <p className="text-sm text-text-body break-words">PCS, Career, Deployment, Shopping, Base Guides</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <div className="min-w-0">
                    <div className="font-semibold text-text-headings">All 6 Calculator Tools</div>
                    <p className="text-sm text-text-body break-words">TSP, SDP, House Hacking, PCS, Savings, Career</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <div className="min-w-0">
                    <div className="font-semibold text-text-headings">Intel Library Access</div>
                    <p className="text-sm text-text-body break-words">410+ articles, 5 per day</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <div className="min-w-0">
                    <div className="font-semibold text-text-headings">AI-Curated Plan Preview</div>
                    <p className="text-sm text-text-body break-words">2 content blocks, 1 plan/month</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <div className="min-w-0">
                    <div className="font-semibold text-text-headings">AI Explainer Previews</div>
                    <p className="text-sm text-text-body break-words">5 per day, first 2-3 sentences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <div className="min-w-0">
                    <div className="font-semibold text-text-headings">Binder Storage</div>
                    <p className="text-sm text-text-body break-words">25 MB for important documents</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Headline */}
          {!isPaid && (
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-headings mb-3">
                Choose Your Plan
              </h2>
              <p className="text-lg sm:text-xl text-text-body max-w-2xl mx-auto">
                Professional military financial planning tools starting at less than a coffee per day
              </p>
            </div>
          )}

          {/* Monthly Plans - HERO (Avoid Sticker Shock) */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16">
            {/* Premium Monthly - HERO */}
            <div className="mobile-card rounded-2xl shadow-xl p-6 sm:p-10 border-2 border-slate-300 bg-white relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg whitespace-nowrap">
                  ⭐ MOST POPULAR - 83% CHOOSE THIS
                </span>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                    Premium
                  </h3>
                  <p className="text-text-muted text-sm">Most popular choice</p>
                </div>
                <div className="mb-6">
                  <div className="text-5xl sm:text-6xl font-black text-slate-900">$9.99</div>
                  <div className="text-text-body text-lg">per month</div>
                  <p className="text-sm text-text-muted mt-2">Cancel anytime, no commitment</p>
                </div>

                {/* Features Grid */}
                <div className="text-left mb-8 space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon name="Sparkles" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <div className="font-bold text-text-headings">AI-Powered Intelligence</div>
                      </div>
                    </div>
                    <ul className="space-y-2 ml-8">
                      <li className="text-sm text-text-body">• 10 AI plans/month (vs 1 for free)</li>
                      <li className="text-sm text-text-body">• All 8-10 expert content blocks</li>
                      <li className="text-sm text-text-body">• Complete executive summaries</li>
                      <li className="text-sm text-text-body">• 15 AI explainers/day (vs 5 for free)</li>
                      <li className="text-sm text-text-body font-semibold text-blue-700">• PCS Money Copilot (Premium only!)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon name="BookOpen" className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <div className="font-bold text-text-headings">Unlimited Content Access</div>
                      </div>
                    </div>
                    <ul className="space-y-2 ml-8">
                      <li className="text-sm text-text-body">• Intel Library: Unlimited articles</li>
                      <li className="text-sm text-text-body">• Bookmark & rate content</li>
                      <li className="text-sm text-text-body">• Advanced search & filters</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon name="FolderOpen" className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <div className="font-bold text-text-headings">Enhanced Storage & Tools</div>
                      </div>
                    </div>
                    <ul className="space-y-2 ml-8">
                      <li className="text-sm text-text-body">• 1 GB Binder storage (vs 25 MB)</li>
                      <li className="text-sm text-text-body">• Expiration tracking & alerts</li>
                      <li className="text-sm text-text-body">• Priority support (24hr response)</li>
                    </ul>
                  </div>
                </div>

                {isPaid ? (
                  <button 
                    disabled
                    className="mobile-button w-full bg-gray-400 text-body cursor-not-allowed"
                  >
                    {isPremium ? 'Current Plan' : 'Contact to Downgrade'}
                  </button>
                ) : (
                  <PaymentButton 
                    priceId="price_1SHdWQQnBqVFfU8hW2UE3je8"
                    buttonText="Start Premium Monthly"
                    className="mobile-button w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-lg hover:shadow-xl transition-all"
                  />
                )}
              </div>
            </div>

            {/* Pro Monthly */}
            <div className="mobile-card rounded-2xl shadow-xl p-6 sm:p-10 border-2 border-orange-300 bg-white relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg whitespace-nowrap">
                  FOR POWER USERS
                </span>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-orange-900 mb-2">
                    Pro
                  </h3>
                  <p className="text-text-muted text-sm">Maximum AI capacity</p>
                </div>
                <div className="mb-6">
                  <div className="text-5xl sm:text-6xl font-black text-orange-600">$24.99</div>
                  <div className="text-text-body text-lg">per month</div>
                  <p className="text-sm text-text-muted mt-2">Cancel anytime, no commitment</p>
                </div>

                {/* Features Grid */}
                <div className="text-left mb-8 space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon name="Sparkles" className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <div className="font-bold text-text-headings">Maximum AI Power</div>
                      </div>
                    </div>
                    <ul className="space-y-2 ml-8">
                      <li className="text-sm text-text-body font-semibold text-orange-800">• 30 AI plans/month (3x Premium!)</li>
                      <li className="text-sm text-text-body font-semibold text-orange-800">• 30 AI explainers/day (2x Premium!)</li>
                      <li className="text-sm text-text-body font-semibold text-orange-800">• PCS Money Copilot (included!)</li>
                      <li className="text-sm text-text-body">• Priority AI processing</li>
                      <li className="text-sm text-text-body">• Everything from Premium</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon name="FolderOpen" className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <div className="font-bold text-text-headings">Massive Storage</div>
                      </div>
                    </div>
                    <ul className="space-y-2 ml-8">
                      <li className="text-sm text-text-body font-semibold text-orange-800">• 10 GB Binder storage (10x Premium!)</li>
                      <li className="text-sm text-text-body">• Store entire deployment folders</li>
                      <li className="text-sm text-text-body">• Unlimited document uploads</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon name="MessageCircle" className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <div className="font-bold text-text-headings">VIP Treatment</div>
                      </div>
                    </div>
                    <ul className="space-y-2 ml-8">
                      <li className="text-sm text-text-body">• White-Glove support (4hr response)</li>
                      <li className="text-sm text-text-body">• Direct priority email access</li>
                      <li className="text-sm text-text-body">• Early access to beta features</li>
                    </ul>
                  </div>
                </div>

                {isPaid ? (
                  <button 
                    disabled={isPro}
                    className={`mobile-button w-full ${isPro ? 'bg-gray-400 text-body cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'}`}
                  >
                    {isPro ? 'Current Plan' : 'Upgrade to Pro'}
                  </button>
                ) : (
                  <PaymentButton 
                    priceId="price_1SJOFTQnBqVFfU8hcALojXhY"
                    buttonText="Start Pro Monthly"
                    className="mobile-button w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Annual Plans - Save Even More */}
          {!isPaid && (
            <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-text-headings mb-2">
                  Save More with Annual Billing
                </h3>
                <p className="text-text-body">Pay upfront and save up to 2 months</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Premium Annual */}
                <div className="mobile-card bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-text-headings mb-2">Premium Annual</h4>
                    <div>
                      <span className="text-3xl font-black text-slate-700">$99</span>
                      <span className="text-text-body">/year</span>
                    </div>
                    <p className="text-sm text-success mt-2 font-semibold">Save $20.88 (only $8.25/mo)</p>
                  </div>
                  <PaymentButton 
                    priceId="price_1SHdWpQnBqVFfU8hPGQ3hLqK"
                    buttonText="Get Premium Annual"
                    className="mobile-button w-full bg-slate-700 hover:bg-slate-800 text-white"
                  />
                </div>

                {/* Pro Annual */}
                <div className="mobile-card bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-text-headings mb-2">Pro Annual</h4>
                    <div>
                      <span className="text-3xl font-black text-orange-600">$250</span>
                      <span className="text-text-body">/year</span>
                    </div>
                    <p className="text-sm text-success mt-2 font-semibold">Save $49.88 (only $20.83/mo)</p>
                  </div>
                  <PaymentButton 
                    priceId="price_1SJOFTQnBqVFfU8hAxbEoVff"
                    buttonText="Get Pro Annual"
                    className="mobile-button w-full bg-orange-600 hover:bg-orange-700 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="max-w-6xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-text-headings mb-8 sm:mb-10">
              Complete Feature Comparison
            </h2>
            <div className="mobile-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-surface-hover">
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-text-headings">Feature</th>
                      <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-text-headings">Free</th>
                      <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-slate-900 bg-slate-50">Premium</th>
                      <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-orange-900 bg-orange-50">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="bg-blue-50">
                      <td colSpan={4} className="px-4 sm:px-6 py-2 text-sm font-bold text-blue-900">
                        <Icon name="Sparkles" className="w-4 h-4 inline mr-2" />
                        AI-Powered Planning
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">AI Plans Per Month</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-text-body">1</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">10</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-orange-600 font-black">30</td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">Content Blocks in Plan</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-text-body">2 preview</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">All 8-10</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">All 8-10</td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">AI Explainers Per Day</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-text-body">5</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">15</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-orange-600 font-black">30</td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">PCS Money Copilot</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-danger">✗</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">✓ Unlimited</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-orange-600 font-black">✓ Unlimited</td>
                    </tr>
                    
                    <tr className="bg-purple-50">
                      <td colSpan={4} className="px-4 sm:px-6 py-2 text-sm font-bold text-purple-900">
                        <Icon name="BookOpen" className="w-4 h-4 inline mr-2" />
                        Content Library
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">Intel Library Access</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-text-body">5/day</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">Unlimited</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">Bookmarking & Ratings</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-danger">✗</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">✓</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">✓</td>
                    </tr>

                    <tr className="bg-orange-50">
                      <td colSpan={4} className="px-4 sm:px-6 py-2 text-sm font-bold text-orange-900">
                        <Icon name="FolderOpen" className="w-4 h-4 inline mr-2" />
                        Document Binder
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">Storage Space</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-text-body">25 MB</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">1 GB</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-orange-600 font-black">10 GB</td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">Expiration Tracking</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">✓</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">✓</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">✓</td>
                    </tr>

                    <tr className="bg-green-50">
                      <td colSpan={4} className="px-4 sm:px-6 py-2 text-sm font-bold text-green-900">
                        <Icon name="Calculator" className="w-4 h-4 inline mr-2" />
                        Financial Tools
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">Calculator Access</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">All 6 Tools</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">All 6 Tools</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">All 6 Tools</td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">Resource Hubs</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">All 5 Hubs</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">All 5 Hubs</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold">All 5 Hubs</td>
                    </tr>

                    <tr className="bg-slate-50">
                      <td colSpan={4} className="px-4 sm:px-6 py-2 text-sm font-bold text-slate-900">
                        <Icon name="MessageCircle" className="w-4 h-4 inline mr-2" />
                        Support & Access
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">Support Response</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-text-body text-xs sm:text-sm">48hr email</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-success font-semibold text-xs sm:text-sm">24hr priority</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-orange-600 font-black text-xs sm:text-sm">4hr direct</td>
                    </tr>
                    <tr>
                      <td className="px-4 sm:px-6 py-3 text-sm text-text-body">Beta Feature Access</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-danger">✗</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-danger">✗</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-orange-600 font-black">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-text-headings mb-8">
              Real Results from Military Families
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              <div className="mobile-card bg-white border-2 border-blue-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    JM
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-headings truncate">Jennifer M.</div>
                    <div className="text-xs text-text-muted truncate">E-5, Army • Fort Hood</div>
                  </div>
                </div>
                <p className="text-sm text-text-body mb-3">&ldquo;The PCS calculator helped us budget perfectly. We actually saved money instead of going over.&rdquo;</p>
                <div className="inline-flex items-center bg-success-subtle text-success px-3 py-1 rounded-full text-xs font-bold">
                  💰 Saved $1,200
                </div>
              </div>

              <div className="mobile-card bg-white border-2 border-green-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0">
                    SK
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-headings truncate">Sarah K.</div>
                    <div className="text-xs text-text-muted truncate">O-3, Navy • San Diego</div>
                  </div>
                </div>
                <p className="text-sm text-text-body mb-3">&ldquo;TSP Modeler showed me I was losing $800/month. Adjusted my allocation immediately.&rdquo;</p>
                <div className="inline-flex items-center bg-success-subtle text-success px-3 py-1 rounded-full text-xs font-bold">
                  💰 $9,600/year
                </div>
              </div>

              <div className="mobile-card bg-white border-2 border-purple-100 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold flex-shrink-0">
                    AR
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-headings truncate">Amanda R.</div>
                    <div className="text-xs text-text-muted truncate">E-7, Air Force • Norfolk</div>
                  </div>
                </div>
                <p className="text-sm text-text-body mb-3">&ldquo;The AI plan spotted deployment savings I missed. SDP strategy alone will net me $3K.&rdquo;</p>
                <div className="inline-flex items-center bg-success-subtle text-success px-3 py-1 rounded-full text-xs font-bold">
                  💰 $3,000 SDP
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-text-headings mb-8 sm:mb-10">
              Frequently Asked Questions
            </h2>
            <div className="mobile-spacing">
              <div className="mobile-card">
                <h3 className="text-base sm:text-lg font-bold text-text-headings mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-sm sm:text-base text-text-body">
                  Yes! No contracts. Cancel with one click from your billing portal.
                </p>
              </div>
              
              <div className="mobile-card">
                <h3 className="text-base sm:text-lg font-bold text-text-headings mb-2">
                  Do you really offer refunds?
                </h3>
                <p className="text-sm sm:text-base text-text-body">
                  Yes. 7-day money-back guarantee. If you're not satisfied within the first week, we'll refund 100% - no questions asked.
                </p>
              </div>
              
              <div className="mobile-card">
                <h3 className="text-base sm:text-lg font-bold text-text-headings mb-2">
                  Is my financial data secure?
                </h3>
                <p className="text-sm sm:text-base text-text-body">
                  Yes. Bank-level encryption. All calculations happen in your browser. We never store sensitive financial data.
                </p>
              </div>
            </div>
          </div>

          {/* Billing Management */}
          {isPaid && (
            <div className="text-center mobile-spacing">
              <BillingPortalButton />
              <div className="text-sm text-text-body">
                Manage subscription, update payment method, or view invoices
              </div>
            </div>
          )}

          {/* Final CTA */}
          {!isPaid && (
            <div className="mobile-card bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center shadow-2xl">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
                Ready to Master Military Life?
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join 500+ military families making smarter financial decisions
              </p>
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-black mb-2">$99/year</div>
                  <div className="text-base sm:text-lg text-blue-200 mb-4">Save 2 months vs monthly • Only $8.25/month</div>
                  <div className="text-sm text-blue-300 mb-6">
                    7-day money-back guarantee • Cancel anytime
                  </div>
                </div>
                <PaymentButton 
                  priceId="price_1SHdWpQnBqVFfU8hPGQ3hLqK"
                  buttonText="Start Premium Annual"
                  className="mobile-button bg-white text-slate-900 hover:bg-slate-50 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
