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

export default function SdpStrategist() {
  const [amount, setAmount] = useState<number>(10000);
  const [deploymentMonths, setDeploymentMonths] = useState<number>(9);

  // Track page view on mount
  useEffect(() => {
    track("sdp_calculator_view");
  }, []);

  // Calculate SDP returns
  // Official formula: Principal × 10% APR × (accrual_months / 12)
  // Accrual period = deployment months + 90 days (3 months)
  const accrualMonths = deploymentMonths + 3;
  const interestEarned = amount * 0.1 * (accrualMonths / 12);
  const totalPayout = amount + interestEarned;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Official SDP Rate Banner */}
      <div className="rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-green-600 p-3">
            <Icon name="Shield" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-bold text-green-900">Official SDP Rate: 10% APR</h3>
            <p className="mb-3 text-sm text-green-800">
              The Savings Deposit Program offers a guaranteed 10% annual percentage rate,
              established by federal law (10 USC § 1035). This rate is fixed and applies to all
              eligible service members during qualified deployments.
            </p>
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-white p-3">
                <p className="mb-1 font-semibold text-green-700">Data Source</p>
                <p className="text-green-900">10 USC § 1035</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-white p-3">
                <p className="mb-1 font-semibold text-green-700">Last Verified</p>
                <p className="text-green-900">January 2025</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-white p-3">
                <p className="mb-1 font-semibold text-green-700">Confidence</p>
                <p className="font-bold text-green-900">Excellent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Calculate Your SDP Returns</h2>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="sdp_deposit_amount"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              SDP Deposit Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                max={10000}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">Maximum: $10,000 per deployment</p>
          </div>

          <div>
            <label
              htmlFor="deployment_duration"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Deployment Duration (months)
            </label>
            <input
              type="number"
              min={3}
              max={24}
              value={deploymentMonths}
              onChange={(e) => setDeploymentMonths(Number(e.target.value))}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-600">
              Interest accrues for deployment duration + 90 days after return
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <Icon name="Info" className="mr-1 inline h-4 w-4" />
            <strong>How SDP Works:</strong> Deposit up to $10,000 during deployment to earn 10% APR.
            Interest continues for 90 days after you return home, then you receive your full payout
            approximately 120 days after deployment ends.
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="rounded-xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Your SDP Calculation</h2>

        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border-2 border-blue-300 bg-white p-5 text-center">
            <p className="mb-2 text-sm text-gray-600">Deposit Amount</p>
            <p className="text-3xl font-bold text-blue-900">{fmt(amount)}</p>
          </div>

          <div className="rounded-lg border-2 border-green-300 bg-white p-5 text-center">
            <p className="mb-2 text-sm text-gray-600">Interest Earned</p>
            <p className="text-3xl font-bold text-green-700">{fmt(interestEarned)}</p>
            <p className="mt-1 text-xs text-gray-600">{accrualMonths} months at 10% APR</p>
          </div>

          <div className="rounded-lg border-2 border-green-500 bg-white p-5 text-center">
            <p className="mb-2 text-sm text-gray-600">Total Payout</p>
            <p className="text-3xl font-bold text-green-600">{fmt(totalPayout)}</p>
            <p className="mt-1 text-xs text-gray-600">Principal + Interest</p>
          </div>
        </div>

        <div className="rounded-lg border-2 border-gray-200 bg-white p-6">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
            <Icon name="Calculator" className="h-5 w-5 text-green-600" />
            Calculation Breakdown
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Deployment duration:</span>
              <span className="font-semibold">{deploymentMonths} months</span>
            </div>
            <div className="flex justify-between">
              <span>Post-deployment accrual:</span>
              <span className="font-semibold">3 months (90 days)</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span>Total accrual period:</span>
              <span className="font-semibold">{accrualMonths} months</span>
            </div>
            <div className="flex justify-between">
              <span>Annual rate:</span>
              <span className="font-semibold">10.00%</span>
            </div>
            <div className="flex justify-between">
              <span>Interest calculation:</span>
              <span className="font-semibold">
                {fmt(amount)} × 10% × ({accrualMonths}/12)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-r-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="mb-1 text-sm font-semibold text-amber-900">
            <Icon name="AlertTriangle" className="mr-1 inline h-4 w-4" />
            Important Disclaimer
          </p>
          <p className="text-xs text-amber-800">
            This calculator provides estimates based on official SDP regulations (10 USC § 1035).
            Actual payout amounts may vary based on exact deployment dates, deposit timing, and
            administrative processing.{" "}
            <strong>
              Always consult your finance office for official calculations before making financial
              decisions.
            </strong>
          </p>
        </div>
      </div>

      {/* Educational Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-blue-900">SDP Eligibility</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Must be deployed to a combat zone or qualified hazardous duty area</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Maximum deposit of $10,000 per deployment</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Deposits must be made during deployment period</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Interest continues for 90 days after deployment ends</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-green-900">Key Benefits</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>Guaranteed 10% annual return by federal law</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>Tax-free earnings in combat zones</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>No market risk - rate is fixed and guaranteed</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span>Automatic payout approximately 120 days after return</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Official Resources */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Icon name="ExternalLink" className="h-5 w-5 text-gray-600" />
          Official Resources
        </h3>
        <div className="space-y-3">
          <a
            href="https://www.dfas.mil/militarymembers/payentitlements/sdp/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            DFAS - Savings Deposit Program Overview →
          </a>
          <a
            href="https://www.dfas.mil/militarymembers/payentitlements/sdp/SDPCalculator/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            DFAS Official SDP Calculator →
          </a>
          <a
            href="https://comptroller.defense.gov/FMR/fmr-vol7a.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            DoD Financial Management Regulation (Volume 7A) →
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          All calculations based on official Department of Defense regulations. Data sources:
          DFAS.mil, 10 USC § 1035, DoD FMR Volume 7A.
        </p>
      </div>
    </div>
  );
}
