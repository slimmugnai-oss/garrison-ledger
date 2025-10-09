import { currentUser } from '@clerk/nextjs/server';
import Header from '../components/Header';
import { redirect } from 'next/navigation';
import PaymentButton from '../components/PaymentButton';
import Link from 'next/link';
import PremiumStatusIndicator from '../components/PremiumStatusIndicator';
import PremiumDebug from '../components/PremiumDebug';

export default async function Dashboard() {
  // This will redirect to sign-in if user is not authenticated
  // due to the middleware protection
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user.firstName || 'User'}! 👋
              </h1>
              <PremiumStatusIndicator />
            </div>
            <p className="text-xl text-gray-600">
              Here&apos;s an overview of your financial dashboard and tools.
            </p>
          </div>

          {/* Quick Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* House Hacking Tool */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                House Hacking Calculator
              </h3>
              <p className="text-gray-600 mb-6">
                Analyze multi-unit property investments with BAH and rental income.
              </p>
              <Link 
                href="/dashboard/tools/house-hacking"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Open Tool →
              </Link>
            </div>

            {/* TSP Modeler Tool */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                TSP Modeler
              </h3>
              <p className="text-gray-600 mb-6">
                Optimize your Thrift Savings Plan allocation for maximum growth.
              </p>
              <Link 
                href="/dashboard/tools/tsp-modeler"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Open Tool →
              </Link>
            </div>

            {/* SDP Strategist Tool */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                SDP Strategist
              </h3>
              <p className="text-gray-600 mb-6">
                Maximize your Savings Deposit Program returns strategically.
              </p>
              <Link 
                href="/dashboard/tools/sdp-strategist"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Open Tool →
              </Link>
            </div>
          </div>

          {/* Assessment Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">
                🎯 Take Your Financial Assessment
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Get personalized recommendations based on your military service stage and financial goals.
              </p>
              <Link 
                href="/dashboard/assessment"
                className="inline-flex items-center bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
              >
                Start Assessment →
              </Link>
            </div>
          </div>

          {/* Premium Debug - Temporary - FORCE DEPLOY */}
          <div className="mb-12">
            <PremiumDebug />
          </div>

          {/* Premium Features */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">
                🚀 Upgrade to Premium
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Unlock advanced features, detailed explanations, and priority support for all your financial tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <PaymentButton 
                  priceId="price_1SG1IMQnBqVFfU8hOxI25Axu"
                  buttonText="Monthly - $15/month"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
                />
                <PaymentButton 
                  priceId="price_1SG1IMQnBqVFfU8h25rO6MoP"
                  buttonText="Annual - $150/year (Save $30!)"
                  className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
