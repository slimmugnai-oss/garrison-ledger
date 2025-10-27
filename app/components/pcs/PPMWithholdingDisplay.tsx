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
            ${result.gccAmount.toLocaleString()}
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
                    <span className="text-blue-900">
                      ${result.taxableAmount.toLocaleString()}
                    </span>
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
              Estimated DFAS Withholding
            </div>
            <span className="text-xs text-slate-500">
              {result.effectiveWithholdingRate.toFixed(1)}% effective rate
            </span>
          </div>
          
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            {/* Federal */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <div className="font-medium text-slate-900">Federal Income Tax</div>
                <div className="text-xs text-slate-600">
                  {result.estimatedWithholding.federal.basis}
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
            <Icon name="Wallet" className="h-5 w-5" />
            <div className="text-sm font-medium opacity-90">Estimated Take-Home</div>
          </div>
          <div className="text-4xl font-black">
            ${result.estimatedNetPayout.toLocaleString()}
          </div>
          <div className="mt-2 text-sm opacity-90">
            After estimated DFAS withholding ({result.effectiveWithholdingRate.toFixed(1)}% of gross)
          </div>
        </div>

        {/* Disclaimer (Always Shown) */}
        <div className="rounded-lg border-2 border-amber-600 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="AlertTriangle" className="h-4 w-4 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-900">Not Tax Advice</h4>
          </div>
          <p className="text-xs leading-relaxed text-amber-900">{result.disclaimer}</p>
          
          <div className="mt-3 space-y-1 text-xs text-amber-800">
            <p className="font-medium">Your actual tax liability may differ based on:</p>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>Total annual income (all sources)</li>
              <li>Filing status (single, married, etc.)</li>
              <li>W-4 withholding elections</li>
              <li>Total deductions and credits</li>
            </ul>
          </div>
          
          <div className="mt-3 text-xs text-amber-900">
            <strong>For tax questions:</strong> Consult a licensed tax professional or use{" "}
            <a
              href="https://www.irs.gov/individuals/tax-withholding-estimator"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-amber-950"
            >
              IRS.gov Withholding Estimator
            </a>
          </div>
        </div>

        {/* Adjust Rates (Optional) */}
        {allowEdit && onUpdateRates && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Adjust Withholding Rates (Optional)
            </h4>
            <p className="mb-4 text-xs text-slate-600">
              Default rates shown are standard DFAS supplemental withholding. You can adjust based
              on your W-4 elections if known.
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
                min="0"
                max="37"
                step="0.1"
              />
              <Input
                label={`${result.estimatedWithholding.state.stateName} State Rate (%)`}
                type="number"
                value={result.estimatedWithholding.state.rate.toString()}
                onChange={(val) => {
                  const newState = parseFloat(val) || 0;
                  onUpdateRates(result.estimatedWithholding.federal.rate, newState);
                }}
                min="0"
                max="15"
                step="0.1"
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

