import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '../../components/Header';
import PaymentButton from '../../components/PaymentButton';
import BillingPortalButton from '../../components/BillingPortalButton';
import Link from 'next/link';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "Upgrade to Premium - Unlock Full Military Financial Planning",
  description: "Get unlimited access to all TSP, SDP, and house hacking calculators, personalized action plans, and priority support. $9.99/month or $99/year.",
  path: "/dashboard/upgrade",
  keywords: ["premium military finance", "TSP calculator premium", "military financial planning subscription", "upgrade account"]
});

export default async function UpgradePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Upgrade to Premium
            </h1>
            <p className="text-xl text-gray-600">
              Unlock advanced features for better financial management
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Monthly Plan
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$9.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">TSP Allocation Optimizer</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">SDP Payout Strategist</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">House Hacking Calculator</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Personalized Action Plans</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Priority Support</span>
                  </li>
                </ul>
                <PaymentButton 
                  priceId="price_1SG5O6QnBqVFfU8h13gbu3rd"
                  buttonText="Start Monthly Plan"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold"
                />
              </div>
            </div>

            {/* Annual Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-500 relative">
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
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">All Premium Tools</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Personalized Action Plans</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Priority Support</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">17% Savings</span>
                  </li>
                </ul>
                <PaymentButton 
                  priceId="price_1SG5O6QnBqVFfU8hpUBOAfPe"
                  buttonText="Start Annual Plan"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold"
                />
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
