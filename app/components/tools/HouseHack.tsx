"use client";

import { useState, useEffect } from "react";

import Explainer from "@/app/components/ai/Explainer";
import Icon from "@/app/components/ui/Icon";
import { track } from "@/lib/track";

const fmt = (v: number) =>
  v.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function HouseHack() {
  const [propertyPrice, setPropertyPrice] = useState(400000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [annualPropertyTax, setAnnualPropertyTax] = useState(4800);
  const [annualInsurance, setAnnualInsurance] = useState(1600);
  const [monthlyBAH, setMonthlyBAH] = useState(2400);
  const [monthlyRent, setMonthlyRent] = useState(2200);

  // Track page view on mount
  useEffect(() => {
    track("house_hacking_view");
  }, []);

  // Calculate monthly mortgage payment (Principal + Interest)
  // Formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
  // where P = payment, L = loan amount, c = monthly rate, n = number of payments
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = 30 * 12; // 30-year mortgage
  const monthlyPI =
    (propertyPrice * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  // Monthly property tax and insurance
  const monthlyTax = annualPropertyTax / 12;
  const monthlyInsurance = annualInsurance / 12;

  // Total monthly PITI (Principal, Interest, Taxes, Insurance)
  const monthlyPITI = monthlyPI + monthlyTax + monthlyInsurance;

  // Total monthly income (BAH + Rent)
  const monthlyIncome = monthlyBAH + monthlyRent;

  // Net monthly cash flow
  const monthlyCashFlow = monthlyIncome - monthlyPITI;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Data Provenance Banner */}
      <div className="rounded-xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-purple-600 p-3">
            <Icon name="Shield" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-bold text-purple-900">VA Loan Cash Flow Estimate</h3>
            <p className="mb-3 text-sm text-purple-800">
              This calculator estimates monthly cash flow for house hacking with a VA loan (0% down,
              no PMI). Calculations use standard mortgage formulas. Actual costs may vary based on
              location, property condition, and market factors.
            </p>
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div className="rounded-lg border border-purple-200 bg-white p-3">
                <p className="mb-1 font-semibold text-purple-700">Loan Type</p>
                <p className="text-purple-900">VA Loan (0% down)</p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-white p-3">
                <p className="mb-1 font-semibold text-purple-700">Formula</p>
                <p className="text-purple-900">Standard PITI</p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-white p-3">
                <p className="mb-1 font-semibold text-purple-700">Confidence</p>
                <p className="font-bold text-purple-900">Estimate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Property Details</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="property_price"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Property Purchase Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                step={10000}
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">VA loan: 0% down payment required</p>
          </div>

          <div>
            <label
              htmlFor="interest_rate"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Interest Rate (%)
            </label>
            <input
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg font-medium text-gray-900 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
            />
            <p className="mt-1 text-xs text-gray-600">Current VA rates typically 5.5% - 7.5%</p>
          </div>

          <div>
            <label
              htmlFor="annual_property_tax"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Annual Property Tax
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={annualPropertyTax}
                onChange={(e) => setAnnualPropertyTax(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">Typically 1-2% of property value annually</p>
          </div>

          <div>
            <label
              htmlFor="annual_insurance"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Annual Homeowners Insurance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={annualInsurance}
                onChange={(e) => setAnnualInsurance(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">Varies by location and coverage</p>
          </div>

          <div>
            <label htmlFor="monthly_bah" className="mb-2 block text-sm font-semibold text-gray-700">
              Your Monthly BAH
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={monthlyBAH}
                onChange={(e) => setMonthlyBAH(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">Based on rank and location</p>
          </div>

          <div>
            <label
              htmlFor="monthly_rent_income"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Expected Monthly Rent
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">From roommates or separate unit</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <Icon name="Info" className="mr-1 inline h-4 w-4" />
            <strong>VA Loan Benefits:</strong> No down payment, no PMI (private mortgage insurance),
            typically lower rates than conventional loans
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="rounded-xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Monthly Cash Flow Analysis
        </h2>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border-2 border-red-300 bg-white p-6 text-center">
            <p className="mb-2 text-sm text-gray-600">Monthly Expenses (PITI)</p>
            <p className="mb-2 text-4xl font-bold text-red-700">{fmt(monthlyPITI)}</p>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Principal + Interest:</span>
                <span className="font-semibold">{fmt(monthlyPI)}</span>
              </div>
              <div className="flex justify-between">
                <span>Property Tax:</span>
                <span className="font-semibold">{fmt(monthlyTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Insurance:</span>
                <span className="font-semibold">{fmt(monthlyInsurance)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-green-300 bg-white p-6 text-center">
            <p className="mb-2 text-sm text-gray-600">Monthly Income</p>
            <p className="mb-2 text-4xl font-bold text-green-700">{fmt(monthlyIncome)}</p>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Your BAH:</span>
                <span className="font-semibold">{fmt(monthlyBAH)}</span>
              </div>
              <div className="flex justify-between">
                <span>Rental Income:</span>
                <span className="font-semibold">{fmt(monthlyRent)}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border-2 p-6 ${
            monthlyCashFlow >= 0 ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
          }`}
        >
          <div className="text-center">
            <p
              className={`mb-2 text-2xl font-bold ${monthlyCashFlow >= 0 ? "text-green-700" : "text-red-700"}`}
            >
              {monthlyCashFlow >= 0 ? (
                <>
                  <Icon name="TrendingUp" className="mr-2 inline h-6 w-6" />
                  Positive Cash Flow
                </>
              ) : (
                <>
                  <Icon name="TrendingDown" className="mr-2 inline h-6 w-6" />
                  Negative Cash Flow
                </>
              )}
            </p>
            <p
              className={`mb-4 text-5xl font-bold ${monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {monthlyCashFlow >= 0 ? "+" : ""}
              {fmt(monthlyCashFlow)}
            </p>
            <p className="text-sm text-gray-700">Net monthly cash flow after all expenses</p>
          </div>
        </div>

        <div className="mt-6 rounded-r-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="mb-1 text-sm font-semibold text-amber-900">
            <Icon name="AlertTriangle" className="mr-1 inline h-4 w-4" />
            Important Disclaimer
          </p>
          <p className="text-xs text-amber-800">
            This calculator provides estimates for planning purposes only.{" "}
            <strong>Actual costs will vary</strong> based on HOA fees, maintenance, utilities,
            vacancy rates, property management, and unexpected repairs. Always build a 10-20% buffer
            for unexpected expenses and consult with a real estate professional and financial
            advisor before purchasing.
          </p>
        </div>

        {/* AI Explainer - Provides context on whether this investment makes sense */}
        <div className="mt-6">
          <Explainer
            payload={{
              tool: "house-hacking-calculator",
              inputs: { propertyPrice, interestRate, monthlyBAH, monthlyRent },
              outputs: { monthlyPITI, monthlyIncome, monthlyCashFlow },
            }}
          />
        </div>
      </div>

      {/* Educational Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-blue-900">House Hacking Basics</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Live in one unit while renting out others (duplex, triplex, fourplex)</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>VA loan allows 0% down for 1-4 unit properties as primary residence</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Tenants help pay down your mortgage while you build equity</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Convert to full rental after PCS to new duty station</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-purple-900">Important Considerations</h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>Budget for 5-10% of rent for maintenance and repairs annually</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>Plan for vacancy periods - budget 1-2 months rent per year</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>Consider property management fees if you PCS (typically 8-10%)</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>Research local landlord-tenant laws and rental market demand</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Official Resources */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Icon name="ExternalLink" className="h-5 w-5 text-gray-600" />
          VA Loan & Real Estate Resources
        </h3>
        <div className="space-y-3">
          <a
            href="https://www.va.gov/housing-assistance/home-loans/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            VA Home Loans Overview →
          </a>
          <a
            href="https://www.benefits.va.gov/homeloans/coe.asp"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            VA Certificate of Eligibility (COE) →
          </a>
          <a
            href="https://www.biggerpockets.com/house-hacking"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            BiggerPockets House Hacking Guide →
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          Cash flow calculations use standard mortgage formulas. Always verify with lenders and
          consult professionals before making real estate investment decisions.
        </p>
      </div>
    </div>
  );
}
