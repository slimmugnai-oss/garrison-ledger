'use client';

import { useState, useEffect } from 'react';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import { track } from '@/lib/track';

type TabMode = 'basic' | 'ppm';

export default function PcsFinancialPlanner() {
  const { isPremium } = usePremiumStatus();
  const [activeTab, setActiveTab] = useState<TabMode>('basic');
  
  // Basic Calculator state
  const [dla, setDla] = useState(1500);
  const [perDiem, setPerDiem] = useState(800);
  const [ppmIncentive, setPpmIncentive] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [travelCosts, setTravelCosts] = useState(600);
  const [lodging, setLodging] = useState(1200);
  const [deposits, setDeposits] = useState(2000);
  const [otherExpenses, setOtherExpenses] = useState(500);
  
  // PPM Profit Estimator state
  const [ppmWeight, setPpmWeight] = useState(8000);
  const [ppmDistance, setPpmDistance] = useState(1200);
  const [truckRental, setTruckRental] = useState(800);
  const [gas, setGas] = useState(400);
  const [supplies, setSupplies] = useState(200);
  const [ppmOther, setPpmOther] = useState(100);

  // Track page view on mount
  useEffect(() => {
    track('pcs_financial_planner_view');
  }, []);

  // Basic Calculator calculations
  const totalIncome = dla + perDiem + ppmIncentive + otherIncome;
  const totalExpenses = travelCosts + lodging + deposits + otherExpenses;
  const netEstimate = totalIncome - totalExpenses;

  // PPM calculations (simplified estimation)
  // Government typically pays ~95% of what it would cost them to move you
  // Rough estimate: $0.16 per pound per 1000 miles
  const govtPayment = (ppmWeight / 1000) * (ppmDistance / 1000) * 160 * 0.95;
  const yourCosts = truckRental + gas + supplies + ppmOther;
  const netProfit = govtPayment - yourCosts;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                activeTab === 'basic'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Basic PCS Calculator
            </button>
            <button
              onClick={() => setActiveTab('ppm')}
              className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                activeTab === 'ppm'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚚 PPM Profit Estimator
            </button>
          </nav>
        </div>
      </div>

      {/* Basic Calculator Tab */}
      {activeTab === 'basic' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">PCS Budget Calculator</h3>
          <p className="text-gray-600 mb-8">
            Estimate your net financial position during a PCS move by tracking income and expenses.
          </p>

          <div className="space-y-8">
            {/* Income Section */}
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  +
                </span>
                Estimated Income
              </h4>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dislocation Allowance (DLA)
                    <span className="text-blue-600 ml-1 cursor-help" title="Based on rank and dependents">ℹ️</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={dla}
                      onChange={(e) => setDla(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="1500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Per Diem / Travel Allowance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={perDiem}
                      onChange={(e) => setPerDiem(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PPM Incentive (if applicable)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={ppmIncentive}
                      onChange={(e) => setPpmIncentive(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Allowances
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={otherIncome}
                      onChange={(e) => setOtherIncome(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-red-100 text-red-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  −
                </span>
                Estimated Expenses
              </h4>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Costs (Gas, Food, etc.)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={travelCosts}
                      onChange={(e) => setTravelCosts(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temporary Lodging
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={lodging}
                      onChange={(e) => setLodging(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="1200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Housing Deposits & Fees
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={deposits}
                      onChange={(e) => setDeposits(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Expenses
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={otherExpenses}
                      onChange={(e) => setOtherExpenses(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="pt-6 border-t-2 border-gray-200">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-700 font-semibold mb-1">Net PCS Financial Estimate</p>
                    <p className="text-xs text-gray-600">Total Income: ${totalIncome.toLocaleString()} − Total Expenses: ${totalExpenses.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-4xl font-black ${netEstimate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netEstimate >= 0 ? '+' : ''}${netEstimate.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  This is an estimate for planning purposes only. Actual costs may vary.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PPM Profit Estimator Tab */}
      {activeTab === 'ppm' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-xl font-bold text-green-900 mb-2">PPM Profit Estimator</h3>
            <p className="text-sm text-green-800">
              Calculate your potential profit from a Personally Procured Move (PPM/DITY Move). 
              The government typically pays ~95% of what it would cost them to move you.
            </p>
          </div>

          <div className="space-y-6">
            {/* Move Details */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Move Details</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={ppmWeight}
                    onChange={(e) => setPpmWeight(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                    placeholder="8000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Get weigh tickets before and after loading</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (miles)
                  </label>
                  <input
                    type="number"
                    value={ppmDistance}
                    onChange={(e) => setPpmDistance(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                    placeholder="1200"
                  />
                  <p className="text-xs text-gray-500 mt-1">Official mileage per TMO</p>
                </div>
              </div>
            </div>

            {/* Your Costs */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Expected Costs</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Truck Rental Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={truckRental}
                      onChange={(e) => setTruckRental(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                      placeholder="800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gas & Fuel
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={gas}
                      onChange={(e) => setGas(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                      placeholder="400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moving Supplies
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={supplies}
                      onChange={(e) => setSupplies(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                      placeholder="200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Expenses
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={ppmOther}
                      onChange={(e) => setPpmOther(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="pt-6 border-t-2 border-gray-200">
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-5 rounded-xl text-center border-2 border-blue-200">
                  <h5 className="text-sm font-semibold text-blue-800 mb-2">Government Payment</h5>
                  <p className="text-3xl font-bold text-blue-600">
                    ${Math.round(govtPayment).toLocaleString()}
                  </p>
                </div>

                <div className="bg-red-50 p-5 rounded-xl text-center border-2 border-red-200">
                  <h5 className="text-sm font-semibold text-red-800 mb-2">Your Costs</h5>
                  <p className="text-3xl font-bold text-red-600">
                    ${Math.round(yourCosts).toLocaleString()}
                  </p>
                </div>

                <div className={`p-5 rounded-xl text-center border-2 ${
                  netProfit >= 0 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-red-50 border-red-300'
                }`}>
                  <h5 className={`text-sm font-semibold mb-2 ${
                    netProfit >= 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Net Profit/Loss
                  </h5>
                  <p className={`text-3xl font-bold ${
                    netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {netProfit >= 0 ? '+' : ''}${Math.round(netProfit).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ Important Disclaimer</p>
                <p className="text-xs text-yellow-800">
                  This is a simplified, unofficial estimate for planning purposes only. 
                  Actual PPM rates vary by weight, distance, and current DoD rate schedules. 
                  <strong> Always consult your Transportation Office (TMO) for official rate calculations before making a decision.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

