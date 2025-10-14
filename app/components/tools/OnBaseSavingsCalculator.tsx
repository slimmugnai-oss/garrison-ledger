'use client';

import { useState, useEffect } from 'react';
import { track } from '@/lib/track';
import Icon from '@/app/components/ui/Icon';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import PaywallWrapper from '@/app/components/ui/PaywallWrapper';

export default function OnBaseSavingsCalculator() {
  const { isPremium } = usePremiumStatus();
  
  // Commissary state - granular breakdown
  const [meatProduce, setMeatProduce] = useState(250);
  const [pantryStaples, setPantryStaples] = useState(200);
  const [diapersBaby, setDiapersBaby] = useState(100);
  
  // Exchange state - integrated approach
  const [majorPurchases, setMajorPurchases] = useState(2000);
  const [clothingApparel, setClothingApparel] = useState(1200);
  const [weeklyGasGallons, setWeeklyGasGallons] = useState(15);
  const [salesTaxRate, setSalesTaxRate] = useState(7);

  // Track page view on mount
  useEffect(() => {
    track('annual_savings_command_center_view');
  }, []);

  // COMMISSARY CALCULATIONS
  // Higher savings on meat/produce (~30%), standard on others (~25%)
  const meatProduceSavings = (meatProduce * 12 * 0.30);
  const pantryStaplesSavings = (pantryStaples * 12 * 0.25);
  const diapersBabySavings = (diapersBaby * 12 * 0.25);
  const totalCommissarySavings = meatProduceSavings + pantryStaplesSavings + diapersBabySavings;

  // EXCHANGE CALCULATIONS
  // Tax savings on major purchases and apparel
  const taxRateDecimal = salesTaxRate / 100;
  const totalTaxableSpending = majorPurchases + clothingApparel;
  const taxSavings = totalTaxableSpending * taxRateDecimal;
  
  // MILITARY STAR® savings (5¢/gallon on gas)
  const annualGasGallons = weeklyGasGallons * 52;
  const starCardSavings = annualGasGallons * 0.05;
  
  const totalExchangeSavings = taxSavings + starCardSavings;

  // TOTAL COMBINED SAVINGS
  const grandTotal = totalCommissarySavings + totalExchangeSavings;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* Section 1: Commissary Savings Plan */}
      <div className="bg-white rounded-2xl border-2 border-blue-300 p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
            1
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Commissary Savings Plan</h2>
            <p className="text-gray-600">Break down your grocery spending for accurate savings estimates</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <Icon name="Lightbulb" className="h-4 w-4 inline mr-1" /> <strong>Pro Tip:</strong> Different categories have different savings rates. Meat & produce typically save you 30%, while pantry staples average 25%.
          </p>
        </div>

        <div className="space-y-6">
          {/* Meat & Produce */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-semibold text-gray-800">
                🥩 Monthly Meat & Produce Spending
              </label>
              <span className="text-sm font-medium text-blue-600">~30% savings</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                value={meatProduce}
                onChange={(e) => setMeatProduce(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-lg"
                placeholder="250"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Includes: Fresh meats, poultry, seafood, fruits, vegetables
            </p>
          </div>

          {/* Pantry Staples */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-semibold text-gray-800">
                🥫 Monthly Pantry Staples Spending
              </label>
              <span className="text-sm font-medium text-blue-600">~25% savings</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                value={pantryStaples}
                onChange={(e) => setPantryStaples(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-lg"
                placeholder="200"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Includes: Canned goods, dry goods, paper products, cleaning supplies
            </p>
          </div>

          {/* Diapers & Baby */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-semibold text-gray-800">
                👶 Monthly Diapers & Baby Supplies Spending
              </label>
              <span className="text-sm font-medium text-blue-600">~25% savings</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                value={diapersBaby}
                onChange={(e) => setDiapersBaby(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-lg"
                placeholder="100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Includes: Diapers, wipes, formula, baby food (enter 0 if not applicable)
            </p>
          </div>

          {/* Commissary Results Preview */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <PaywallWrapper
              isPremium={isPremium}
              title="Your Commissary Savings Revealed!"
              description="Unlock to see your detailed commissary savings breakdown by category"
              toolName="On-Base Savings"
              sampleData={
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <p className="text-sm text-gray-700 mb-2 font-medium text-center">
                    Estimated Annual Commissary Savings
                  </p>
                  <p className="text-5xl font-black text-blue-600 text-center mb-3">
                    $1,800
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs text-center mt-4">
                    <div>
                      <p className="text-gray-600">Meat/Produce</p>
                      <p className="font-bold text-blue-700">$900</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pantry Staples</p>
                      <p className="font-bold text-blue-700">$600</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Baby Supplies</p>
                      <p className="font-bold text-blue-700">$300</p>
                    </div>
                  </div>
                </div>
              }
            >
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <p className="text-sm text-gray-700 mb-2 font-medium text-center">
                  Estimated Annual Commissary Savings
                </p>
                <p className="text-5xl font-black text-blue-600 text-center mb-3">
                  ${Math.round(totalCommissarySavings).toLocaleString()}
                </p>
                <div className="grid grid-cols-3 gap-3 text-xs text-center mt-4">
                  <div>
                    <p className="text-gray-600">Meat/Produce</p>
                    <p className="font-bold text-blue-700">${Math.round(meatProduceSavings).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pantry Staples</p>
                    <p className="font-bold text-blue-700">${Math.round(pantryStaplesSavings).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Baby Supplies</p>
                    <p className="font-bold text-blue-700">${Math.round(diapersBabySavings).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </PaywallWrapper>
          </div>
        </div>
      </div>

      {/* Section 2: Exchange Savings Plan */}
      <div className="bg-white rounded-2xl border-2 border-green-300 p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
            2
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Exchange Savings Plan</h2>
            <p className="text-gray-600">Calculate tax savings and MILITARY STAR® benefits</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            <Icon name="Lightbulb" className="h-4 w-4 inline mr-1" /> <strong>Remember:</strong> Exchange shopping is tax-free! Plus, MILITARY STAR® cardholders get 5¢/gallon fuel discounts.
          </p>
        </div>

        <div className="space-y-6">
          {/* Sales Tax Rate */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">
              💳 Your Local Sales Tax Rate (%)
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

          {/* Major Annual Purchases */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">
              <Icon name="Monitor" className="h-4 w-4 inline mr-1" /> Major Annual Purchases (Electronics, Furniture, Appliances)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                value={majorPurchases}
                onChange={(e) => setMajorPurchases(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-lg"
                placeholder="2000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Examples: TVs, laptops, phones, furniture, appliances (annual total)
            </p>
          </div>

          {/* Clothing & Apparel */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">
              👕 Annual Clothing & Apparel Spending
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                value={clothingApparel}
                onChange={(e) => setClothingApparel(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-lg"
                placeholder="1200"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Includes: Clothing, shoes, accessories for entire family
            </p>
          </div>

          {/* Weekly Gas */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">
              ⛽ Average Weekly Gas (Gallons)
            </label>
            <input
              type="number"
              value={weeklyGasGallons}
              onChange={(e) => setWeeklyGasGallons(Number(e.target.value))}
              step="0.1"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-lg"
              placeholder="15"
            />
            <p className="text-xs text-gray-500 mt-1">
              MILITARY STAR® card saves you 5¢ per gallon
            </p>
          </div>

          {/* Exchange Results Preview */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <PaywallWrapper
              isPremium={isPremium}
              title="Your Exchange Savings Revealed!"
              description="Unlock to see your detailed exchange savings breakdown including tax savings and STAR card benefits"
              toolName="On-Base Savings"
              sampleData={
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <p className="text-sm text-gray-700 mb-4 font-medium text-center">
                    Estimated Annual Exchange Savings Breakdown
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 border border-green-300">
                      <p className="text-xs text-gray-600 mb-1">Tax Savings (Non-Fuel)</p>
                      <p className="text-3xl font-bold text-green-600">
                        $224
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on 7% local rate
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-300">
                      <p className="text-xs text-gray-600 mb-1">MILITARY STAR® Fuel Savings</p>
                      <p className="text-3xl font-bold text-blue-600">
                        $39
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        780 gallons × 5¢
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-5 text-center">
                    <p className="text-sm mb-1 opacity-90">Total Exchange Savings</p>
                    <p className="text-4xl font-black">
                      $263
                    </p>
                  </div>
                </div>
              }
            >
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <p className="text-sm text-gray-700 mb-4 font-medium text-center">
                  Estimated Annual Exchange Savings Breakdown
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <p className="text-xs text-gray-600 mb-1">Tax Savings (Non-Fuel)</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${Math.round(taxSavings).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {salesTaxRate}% local rate
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-300">
                    <p className="text-xs text-gray-600 mb-1">MILITARY STAR® Fuel Savings</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ${Math.round(starCardSavings).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {annualGasGallons.toLocaleString()} gallons × 5¢
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-5 text-center">
                  <p className="text-sm mb-1 opacity-90">Total Exchange Savings</p>
                  <p className="text-4xl font-black">
                    ${Math.round(totalExchangeSavings).toLocaleString()}
                  </p>
                </div>
              </div>
            </PaywallWrapper>
          </div>
        </div>
      </div>

      {/* Section 3: Executive Summary */}
      <PaywallWrapper
        isPremium={isPremium}
        title="Your Annual Savings Command Center is Ready!"
        description="Unlock to see your complete on-base savings analysis with detailed breakdowns and personalized strategy"
        toolName="On-Base Savings"
        sampleData={
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl border-4 border-amber-400 p-10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 border-2 border-amber-400 rounded-full mb-4">
                <Icon name="Star" className="h-6 w-6 text-gray-700" />
                <span className="text-sm font-black text-amber-900 uppercase tracking-wider">
                  Executive Summary
                </span>
              </div>
              <h2 className="text-4xl font-serif font-black text-text-headings mb-3">
                Your Annual Savings Command Center
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Here&apos;s the complete picture of your on-base shopping benefits
              </p>
            </div>

            {/* Breakdown Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border-2 border-blue-400 p-6 text-center">
                <Icon name="ShoppingCart" className="h-10 w-10 text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Commissary Savings
                </p>
                <p className="text-4xl font-black text-blue-600 mb-2">
                  $2,847
                </p>
                <div className="flex justify-center gap-4 text-xs text-gray-600">
                  <span>Meat: $1,200</span>
                  <span>Pantry: $1,647</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-green-400 p-6 text-center">
                <div className="text-4xl mb-3">🏪</div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Exchange Savings
                </p>
                <p className="text-4xl font-black text-green-600 mb-2">
                  $1,753
                </p>
                <div className="flex justify-center gap-4 text-xs text-gray-600">
                  <span>Tax: $1,400</span>
                  <span>STAR®: $353</span>
                </div>
              </div>
            </div>

            {/* Grand Total */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-2xl p-8 shadow-xl">
              <p className="text-center text-lg font-semibold mb-3 opacity-90">
                <Icon name="DollarSign" className="h-5 w-5 inline mr-1" /> Total Combined Annual Savings
              </p>
              <p className="text-center text-6xl font-black mb-6">
                $4,600
              </p>
              <div className="bg-white/20 backdrop-blur border border-white/40 rounded-xl p-4">
                <p className="text-white text-center text-base leading-relaxed">
                  <strong>By strategically using your on-base benefits, your family could save an estimated{' '}
                  <span className="text-2xl font-black">$4,600</span> this year.</strong>
                </p>
              </div>
            </div>

            {/* Context */}
            <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Monthly Equivalent</p>
                <p className="text-lg font-bold text-gray-900">
                  $383/mo
                </p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Weekly Equivalent</p>
                <p className="text-lg font-bold text-gray-900">
                  $88/wk
                </p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Per Paycheck (24/year)</p>
                <p className="text-lg font-bold text-gray-900">
                  $192
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6 text-center">
              <Icon name="Lightbulb" className="h-4 w-4 inline mr-1" /> These estimates use DeCA&apos;s published averages and your local tax rate. Actual savings may vary based on shopping habits and product choices.
            </p>
          </div>
        }
      >
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl border-4 border-amber-400 p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 border-2 border-amber-400 rounded-full mb-4">
              <Icon name="Star" className="h-6 w-6 text-gray-700" />
              <span className="text-sm font-black text-amber-900 uppercase tracking-wider">
                Executive Summary
              </span>
            </div>
            <h2 className="text-4xl font-serif font-black text-text-headings mb-3">
              Your Annual Savings Command Center
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Here&apos;s the complete picture of your on-base shopping benefits
            </p>
          </div>

          {/* Breakdown Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border-2 border-blue-400 p-6 text-center">
              <Icon name="ShoppingCart" className="h-10 w-10 text-gray-700 mb-3" />
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Commissary Savings
              </p>
              <p className="text-4xl font-black text-blue-600 mb-2">
                ${Math.round(totalCommissarySavings).toLocaleString()}
              </p>
              <div className="flex justify-center gap-4 text-xs text-gray-600">
                <span>Meat: ${Math.round(meatProduceSavings).toLocaleString()}</span>
                <span>Pantry: ${Math.round(pantryStaplesSavings).toLocaleString()}</span>
                {diapersBabySavings > 0 && <span>Baby: ${Math.round(diapersBabySavings).toLocaleString()}</span>}
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-green-400 p-6 text-center">
              <div className="text-4xl mb-3">🏪</div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Exchange Savings
              </p>
              <p className="text-4xl font-black text-green-600 mb-2">
                ${Math.round(totalExchangeSavings).toLocaleString()}
              </p>
              <div className="flex justify-center gap-4 text-xs text-gray-600">
                <span>Tax: ${Math.round(taxSavings).toLocaleString()}</span>
                <span>STAR®: ${Math.round(starCardSavings).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-2xl p-8 shadow-xl">
            <p className="text-center text-lg font-semibold mb-3 opacity-90">
              <Icon name="DollarSign" className="h-5 w-5 inline mr-1" /> Total Combined Annual Savings
            </p>
            <p className="text-center text-6xl font-black mb-6">
              ${Math.round(grandTotal).toLocaleString()}
            </p>
            <div className="bg-white/20 backdrop-blur border border-white/40 rounded-xl p-4">
              <p className="text-white text-center text-base leading-relaxed">
                <strong>By strategically using your on-base benefits, your family could save an estimated{' '}
                <span className="text-2xl font-black">${Math.round(grandTotal).toLocaleString()}</span> this year.</strong>
              </p>
            </div>
          </div>

          {/* Context */}
          <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Monthly Equivalent</p>
              <p className="text-lg font-bold text-gray-900">
                ${Math.round(grandTotal / 12).toLocaleString()}/mo
              </p>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Weekly Equivalent</p>
              <p className="text-lg font-bold text-gray-900">
                ${Math.round(grandTotal / 52).toLocaleString()}/wk
              </p>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Per Paycheck (24/year)</p>
              <p className="text-lg font-bold text-gray-900">
                ${Math.round(grandTotal / 24).toLocaleString()}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center">
            <Icon name="Lightbulb" className="h-4 w-4 inline mr-1" /> These estimates use DeCA&apos;s published averages and your local tax rate. Actual savings may vary based on shopping habits and product choices.
          </p>
        </div>
      </PaywallWrapper>

      {/* Educational Tips */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2"><Icon name="Lightbulb" className="h-5 w-5" /> Maximize Your Savings</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ul className="space-y-2 text-sm text-indigo-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Shop Commissary on Tuesday-Thursday mornings for best selection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Case lot sales offer an additional 10-30% off bulk items</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Commissary brand items often match or beat name brands in quality</span>
            </li>
          </ul>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Exchange price-matches local retailers (check your store&apos;s policy)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>MILITARY STAR® card offers 10% off food court purchases too</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Your Exchange purchases fund MWR programs and facilities</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
