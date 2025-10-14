'use client';

import { useState, useEffect } from 'react';
import { track } from '@/lib/track';

type TabMode = 'commissary' | 'exchange';
type CommissaryMode = 'monthly' | 'pcs';
type ExchangeMode = 'annual' | 'newhome';

export default function OnBaseSavingsCalculator() {
  const [activeTab, setActiveTab] = useState<TabMode>('commissary');
  
  // Commissary state
  const [commissaryMode, setCommissaryMode] = useState<CommissaryMode>('monthly');
  const [commissaryRate, setCommissaryRate] = useState(25);
  const [monthlyGroceries, setMonthlyGroceries] = useState(600);
  const [habitCaselot, setHabitCaselot] = useState(false);
  const [habitStoreBrands, setHabitStoreBrands] = useState(false);
  const [habitFamilyMag, setHabitFamilyMag] = useState(false);
  
  // Exchange state
  const [exchangeMode, setExchangeMode] = useState<ExchangeMode>('annual');
  const [salesTaxRate, setSalesTaxRate] = useState(7);
  const [annualClothing, setAnnualClothing] = useState(1200);
  const [annualElectronics, setAnnualElectronics] = useState(800);
  const [annualHomeGoods, setAnnualHomeGoods] = useState(600);
  const [weeklyFuel, setWeeklyFuel] = useState(50);
  const [weeklyFoodCourt, setWeeklyFoodCourt] = useState(20);
  const [newHomeAppliances, setNewHomeAppliances] = useState(false);
  const [newHomeFurniture, setNewHomeFurniture] = useState(false);

  // Track page view on mount
  useEffect(() => {
    track('onbase_savings_view');
  }, []);

  // Commissary calculations
  const calculateCommissarySavings = () => {
    let baseSavings = 0;
    
    if (commissaryMode === 'monthly') {
      baseSavings = (monthlyGroceries * 12 * commissaryRate) / 100;
    } else {
      // PCS Stock-Up mode - one-time purchase
      baseSavings = (monthlyGroceries * commissaryRate) / 100;
    }
    
    // Add habit boosters (small percentage increases)
    let boostMultiplier = 1;
    if (habitCaselot) boostMultiplier += 0.05; // 5% extra
    if (habitStoreBrands) boostMultiplier += 0.03; // 3% extra
    if (habitFamilyMag) boostMultiplier += 0.02; // 2% extra
    
    return baseSavings * boostMultiplier;
  };

  // Exchange calculations
  const calculateExchangeSavings = () => {
    const taxRateDecimal = salesTaxRate / 100;
    
    // Calculate tax savings on non-fuel items
    const annualSpending = annualClothing + annualElectronics + annualHomeGoods;
    const newHomeSpending = (newHomeAppliances ? 2000 : 0) + (newHomeFurniture ? 3000 : 0);
    
    const totalNonFuelSpending = exchangeMode === 'annual' 
      ? annualSpending 
      : annualSpending + newHomeSpending;
    
    const taxSavings = totalNonFuelSpending * taxRateDecimal;
    
    // MILITARY STAR savings
    const fuelSavings = weeklyFuel * 52 * 0.05; // 5 cents per gallon, assume $50/week = ~15 gallons
    const foodCourtSavings = weeklyFoodCourt * 52 * 0.10; // 10% discount
    const starSavings = fuelSavings + foodCourtSavings;
    
    return {
      taxSavings,
      starSavings,
      total: taxSavings + starSavings
    };
  };

  const commissarySavings = calculateCommissarySavings();
  const exchangeSavings = calculateExchangeSavings();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('commissary')}
              className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                activeTab === 'commissary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💰 Commissary Savings
            </button>
            <button
              onClick={() => setActiveTab('exchange')}
              className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                activeTab === 'exchange'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏪 Exchange Tax Savings
            </button>
          </nav>
        </div>
      </div>

      {/* Commissary Tab */}
      {activeTab === 'commissary' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Commissary Savings Calculator</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCommissaryMode('monthly')}
                className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                  commissaryMode === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCommissaryMode('pcs')}
                className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                  commissaryMode === 'pcs' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
              >
                PCS Stock-Up
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            {commissaryMode === 'monthly'
              ? 'Estimate your annual savings based on your monthly grocery spending.'
              : 'Estimate savings on a one-time PCS stock-up purchase.'}
          </p>

          <div className="space-y-6">
            {/* Savings Rate Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Savings Rate: {commissaryRate}%
              </label>
              <input
                type="range"
                min="10"
                max="35"
                value={commissaryRate}
                onChange={(e) => setCommissaryRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                DeCA worldwide average is ≈25%. Adjust based on your local store and shopping habits.
              </p>
            </div>

            {/* Monthly Spending */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {commissaryMode === 'monthly' ? 'Monthly Grocery Spending' : 'PCS Stock-Up Amount'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyGroceries}
                  onChange={(e) => setMonthlyGroceries(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-lg"
                  placeholder="600"
                />
              </div>
            </div>

            {/* Habit Boosters */}
            <div>
              <h4 className="font-bold text-gray-700 mb-3">💡 Savings Habit Boosters</h4>
              <div className="space-y-2">
                <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={habitCaselot}
                    onChange={(e) => setHabitCaselot(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">Shop at Case Lot Sales (+5%)</span>
                </label>
                <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={habitStoreBrands}
                    onChange={(e) => setHabitStoreBrands(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">Buy Commissary Store Brands (+3%)</span>
                </label>
                <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={habitFamilyMag}
                    onChange={(e) => setHabitFamilyMag(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">Use Family Magazine Coupons (+2%)</span>
                </label>
              </div>
            </div>

            {/* Results */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <div className="text-center bg-blue-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-2 font-medium">
                  {commissaryMode === 'monthly' ? 'Estimated Annual Savings:' : 'Estimated PCS Stock-Up Savings:'}
                </p>
                <p className="text-5xl font-black text-blue-600">
                  ${Math.round(commissarySavings).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Estimates use DeCA's worldwide average savings. Real savings vary by store and basket.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exchange Tab */}
      {activeTab === 'exchange' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Exchange Tax Savings Calculator</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setExchangeMode('annual')}
                className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                  exchangeMode === 'annual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
              >
                Annual
              </button>
              <button
                onClick={() => setExchangeMode('newhome')}
                className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                  exchangeMode === 'newhome' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
              >
                New Home
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            {exchangeMode === 'annual'
              ? 'Estimate your total annual tax savings by shopping tax-free at the Exchange.'
              : 'Calculate tax savings when furnishing a new home after PCS.'}
          </p>

          <div className="space-y-6">
            {/* Sales Tax Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Local Sales Tax Rate (%)
              </label>
              <input
                type="number"
                value={salesTaxRate}
                onChange={(e) => setSalesTaxRate(Number(e.target.value))}
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-lg"
                placeholder="7.25"
              />
              <p className="text-xs text-gray-500 mt-1">
                Not sure?{' '}
                <a
                  href="https://www.avalara.com/taxrates/en/state-rates.html"
                  target="_blank"
                  rel="noopener"
                  className="text-blue-600 underline"
                >
                  Look up your rate by state
                </a>
              </p>
            </div>

            {/* Annual Spending */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-700">Annual Exchange Spending</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clothing & Apparel
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={annualClothing}
                    onChange={(e) => setAnnualClothing(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Electronics & Tech
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={annualElectronics}
                    onChange={(e) => setAnnualElectronics(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Goods & Décor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={annualHomeGoods}
                    onChange={(e) => setAnnualHomeGoods(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* New Home Options */}
            {exchangeMode === 'newhome' && (
              <div>
                <h4 className="font-bold text-gray-700 mb-3">Big-Ticket PCS Purchases</h4>
                <div className="space-y-2">
                  <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={newHomeAppliances}
                      onChange={(e) => setNewHomeAppliances(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-3 text-gray-700">Appliances (~$2,000)</span>
                  </label>
                  <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={newHomeFurniture}
                      onChange={(e) => setNewHomeFurniture(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-3 text-gray-700">Furniture (~$3,000)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Weekly STAR Savings */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-700">Weekly MILITARY STAR® Savings</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weekly Fuel Spending
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={weeklyFuel}
                    onChange={(e) => setWeeklyFuel(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">5¢/gal discount with MILITARY STAR®</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weekly Food Court Spending
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={weeklyFoodCourt}
                    onChange={(e) => setWeeklyFoodCourt(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">10% discount with MILITARY STAR®</p>
              </div>
            </div>

            {/* Results */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Tax Savings</p>
                  <p className="text-3xl font-bold text-green-700">
                    ${Math.round(exchangeSavings.taxSavings).toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">STAR® Savings</p>
                  <p className="text-3xl font-bold text-blue-700">
                    ${Math.round(exchangeSavings.starSavings).toLocaleString()}
                  </p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg text-center border-2 border-emerald-300">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">Total Annual Savings</p>
                  <p className="text-3xl font-bold text-emerald-700">
                    ${Math.round(exchangeSavings.total).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Assumes your local sales tax rate for non-fuel items. Fuel prices are competitive with local market.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

