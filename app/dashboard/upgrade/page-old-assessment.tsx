import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { generatePageMeta } from "@/lib/seo-config";
import { supabaseAdmin } from "@/lib/supabase/admin";

import BillingPortalButton from "../../components/BillingPortalButton";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import PaymentButton from "../../components/PaymentButton";
import Icon from "../../components/ui/Icon";

export const metadata: Metadata = generatePageMeta({
  title: "Upgrade to Premium - Unlock Full Military Life Planning",
  description:
    "Get unlimited access to all TSP, SDP, and house hacking calculators, personalized action plans, and priority support. $9.99/month or $99/year.",
  path: "/dashboard/upgrade",
  keywords: [
    "premium military planning",
    "TSP calculator premium",
    "military life planning subscription",
    "upgrade account",
  ],
});

export default async function UpgradePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check user's current tier
  const { data: entitlement } = await supabaseAdmin
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentTier = entitlement?.tier || "free";
  const isPremium = currentTier === "premium" && entitlement?.status === "active";
  const isPro = currentTier === "pro" && entitlement?.status === "active";
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
            <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-3 text-center text-white shadow-lg">
              <div className="mx-auto flex max-w-4xl items-center justify-center gap-3">
                <Icon name="Shield" className="h-5 w-5" />
                <span className="text-sm font-bold sm:text-base">7-Day Money-Back Guarantee</span>
              </div>
            </div>
          </>
        )}

        <div className="mobile-container py-12 sm:py-16">
          {/* Header */}
          <div className="mb-12 text-center sm:mb-16">
            {isPaid ? (
              <>
                <div className="mb-4 inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-6 py-3 text-base font-black text-slate-900 shadow-lg sm:text-lg">
                  <Icon name="Star" className="mr-2 h-5 w-5" />
                  {isPro ? "You're a Pro Member!" : "You're Premium!"}
                </div>
                <h1 className="mobile-heading text-text-headings mb-4 font-serif text-3xl font-black sm:text-4xl md:text-5xl">
                  Manage Your Subscription
                </h1>
                <p className="text-text-body mx-auto max-w-2xl text-lg sm:text-xl">
                  Update billing, view invoices, or modify your plan
                </p>
              </>
            ) : (
              <>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-2 text-sm font-bold text-white shadow-lg">
                  <Icon name="TrendingUp" className="h-4 w-4" />
                  <span>Join 500+ Military Families</span>
                </div>
                <h1 className="mobile-heading text-text-headings mb-4 font-serif text-3xl font-black sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
                  Unlock Your Complete
                  <span className="block bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                    Military Life Command Center
                  </span>
                </h1>
                <p className="text-text-body mx-auto mb-6 max-w-3xl text-lg sm:mb-8 sm:text-xl">
                  Everything you need to master military finances, from PCS moves to TSP
                  optimization
                </p>
                {/* Value Prop */}
                <div className="bg-success-subtle mobile-safe inline-flex items-center gap-3 rounded-full border-2 border-success px-5 py-3 font-bold text-success shadow-lg">
                  <span className="break-words text-sm sm:text-base">
                    Save $2,400+/year vs $120/year = 20x ROI
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Free Tier - What Everyone Gets */}
          <div className="mx-auto mb-12 max-w-4xl sm:mb-16">
            <div className="mobile-card border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="mb-6 text-center">
                <div className="mb-3 inline-flex items-center gap-2">
                  <Icon name="Gift" className="h-6 w-6 text-success" />
                  <h3 className="font-serif text-2xl font-bold text-success sm:text-3xl">
                    Free Forever Tier
                  </h3>
                </div>
                <p className="text-text-body">What everyone gets at no cost (forever!)</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-5 w-5 flex-shrink-0 text-success" />
                  <div className="min-w-0">
                    <div className="text-text-headings font-semibold">5 Resource Hub Pages</div>
                    <p className="text-text-body break-words text-sm">
                      PCS, Career, Deployment, Shopping, Base Guides
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-5 w-5 flex-shrink-0 text-success" />
                  <div className="min-w-0">
                    <div className="text-text-headings font-semibold">All 6 Calculator Tools</div>
                    <p className="text-text-body break-words text-sm">
                      TSP, SDP, House Hacking, PCS, Savings, Career
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-5 w-5 flex-shrink-0 text-success" />
                  <div className="min-w-0">
                    <div className="text-text-headings font-semibold">Intel Library Access</div>
                    <p className="text-text-body break-words text-sm">410+ articles, 5 per day</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-5 w-5 flex-shrink-0 text-success" />
                  <div className="min-w-0">
                    <div className="text-text-headings font-semibold">AI-Curated Plan Preview</div>
                    <p className="text-text-body break-words text-sm">
                      2 content blocks, 1 plan/month
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-5 w-5 flex-shrink-0 text-success" />
                  <div className="min-w-0">
                    <div className="text-text-headings font-semibold">AI Explainer Previews</div>
                    <p className="text-text-body break-words text-sm">
                      5 per day, first 2-3 sentences
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="mt-1 h-5 w-5 flex-shrink-0 text-success" />
                  <div className="min-w-0">
                    <div className="text-text-headings font-semibold">Binder Storage</div>
                    <p className="text-text-body break-words text-sm">
                      25 MB for important documents
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Headline */}
          {!isPaid && (
            <div className="mb-10 text-center sm:mb-12">
              <h2 className="text-text-headings mb-3 font-serif text-3xl font-bold sm:text-4xl">
                Choose Your Plan
              </h2>
              <p className="text-text-body mx-auto max-w-2xl text-lg sm:text-xl">
                Professional military financial planning tools starting at less than a coffee per
                day
              </p>
            </div>
          )}

          {/* Monthly Plans - HERO (Avoid Sticker Shock) */}
          <div className="mx-auto mb-12 grid max-w-6xl gap-6 sm:mb-16 sm:gap-8 lg:grid-cols-2">
            {/* Premium Monthly - HERO */}
            <div className="mobile-card relative rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-xl sm:p-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-slate-700 to-slate-900 px-4 py-1.5 text-xs font-black text-white shadow-lg">
                  ⭐ MOST POPULAR - 83% CHOOSE THIS
                </span>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="mb-2 text-2xl font-black text-slate-900 sm:text-3xl">Premium</h3>
                  <p className="text-text-muted text-sm">Most popular choice</p>
                </div>
                <div className="mb-6">
                  <div className="text-5xl font-black text-slate-900 sm:text-6xl">$9.99</div>
                  <div className="text-text-body text-lg">per month</div>
                  <p className="text-text-muted mt-2 text-sm">Cancel anytime, no commitment</p>
                </div>

                {/* Features Grid */}
                <div className="mb-8 space-y-4 text-left">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <Icon name="Sparkles" className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                      <div className="min-w-0">
                        <div className="text-text-headings font-bold">AI-Powered Intelligence</div>
                      </div>
                    </div>
                    <ul className="ml-8 space-y-2">
                      <li className="text-text-body text-sm">
                        • 10 AI plans/month (vs 1 for free)
                      </li>
                      <li className="text-text-body text-sm">• All 8-10 expert content blocks</li>
                      <li className="text-text-body text-sm">• Complete executive summaries</li>
                      <li className="text-text-body text-sm">
                        • 15 AI explainers/day (vs 5 for free)
                      </li>
                      <li className="text-text-body text-sm font-semibold text-blue-700">
                        • PCS Money Copilot (Premium & Pro)
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <Icon
                        name="BookOpen"
                        className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600"
                      />
                      <div className="min-w-0">
                        <div className="text-text-headings font-bold">Unlimited Content Access</div>
                      </div>
                    </div>
                    <ul className="ml-8 space-y-2">
                      <li className="text-text-body text-sm">
                        • Intel Library: Unlimited articles
                      </li>
                      <li className="text-text-body text-sm">• Bookmark & rate content</li>
                      <li className="text-text-body text-sm">• Advanced search & filters</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <Icon
                        name="FolderOpen"
                        className="mt-1 h-5 w-5 flex-shrink-0 text-orange-600"
                      />
                      <div className="min-w-0">
                        <div className="text-text-headings font-bold">Enhanced Storage & Tools</div>
                      </div>
                    </div>
                    <ul className="ml-8 space-y-2">
                      <li className="text-text-body text-sm">• 1 GB Binder storage (vs 25 MB)</li>
                      <li className="text-text-body text-sm">• Expiration tracking & alerts</li>
                      <li className="text-text-body text-sm">• Priority support (24hr response)</li>
                    </ul>
                  </div>
                </div>

                {isPaid ? (
                  <button
                    disabled
                    className="mobile-button text-body w-full cursor-not-allowed bg-gray-400"
                  >
                    {isPremium ? "Current Plan" : "Contact to Downgrade"}
                  </button>
                ) : (
                  <PaymentButton
                    priceId="price_1SHdWQQnBqVFfU8hW2UE3je8"
                    buttonText="Start Premium Monthly"
                    className="mobile-button w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg transition-all hover:from-slate-800 hover:to-slate-900 hover:shadow-xl"
                  />
                )}
              </div>
            </div>

            {/* Pro Monthly */}
            <div className="mobile-card relative rounded-2xl border-2 border-orange-300 bg-white p-6 shadow-xl sm:p-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-orange-600 to-red-600 px-4 py-1.5 text-xs font-black text-white shadow-lg">
                  FOR POWER USERS
                </span>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="mb-2 text-2xl font-black text-orange-900 sm:text-3xl">Pro</h3>
                  <p className="text-text-muted text-sm">Maximum AI capacity</p>
                </div>
                <div className="mb-6">
                  <div className="text-5xl font-black text-orange-600 sm:text-6xl">$24.99</div>
                  <div className="text-text-body text-lg">per month</div>
                  <p className="text-text-muted mt-2 text-sm">Cancel anytime, no commitment</p>
                </div>

                {/* Features Grid */}
                <div className="mb-8 space-y-4 text-left">
                  <div className="rounded-lg border border-orange-200 bg-white p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <Icon
                        name="Sparkles"
                        className="mt-1 h-5 w-5 flex-shrink-0 text-orange-600"
                      />
                      <div className="min-w-0">
                        <div className="text-text-headings font-bold">Maximum AI Power</div>
                      </div>
                    </div>
                    <ul className="ml-8 space-y-2">
                      <li className="text-text-body text-sm font-semibold text-orange-800">
                        • 30 AI plans/month (3x Premium!)
                      </li>
                      <li className="text-text-body text-sm font-semibold text-orange-800">
                        • 30 AI explainers/day (2x Premium!)
                      </li>
                      <li className="text-text-body text-sm font-semibold text-orange-800">
                        • PCS Money Copilot (Premium & Pro)
                      </li>
                      <li className="text-text-body text-sm">• Priority AI processing</li>
                      <li className="text-text-body text-sm">• Everything from Premium</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-orange-200 bg-white p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <Icon
                        name="FolderOpen"
                        className="mt-1 h-5 w-5 flex-shrink-0 text-orange-600"
                      />
                      <div className="min-w-0">
                        <div className="text-text-headings font-bold">Massive Storage</div>
                      </div>
                    </div>
                    <ul className="ml-8 space-y-2">
                      <li className="text-text-body text-sm font-semibold text-orange-800">
                        • 10 GB Binder storage (10x Premium!)
                      </li>
                      <li className="text-text-body text-sm">• Store entire deployment folders</li>
                      <li className="text-text-body text-sm">• Unlimited document uploads</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-orange-200 bg-white p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <Icon
                        name="MessageCircle"
                        className="mt-1 h-5 w-5 flex-shrink-0 text-orange-600"
                      />
                      <div className="min-w-0">
                        <div className="text-text-headings font-bold">VIP Treatment</div>
                      </div>
                    </div>
                    <ul className="ml-8 space-y-2">
                      <li className="text-text-body text-sm">
                        • White-Glove support (4hr response)
                      </li>
                      <li className="text-text-body text-sm">• Direct priority email access</li>
                      <li className="text-text-body text-sm">• Early access to beta features</li>
                    </ul>
                  </div>
                </div>

                {isPaid ? (
                  <button
                    disabled={isPro}
                    className={`mobile-button w-full ${isPro ? "text-body cursor-not-allowed bg-gray-400" : "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"}`}
                  >
                    {isPro ? "Current Plan" : "Upgrade to Pro"}
                  </button>
                ) : (
                  <PaymentButton
                    priceId="price_1SJOFTQnBqVFfU8hcALojXhY"
                    buttonText="Start Pro Monthly"
                    className="mobile-button w-full bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transition-all hover:from-orange-700 hover:to-red-700 hover:shadow-xl"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Annual Plans - Save Even More */}
          {!isPaid && (
            <div className="mx-auto mb-12 max-w-4xl sm:mb-16">
              <div className="mb-6 text-center">
                <h3 className="text-text-headings mb-2 text-xl font-bold sm:text-2xl">
                  Save More with Annual Billing
                </h3>
                <p className="text-text-body">Pay upfront and save up to 2 months</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                {/* Premium Annual */}
                <div className="mobile-card border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                  <div className="mb-4 text-center">
                    <h4 className="text-text-headings mb-2 text-lg font-bold">Premium Annual</h4>
                    <div>
                      <span className="text-3xl font-black text-slate-700">$99</span>
                      <span className="text-text-body">/year</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-success">
                      Save $20.88 (only $8.25/mo)
                    </p>
                  </div>
                  <PaymentButton
                    priceId="price_1SHdWpQnBqVFfU8hPGQ3hLqK"
                    buttonText="Get Premium Annual"
                    className="mobile-button w-full bg-slate-700 text-white hover:bg-slate-800"
                  />
                </div>

                {/* Pro Annual */}
                <div className="mobile-card border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="mb-4 text-center">
                    <h4 className="text-text-headings mb-2 text-lg font-bold">Pro Annual</h4>
                    <div>
                      <span className="text-3xl font-black text-orange-600">$250</span>
                      <span className="text-text-body">/year</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-success">
                      Save $49.88 (only $20.83/mo)
                    </p>
                  </div>
                  <PaymentButton
                    priceId="price_1SJOFTQnBqVFfU8hAxbEoVff"
                    buttonText="Get Pro Annual"
                    className="mobile-button w-full bg-orange-600 text-white hover:bg-orange-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="mx-auto mb-12 max-w-6xl sm:mb-16">
            <h2 className="text-text-headings mb-8 text-center font-serif text-2xl font-bold sm:mb-10 sm:text-3xl">
              Complete Feature Comparison
            </h2>
            <div className="mobile-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-surface-hover">
                      <th className="text-text-headings px-4 py-4 text-left text-sm font-semibold sm:px-6">
                        Feature
                      </th>
                      <th className="text-text-headings px-4 py-4 text-center text-sm font-semibold sm:px-6">
                        Free
                      </th>
                      <th className="bg-slate-50 px-4 py-4 text-center text-sm font-semibold text-slate-900 sm:px-6">
                        Premium
                      </th>
                      <th className="bg-orange-50 px-4 py-4 text-center text-sm font-semibold text-orange-900 sm:px-6">
                        Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="bg-blue-50">
                      <td colSpan={4} className="px-4 py-2 text-sm font-bold text-blue-900 sm:px-6">
                        <Icon name="Sparkles" className="mr-2 inline h-4 w-4" />
                        AI-Powered Planning
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">
                        AI Plans Per Month
                      </td>
                      <td className="text-text-body px-4 py-3 text-center sm:px-6">1</td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        10
                      </td>
                      <td className="px-4 py-3 text-center font-black text-orange-600 sm:px-6">
                        30
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">
                        Content Blocks in Plan
                      </td>
                      <td className="text-text-body px-4 py-3 text-center sm:px-6">2 preview</td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        All 8-10
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        All 8-10
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">
                        AI Explainers Per Day
                      </td>
                      <td className="text-text-body px-4 py-3 text-center sm:px-6">5</td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        15
                      </td>
                      <td className="px-4 py-3 text-center font-black text-orange-600 sm:px-6">
                        30
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">
                        PCS Money Copilot
                      </td>
                      <td className="px-4 py-3 text-center text-danger sm:px-6">✗</td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        ✓ Unlimited
                      </td>
                      <td className="px-4 py-3 text-center font-black text-orange-600 sm:px-6">
                        ✓ Unlimited
                      </td>
                    </tr>

                    <tr className="bg-purple-50">
                      <td
                        colSpan={4}
                        className="px-4 py-2 text-sm font-bold text-purple-900 sm:px-6"
                      >
                        <Icon name="BookOpen" className="mr-2 inline h-4 w-4" />
                        Content Library
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">
                        Intel Library Access
                      </td>
                      <td className="text-text-body px-4 py-3 text-center sm:px-6">5/day</td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        Unlimited
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        Unlimited
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">
                        Bookmarking & Ratings
                      </td>
                      <td className="px-4 py-3 text-center text-danger sm:px-6">✗</td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        ✓
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        ✓
                      </td>
                    </tr>

                    <tr className="bg-orange-50">
                      <td
                        colSpan={4}
                        className="px-4 py-2 text-sm font-bold text-orange-900 sm:px-6"
                      >
                        <Icon name="FolderOpen" className="mr-2 inline h-4 w-4" />
                        Document Binder
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">Storage Space</td>
                      <td className="text-text-body px-4 py-3 text-center sm:px-6">25 MB</td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        1 GB
                      </td>
                      <td className="px-4 py-3 text-center font-black text-orange-600 sm:px-6">
                        10 GB
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">
                        Expiration Tracking
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        ✓
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        ✓
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        ✓
                      </td>
                    </tr>

                    <tr className="bg-green-50">
                      <td
                        colSpan={4}
                        className="px-4 py-2 text-sm font-bold text-green-900 sm:px-6"
                      >
                        <Icon name="Calculator" className="mr-2 inline h-4 w-4" />
                        Financial Tools
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">
                        Calculator Access
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        All 6 Tools
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        All 6 Tools
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        All 6 Tools
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">Resource Hubs</td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        All 5 Hubs
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        All 5 Hubs
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success sm:px-6">
                        All 5 Hubs
                      </td>
                    </tr>

                    <tr className="bg-slate-50">
                      <td
                        colSpan={4}
                        className="px-4 py-2 text-sm font-bold text-slate-900 sm:px-6"
                      >
                        <Icon name="MessageCircle" className="mr-2 inline h-4 w-4" />
                        Support & Access
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">Support Response</td>
                      <td className="text-text-body px-4 py-3 text-center text-xs sm:px-6 sm:text-sm">
                        48hr email
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-semibold text-success sm:px-6 sm:text-sm">
                        24hr priority
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-black text-orange-600 sm:px-6 sm:text-sm">
                        4hr direct
                      </td>
                    </tr>
                    <tr>
                      <td className="text-text-body px-4 py-3 text-sm sm:px-6">
                        Beta Feature Access
                      </td>
                      <td className="px-4 py-3 text-center text-danger sm:px-6">✗</td>
                      <td className="px-4 py-3 text-center text-danger sm:px-6">✗</td>
                      <td className="px-4 py-3 text-center font-black text-orange-600 sm:px-6">
                        ✓
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-text-headings mb-8 text-center font-serif text-2xl font-bold sm:text-3xl">
              Real Results from Military Families
            </h2>
            <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              <div className="mobile-card border-2 border-blue-100 bg-white transition-shadow hover:shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                    JM
                  </div>
                  <div className="min-w-0">
                    <div className="text-text-headings truncate text-sm font-semibold">
                      Jennifer M.
                    </div>
                    <div className="text-text-muted truncate text-xs">E-5, Army • Fort Hood</div>
                  </div>
                </div>
                <p className="text-text-body mb-3 text-sm">
                  &ldquo;The PCS calculator helped us budget perfectly. We actually saved money
                  instead of going over.&rdquo;
                </p>
                <div className="bg-success-subtle inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-success">
                  💰 Saved $1,200
                </div>
              </div>

              <div className="mobile-card border-2 border-green-100 bg-white transition-shadow hover:shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">
                    SK
                  </div>
                  <div className="min-w-0">
                    <div className="text-text-headings truncate text-sm font-semibold">
                      Sarah K.
                    </div>
                    <div className="text-text-muted truncate text-xs">O-3, Navy • San Diego</div>
                  </div>
                </div>
                <p className="text-text-body mb-3 text-sm">
                  &ldquo;TSP Modeler showed me I was losing $800/month. Adjusted my allocation
                  immediately.&rdquo;
                </p>
                <div className="bg-success-subtle inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-success">
                  💰 $9,600/year
                </div>
              </div>

              <div className="mobile-card border-2 border-purple-100 bg-white transition-shadow hover:shadow-lg sm:col-span-2 lg:col-span-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600">
                    AR
                  </div>
                  <div className="min-w-0">
                    <div className="text-text-headings truncate text-sm font-semibold">
                      Amanda R.
                    </div>
                    <div className="text-text-muted truncate text-xs">E-7, Air Force • Norfolk</div>
                  </div>
                </div>
                <p className="text-text-body mb-3 text-sm">
                  &ldquo;The AI plan spotted deployment savings I missed. SDP strategy alone will
                  net me $3K.&rdquo;
                </p>
                <div className="bg-success-subtle inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-success">
                  💰 $3,000 SDP
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mx-auto mb-12 max-w-3xl sm:mb-16">
            <h2 className="text-text-headings mb-8 text-center font-serif text-2xl font-bold sm:mb-10 sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="mobile-spacing">
              <div className="mobile-card">
                <h3 className="text-text-headings mb-2 text-base font-bold sm:text-lg">
                  Can I cancel anytime?
                </h3>
                <p className="text-text-body text-sm sm:text-base">
                  Yes! No contracts. Cancel with one click from your billing portal.
                </p>
              </div>

              <div className="mobile-card">
                <h3 className="text-text-headings mb-2 text-base font-bold sm:text-lg">
                  Do you really offer refunds?
                </h3>
                <p className="text-text-body text-sm sm:text-base">
                  Yes. 7-day money-back guarantee. If you're not satisfied within the first week,
                  we'll refund 100% - no questions asked.
                </p>
              </div>

              <div className="mobile-card">
                <h3 className="text-text-headings mb-2 text-base font-bold sm:text-lg">
                  Is my financial data secure?
                </h3>
                <p className="text-text-body text-sm sm:text-base">
                  Yes. Bank-level encryption. All calculations happen in your browser. We never
                  store sensitive financial data.
                </p>
              </div>
            </div>
          </div>

          {/* Billing Management */}
          {isPaid && (
            <div className="mobile-spacing text-center">
              <BillingPortalButton />
              <div className="text-text-body text-sm">
                Manage subscription, update payment method, or view invoices
              </div>
            </div>
          )}

          {/* Final CTA */}
          {!isPaid && (
            <div className="mobile-card bg-gradient-to-br from-slate-900 to-slate-800 text-center text-white shadow-2xl">
              <h2 className="mb-4 font-serif text-3xl font-bold sm:text-4xl">
                Ready to Master Military Life?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 sm:text-xl">
                Join 500+ military families making smarter financial decisions
              </p>
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <div className="mb-2 text-4xl font-black sm:text-5xl">$99/year</div>
                  <div className="mb-4 text-base text-blue-200 sm:text-lg">
                    Save 2 months vs monthly • Only $8.25/month
                  </div>
                  <div className="mb-6 text-sm text-blue-300">
                    7-day money-back guarantee • Cancel anytime
                  </div>
                </div>
                <PaymentButton
                  priceId="price_1SHdWpQnBqVFfU8hPGQ3hLqK"
                  buttonText="Start Premium Annual"
                  className="mobile-button bg-white text-slate-900 shadow-xl transition-all hover:-translate-y-1 hover:bg-slate-50 hover:shadow-2xl"
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
