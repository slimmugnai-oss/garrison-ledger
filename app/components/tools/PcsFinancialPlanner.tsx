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

type EntitlementData = {
  rank_group: string;
  dependency_status: string;
  weight_allowance: number;
  dla_rate: number;
  effective_year: number;
};

const RANKS = [
  { value: "", label: "Select your rank..." },
  { value: "E-1", label: "E-1" },
  { value: "E-2", label: "E-2" },
  { value: "E-3", label: "E-3" },
  { value: "E-4", label: "E-4" },
  { value: "E-5", label: "E-5" },
  { value: "E-6", label: "E-6" },
  { value: "E-7", label: "E-7" },
  { value: "E-8", label: "E-8" },
  { value: "E-9", label: "E-9" },
  { value: "W-1", label: "W-1" },
  { value: "W-2", label: "W-2" },
  { value: "W-3", label: "W-3" },
  { value: "W-4", label: "W-4" },
  { value: "W-5", label: "W-5" },
  { value: "O-1", label: "O-1" },
  { value: "O-2", label: "O-2" },
  { value: "O-3", label: "O-3" },
  { value: "O-4", label: "O-4" },
  { value: "O-5", label: "O-5" },
  { value: "O-6", label: "O-6" },
  { value: "O-7", label: "O-7" },
  { value: "O-8", label: "O-8" },
  { value: "O-9", label: "O-9" },
  { value: "O-10", label: "O-10" },
];

export default function PcsFinancialPlanner() {
  const [rank, setRank] = useState("");
  const [dependencyStatus, setDependencyStatus] = useState<"with" | "without" | "">("");
  const [entitlementData, setEntitlementData] = useState<EntitlementData | null>(null);
  const [loadingEntitlements, setLoadingEntitlements] = useState(false);

  // Income
  const [dla, setDla] = useState(0);
  const [perDiem, setPerDiem] = useState(800);
  const [otherIncome, setOtherIncome] = useState(0);

  // Expenses
  const [travelCosts, setTravelCosts] = useState(600);
  const [lodging, setLodging] = useState(1200);
  const [deposits, setDeposits] = useState(2000);
  const [otherExpenses, setOtherExpenses] = useState(500);

  // Track page view on mount
  useEffect(() => {
    track("pcs_planner_view");
  }, []);

  // Fetch entitlement data when rank and dependency are selected
  useEffect(() => {
    async function fetchEntitlements() {
      if (!rank || !dependencyStatus) {
        setEntitlementData(null);
        return;
      }

      setLoadingEntitlements(true);
      try {
        const params = new URLSearchParams({
          rank_group: rank,
          dependency_status: dependencyStatus,
        });

        const response = await fetch(`/api/entitlements?${params.toString()}`);
        const result = await response.json();

        if (response.ok && result.success) {
          setEntitlementData(result.data);
          setDla(result.data.dla_rate);
          track("entitlements_fetched", { rank, dependency: dependencyStatus });
        }
      } catch {
        // Error handled silently - user will enter manually
      } finally {
        setLoadingEntitlements(false);
      }
    }

    fetchEntitlements();
  }, [rank, dependencyStatus]);

  // Calculate totals
  const totalIncome = dla + perDiem + otherIncome;
  const totalExpenses = travelCosts + lodging + deposits + otherExpenses;
  const netEstimate = totalIncome - totalExpenses;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Data Provenance Banner */}
      <div className="rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-indigo-600 p-3">
            <Icon name="Shield" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-bold text-indigo-900">
              Official PCS Entitlements Calculator
            </h3>
            <p className="mb-3 text-sm text-indigo-800">
              This calculator uses official DoD entitlement rates from DTMO (Defense Travel
              Management Office). DLA and weight allowances are based on current Joint Travel
              Regulations (JTR).
            </p>
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div className="rounded-lg border border-indigo-200 bg-white p-3">
                <p className="mb-1 font-semibold text-indigo-700">Data Source</p>
                <p className="text-indigo-900">DTMO / JTR</p>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-white p-3">
                <p className="mb-1 font-semibold text-indigo-700">Last Updated</p>
                <p className="text-indigo-900">2025 Rates</p>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-white p-3">
                <p className="mb-1 font-semibold text-indigo-700">Confidence</p>
                <p className="font-bold text-indigo-900">Excellent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Input */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Your Profile</h2>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="rank_select" className="mb-2 block text-sm font-semibold text-gray-700">
              Your Rank
            </label>
            <select
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base font-medium text-gray-900 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              {RANKS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="dependency_status"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Dependency Status
            </label>
            <select
              value={dependencyStatus}
              onChange={(e) => setDependencyStatus(e.target.value as "with" | "without")}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base font-medium text-gray-900 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select...</option>
              <option value="with">With Dependents</option>
              <option value="without">Without Dependents</option>
            </select>
          </div>
        </div>

        {loadingEntitlements && (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm text-gray-600">Fetching your official entitlements...</p>
          </div>
        )}

        {entitlementData && !loadingEntitlements && (
          <div className="rounded-xl border-2 border-indigo-400 bg-indigo-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Icon name="CheckCircle" className="h-6 w-6 text-indigo-600" />
              <h4 className="text-xl font-bold text-indigo-900">Your Official PCS Entitlements</h4>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-indigo-300 bg-white p-4 text-center">
                <p className="mb-1 text-xs font-semibold uppercase text-indigo-600">DLA Rate</p>
                <p className="text-2xl font-black text-indigo-900">
                  ${entitlementData.dla_rate.toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-indigo-300 bg-white p-4 text-center">
                <p className="mb-1 text-xs font-semibold uppercase text-indigo-600">
                  Weight Allowance
                </p>
                <p className="text-2xl font-black text-indigo-900">
                  {entitlementData.weight_allowance.toLocaleString()} lbs
                </p>
              </div>

              <div className="rounded-lg border border-indigo-300 bg-white p-4 text-center">
                <p className="mb-1 text-xs font-semibold uppercase text-indigo-600">
                  Effective Year
                </p>
                <p className="text-2xl font-black text-indigo-900">
                  {entitlementData.effective_year}
                </p>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-indigo-700">
              <Icon name="Check" className="mr-1 inline h-4 w-4" />
              Based on official DoD rates from DTMO
            </p>
          </div>
        )}

        {!entitlementData && !loadingEntitlements && rank && dependencyStatus && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <Icon name="AlertTriangle" className="mr-1 inline h-4 w-4" />
              Unable to fetch entitlements. Please enter your DLA manually below.
            </p>
          </div>
        )}
      </div>

      {/* Budget Calculator */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">PCS Budget Estimate</h2>

        {/* Income Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              +
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Expected Income</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="dla_amount"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Dislocation Allowance (DLA)
                {entitlementData && (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Auto-filled
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={dla}
                  onChange={(e) => setDla(Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
                  placeholder="Enter rank above for auto-fill"
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">Based on rank and dependents</p>
            </div>

            <div>
              <label
                htmlFor="per_diem_estimate"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Per Diem / Travel Allowance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={perDiem}
                  onChange={(e) => setPerDiem(Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">Varies by travel days and location</p>
            </div>

            <div>
              <label
                htmlFor="other_income"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Other Allowances
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">MALT, advance pay, etc.</p>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
              −
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Expected Expenses</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="travel_costs"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Travel Costs
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={travelCosts}
                  onChange={(e) => setTravelCosts(Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">Gas, food, tolls</p>
            </div>

            <div>
              <label
                htmlFor="lodging_costs"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Temporary Lodging
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={lodging}
                  onChange={(e) => setLodging(Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">Hotels during transition</p>
            </div>

            <div>
              <label
                htmlFor="deposits_fees"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Housing Deposits & Fees
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={deposits}
                  onChange={(e) => setDeposits(Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">Security deposit, utilities setup</p>
            </div>

            <div>
              <label
                htmlFor="other_expenses"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Other Expenses
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={otherExpenses}
                  onChange={(e) => setOtherExpenses(Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">Unexpected costs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="rounded-xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">PCS Budget Estimate</h2>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border-2 border-green-300 bg-white p-6 text-center">
            <p className="mb-2 text-sm text-gray-600">Total Income</p>
            <p className="mb-2 text-4xl font-bold text-green-700">{fmt(totalIncome)}</p>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>DLA:</span>
                <span className="font-semibold">{fmt(dla)}</span>
              </div>
              <div className="flex justify-between">
                <span>Per Diem:</span>
                <span className="font-semibold">{fmt(perDiem)}</span>
              </div>
              {otherIncome > 0 && (
                <div className="flex justify-between">
                  <span>Other:</span>
                  <span className="font-semibold">{fmt(otherIncome)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border-2 border-red-300 bg-white p-6 text-center">
            <p className="mb-2 text-sm text-gray-600">Total Expenses</p>
            <p className="mb-2 text-4xl font-bold text-red-700">{fmt(totalExpenses)}</p>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Travel:</span>
                <span className="font-semibold">{fmt(travelCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span>Lodging:</span>
                <span className="font-semibold">{fmt(lodging)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deposits:</span>
                <span className="font-semibold">{fmt(deposits)}</span>
              </div>
              {otherExpenses > 0 && (
                <div className="flex justify-between">
                  <span>Other:</span>
                  <span className="font-semibold">{fmt(otherExpenses)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border-2 p-6 ${
            netEstimate >= 0 ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
          }`}
        >
          <div className="text-center">
            <p
              className={`mb-2 text-2xl font-bold ${netEstimate >= 0 ? "text-green-700" : "text-red-700"}`}
            >
              {netEstimate >= 0 ? (
                <>
                  <Icon name="TrendingUp" className="mr-2 inline h-6 w-6" />
                  Estimated Surplus
                </>
              ) : (
                <>
                  <Icon name="TrendingDown" className="mr-2 inline h-6 w-6" />
                  Estimated Shortfall
                </>
              )}
            </p>
            <p
              className={`mb-4 text-5xl font-bold ${netEstimate >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {netEstimate >= 0 ? "+" : ""}
              {fmt(netEstimate)}
            </p>
            <p className="text-sm text-gray-700">Net PCS budget estimate</p>
          </div>
        </div>

        <div className="mt-6 rounded-r-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="mb-1 text-sm font-semibold text-amber-900">
            <Icon name="AlertTriangle" className="mr-1 inline h-4 w-4" />
            Important Disclaimer
          </p>
          <p className="text-xs text-amber-800">
            This is an estimate for planning purposes only.{" "}
            <strong>Actual PCS costs vary significantly</strong> based on distance, move type,
            family size, and unexpected expenses. Build in a 20-30% buffer for safety. Always
            consult your Transportation Office (TMO) for official entitlement calculations and
            reimbursement guidance.
          </p>
        </div>

        {/* AI Explainer - Provides PCS planning insights and tips based on the user's budget */}
        <div className="mt-6">
          <Explainer
            payload={{
              tool: "pcs-budget-calculator",
              inputs: { rank, dependencyStatus, dla, perDiem },
              outputs: { totalIncome, totalExpenses, netEstimate },
            }}
          />
        </div>
      </div>

      {/* Educational Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-blue-900">PCS Entitlements</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>
                <strong>DLA:</strong> One-time payment to offset relocation costs (varies by rank)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>
                <strong>Per Diem:</strong> Daily allowance for meals and lodging during travel
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>
                <strong>MALT:</strong> Mileage reimbursement if driving personally owned vehicle
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>
                <strong>Weight Allowance:</strong> Maximum household goods weight you can move
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-purple-900">PCS Planning Tips</h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>Keep ALL receipts - even for items you think might not be reimbursable</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>Build in 20-30% buffer for unexpected expenses and delays</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>Check new location housing deposit requirements early</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>Coordinate with TMO at least 90 days before move date</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Official Resources */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Icon name="ExternalLink" className="h-5 w-5 text-gray-600" />
          Official PCS Resources
        </h3>
        <div className="space-y-3">
          <a
            href="https://www.dfas.mil/militarymembers/payentitlements/Pay-Tables/DLA/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            DFAS - Dislocation Allowance (DLA) Rates →
          </a>
          <a
            href="https://www.move.mil/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            Move.mil - Official Military Moving Portal →
          </a>
          <a
            href="https://www.defensetravel.dod.mil/site/perdiemCalc.cfm"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            DTMO - Per Diem Rate Calculator →
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          Entitlement data sourced from official DoD databases. DLA rates and weight allowances from
          DTMO. Last updated: 2025.
        </p>
      </div>
    </div>
  );
}
