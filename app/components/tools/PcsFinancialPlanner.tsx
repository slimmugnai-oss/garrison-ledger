'use client';

import { useState, useEffect } from 'react';
import { track } from '@/lib/track';
import Icon from '@/app/components/ui/Icon';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';

type TabMode = 'basic' | 'ppm';

type EntitlementData = {
  rank_group: string;
  dependency_status: string;
  weight_allowance: number;
  dla_rate: number;
  effective_year: number;
};

const RANKS = [
  { value: '', label: 'Select your rank...' },
  { value: 'E-1', label: 'E-1' },
  { value: 'E-2', label: 'E-2' },
  { value: 'E-3', label: 'E-3' },
  { value: 'E-4', label: 'E-4' },
  { value: 'E-5', label: 'E-5' },
  { value: 'E-6', label: 'E-6' },
  { value: 'E-7', label: 'E-7' },
  { value: 'E-8', label: 'E-8' },
  { value: 'E-9', label: 'E-9' },
  { value: 'W-1', label: 'W-1' },
  { value: 'W-2', label: 'W-2' },
  { value: 'W-3', label: 'W-3' },
  { value: 'W-4', label: 'W-4' },
  { value: 'W-5', label: 'W-5' },
  { value: 'O-1', label: 'O-1' },
  { value: 'O-2', label: 'O-2' },
  { value: 'O-3', label: 'O-3' },
  { value: 'O-4', label: 'O-4' },
  { value: 'O-5', label: 'O-5' },
  { value: 'O-6', label: 'O-6' },
  { value: 'O-7', label: 'O-7' },
  { value: 'O-8', label: 'O-8' },
  { value: 'O-9', label: 'O-9' },
  { value: 'O-10', label: 'O-10' },
];

export default function PcsFinancialPlanner() {
  const { isPremium } = usePremiumStatus();
  const [activeTab, setActiveTab] = useState<TabMode>('basic');
  
  // Step 1: Profile Input
  const [rankGroup, setRankGroup] = useState('');
  const [dependencyStatus, setDependencyStatus] = useState<'with' | 'without' | ''>('');
  const [entitlementData, setEntitlementData] = useState<EntitlementData | null>(null);
  const [loadingEntitlements, setLoadingEntitlements] = useState(false);
  
  // Basic Calculator state
  const [dla, setDla] = useState(0);
  const [perDiem, setPerDiem] = useState(800);
  const [ppmIncentive, setPpmIncentive] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [travelCosts, setTravelCosts] = useState(600);
  const [lodging, setLodging] = useState(1200);
  const [deposits, setDeposits] = useState(2000);
  const [otherExpenses, setOtherExpenses] = useState(500);
  
  // PPM Profit Estimator state
  const [ppmWeight, setPpmWeight] = useState(0);
  const [ppmDistance, setPpmDistance] = useState(1200);
  const [truckRental, setTruckRental] = useState(800);
  const [gas, setGas] = useState(400);
  const [supplies, setSupplies] = useState(200);
  const [ppmOther, setPpmOther] = useState(100);

  // Track page view on mount
  useEffect(() => {
    track('pcs_financial_planner_view');
  }, []);

  // Fetch entitlement data when rank and dependency are selected
  useEffect(() => {
    async function fetchEntitlements() {
      if (!rankGroup || !dependencyStatus) {
        setEntitlementData(null);
        return;
      }

      setLoadingEntitlements(true);
      try {
        const params = new URLSearchParams({
          rank_group: rankGroup,
          dependency_status: dependencyStatus
        });
        
        const response = await fetch(`/api/entitlements?${params.toString()}`);
        const result = await response.json();

        if (response.ok && result.success) {
          setEntitlementData(result.data);
          // Auto-populate DLA and weight allowance
          setDla(result.data.dla_rate);
          setPpmWeight(result.data.weight_allowance);
          track('entitlements_fetched', { rank: rankGroup, dependency: dependencyStatus });
        } else {
          console.error('Failed to fetch entitlements:', result.error);
        }
      } catch (error) {
        console.error('Error fetching entitlements:', error);
      } finally {
        setLoadingEntitlements(false);
      }
    }

    fetchEntitlements();
  }, [rankGroup, dependencyStatus]);

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
      {/* Step 1: Profile Input */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Your Profile</h3>
            <p className="text-sm text-gray-600">We&apos;ll auto-calculate your entitlements</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Rank
            </label>
            <select
              value={rankGroup}
              onChange={(e) => setRankGroup(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none text-base"
            >
              {RANKS.map((rank) => (
                <option key={rank.value} value={rank.value}>
                  {rank.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dependency Status
            </label>
            <select
              value={dependencyStatus}
              onChange={(e) => setDependencyStatus(e.target.value as 'with' | 'without')}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none text-base"
            >
              <option value="">Select...</option>
              <option value="with">With Dependents</option>
              <option value="without">Without Dependents</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loadingEntitlements && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-gray-600 mt-2">Fetching your entitlements...</p>
          </div>
        )}

        {/* Entitlements Briefing Card */}
        {entitlementData && !loadingEntitlements && (
          <div className="mt-6 bg-white border-2 border-indigo-400 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="ClipboardList" className="h-6 w-6 text-gray-700" />
              <h4 className="text-xl font-bold text-gray-900">Your PCS Entitlements</h4>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-1">DLA Rate</p>
                <p className="text-2xl font-black text-blue-600">
                  ${entitlementData.dla_rate.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">Weight Allowance</p>
                <p className="text-2xl font-black text-green-600">
                  {entitlementData.weight_allowance.toLocaleString()} lbs
                </p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-xs font-semibold text-purple-700 uppercase mb-1">Effective Year</p>
                <p className="text-2xl font-black text-purple-600">
                  {entitlementData.effective_year}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              <Icon name="Check" className="h-4 w-4 inline mr-1" /> Data auto-populated below based on current DoD rates
            </p>
          </div>
        )}
      </div>

      {/* Show message if no entitlements selected */}
      {!entitlementData && !loadingEntitlements && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 mb-8 text-center">
          <p className="text-amber-800 font-medium">
            👆 Select your rank and dependency status above to auto-populate your PCS entitlements
          </p>
        </div>
      )}

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
              <Icon name="BarChart" className="h-5 w-5 inline mr-1" /> Basic PCS Calculator
            </button>
            <button
              onClick={() => setActiveTab('ppm')}
              className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                activeTab === 'ppm'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon name="Truck" className="h-5 w-5 inline mr-1" /> PPM Profit Estimator
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
                    {entitlementData && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        Auto-filled <Icon name="Check" className="h-3 w-3 inline" />
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={dla}
                      onChange={(e) => setDla(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="Enter rank above for auto-fill"
                      disabled={!rankGroup}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Based on your rank and dependents</p>
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
                  <p className="text-xs text-gray-500 mt-1">Varies by travel days and location</p>
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
                  <p className="text-xs text-gray-500 mt-1">Use PPM tab to estimate</p>
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
              {isPremium ? (
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
              ) : (
                <div className="relative">
                  <div className="blur-sm pointer-events-none select-none">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-700 font-semibold mb-1">Net PCS Financial Estimate</p>
                          <p className="text-xs text-gray-600">Total Income: $15,247 − Total Expenses: $8,934</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-black text-green-600">
                            +$6,313
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-4 text-center">
                        This is an estimate for planning purposes only. Actual costs may vary.
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm rounded-2xl">
                    <div className="bg-white rounded-2xl p-10 shadow-2xl border-2 border-indigo-400 text-center max-w-lg">
                      <Icon name="Lock" className="h-16 w-16 text-gray-700 mb-4 mx-auto" />
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        Your Results Are Ready!
                      </h3>
                      <p className="text-lg text-gray-700 mb-2">
                        Unlock to see your complete PCS financial estimate with detailed breakdowns
                      </p>
                      <p className="text-3xl font-black text-gray-900 mb-6">
                        $9.99<span className="text-lg font-normal text-gray-600">/month</span>
                      </p>
                      <a href="/dashboard/upgrade" className="inline-block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 mb-4">
                        Unlock Now →
                      </a>
                      <p className="text-xs text-gray-500">
                        Less than a coffee per week · Upgrade anytime
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                    {entitlementData && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        Max: {entitlementData.weight_allowance.toLocaleString()} <Icon name="Check" className="h-3 w-3 inline" />
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={ppmWeight}
                    onChange={(e) => setPpmWeight(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                    placeholder={entitlementData ? entitlementData.weight_allowance.toString() : "Enter rank above for auto-fill"}
                    disabled={!rankGroup}
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
              {isPremium ? (
                <div>
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

                  {entitlementData && ppmWeight > entitlementData.weight_allowance && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg mb-4">
                      <p className="text-sm font-semibold text-red-900 mb-1"><Icon name="AlertTriangle" className="h-4 w-4 inline mr-1" /> Weight Limit Exceeded</p>
                      <p className="text-xs text-red-800">
                        Your estimated weight ({ppmWeight.toLocaleString()} lbs) exceeds your allowance ({entitlementData.weight_allowance.toLocaleString()} lbs). 
                        You may incur excess weight charges of approximately ${Math.round((ppmWeight - entitlementData.weight_allowance) * 0.75).toLocaleString()}.
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm font-semibold text-yellow-900 mb-1"><Icon name="AlertTriangle" className="h-4 w-4 inline mr-1" /> Important Disclaimer</p>
                    <p className="text-xs text-yellow-800">
                      This is a simplified, unofficial estimate for planning purposes only. 
                      Actual PPM rates vary by weight, distance, and current DoD rate schedules. 
                      <strong> Always consult your Transportation Office (TMO) for official rate calculations before making a decision.</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="blur-sm pointer-events-none select-none">
                    <div className="grid sm:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-5 rounded-xl text-center border-2 border-blue-200">
                        <h5 className="text-sm font-semibold text-blue-800 mb-2">Government Payment</h5>
                        <p className="text-3xl font-bold text-blue-600">
                          $8,247
                        </p>
                      </div>

                      <div className="bg-red-50 p-5 rounded-xl text-center border-2 border-red-200">
                        <h5 className="text-sm font-semibold text-red-800 mb-2">Your Costs</h5>
                        <p className="text-3xl font-bold text-red-600">
                          $5,934
                        </p>
                      </div>

                      <div className="p-5 rounded-xl text-center border-2 bg-green-50 border-green-300">
                        <h5 className="text-sm font-semibold mb-2 text-green-800">
                          Net Profit/Loss
                        </h5>
                        <p className="text-3xl font-bold text-green-600">
                          +$2,313
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <p className="text-sm font-semibold text-yellow-900 mb-1"><Icon name="AlertTriangle" className="h-4 w-4 inline mr-1" /> Important Disclaimer</p>
                      <p className="text-xs text-yellow-800">
                        This is a simplified, unofficial estimate for planning purposes only. 
                        Actual PPM rates vary by weight, distance, and current DoD rate schedules. 
                        <strong> Always consult your Transportation Office (TMO) for official rate calculations before making a decision.</strong>
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm rounded-2xl">
                    <div className="bg-white rounded-2xl p-10 shadow-2xl border-2 border-indigo-400 text-center max-w-lg">
                      <Icon name="Lock" className="h-16 w-16 text-gray-700 mb-4 mx-auto" />
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        Your Results Are Ready!
                      </h3>
                      <p className="text-lg text-gray-700 mb-2">
                        Unlock to see your complete PPM profit analysis with detailed breakdowns
                      </p>
                      <p className="text-3xl font-black text-gray-900 mb-6">
                        $9.99<span className="text-lg font-normal text-gray-600">/month</span>
                      </p>
                      <a href="/dashboard/upgrade" className="inline-block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 mb-4">
                        Unlock Now →
                      </a>
                      <p className="text-xs text-gray-500">
                        Less than a coffee per week · Upgrade anytime
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
