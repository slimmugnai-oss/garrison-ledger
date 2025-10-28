"use client";

import Badge from "@/app/components/ui/Badge";
import Card, { CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";
import Input from "@/app/components/ui/Input";
import type { PPMWithholdingResult } from "@/lib/pcs/ppm-withholding-calculator";

interface PPMWithholdingDisplayProps {
  result: PPMWithholdingResult;
  allowEdit?: boolean;
  onUpdateRates?: (federal: number, state: number) => void;
}

/**
 * Display PPM withholding breakdown
 * Shows gross payout, deductions, withholding, and net payout
 *
 * With strong disclaimers that this is withholding estimate, not tax advice
 */
export default function PPMWithholdingDisplay({
  result,
  allowEdit = false,
  onUpdateRates,
}: PPMWithholdingDisplayProps) {
  return (
    <Card className="border-2 border-green-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="DollarSign" className="h-5 w-5 text-green-600" />
            Estimated PPM Payout
          </CardTitle>
          <Badge variant="success">
            <Icon name="CheckCircle" className="mr-1 h-3 w-3" />
            {result.confidence}% Confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GCC Estimator Warning (if using estimator mode) */}
        {result.source.includes("Estimator") && (
          <div className="rounded-lg border-2 border-red-600 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-900">⚠️ GCC ESTIMATE ONLY - NOT OFFICIAL</p>
            <p className="mt-1 text-xs text-red-800">
              The <strong>${result.gccAmount.toLocaleString()} GCC amount</strong> below is a{" "}
              <strong>rough approximation</strong> using simplified math. DoD uses proprietary
              DP3/GHC household goods rate tables with banded pricing we cannot replicate. Your
              actual GCC could be ±50% different.{" "}
              <strong>
                <a
                  href="https://my.move.mil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Get your official GCC from my.move.mil
                </a>
              </strong>{" "}
              before making financial decisions.
            </p>
          </div>
        )}

        {/* Gross Payout */}
        <div className="rounded-lg bg-green-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-green-700">GCC Amount</div>
            <div className="text-sm text-green-600">
              {result.estimatedWithholding.federal.isCustom && (
                <Icon name="Edit" className="mr-1 inline h-3 w-3" />
              )}
              {result.source}
            </div>
          </div>
          <div className="text-3xl font-black text-green-900">
            {result.source.includes("Estimator") && "~"}${result.gccAmount.toLocaleString()}
          </div>
          <div className="mt-1 text-sm text-green-700">
            Incentive: {result.incentivePercentage}% = ${result.grossPayout.toLocaleString()} gross
          </div>
        </div>

        {/* Allowed Deductions */}
        {result.totalAllowedExpenses > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Icon name="Receipt" className="h-4 w-4" />
              Allowed Operating Expenses
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-700">Deductible expenses:</span>
                  <span className="font-bold text-blue-900">
                    -${result.totalAllowedExpenses.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700">Taxable Amount:</span>
                    <span className="text-blue-900">${result.taxableAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Withholding Breakdown */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Icon name="Calculator" className="h-4 w-4" />
              Typical DFAS Withholding (Estimate)
            </div>
            <span className="text-xs text-slate-500">
              {result.effectiveWithholdingRate.toFixed(1)}% effective rate
            </span>
          </div>

          <div className="mb-3 rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-900">
              <Icon name="Info" className="mr-1 inline h-3 w-3" />
              <strong>Default rates shown:</strong> Federal 22% (IRS Pub 15 supplemental), State
              from database, FICA 6.2%, Medicare 1.45%. You can adjust below if you know your
              specific W-4 withholding rates.
            </p>
          </div>

          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            {/* Federal */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <div className="font-medium text-slate-900">Federal Income Tax</div>
                <div className="text-xs text-slate-600">
                  {result.estimatedWithholding.federal.basis}
                  {!result.estimatedWithholding.federal.isCustom && " (IRS Pub 15)"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-red-600">
                  -${result.estimatedWithholding.federal.amount.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600">
                  {result.estimatedWithholding.federal.rate}%
                </div>
              </div>
            </div>

            {/* State */}
            {result.estimatedWithholding.state.amount > 0 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                <div className="flex-1">
                  <div className="font-medium text-slate-900">
                    {result.estimatedWithholding.state.stateName} State Tax
                  </div>
                  <div className="text-xs text-slate-600">
                    {result.estimatedWithholding.state.basis}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">
                    -${result.estimatedWithholding.state.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600">
                    {result.estimatedWithholding.state.rate.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}

            {/* FICA */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
              <div className="flex-1">
                <div className="font-medium text-slate-900">Social Security (FICA)</div>
                <div className="text-xs text-slate-600">
                  {result.estimatedWithholding.fica.basis}
                  {result.estimatedWithholding.fica.cappedAtYTD && " - At annual cap"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-red-600">
                  -${result.estimatedWithholding.fica.amount.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600">6.2%</div>
              </div>
            </div>

            {/* Medicare */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
              <div className="flex-1">
                <div className="font-medium text-slate-900">Medicare</div>
                <div className="text-xs text-slate-600">
                  {result.estimatedWithholding.medicare.basis}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-red-600">
                  -${result.estimatedWithholding.medicare.amount.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600">1.45%</div>
              </div>
            </div>

            {/* Total Withholding */}
            <div className="flex items-center justify-between border-t-2 border-slate-300 pt-3 text-sm">
              <div className="font-bold text-slate-900">Total Withholding:</div>
              <div className="text-lg font-black text-red-600">
                -${result.totalWithholding.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Net Payout */}
        <div className="rounded-lg bg-gradient-to-br from-green-600 to-green-700 p-6 text-white">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="DollarSign" className="h-5 w-5" />
            <div className="text-sm font-medium opacity-90">Estimated Net Payout</div>
          </div>
          <div className="text-4xl font-black">${result.estimatedNetPayout.toLocaleString()}</div>
          <div className="mt-2 text-sm opacity-90">
            After typical DFAS withholding ({result.effectiveWithholdingRate.toFixed(1)}% of gross)
          </div>
          <div className="mt-2 text-xs opacity-75">
            Your actual payout may vary based on your W-4 elections
          </div>
        </div>

        {/* Disclaimer (Always Shown) */}
        <div className="rounded-lg border-2 border-amber-600 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="AlertTriangle" className="h-4 w-4 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-900">Not Tax Advice</h4>
          </div>
          <p className="text-xs leading-relaxed text-amber-900">{result.disclaimer}</p>

          <div className="mt-3 space-y-2 text-xs text-amber-800">
            <p className="font-medium">Why actual withholding may differ:</p>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>Your W-4 elections (single vs. married, allowances claimed)</li>
              <li>Year-to-date income and prior withholding</li>
              <li>State residency vs. duty station differences</li>
              <li>Additional withholding requests or exemptions</li>
            </ul>
            <p className="mt-2 font-medium">Why actual tax liability may differ:</p>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>Total annual income from all sources (base pay, bonuses, spouse income, etc.)</li>
              <li>Filing status and dependents</li>
              <li>Total deductions and credits you claim at tax time</li>
              <li>Combat zone tax exclusions or other military benefits</li>
            </ul>
          </div>

          <div className="mt-3 rounded-lg bg-amber-100 p-2 text-xs text-amber-900">
            <p className="font-bold">For accurate tax planning:</p>
            <ul className="mt-1 space-y-1">
              <li>
                • <strong>Free for military:</strong>{" "}
                <a
                  href="https://www.militaryonesource.mil/financial-legal/tax-resource-center/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-950"
                >
                  Military OneSource Tax Prep
                </a>
              </li>
              <li>
                • <strong>IRS tool:</strong>{" "}
                <a
                  href="https://www.irs.gov/individuals/tax-withholding-estimator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-950"
                >
                  Withholding Estimator
                </a>
              </li>
              <li>
                • <strong>myPay:</strong> Adjust W-4 elections if needed
              </li>
            </ul>
          </div>
        </div>

        {/* Adjust Rates (Optional) */}
        {allowEdit && onUpdateRates && (
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-blue-900">
              Know Your Withholding Rates? Adjust Here
            </h4>
            <p className="mb-4 text-xs text-blue-800">
              <strong>Default rates shown:</strong> Federal 22% (IRS supplemental wage rate), State
              from average database rates. If you know YOUR specific withholding percentages from
              recent LES statements, adjust them below for a more accurate estimate.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Federal Rate (%)"
                type="number"
                value={result.estimatedWithholding.federal.rate.toString()}
                onChange={(val) => {
                  const newFederal = parseFloat(val) || 22;
                  onUpdateRates(newFederal, result.estimatedWithholding.state.rate);
                }}
              />
              <Input
                label={`${result.estimatedWithholding.state.stateName} State Rate (%)`}
                type="number"
                value={result.estimatedWithholding.state.rate.toString()}
                onChange={(val) => {
                  const newState = parseFloat(val) || 0;
                  onUpdateRates(result.estimatedWithholding.federal.rate, newState);
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              <Icon name="Info" className="mr-1 inline h-3 w-3" />
              Check your LES to see your typical withholding rates, or leave defaults.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
