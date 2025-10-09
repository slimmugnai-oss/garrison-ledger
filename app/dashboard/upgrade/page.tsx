import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '../../components/Header';
import PaymentButton from '../../components/PaymentButton';
import BillingPortalButton from '../../components/BillingPortalButton';
import Link from 'next/link';

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
                  <span className="text-4xl font-bold text-gray-900">$15</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Advanced budgeting tools</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Detailed financial reports</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Priority customer support</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Export data to CSV/PDF</span>
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
                  Best Value
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Annual Plan
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">$150</span>
                  <span className="text-gray-600">/year</span>
                </div>
                <div className="mb-6">
                  <span className="text-lg text-green-600 font-semibold">
                    Save $30 per year!
                  </span>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Everything in Monthly</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Annual financial planning</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Tax report generation</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-900 font-medium">Priority feature requests</span>
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
              Premium Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-gray-600">Get detailed insights into your spending patterns and financial health.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Budgeting</h3>
                <p className="text-gray-600">AI-powered budget recommendations based on your spending history.</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Goal Tracking</h3>
                <p className="text-gray-600">Set and track financial goals with personalized milestones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
