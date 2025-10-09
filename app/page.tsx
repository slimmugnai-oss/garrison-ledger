import Header from "./components/Header";
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              📊 Garrison Ledger
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your comprehensive financial toolkit for military personnel. 
              Plan, track, and optimize your financial future with specialized tools.
            </p>
            
            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl">
                    Get Started Free
                  </button>
                </SignUpButton>
                <Link 
                  href="/dashboard/assessment"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  Take Assessment
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link 
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                </Link>
                <Link 
                  href="/dashboard/assessment"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  Take Assessment
                </Link>
              </div>
            </SignedIn>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">House Hacking Calculator</h3>
              <p className="text-gray-600 mb-6">
                Analyze multi-unit property investments with BAH and rental income calculations.
              </p>
              <Link 
                href="/dashboard/tools/house-hacking"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Try House Tool →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">TSP Modeler</h3>
              <p className="text-gray-600 mb-6">
                Optimize your Thrift Savings Plan allocation for maximum retirement growth.
              </p>
              <Link 
                href="/dashboard/tools/tsp-modeler"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Try TSP Tool →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SDP Strategist</h3>
              <p className="text-gray-600 mb-6">
                Maximize your Savings Deposit Program returns with strategic investment planning.
              </p>
              <Link 
                href="/dashboard/tools/sdp-strategist"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Try SDP Tool →
              </Link>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of military personnel who trust Garrison Ledger for their financial planning.
            </p>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg">
                  Start Your Free Account
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg inline-block"
              >
                Access Your Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </>
  );
}
