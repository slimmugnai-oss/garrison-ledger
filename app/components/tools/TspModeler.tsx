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

// Historical average returns (10-year avg, 2013-2023)
// Source: TSP.gov historical performance data
const HISTORICAL_RETURNS = {
  C: 0.1145, // S&P 500 - 11.45%
  S: 0.0982, // Small/Mid Cap - 9.82%
  I: 0.0513, // International - 5.13%
  F: 0.0063, // Bond Index - 0.63%
  G: 0.0218, // Government Securities - 2.18%
};

// Default Lifecycle L2050 allocation (approximate)
const L2050_ALLOCATION = {
  C: 35,
  S: 23,
  I: 17,
  F: 14,
  G: 11,
};

export default function TspModeler() {
  const [age, setAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [currentBalance, setCurrentBalance] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);

  // Custom allocation (percentages)
  const [allocC, setAllocC] = useState(40);
  const [allocS, setAllocS] = useState(30);
  const [allocI, setAllocI] = useState(15);
  const [allocF, setAllocF] = useState(10);
  const [allocG, setAllocG] = useState(5);

  // Track page view on mount
  useEffect(() => {
    track("tsp_modeler_view");
  }, []);

  // Calculate weighted average return based on allocation
  const calculateWeightedReturn = (allocation: Record<string, number>) => {
    return (
      (allocation.C / 100) * HISTORICAL_RETURNS.C +
      (allocation.S / 100) * HISTORICAL_RETURNS.S +
      (allocation.I / 100) * HISTORICAL_RETURNS.I +
      (allocation.F / 100) * HISTORICAL_RETURNS.F +
      (allocation.G / 100) * HISTORICAL_RETURNS.G
    );
  };

  // Calculate future value with contributions
  const calculateFutureValue = (
    principal: number,
    monthlyContrib: number,
    annualReturn: number,
    years: number
  ) => {
    const monthlyRate = annualReturn / 12;
    const months = years * 12;

    // Future value of current balance
    const fvPrincipal = principal * Math.pow(1 + monthlyRate, months);

    // Future value of monthly contributions (annuity)
    const fvContributions =
      monthlyContrib * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    return fvPrincipal + fvContributions;
  };

  const yearsToRetirement = retirementAge - age;
  const totalCustomAlloc = allocC + allocS + allocI + allocF + allocG;

  // Normalize allocations if total isn't 100
  const normalizedCustom = {
    C: (allocC / totalCustomAlloc) * 100,
    S: (allocS / totalCustomAlloc) * 100,
    I: (allocI / totalCustomAlloc) * 100,
    F: (allocF / totalCustomAlloc) * 100,
    G: (allocG / totalCustomAlloc) * 100,
  };

  const customReturn = calculateWeightedReturn(normalizedCustom);
  const l2050Return = calculateWeightedReturn(L2050_ALLOCATION);

  const customBalance = calculateFutureValue(
    currentBalance,
    monthlyContribution,
    customReturn,
    yearsToRetirement
  );

  const l2050Balance = calculateFutureValue(
    currentBalance,
    monthlyContribution,
    l2050Return,
    yearsToRetirement
  );

  const difference = customBalance - l2050Balance;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Data Provenance Banner */}
      <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-600 p-3">
            <Icon name="Shield" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-bold text-blue-900">
              TSP Historical Performance Data
            </h3>
            <p className="mb-3 text-sm text-blue-800">
              This calculator uses 10-year average returns (2013-2023) from official TSP fund
              performance data. Past performance does not guarantee future results.
            </p>
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div className="rounded-lg border border-blue-200 bg-white p-3">
                <p className="mb-1 font-semibold text-blue-700">Data Source</p>
                <p className="text-blue-900">TSP.gov Performance</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-white p-3">
                <p className="mb-1 font-semibold text-blue-700">Time Period</p>
                <p className="text-blue-900">10-Year Avg (2013-2023)</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-white p-3">
                <p className="mb-1 font-semibold text-blue-700">Confidence</p>
                <p className="font-bold text-blue-900">Historical Data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Your TSP Information</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="current_age" className="mb-2 block text-sm font-semibold text-gray-700">
              Current Age
            </label>
            <input
              type="number"
              min={18}
              max={100}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg font-medium text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="retirement_age"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Retirement Age
            </label>
            <input
              type="number"
              min={age}
              max={100}
              value={retirementAge}
              onChange={(e) => setRetirementAge(Number(e.target.value))}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg font-medium text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="current_balance"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Current Balance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                step={1000}
                value={currentBalance}
                onChange={(e) => setCurrentBalance(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="monthly_contribution"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Monthly Contribution
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                step={50}
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <Icon name="Info" className="mr-1 inline h-4 w-4" />
            <strong>Years to retirement:</strong> {yearsToRetirement} years |{" "}
            <strong>BRS Tip:</strong> Contribute at least 5% to get full DoD matching
          </p>
        </div>
      </div>

      {/* Fund Allocation */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Your Custom Allocation</h2>

        <div className="mb-6 grid gap-6 md:grid-cols-5">
          <FundSlider
            label="C Fund"
            value={allocC}
            onChange={setAllocC}
            historicalReturn={HISTORICAL_RETURNS.C}
            description="S&P 500"
          />
          <FundSlider
            label="S Fund"
            value={allocS}
            onChange={setAllocS}
            historicalReturn={HISTORICAL_RETURNS.S}
            description="Small/Mid Cap"
          />
          <FundSlider
            label="I Fund"
            value={allocI}
            onChange={setAllocI}
            historicalReturn={HISTORICAL_RETURNS.I}
            description="International"
          />
          <FundSlider
            label="F Fund"
            value={allocF}
            onChange={setAllocF}
            historicalReturn={HISTORICAL_RETURNS.F}
            description="Bonds"
          />
          <FundSlider
            label="G Fund"
            value={allocG}
            onChange={setAllocG}
            historicalReturn={HISTORICAL_RETURNS.G}
            description="Gov Securities"
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Total Allocation:</span>
            <span
              className={`text-lg font-bold ${totalCustomAlloc === 100 ? "text-green-600" : "text-amber-600"}`}
            >
              {totalCustomAlloc}%
            </span>
          </div>
          {totalCustomAlloc !== 100 && (
            <p className="mt-2 text-xs text-amber-700">
              Allocations will be normalized to 100% for calculations
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Retirement Projection ({yearsToRetirement} Years)
        </h2>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border-2 border-gray-400 bg-white p-6 text-center">
            <p className="mb-2 text-sm text-gray-600">Default Lifecycle L2050</p>
            <p className="mb-2 text-4xl font-bold text-gray-900">{fmt(l2050Balance)}</p>
            <p className="text-xs text-gray-600">
              Avg Return: {(l2050Return * 100).toFixed(2)}% annually
            </p>
          </div>

          <div className="rounded-lg border-2 border-blue-500 bg-white p-6 text-center">
            <p className="mb-2 text-sm text-gray-600">Your Custom Allocation</p>
            <p className="mb-2 text-4xl font-bold text-blue-900">{fmt(customBalance)}</p>
            <p className="text-xs text-gray-600">
              Avg Return: {(customReturn * 100).toFixed(2)}% annually
            </p>
          </div>
        </div>

        <div
          className={`rounded-lg border-2 p-6 ${
            difference >= 0 ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
          }`}
        >
          <div className="text-center">
            <p
              className={`mb-2 text-2xl font-bold ${difference >= 0 ? "text-green-700" : "text-red-700"}`}
            >
              {difference >= 0 ? (
                <>
                  <Icon name="TrendingUp" className="mr-2 inline h-6 w-6" />
                  Potential Gain
                </>
              ) : (
                <>
                  <Icon name="TrendingDown" className="mr-2 inline h-6 w-6" />
                  Potential Loss
                </>
              )}
            </p>
            <p
              className={`mb-4 text-5xl font-bold ${difference >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {difference >= 0 ? "+" : ""}
              {fmt(difference)}
            </p>
            <p className="text-sm text-gray-700">vs. Default L2050 Lifecycle Fund</p>
          </div>
        </div>

        <div className="mt-6 rounded-r-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="mb-1 text-sm font-semibold text-amber-900">
            <Icon name="AlertTriangle" className="mr-1 inline h-4 w-4" />
            Important Disclaimer
          </p>
          <p className="text-xs text-amber-800">
            This calculator uses historical averages for educational purposes only.{" "}
            <strong>Past performance does not guarantee future results.</strong> Actual TSP returns
            will vary based on market conditions. Consider your risk tolerance, time horizon, and
            financial goals. Consult with a financial advisor for personalized guidance.
          </p>
        </div>

        {/* AI Explainer - Helps users understand their allocation strategy and results */}
        <div className="mt-6">
          <Explainer
            payload={{
              tool: "tsp-calculator",
              inputs: {
                age,
                retirementAge,
                currentBalance,
                monthlyContribution,
                allocation: { C: allocC, S: allocS, I: allocI, F: allocF, G: allocG },
              },
              outputs: {
                customBalance,
                l2050Balance,
                difference,
                customReturn: (customReturn * 100).toFixed(2),
                yearsToRetirement,
              },
            }}
          />
        </div>
      </div>

      {/* Educational Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-blue-900">TSP Fund Overview</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div>
              <strong>C Fund:</strong> Tracks S&P 500, large-cap US stocks (11.45% 10-yr avg)
            </div>
            <div>
              <strong>S Fund:</strong> Small/mid-cap US stocks, higher volatility (9.82% 10-yr avg)
            </div>
            <div>
              <strong>I Fund:</strong> International stocks, geographic diversification (5.13% 10-yr
              avg)
            </div>
            <div>
              <strong>F Fund:</strong> Bond index, more stable than stocks (0.63% 10-yr avg)
            </div>
            <div>
              <strong>G Fund:</strong> Government securities, stable but low returns (2.18% 10-yr
              avg)
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-green-900">TSP Best Practices</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>Contribute at least 5% to get full BRS matching (free money)</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>Younger investors can afford more stock fund exposure (C/S/I)</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>Rebalance annually to maintain your target allocation</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>2024 contribution limit: $23,000/year (combat zone exempt)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Official Resources */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Icon name="ExternalLink" className="h-5 w-5 text-gray-600" />
          Official TSP Resources
        </h3>
        <div className="space-y-3">
          <a
            href="https://www.tsp.gov/fund-performance/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            TSP Fund Performance & Returns →
          </a>
          <a
            href="https://www.tsp.gov/planning-tools/calculators/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            Official TSP Calculators →
          </a>
          <a
            href="https://www.tsp.gov/funds-lifecycle/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            TSP Lifecycle Funds Overview →
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          All calculations based on official TSP historical performance data. Data sources: TSP.gov,
          10-year average returns (2013-2023).
        </p>
      </div>
    </div>
  );
}

function FundSlider({
  label,
  value,
  onChange,
  historicalReturn,
  description,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  historicalReturn: number;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-700">{label}</label>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className="text-lg font-bold text-blue-600">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
      />
      <p className="text-xs text-gray-600">10-yr avg: {(historicalReturn * 100).toFixed(2)}%</p>
    </div>
  );
}
