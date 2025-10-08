import { currentUser } from '@clerk/nextjs/server';
import Header from '../components/Header';
import { redirect } from 'next/navigation';
import PaymentButton from '../components/PaymentButton';

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.firstName || 'User'}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here&apos;s an overview of your financial dashboard.
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Balance Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Current Balance
              </h3>
              <p className="text-3xl font-bold text-green-600">
                $0.00
              </p>
              <p className="text-sm text-gray-500 mt-1">
                No transactions yet
              </p>
            </div>

            {/* Monthly Income Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Monthly Income
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                $0.00
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This month
              </p>
            </div>

            {/* Monthly Expenses Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Monthly Expenses
              </h3>
              <p className="text-3xl font-bold text-red-600">
                $0.00
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This month
              </p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Transactions
                </h2>
              </div>
              <div className="px-6 py-8 text-center text-gray-500">
                <p className="text-lg">No transactions yet</p>
                <p className="text-sm mt-1">
                  Start by adding your first transaction
                </p>
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                🚀 Upgrade to Premium - Fixed Build
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Unlock advanced features like budgeting, detailed reports, and priority support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <PaymentButton 
                  priceId="price_1SG1IMQnBqVFfU8hOxI25Axu"
                  buttonText="Monthly - $15/month"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                />
                <PaymentButton 
                  priceId="price_1SG1IMQnBqVFfU8h25rO6MoP"
                  buttonText="Annual - $150/year (Save $30!)"
                  className="bg-green-500 text-white hover:bg-green-600"
                />
                <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-purple-600 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                Add Income
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                Add Expense
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                Add Transfer
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
