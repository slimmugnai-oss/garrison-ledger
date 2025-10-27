"use client";

import { useState, useEffect } from "react";

import Icon from "@/app/components/ui/Icon";
import { track } from "@/lib/track";

const fmt = (v: number) =>
  v.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function OnBaseSavingsCalculator() {
  // Commissary spending
  const [monthlyGroceries, setMonthlyGroceries] = useState(600);

  // Exchange spending
  const [annualMajorPurchases, setAnnualMajorPurchases] = useState(2000);
  const [annualClothing, setAnnualClothing] = useState(1200);
  const [weeklyGasGallons, setWeeklyGasGallons] = useState(15);
  const [salesTaxRate, setSalesTaxRate] = useState(7);

  // Track page view on mount
  useEffect(() => {
    track("on_base_savings_view");
  }, []);

  // COMMISSARY SAVINGS CALCULATION
  // Average savings: 25-30% vs civilian grocery stores
  // Source: Defense Commissary Agency (DeCA) - commissaries.com
  // Conservative estimate: 25% average savings
  const commissarySavingsRate = 0.25;
  const annualCommissarySavings = monthlyGroceries * 12 * commissarySavingsRate;

  // EXCHANGE SAVINGS CALCULATION
  // Primary benefit: Tax-free shopping (saves local sales tax rate)
  const taxRateDecimal = salesTaxRate / 100;
  const totalTaxablePurchases = annualMajorPurchases + annualClothing;
  const taxSavings = totalTaxablePurchases * taxRateDecimal;

  // MILITARY STAR CARD GAS SAVINGS
  // Official benefit: 5¢ per gallon discount on fuel
  // Source: Army & Air Force Exchange Service (AAFES) - shopmyexchange.com
  const annualGasGallons = weeklyGasGallons * 52;
  const starCardGasSavings = annualGasGallons * 0.05;

  const totalExchangeSavings = taxSavings + starCardGasSavings;

  // TOTAL COMBINED SAVINGS
  const totalAnnualSavings = annualCommissarySavings + totalExchangeSavings;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Data Provenance Banner */}
      <div className="rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-green-600 p-3">
            <Icon name="Shield" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-bold text-green-900">
              On-Base Shopping Savings Estimate
            </h3>
            <p className="mb-3 text-sm text-green-800">
              This calculator uses published savings rates from DeCA (Defense Commissary Agency) and
              AAFES (Army & Air Force Exchange Service). Actual savings vary by shopping habits and
              location.
            </p>
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-white p-3">
                <p className="mb-1 font-semibold text-green-700">Data Source</p>
                <p className="text-green-900">DeCA / AAFES</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-white p-3">
                <p className="mb-1 font-semibold text-green-700">Savings Rate</p>
                <p className="text-green-900">~25% avg (DeCA)</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-white p-3">
                <p className="mb-1 font-semibold text-green-700">Confidence</p>
                <p className="font-bold text-green-900">Good</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commissary Input */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            1
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Commissary Spending</h2>
            <p className="text-sm text-gray-600">Average savings: 25% vs civilian stores</p>
          </div>
        </div>

        <div>
          <label
            htmlFor="monthly_grocery_spending"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Monthly Grocery Spending
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
              $
            </span>
            <input
              type="number"
              min={0}
              step={50}
              value={monthlyGroceries}
              onChange={(e) => setMonthlyGroceries(Number(e.target.value))}
              className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-600">
            Total monthly spending on groceries and household items
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-900">
              Estimated Annual Commissary Savings
            </span>
            <span className="text-2xl font-bold text-blue-900">{fmt(annualCommissarySavings)}</span>
          </div>
        </div>
      </div>

      {/* Exchange Input */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white">
            2
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Exchange Spending</h2>
            <p className="text-sm text-gray-600">Tax-free shopping + MILITARY STAR card benefits</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="sales_tax_rate"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Your Local Sales Tax Rate (%)
            </label>
            <input
              type="number"
              min={0}
              max={15}
              step={0.1}
              value={salesTaxRate}
              onChange={(e) => setSalesTaxRate(Number(e.target.value))}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-600">
              Example rates: CA ~8.5%, TX ~6.5%, FL ~6%, NY ~8%
            </p>
          </div>

          <div>
            <label
              htmlFor="annual_major_purchases"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Annual Major Purchases
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={annualMajorPurchases}
                onChange={(e) => setAnnualMajorPurchases(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">Electronics, furniture, appliances</p>
          </div>

          <div>
            <label
              htmlFor="annual_clothing"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Annual Clothing & Apparel
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={annualClothing}
                onChange={(e) => setAnnualClothing(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">Clothing, shoes, accessories for family</p>
          </div>

          <div>
            <label
              htmlFor="weekly_gas_gallons"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Weekly Gas (Gallons)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={weeklyGasGallons}
              onChange={(e) => setWeeklyGasGallons(Number(e.target.value))}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-600">MILITARY STAR card: 5¢/gallon discount</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-green-900">Tax Savings</span>
            <span className="text-2xl font-bold text-green-900">{fmt(taxSavings)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-green-200 pt-3">
            <span className="text-sm font-semibold text-green-900">STAR Card Gas Savings</span>
            <span className="text-2xl font-bold text-green-900">{fmt(starCardGasSavings)}</span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="rounded-xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Annual Savings Estimate
        </h2>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border-2 border-blue-400 bg-white p-6 text-center">
            <Icon name="ShoppingCart" className="mx-auto mb-3 h-8 w-8 text-blue-600" />
            <p className="mb-2 text-sm text-gray-600">Commissary Savings</p>
            <p className="text-4xl font-bold text-blue-900">{fmt(annualCommissarySavings)}</p>
            <p className="mt-2 text-xs text-gray-600">25% avg savings rate</p>
          </div>

          <div className="rounded-lg border-2 border-green-400 bg-white p-6 text-center">
            <Icon name="Building" className="mx-auto mb-3 h-8 w-8 text-green-600" />
            <p className="mb-2 text-sm text-gray-600">Exchange Savings</p>
            <p className="text-4xl font-bold text-green-900">{fmt(totalExchangeSavings)}</p>
            <p className="mt-2 text-xs text-gray-600">Tax-free + STAR benefits</p>
          </div>
        </div>

        <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6">
          <div className="text-center">
            <p className="mb-2 text-2xl font-bold text-green-700">
              <Icon name="DollarSign" className="mr-2 inline h-6 w-6" />
              Total Annual Savings
            </p>
            <p className="mb-4 text-5xl font-bold text-green-600">{fmt(totalAnnualSavings)}</p>
            <div className="grid gap-3 text-sm text-green-800 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-600">Monthly</p>
                <p className="font-bold">{fmt(totalAnnualSavings / 12)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Weekly</p>
                <p className="font-bold">{fmt(totalAnnualSavings / 52)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Per Paycheck</p>
                <p className="font-bold">{fmt(totalAnnualSavings / 24)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-r-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="mb-1 text-sm font-semibold text-amber-900">
            <Icon name="AlertTriangle" className="mr-1 inline h-4 w-4" />
            Important Disclaimer
          </p>
          <p className="text-xs text-amber-800">
            This calculator provides estimates based on published average savings rates from DeCA
            and AAFES. <strong>Actual savings vary significantly</strong> based on shopping habits,
            product choices, and comparison to local civilian stores. Commissary savings rates are
            averages and may not reflect your specific purchases. Use this as a general planning
            tool only.
          </p>
        </div>
      </div>

      {/* Educational Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-blue-900">Commissary Benefits</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Average 25% savings vs civilian grocery stores (DeCA estimate)</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>5% surcharge funds commissary operations and improvements</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Best selection on Tuesday-Thursday mornings</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Case lot sales offer additional bulk discounts</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-green-900">Exchange Benefits</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>Tax-free shopping saves your local sales tax rate on all purchases</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>MILITARY STAR card: 5¢/gallon fuel discount at base gas stations</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>Exchange earnings fund MWR programs and facilities</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>Price match available at many locations (check local policy)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Official Resources */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Icon name="ExternalLink" className="h-5 w-5 text-gray-600" />
          Official Shopping Resources
        </h3>
        <div className="space-y-3">
          <a
            href="https://www.commissaries.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            Defense Commissary Agency (DeCA) →
          </a>
          <a
            href="https://www.shopmyexchange.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            Army & Air Force Exchange Service (AAFES) →
          </a>
          <a
            href="https://www.mynavyexchange.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            Navy Exchange (NEX) →
          </a>
          <a
            href="https://www.mymcx.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            Marine Corps Exchange (MCX) →
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          Savings estimates based on published DeCA/AAFES data. Commissary 25% average savings rate
          from commissaries.com. MILITARY STAR 5¢/gallon discount from shopmyexchange.com.
        </p>
      </div>
    </div>
  );
}
