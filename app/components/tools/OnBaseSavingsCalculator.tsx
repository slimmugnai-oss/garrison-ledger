"use client";

import { useState, useEffect, useRef } from "react";

import Explainer from "@/app/components/ai/Explainer";
import ComparisonMode from "@/app/components/calculators/ComparisonMode";
import ExportButtons from "@/app/components/calculators/ExportButtons";
import Icon from "@/app/components/ui/Icon";
import PaywallWrapper from "@/app/components/ui/PaywallWrapper";
import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";
import { track } from "@/lib/track";

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

  // Save state functionality
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track page view on mount
  useEffect(() => {
    track("annual_savings_command_center_view");
  }, []);

  // Load saved model on mount (premium only)
  useEffect(() => {
    if (isPremium) {
      fetch("/api/saved-models?tool=savings")
        .then((res) => res.json())
        .then((data) => {
          if (data.input) {
            setMeatProduce(data.input.meatProduce || 250);
            setPantryStaples(data.input.pantryStaples || 200);
            setDiapersBaby(data.input.diapersBaby || 100);
            setMajorPurchases(data.input.majorPurchases || 2000);
            setClothingApparel(data.input.clothingApparel || 1200);
            setWeeklyGasGallons(data.input.weeklyGasGallons || 15);
            setSalesTaxRate(data.input.salesTaxRate || 7);
          }
        });
    }
  }, [isPremium]);

  // COMMISSARY CALCULATIONS
  // Higher savings on meat/produce (~30%), standard on others (~25%)
  // Source: DeCA (Defense Commissary Agency) savings estimates - commissaries.com
  // Note: Actual savings vary by location and shopping habits
  const meatProduceSavings = meatProduce * 12 * 0.3;
  const pantryStaplesSavings = pantryStaples * 12 * 0.25;
  const diapersBabySavings = diapersBaby * 12 * 0.25;
  const totalCommissarySavings = meatProduceSavings + pantryStaplesSavings + diapersBabySavings;

  // EXCHANGE CALCULATIONS
  // Tax savings on major purchases and apparel
  const taxRateDecimal = salesTaxRate / 100;
  const totalTaxableSpending = majorPurchases + clothingApparel;
  const taxSavings = totalTaxableSpending * taxRateDecimal;

  // MILITARY STAR® savings (5¢/gallon on gas)
  // Source: Official Military Star Card benefits (shopmyexchange.com)
  const annualGasGallons = weeklyGasGallons * 52;
  const starCardSavings = annualGasGallons * 0.05;

  const totalExchangeSavings = taxSavings + starCardSavings;

  // TOTAL COMBINED SAVINGS
  const grandTotal = totalCommissarySavings + totalExchangeSavings;

  // Auto-save (debounced, premium only)
  useEffect(() => {
    if (isPremium && (meatProduce > 0 || majorPurchases > 0)) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      const timeout = setTimeout(() => {
        fetch("/api/saved-models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool: "savings",
            input: {
              meatProduce,
              pantryStaples,
              diapersBaby,
              majorPurchases,
              clothingApparel,
              weeklyGasGallons,
              salesTaxRate,
            },
            output: {
              totalCommissarySavings,
              totalExchangeSavings,
              grandTotal,
              meatProduceSavings,
              pantryStaplesSavings,
              diapersBabySavings,
              taxSavings,
              starCardSavings,
            },
          }),
        });
      }, 2000);
      saveTimeoutRef.current = timeout;
    }
  }, [
    isPremium,
    meatProduce,
    pantryStaples,
    diapersBaby,
    majorPurchases,
    clothingApparel,
    weeklyGasGallons,
    salesTaxRate,
    totalCommissarySavings,
    totalExchangeSavings,
    grandTotal,
    meatProduceSavings,
    pantryStaplesSavings,
    diapersBabySavings,
    taxSavings,
    starCardSavings,
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Section 1: Commissary Savings Plan */}
      <div
        id="savings-results"
        className="bg-surface calculator-results rounded-2xl border-2 border-blue-300 p-8 shadow-lg"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-info flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white">
            1
          </div>
          <div>
            <h2 className="text-3xl font-bold text-primary">Your Commissary Savings Plan</h2>
            <p className="text-body">
              Break down your grocery spending for accurate savings estimates
            </p>
          </div>
        </div>

        <div className="bg-info-subtle border-info mb-6 rounded-lg border p-4">
          <p className="text-info text-sm">
            <Icon name="Lightbulb" className="mr-1 inline h-4 w-4" /> <strong>Pro Tip:</strong>{" "}
            Different categories have different savings rates. Meat & produce typically save you
            30%, while pantry staples average 25%.
          </p>
        </div>

        <div className="space-y-6">
          {/* Meat & Produce */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-base font-semibold text-primary">
                🥩 Monthly Meat & Produce Spending
              </label>
              <span className="text-info text-sm font-medium">~30% savings</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted">
                $
              </span>
              <input
                type="number"
                value={meatProduce}
                onChange={(e) => setMeatProduce(Number(e.target.value))}
                className="border-default w-full rounded-lg border-2 py-3 pl-10 pr-4 text-lg focus:border-blue-600 focus:outline-none"
                placeholder="250"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Includes: Fresh meats, poultry, seafood, fruits, vegetables
            </p>
          </div>

          {/* Pantry Staples */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-base font-semibold text-primary">
                🥫 Monthly Pantry Staples Spending
              </label>
              <span className="text-info text-sm font-medium">~25% savings</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted">
                $
              </span>
              <input
                type="number"
                value={pantryStaples}
                onChange={(e) => setPantryStaples(Number(e.target.value))}
                className="border-default w-full rounded-lg border-2 py-3 pl-10 pr-4 text-lg focus:border-blue-600 focus:outline-none"
                placeholder="200"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Includes: Canned goods, dry goods, paper products, cleaning supplies
            </p>
          </div>

          {/* Diapers & Baby */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-base font-semibold text-primary">
                👶 Monthly Diapers & Baby Supplies Spending
              </label>
              <span className="text-info text-sm font-medium">~25% savings</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted">
                $
              </span>
              <input
                type="number"
                value={diapersBaby}
                onChange={(e) => setDiapersBaby(Number(e.target.value))}
                className="border-default w-full rounded-lg border-2 py-3 pl-10 pr-4 text-lg focus:border-blue-600 focus:outline-none"
                placeholder="100"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Includes: Diapers, wipes, formula, baby food (enter 0 if not applicable)
            </p>
          </div>

          {/* Commissary Results Preview */}
          <div className="border-subtle mt-8 border-t-2 pt-6">
            <PaywallWrapper
              isPremium={isPremium}
              title="Your Commissary Savings Revealed!"
              description="Unlock to see your detailed commissary savings breakdown by category"
              toolName="On-Base Savings"
              sampleData={
                <div className="bg-info-subtle border-info rounded-xl border-2 p-6">
                  <p className="text-body mb-2 text-center text-sm font-medium">
                    Estimated Annual Commissary Savings
                  </p>
                  <p className="text-info mb-3 text-center text-5xl font-black">$1,800</p>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                    <div>
                      <p className="text-body">Meat/Produce</p>
                      <p className="text-info font-bold">$900</p>
                    </div>
                    <div>
                      <p className="text-body">Pantry Staples</p>
                      <p className="text-info font-bold">$600</p>
                    </div>
                    <div>
                      <p className="text-body">Baby Supplies</p>
                      <p className="text-info font-bold">$300</p>
                    </div>
                  </div>
                </div>
              }
            >
              <div className="bg-info-subtle border-info rounded-xl border-2 p-6">
                <p className="text-body mb-2 text-center text-sm font-medium">
                  Estimated Annual Commissary Savings
                </p>
                <p className="text-info mb-3 text-center text-5xl font-black">
                  ${Math.round(totalCommissarySavings).toLocaleString()}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <p className="text-body">Meat/Produce</p>
                    <p className="text-info font-bold">
                      ${Math.round(meatProduceSavings).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-body">Pantry Staples</p>
                    <p className="text-info font-bold">
                      ${Math.round(pantryStaplesSavings).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-body">Baby Supplies</p>
                    <p className="text-info font-bold">
                      ${Math.round(diapersBabySavings).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </PaywallWrapper>
          </div>
        </div>
      </div>

      {/* Section 2: Exchange Savings Plan */}
      <div className="bg-surface rounded-2xl border-2 border-green-300 p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-xl font-bold text-white">
            2
          </div>
          <div>
            <h2 className="text-3xl font-bold text-primary">Your Exchange Savings Plan</h2>
            <p className="text-body">Calculate tax savings and MILITARY STAR® benefits</p>
          </div>
        </div>

        <div className="bg-success-subtle mb-6 rounded-lg border border-success p-4">
          <p className="text-sm text-success">
            <Icon name="Lightbulb" className="mr-1 inline h-4 w-4" /> <strong>Remember:</strong>{" "}
            Exchange shopping is tax-free! Plus, MILITARY STAR® cardholders get 5¢/gallon fuel
            discounts.
          </p>
        </div>

        <div className="space-y-6">
          {/* Sales Tax Rate */}
          <div>
            <label
              htmlFor="_your_local_sales_tax_rate_"
              className="mb-2 block text-base font-semibold text-primary"
            >
              💳 Your Local Sales Tax Rate (%)
            </label>
            <input
              type="number"
              value={salesTaxRate}
              onChange={(e) => setSalesTaxRate(Number(e.target.value))}
              step="0.01"
              className="border-default w-full rounded-lg border-2 px-4 py-3 text-lg focus:border-green-600 focus:outline-none"
              placeholder="7.25"
            />
            <p className="mt-1 text-xs text-muted">
              Not sure?{" "}
              <a
                href="https://www.avalara.com/taxrates/en/state-rates.html"
                target="_blank"
                rel="noopener"
                className="text-info underline"
              >
                Look up your rate by state
              </a>
            </p>
          </div>

          {/* Major Annual Purchases */}
          <div>
            <label className="mb-2 block text-base font-semibold text-primary">
              <Icon name="Monitor" className="mr-1 inline h-4 w-4" /> Major Annual Purchases
              (Electronics, Furniture, Appliances)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted">
                $
              </span>
              <input
                type="number"
                value={majorPurchases}
                onChange={(e) => setMajorPurchases(Number(e.target.value))}
                className="border-default w-full rounded-lg border-2 py-3 pl-10 pr-4 text-lg focus:border-green-600 focus:outline-none"
                placeholder="2000"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Examples: TVs, laptops, phones, furniture, appliances (annual total)
            </p>
          </div>

          {/* Clothing & Apparel */}
          <div>
            <label className="mb-2 block text-base font-semibold text-primary">
              👕 Annual Clothing & Apparel Spending
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted">
                $
              </span>
              <input
                type="number"
                value={clothingApparel}
                onChange={(e) => setClothingApparel(Number(e.target.value))}
                className="border-default w-full rounded-lg border-2 py-3 pl-10 pr-4 text-lg focus:border-green-600 focus:outline-none"
                placeholder="1200"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Includes: Clothing, shoes, accessories for entire family
            </p>
          </div>

          {/* Weekly Gas */}
          <div>
            <label
              htmlFor="_average_weekly_gas_gallons"
              className="mb-2 block text-base font-semibold text-primary"
            >
              ⛽ Average Weekly Gas (Gallons)
            </label>
            <input
              type="number"
              value={weeklyGasGallons}
              onChange={(e) => setWeeklyGasGallons(Number(e.target.value))}
              step="0.1"
              className="border-default w-full rounded-lg border-2 px-4 py-3 text-lg focus:border-green-600 focus:outline-none"
              placeholder="15"
            />
            <p className="mt-1 text-xs text-muted">MILITARY STAR® card saves you 5¢ per gallon</p>
          </div>

          {/* Exchange Results Preview */}
          <div className="border-subtle mt-8 border-t-2 pt-6">
            <PaywallWrapper
              isPremium={isPremium}
              title="Your Exchange Savings Revealed!"
              description="Unlock to see your detailed exchange savings breakdown including tax savings and STAR card benefits"
              toolName="On-Base Savings"
              sampleData={
                <div className="bg-success-subtle rounded-xl border-2 border-success p-6">
                  <p className="text-body mb-4 text-center text-sm font-medium">
                    Estimated Annual Exchange Savings Breakdown
                  </p>

                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                    <div className="bg-surface rounded-lg border border-green-300 p-4">
                      <p className="text-body mb-1 text-xs">Tax Savings (Non-Fuel)</p>
                      <p className="text-3xl font-bold text-success">$224</p>
                      <p className="mt-1 text-xs text-muted">Based on 7% local rate</p>
                    </div>

                    <div className="bg-surface rounded-lg border border-blue-300 p-4">
                      <p className="text-body mb-1 text-xs">MILITARY STAR® Fuel Savings</p>
                      <p className="text-info text-3xl font-bold">$39</p>
                      <p className="mt-1 text-xs text-muted">780 gallons × 5¢</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-5 text-center text-white">
                    <p className="mb-1 text-sm opacity-90">Total Exchange Savings</p>
                    <p className="text-4xl font-black">$263</p>
                  </div>
                </div>
              }
            >
              <div className="bg-success-subtle rounded-xl border-2 border-success p-6">
                <p className="text-body mb-4 text-center text-sm font-medium">
                  Estimated Annual Exchange Savings Breakdown
                </p>

                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div className="bg-surface rounded-lg border border-green-300 p-4">
                    <p className="text-body mb-1 text-xs">Tax Savings (Non-Fuel)</p>
                    <p className="text-3xl font-bold text-success">
                      ${Math.round(taxSavings).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-muted">Based on {salesTaxRate}% local rate</p>
                  </div>

                  <div className="bg-surface rounded-lg border border-blue-300 p-4">
                    <p className="text-body mb-1 text-xs">MILITARY STAR® Fuel Savings</p>
                    <p className="text-info text-3xl font-bold">
                      ${Math.round(starCardSavings).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {annualGasGallons.toLocaleString()} gallons × 5¢
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-5 text-center text-white">
                  <p className="mb-1 text-sm opacity-90">Total Exchange Savings</p>
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
          <div className="rounded-2xl border-4 border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-10 shadow-2xl">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-amber-400 bg-amber-100 px-4 py-2">
                <Icon name="Star" className="text-body h-6 w-6" />
                <span className="text-sm font-black uppercase tracking-wider text-amber-900">
                  Executive Summary
                </span>
              </div>
              <h2 className="text-text-headings mb-3 font-serif text-4xl font-black">
                Your Annual Savings Command Center
              </h2>
              <p className="text-body mx-auto max-w-2xl text-lg">
                Here&apos;s the complete picture of your on-base shopping benefits
              </p>
            </div>

            {/* Breakdown Cards */}
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <div className="bg-surface rounded-xl border-2 border-blue-400 p-6 text-center">
                <Icon name="ShoppingCart" className="text-body mb-3 h-10 w-10" />
                <p className="text-body mb-2 text-sm font-semibold uppercase tracking-wider">
                  Commissary Savings
                </p>
                <p className="text-info mb-2 text-4xl font-black">$2,847</p>
                <div className="text-body flex justify-center gap-4 text-xs">
                  <span>Meat: $1,200</span>
                  <span>Pantry: $1,647</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl border-2 border-green-400 p-6 text-center">
                <div className="mb-3 text-4xl">🏪</div>
                <p className="text-body mb-2 text-sm font-semibold uppercase tracking-wider">
                  Exchange Savings
                </p>
                <p className="mb-2 text-4xl font-black text-success">$1,753</p>
                <div className="text-body flex justify-center gap-4 text-xs">
                  <span>Tax: $1,400</span>
                  <span>STAR®: $353</span>
                </div>
              </div>
            </div>

            {/* Grand Total */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-8 text-white shadow-xl">
              <p className="mb-3 text-center text-lg font-semibold opacity-90">
                <Icon name="DollarSign" className="mr-1 inline h-5 w-5" /> Total Combined Annual
                Savings
              </p>
              <p className="mb-6 text-center text-6xl font-black">$4,600</p>
              <div className="rounded-xl border border-white/40 bg-white/20 p-4 backdrop-blur">
                <p className="text-center text-base leading-relaxed text-white">
                  <strong>
                    By strategically using your on-base benefits, your family could save an
                    estimated <span className="text-2xl font-black">$4,600</span> this year.
                  </strong>
                </p>
              </div>
            </div>

            {/* Context */}
            <div className="mt-6 grid gap-4 text-center md:grid-cols-3">
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-body mb-1 text-xs">Monthly Equivalent</p>
                <p className="text-lg font-bold text-primary">$383/mo</p>
              </div>
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-body mb-1 text-xs">Weekly Equivalent</p>
                <p className="text-lg font-bold text-primary">$88/wk</p>
              </div>
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-body mb-1 text-xs">Per Paycheck (24/year)</p>
                <p className="text-lg font-bold text-primary">$192</p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted">
              <Icon name="Lightbulb" className="mr-1 inline h-4 w-4" /> These estimates use
              DeCA&apos;s published averages and your local tax rate. Actual savings may vary based
              on shopping habits and product choices.
            </p>
          </div>
        }
      >
        <div className="rounded-2xl border-4 border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-10 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-amber-400 bg-amber-100 px-4 py-2">
              <Icon name="Star" className="text-body h-6 w-6" />
              <span className="text-sm font-black uppercase tracking-wider text-amber-900">
                Executive Summary
              </span>
            </div>
            <h2 className="text-text-headings mb-3 font-serif text-4xl font-black">
              Your Annual Savings Command Center
            </h2>
            <p className="text-body mx-auto max-w-2xl text-lg">
              Here&apos;s the complete picture of your on-base shopping benefits
            </p>
          </div>

          {/* Breakdown Cards */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="bg-surface rounded-xl border-2 border-blue-400 p-6 text-center">
              <Icon name="ShoppingCart" className="text-body mb-3 h-10 w-10" />
              <p className="text-body mb-2 text-sm font-semibold uppercase tracking-wider">
                Commissary Savings
              </p>
              <p className="text-info mb-2 text-4xl font-black">
                ${Math.round(totalCommissarySavings).toLocaleString()}
              </p>
              <div className="text-body flex justify-center gap-4 text-xs">
                <span>Meat: ${Math.round(meatProduceSavings).toLocaleString()}</span>
                <span>Pantry: ${Math.round(pantryStaplesSavings).toLocaleString()}</span>
                {diapersBabySavings > 0 && (
                  <span>Baby: ${Math.round(diapersBabySavings).toLocaleString()}</span>
                )}
              </div>
            </div>

            <div className="bg-surface rounded-xl border-2 border-green-400 p-6 text-center">
              <div className="mb-3 text-4xl">🏪</div>
              <p className="text-body mb-2 text-sm font-semibold uppercase tracking-wider">
                Exchange Savings
              </p>
              <p className="mb-2 text-4xl font-black text-success">
                ${Math.round(totalExchangeSavings).toLocaleString()}
              </p>
              <div className="text-body flex justify-center gap-4 text-xs">
                <span>Tax: ${Math.round(taxSavings).toLocaleString()}</span>
                <span>STAR®: ${Math.round(starCardSavings).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-8 text-white shadow-xl">
            <p className="mb-3 text-center text-lg font-semibold opacity-90">
              <Icon name="DollarSign" className="mr-1 inline h-5 w-5" /> Total Combined Annual
              Savings
            </p>
            <p className="mb-6 text-center text-6xl font-black">
              ${Math.round(grandTotal).toLocaleString()}
            </p>
            <div className="rounded-xl border border-white/40 bg-white/20 p-4 backdrop-blur">
              <p className="text-center text-base leading-relaxed text-white">
                <strong>
                  By strategically using your on-base benefits, your family could save an estimated{" "}
                  <span className="text-2xl font-black">
                    ${Math.round(grandTotal).toLocaleString()}
                  </span>{" "}
                  this year.
                </strong>
              </p>
            </div>
          </div>

          {/* Context */}
          <div className="mt-6 grid gap-4 text-center md:grid-cols-3">
            <div className="rounded-lg bg-white/50 p-3">
              <p className="text-body mb-1 text-xs">Monthly Equivalent</p>
              <p className="text-lg font-bold text-primary">
                ${Math.round(grandTotal / 12).toLocaleString()}/mo
              </p>
            </div>
            <div className="rounded-lg bg-white/50 p-3">
              <p className="text-body mb-1 text-xs">Weekly Equivalent</p>
              <p className="text-lg font-bold text-primary">
                ${Math.round(grandTotal / 52).toLocaleString()}/wk
              </p>
            </div>
            <div className="rounded-lg bg-white/50 p-3">
              <p className="text-body mb-1 text-xs">Per Paycheck (24/year)</p>
              <p className="text-lg font-bold text-primary">
                ${Math.round(grandTotal / 24).toLocaleString()}
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            <Icon name="Lightbulb" className="mr-1 inline h-4 w-4" /> These estimates use
            DeCA&apos;s published averages and your local tax rate. Actual savings may vary based on
            shopping habits and product choices.
          </p>
        </div>
      </PaywallWrapper>

      {/* AI Explainer */}
      <Explainer
        payload={{
          tool: "on-base-savings",
          inputs: {
            commissary: { meatProduce, pantryStaples, diapersBaby },
            exchange: { majorPurchases, clothingApparel, weeklyGasGallons },
          },
          outputs: {
            commissarySavings: totalCommissarySavings,
            exchangeSavings: totalExchangeSavings,
            grandTotal,
          },
        }}
      />

      {/* Export Options */}
      <div className="mt-8 border-t border-border pt-6">
        <ExportButtons
          tool="on-base-savings"
          resultsElementId="savings-results"
          data={{
            inputs: {
              meatProduce,
              pantryStaples,
              diapersBaby,
              majorPurchases,
              clothingApparel,
              weeklyGasGallons,
              salesTaxRate,
            },
            outputs: {
              totalCommissarySavings,
              totalExchangeSavings,
              grandTotal,
              meatProduceSavings,
              pantryStaplesSavings,
              diapersBabySavings,
              taxSavings,
              starCardSavings,
            },
          }}
        />
      </div>

      {/* Weekly Shopping Planner */}
      {grandTotal > 0 && (
        <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
          <h3 className="mb-4 text-xl font-bold text-green-900">
            <Icon name="Calendar" className="mr-2 inline h-5 w-5" />
            Optimized Shopping Strategy
          </h3>

          <div className="space-y-4">
            <div className="rounded-lg border border-green-300 bg-white p-5">
              <h4 className="mb-3 font-bold text-green-900">Weekly Shopping Plan:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Commissary (Tuesday-Thursday)</p>
                    <p className="text-sm text-green-800">
                      Meat, produce, pantry staples:{" "}
                      {fmt((meatProduce + pantryStaples + diapersBaby) / 4)}/week
                    </p>
                    <p className="text-xs text-green-700">
                      Best selection, shortest lines, freshest produce
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">Exchange (As Needed)</p>
                    <p className="text-sm text-blue-800">Clothing, electronics, major purchases</p>
                    <p className="text-xs text-blue-700">
                      Tax-free shopping saves {salesTaxRate}% on every purchase
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-purple-900">Gas Station (Weekly)</p>
                    <p className="text-sm text-purple-800">
                      Fill up with MILITARY STAR®: Save {fmt(starCardSavings)}/year
                    </p>
                    <p className="text-xs text-purple-700">
                      5¢/gallon discount = ${(weeklyGasGallons * 0.05).toFixed(2)}/week
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-green-300 bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-green-900">Monthly Savings Goal:</p>
                <p className="text-3xl font-bold text-success">{fmt(grandTotal / 12)}</p>
                <p className="mt-1 text-xs text-green-700">
                  Track this in your budget to ensure you're maximizing benefits
                </p>
              </div>
              <div className="rounded-lg border border-green-300 bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-green-900">Weekly Budget Impact:</p>
                <p className="text-3xl font-bold text-success">{fmt(grandTotal / 52)}</p>
                <p className="mt-1 text-xs text-green-700">
                  Extra cash for family activities or emergency fund
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Performance Breakdown */}
      {grandTotal > 0 && (
        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
          <h3 className="mb-4 text-xl font-bold text-indigo-900">
            <Icon name="BarChart" className="mr-2 inline h-5 w-5" />
            Savings Breakdown by Category
          </h3>

          <div className="space-y-3">
            {[
              {
                name: "Meat & Produce",
                amount: meatProduceSavings,
                percent: (meatProduceSavings / grandTotal) * 100,
                color: "bg-red-500",
              },
              {
                name: "Pantry Staples",
                amount: pantryStaplesSavings,
                percent: (pantryStaplesSavings / grandTotal) * 100,
                color: "bg-amber-500",
              },
              {
                name: "Baby/Diapers",
                amount: diapersBabySavings,
                percent: (diapersBabySavings / grandTotal) * 100,
                color: "bg-pink-500",
              },
              {
                name: "Exchange Tax Savings",
                amount: taxSavings,
                percent: (taxSavings / grandTotal) * 100,
                color: "bg-blue-500",
              },
              {
                name: "Gas Station Rewards",
                amount: starCardSavings,
                percent: (starCardSavings / grandTotal) * 100,
                color: "bg-purple-500",
              },
            ]
              .sort((a, b) => b.amount - a.amount)
              .map((category) => (
                <div
                  key={category.name}
                  className="rounded-lg border border-indigo-200 bg-white p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-indigo-900">{category.name}</span>
                    <span className="text-2xl font-bold text-indigo-900">
                      {fmt(category.amount)}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`${category.color} h-full rounded-full transition-all`}
                      style={{ width: `${category.percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-indigo-700">
                    {category.percent.toFixed(1)}% of total savings
                  </p>
                </div>
              ))}
          </div>

          <div className="mt-4 rounded-lg border border-success bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-success">Top Opportunity:</p>
            <p className="text-lg font-bold text-success">
              {(() => {
                const top = [
                  { name: "Meat & Produce", amount: meatProduceSavings },
                  { name: "Pantry Staples", amount: pantryStaplesSavings },
                  { name: "Baby/Diapers", amount: diapersBabySavings },
                  { name: "Exchange Purchases", amount: taxSavings },
                  { name: "Gas Rewards", amount: starCardSavings },
                ].sort((a, b) => b.amount - a.amount)[0];

                return `${top.name} - Focus here for maximum impact`;
              })()}
            </p>
          </div>
        </div>
      )}

      {/* Educational Tips */}
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-indigo-900">
          <Icon name="Lightbulb" className="h-5 w-5" /> Maximize Your Savings
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
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

      {/* Comparison Mode */}
      <ComparisonMode
        tool="on-base-savings"
        currentInput={{
          meatProduce,
          pantryStaples,
          diapersBaby,
          majorPurchases,
          clothingApparel,
          weeklyGasGallons,
          salesTaxRate,
        }}
        currentOutput={{
          totalCommissarySavings,
          totalExchangeSavings,
          grandTotal,
          meatProduceSavings,
          pantryStaplesSavings,
          diapersBabySavings,
          taxSavings,
          starCardSavings,
        }}
        onLoadScenario={(input) => {
          setMeatProduce(input.meatProduce || 250);
          setPantryStaples(input.pantryStaples || 200);
          setDiapersBaby(input.diapersBaby || 75);
          setMajorPurchases(input.majorPurchases || 2000);
          setClothingApparel(input.clothingApparel || 500);
          setWeeklyGasGallons(input.weeklyGasGallons || 15);
          setSalesTaxRate(input.salesTaxRate || 7.5);
        }}
        renderComparison={(scenarios) => (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="p-3 text-left text-sm font-bold text-primary">Scenario</th>
                  <th className="p-3 text-right text-sm font-bold text-primary">
                    Commissary Savings
                  </th>
                  <th className="p-3 text-right text-sm font-bold text-primary">
                    Exchange Savings
                  </th>
                  <th className="p-3 text-right text-sm font-bold text-primary">
                    Total Annual Savings
                  </th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario, idx) => (
                  <tr key={scenario.id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="p-3 font-semibold text-primary">{scenario.name}</td>
                    <td className="text-info p-3 text-right font-bold">
                      {fmt(scenario.output.totalCommissarySavings || 0)}
                    </td>
                    <td className="p-3 text-right font-bold text-blue-600">
                      {fmt(scenario.output.totalExchangeSavings || 0)}
                    </td>
                    <td className="p-3 text-right font-bold text-success">
                      {fmt(scenario.output.grandTotal || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />
    </div>
  );
}

const fmt = (v: number) =>
  v.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
