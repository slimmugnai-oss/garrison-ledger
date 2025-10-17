'use client';

import { useState, useEffect, useRef } from 'react';
import { track } from '@/lib/track';
import Icon from '@/app/components/ui/Icon';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import Explainer from '@/app/components/ai/Explainer';
import ExportButtons from '@/app/components/calculators/ExportButtons';

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

  // Save state functionality
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track page view on mount
  useEffect(() => {
    track('pcs_financial_planner_view');
  }, []);

  // Load saved model on mount (premium only)
  useEffect(() => {
    if (isPremium) {
      fetch('/api/saved-models?tool=pcs')
        .then(res => res.json())
        .then(data => {
          if (data.input) {
            setActiveTab(data.input.activeTab || 'basic');
            setRankGroup(data.input.rankGroup || '');
            setDependencyStatus(data.input.dependencyStatus || '');
            setDla(data.input.dla || 0);
            setPerDiem(data.input.perDiem || 800);
            setPpmIncentive(data.input.ppmIncentive || 0);
            setOtherIncome(data.input.otherIncome || 0);
            setTravelCosts(data.input.travelCosts || 600);
            setLodging(data.input.lodging || 1200);
            setDeposits(data.input.deposits || 2000);
            setOtherExpenses(data.input.otherExpenses || 500);
            setPpmWeight(data.input.ppmWeight || 0);
            setPpmDistance(data.input.ppmDistance || 1200);
            setTruckRental(data.input.truckRental || 800);
            setGas(data.input.gas || 400);
            setSupplies(data.input.supplies || 200);
            setPpmOther(data.input.ppmOther || 100);
          }
        })
        .catch(console.error);
    }
  }, [isPremium]);

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

  // Auto-save (debounced, premium only)
  useEffect(() => {
    if (isPremium && (rankGroup || dla > 0 || ppmWeight > 0)) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      const timeout = setTimeout(() => {
        fetch('/api/saved-models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: 'pcs',
            input: {
              activeTab,
              rankGroup,
              dependencyStatus,
              dla,
              perDiem,
              ppmIncentive,
              otherIncome,
              travelCosts,
              lodging,
              deposits,
              otherExpenses,
              ppmWeight,
              ppmDistance,
              truckRental,
              gas,
              supplies,
              ppmOther
            },
            output: {
              totalIncome,
              totalExpenses,
              netEstimate,
              govtPayment,
              yourCosts,
              netProfit
            }
          })
        }).catch(console.error);
      }, 2000);
      saveTimeoutRef.current = timeout;
    }
  }, [isPremium, activeTab, rankGroup, dependencyStatus, dla, perDiem, ppmIncentive, otherIncome, travelCosts, lodging, deposits, otherExpenses, ppmWeight, ppmDistance, truckRental, gas, supplies, ppmOther, totalIncome, totalExpenses, netEstimate, govtPayment, yourCosts, netProfit]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Step 1: Profile Input */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h3 className="text-2xl font-bold text-primary">Your Profile</h3>
            <p className="text-sm text-body">We&apos;ll auto-calculate your entitlements</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-body mb-2">
              Your Rank
            </label>
            <select
              value={rankGroup}
              onChange={(e) => setRankGroup(e.target.value)}
              className="w-full px-4 py-3 border-2 border-default rounded-lg focus:border-indigo-600 focus:outline-none text-base"
            >
              {RANKS.map((rank) => (
                <option key={rank.value} value={rank.value}>
                  {rank.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-body mb-2">
              Dependency Status
            </label>
            <select
              value={dependencyStatus}
              onChange={(e) => setDependencyStatus(e.target.value as 'with' | 'without')}
              className="w-full px-4 py-3 border-2 border-default rounded-lg focus:border-indigo-600 focus:outline-none text-base"
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
            <p className="text-sm text-body mt-2">Fetching your entitlements...</p>
          </div>
        )}

        {/* Entitlements Briefing Card */}
        {entitlementData && !loadingEntitlements && (
          <div className="mt-6 bg-surface border-2 border-indigo-400 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="ClipboardList" className="h-6 w-6 text-body" />
              <h4 className="text-xl font-bold text-primary">Your PCS Entitlements</h4>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-info-subtle border border-info rounded-lg p-4 text-center">
                <p className="text-xs font-semibold text-info uppercase mb-1">DLA Rate</p>
                <p className="text-2xl font-black text-info">
                  ${entitlementData.dla_rate.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-success-subtle border border-success rounded-lg p-4 text-center">
                <p className="text-xs font-semibold text-success uppercase mb-1">Weight Allowance</p>
                <p className="text-2xl font-black text-success">
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

            <p className="text-xs text-muted mt-4 text-center">
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
        <div className="border-b border-subtle">
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
        <div className="bg-surface rounded-xl border border-subtle p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-primary mb-2">PCS Budget Calculator</h3>
          <p className="text-body mb-8">
            Estimate your net financial position during a PCS move by tracking income and expenses.
          </p>

          <div className="space-y-8">
            {/* Income Section */}
            <div>
              <h4 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <span className="bg-success-subtle text-success rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  +
                </span>
                Estimated Income
              </h4>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Dislocation Allowance (DLA)
                    {entitlementData && (
                      <span className="ml-2 text-xs bg-success-subtle text-success px-2 py-0.5 rounded-full font-semibold">
                        Auto-filled <Icon name="Check" className="h-3 w-3 inline" />
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={dla}
                      onChange={(e) => setDla(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="Enter rank above for auto-fill"
                      disabled={!rankGroup}
                    />
                  </div>
                  <p className="text-xs text-muted mt-1">Based on your rank and dependents</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Per Diem / Travel Allowance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={perDiem}
                      onChange={(e) => setPerDiem(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="800"
                    />
                  </div>
                  <p className="text-xs text-muted mt-1">Varies by travel days and location</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    PPM Incentive (if applicable)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={ppmIncentive}
                      onChange={(e) => setPpmIncentive(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-muted mt-1">Use PPM tab to estimate</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Other Allowances
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={otherIncome}
                      onChange={(e) => setOtherIncome(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h4 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <span className="bg-danger-subtle text-danger rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  −
                </span>
                Estimated Expenses
              </h4>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Travel Costs (Gas, Food, etc.)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={travelCosts}
                      onChange={(e) => setTravelCosts(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Temporary Lodging
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={lodging}
                      onChange={(e) => setLodging(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="1200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Housing Deposits & Fees
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={deposits}
                      onChange={(e) => setDeposits(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Other Expenses
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={otherExpenses}
                      onChange={(e) => setOtherExpenses(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-indigo-600 focus:outline-none"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results - Available to ALL users */}
            <div className="pt-6 border-t-2 border-subtle">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-body font-semibold mb-1">Net PCS Financial Estimate</p>
                    <p className="text-xs text-body">Total Income: ${totalIncome.toLocaleString()} − Total Expenses: ${totalExpenses.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-4xl font-black ${netEstimate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netEstimate >= 0 ? '+' : ''}${netEstimate.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted mt-4 text-center">
                  This is an estimate for planning purposes only. Actual costs may vary.
                </p>
              </div>

              {/* AI Explainer */}
              <Explainer payload={{
                tool: "pcs",
                inputs: { rankGroup, dependencyStatus, dla, perDiem, ppmIncentive },
                outputs: { totalIncome, totalExpenses, netEstimate }
              }} />
            </div>
          </div>
        </div>
      )}

      {/* PPM Profit Estimator Tab */}
      {activeTab === 'ppm' && (
        <div className="bg-surface rounded-xl border border-subtle p-8 shadow-sm">
          <div className="bg-success-subtle border border-success rounded-lg p-4 mb-6">
            <h3 className="text-xl font-bold text-success mb-2">PPM Profit Estimator</h3>
            <p className="text-sm text-success">
              Calculate your potential profit from a Personally Procured Move (PPM/DITY Move). 
              The government typically pays ~95% of what it would cost them to move you.
            </p>
          </div>

          <div className="space-y-6">
            {/* Move Details */}
            <div>
              <h4 className="text-lg font-semibold text-primary mb-4">Move Details</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Estimated Weight (lbs)
                    {entitlementData && (
                      <span className="ml-2 text-xs bg-success-subtle text-success px-2 py-0.5 rounded-full font-semibold">
                        Max: {entitlementData.weight_allowance.toLocaleString()} <Icon name="Check" className="h-3 w-3 inline" />
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={ppmWeight}
                    onChange={(e) => setPpmWeight(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-default rounded-lg focus:border-green-600 focus:outline-none"
                    placeholder={entitlementData ? entitlementData.weight_allowance.toString() : "Enter rank above for auto-fill"}
                    disabled={!rankGroup}
                  />
                  <p className="text-xs text-muted mt-1">Get weigh tickets before and after loading</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Distance (miles)
                  </label>
                  <input
                    type="number"
                    value={ppmDistance}
                    onChange={(e) => setPpmDistance(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-default rounded-lg focus:border-green-600 focus:outline-none"
                    placeholder="1200"
                  />
                  <p className="text-xs text-muted mt-1">Official mileage per TMO</p>
                </div>
              </div>
            </div>

            {/* Your Costs */}
            <div>
              <h4 className="text-lg font-semibold text-primary mb-4">Your Expected Costs</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Truck Rental Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={truckRental}
                      onChange={(e) => setTruckRental(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-green-600 focus:outline-none"
                      placeholder="800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Gas & Fuel
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={gas}
                      onChange={(e) => setGas(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-green-600 focus:outline-none"
                      placeholder="400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Moving Supplies
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={supplies}
                      onChange={(e) => setSupplies(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-green-600 focus:outline-none"
                      placeholder="200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">
                    Other Expenses
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={ppmOther}
                      onChange={(e) => setPpmOther(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:border-green-600 focus:outline-none"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="pt-6 border-t-2 border-subtle">
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-info-subtle p-5 rounded-xl text-center border-2 border-info">
                  <h5 className="text-sm font-semibold text-info mb-2">Government Payment</h5>
                  <p className="text-3xl font-bold text-info">
                    ${Math.round(govtPayment).toLocaleString()}
                  </p>
                </div>

                <div className="bg-danger-subtle p-5 rounded-xl text-center border-2 border-danger">
                  <h5 className="text-sm font-semibold text-danger mb-2">Your Costs</h5>
                  <p className="text-3xl font-bold text-danger">
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
                <div className="bg-danger-subtle border-l-4 border-red-400 p-4 rounded-r-lg mb-4">
                  <p className="text-sm font-semibold text-danger mb-1"><Icon name="AlertTriangle" className="h-4 w-4 inline mr-1" /> Weight Limit Exceeded</p>
                  <p className="text-xs text-danger">
                    Your estimated weight ({ppmWeight.toLocaleString()} lbs) exceeds your allowance ({entitlementData.weight_allowance.toLocaleString()} lbs). 
                    You may incur excess weight charges of approximately ${Math.round((ppmWeight - entitlementData.weight_allowance) * 0.75).toLocaleString()}.
                  </p>
                </div>
              )}

              <div className="bg-warning-subtle border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-sm font-semibold text-warning mb-1"><Icon name="AlertTriangle" className="h-4 w-4 inline mr-1" /> Important Disclaimer</p>
                <p className="text-xs text-warning">
                  This is a simplified, unofficial estimate for planning purposes only. 
                  Actual PPM rates vary by weight, distance, and current DoD rate schedules. 
                  <strong> Always consult your Transportation Office (TMO) for official rate calculations before making a decision.</strong>
                </p>
              </div>
              
              {/* Export Options */}
              <div className="mt-8 pt-6 border-t border-border">
                <ExportButtons 
                  tool="pcs-planner"
                  resultsElementId="pcs-results"
                  data={{
                    inputs: { activeTab, rankGroup, dependencyStatus, dla, perDiem, ppmIncentive, otherIncome, travelCosts, lodging, deposits, otherExpenses, ppmWeight, ppmDistance, truckRental, gas, supplies, ppmOther },
                    outputs: { totalIncome, totalExpenses, netEstimate, govtPayment, yourCosts, netProfit }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
