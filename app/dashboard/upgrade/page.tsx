/**
 * UPGRADE PAGE - TOOLS-FIRST (v5.0)
 * 
 * Clear tool benefits, simple pricing
 */

import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PaymentButton from '../../components/PaymentButton';
import BillingPortalButton from '../../components/BillingPortalButton';
import Icon from '../../components/ui/Icon';

export const metadata: Metadata = {
  title: "Upgrade to Premium - Garrison Ledger",
  description: "Unlimited access to 4 premium tools: LES Auditor, Base Navigator, TDY Copilot, Intel Library. $9.99/month.",
};

export default async function UpgradePage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

  if (isPremium) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <Icon name="Star" className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              You're Already Premium!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Enjoy unlimited access to all 4 tools
            </p>
            <BillingPortalButton />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 font-lora mb-4">
              Upgrade to Premium
            </h1>
            <p className="text-2xl text-gray-600 mb-6">
              Unlock unlimited access to all 4 premium tools
            </p>
            <p className="text-lg text-gray-500">
              One price. Four tools. Unlimited use.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-10 shadow-xl">
              <div className="text-center mb-8">
                <div className="text-6xl font-black text-gray-900 mb-2">
                  $9.99
                  <span className="text-2xl text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">or $99/year (save $20)</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Unlimited LES Audits</p>
                    <p className="text-sm text-gray-600">Catch pay errors every month</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Full Base Navigator</p>
                    <p className="text-sm text-gray-600">See ALL neighborhoods, not just top 3</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Unlimited TDY Receipts</p>
                    <p className="text-sm text-gray-600">Build compliant vouchers with unlimited uploads</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Premium Intel Cards</p>
                    <p className="text-sm text-gray-600">Advanced tax, investment, and benefits guides</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">All Calculators</p>
                    <p className="text-sm text-gray-600">TSP, SDP, House Hacking, and more</p>
                  </div>
                </div>
              </div>

              <PaymentButton
                priceId={process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || ''}
                buttonText="Upgrade to Premium - $9.99/month"
                className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg"
              />

              <p className="text-center text-sm text-gray-600 mt-4">
                7-day money-back guarantee • Cancel anytime
              </p>
            </div>
          </div>

          {/* Comparison */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Free vs Premium
            </h2>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-900 bg-blue-50">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">LES Audits</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">1/month</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">Base Navigator</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">Top 3 results</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">Full rankings</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">TDY Receipts</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">3 per trip</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">Intel Library</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">Basic cards</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">All premium cards</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">Calculators</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">All 6 tools</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">All 6 tools</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

