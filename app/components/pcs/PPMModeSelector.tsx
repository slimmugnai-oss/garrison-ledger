"use client";

import { useState } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";
import Input from "@/app/components/ui/Input";

interface PPMModeSelectorProps {
  onModeSelected: (mode: "official" | "estimator", data: PPMData) => void;
  weight?: number;
  distance?: number;
}

interface PPMData {
  mode: "official" | "estimator";
  gccAmount?: number;
  weight?: number;
  distance?: number;
  movingExpenses?: number;
  fuelReceipts?: number;
  laborCosts?: number;
  tollsAndFees?: number;
}

/**
 * PPM Mode Selector - Choose between official GCC entry or estimator
 *
 * Official Path (Recommended): User enters GCC from MilMove
 * Estimator Path: Planning estimate when GCC not available yet
 */
export default function PPMModeSelector({
  onModeSelected,
  weight,
  distance,
}: PPMModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<"official" | "estimator" | null>(null);
  const [gccAmount, setGccAmount] = useState<string>("");
  const [movingExpenses, setMovingExpenses] = useState<string>("0");
  const [fuelReceipts, setFuelReceipts] = useState<string>("0");
  const [laborCosts, setLaborCosts] = useState<string>("0");
  const [tollsAndFees, setTollsAndFees] = useState<string>("0");

  if (selectedMode === null) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">DIY Move (PPM) Reimbursement</h3>
        <p className="text-sm text-slate-600">
          Choose how you'd like to calculate your PPM payout estimate
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Official Path */}
          <AnimatedCard
            className="cursor-pointer border-2 border-green-600 p-6 hover:shadow-xl"
            onClick={() => setSelectedMode("official")}
          >
            <Badge variant="success" className="mb-4">
              Recommended
            </Badge>
            <div className="mb-4 inline-flex rounded-xl bg-green-50 p-3">
              <Icon name="CheckCircle" className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="mb-2 text-lg font-bold text-slate-900">I Have My GCC from MilMove</h4>
            <p className="mb-4 text-sm text-slate-600">
              Enter the Government Constructed Cost from your MilMove estimate. This provides the
              most accurate payout calculation.
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Icon name="Check" className="h-3 w-3 text-green-600" />
                Most accurate (uses official GCC)
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Check" className="h-3 w-3 text-green-600" />
                Matches Transportation Office calculation
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Check" className="h-3 w-3 text-green-600" />
                Includes tax withholding estimate
              </li>
            </ul>
          </AnimatedCard>

          {/* Estimator Path */}
          <AnimatedCard
            className="cursor-pointer border border-slate-300 p-6 hover:shadow-xl"
            onClick={() => setSelectedMode("estimator")}
          >
            <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-3">
              <Icon name="Calculator" className="h-8 w-8 text-slate-600" />
            </div>
            <h4 className="mb-2 text-lg font-bold text-slate-900">Planning Estimate</h4>
            <p className="mb-4 text-sm text-slate-600">
              Get a rough estimate for early planning. Uses weight and distance to approximate GCC.
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Icon name="Check" className="h-3 w-3 text-slate-600" />
                For early planning only
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Check" className="h-3 w-3 text-slate-600" />
                ±30% variance range shown
              </li>
              <li className="flex items-center gap-2">
                <Icon name="AlertTriangle" className="h-3 w-3 text-amber-600" />
                Not official - verify with MilMove
              </li>
            </ul>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  if (selectedMode === "official") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
              Enter Your GCC from MilMove
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setSelectedMode(null)}>
              Change Method
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* GCC Amount Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              GCC Amount (Government Constructed Cost)
              <span className="ml-1 text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                $
              </span>
              <Input
                type="number"
                value={gccAmount}
                onChange={setGccAmount}
                placeholder="8500"
                className="pl-8 text-lg font-semibold"
                min="0"
                step="0.01"
              />
            </div>
            <div className="mt-2 rounded-lg bg-blue-50 p-3">
              <p className="mb-2 text-xs font-semibold text-blue-900">How to find your GCC:</p>
              <ol className="ml-4 list-decimal space-y-1 text-xs text-blue-800">
                <li>
                  Visit{" "}
                  <a
                    href="https://www.move.mil/moving-guide/ppm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    move.mil PPM calculator
                  </a>
                </li>
                <li>Enter your move details (weight, origin, destination, dates)</li>
                <li>Click "Calculate" to get your GCC estimate</li>
                <li>Copy the GCC dollar amount and paste it above</li>
              </ol>
            </div>
          </div>

          {/* Operating Expenses */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              <Icon name="Receipt" className="mr-1 inline h-4 w-4" />
              Allowed Operating Expenses (Optional - Reduces Taxes)
            </label>
            <p className="mb-3 text-xs text-slate-600">
              Track your moving expenses - these reduce your taxable income and save on taxes!
            </p>

            <div className="space-y-3">
              <Input
                label="Moving Costs (truck rental, equipment, supplies)"
                type="number"
                value={movingExpenses}
                onChange={setMovingExpenses}
                placeholder="1200"
                min="0"
                step="0.01"
              />
              <Input
                label="Fuel Receipts (gas/diesel)"
                type="number"
                value={fuelReceipts}
                onChange={setFuelReceipts}
                placeholder="800"
                min="0"
                step="0.01"
              />
              <Input
                label="Labor Costs (hired help, packing materials)"
                type="number"
                value={laborCosts}
                onChange={setLaborCosts}
                placeholder="300"
                min="0"
                step="0.01"
              />
              <Input
                label="Tolls & Fees (toll roads, parking, weigh station)"
                type="number"
                value={tollsAndFees}
                onChange={setTollsAndFees}
                placeholder="100"
                min="0"
                step="0.01"
              />
            </div>

            <div className="mt-3 rounded-lg bg-green-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-green-900">Total Deductible Expenses:</span>
                <span className="text-lg font-bold text-green-700">
                  $
                  {(
                    parseFloat(movingExpenses || "0") +
                    parseFloat(fuelReceipts || "0") +
                    parseFloat(laborCosts || "0") +
                    parseFloat(tollsAndFees || "0")
                  ).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-green-800">
                💡 These expenses reduce your taxable PPM income
              </p>
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={() => {
              const gcc = parseFloat(gccAmount);
              if (gcc > 0) {
                onModeSelected("official", {
                  mode: "official",
                  gccAmount: gcc,
                  movingExpenses: parseFloat(movingExpenses || "0"),
                  fuelReceipts: parseFloat(fuelReceipts || "0"),
                  laborCosts: parseFloat(laborCosts || "0"),
                  tollsAndFees: parseFloat(tollsAndFees || "0"),
                });
              }
            }}
            disabled={!gccAmount || parseFloat(gccAmount) <= 0}
            className="w-full bg-green-600 text-lg hover:bg-green-700"
          >
            <Icon name="Calculator" className="mr-2 h-5 w-5" />
            Calculate PPM Payout & Withholding
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (selectedMode === "estimator") {
    return (
      <Card className="border-2 border-amber-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600" />
              Planning Estimate Mode
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setSelectedMode(null)}>
              Change Method
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Warning */}
          <div className="rounded-lg border-2 border-amber-600 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-900">⚠️ PLANNING ESTIMATE ONLY</p>
            <p className="mt-1 text-xs text-amber-800">
              This is NOT your official reimbursement. Actual GCC may vary by ±30% based on route
              complexity, seasonal demand, and contract pricing. For accurate calculation, get your
              GCC from move.mil.
            </p>
          </div>

          {/* Estimator Inputs */}
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-slate-700">Weight</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {weight?.toLocaleString() || "---"} lbs
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">Distance</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {distance?.toLocaleString() || "---"} miles
                  </div>
                  <div className="text-xs text-slate-600">Planning estimate (Google Maps)</div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Cost per Pound-Mile (Industry Average)
              </label>
              <Input type="number" value="0.50" disabled className="bg-slate-100" />
              <p className="mt-1 text-xs text-slate-500">
                Industry average. Actual DoD contract rates are proprietary.
              </p>
            </div>

            <div className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-sm font-medium text-slate-700">Estimated GCC:</div>
              <div className="text-3xl font-black text-slate-900">
                ${((weight || 0) * (distance || 0) * 0.5).toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-slate-600">
                Formula: {weight?.toLocaleString()} lbs × {distance?.toLocaleString()} mi ×
                $0.50/lb-mi
              </div>
              <div className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900">
                ⚠️ Variance: ±30% (${((weight || 0) * (distance || 0) * 0.5 * 0.7).toLocaleString()}{" "}
                - ${((weight || 0) * (distance || 0) * 0.5 * 1.3).toLocaleString()})
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                const estimatedGCC = (weight || 0) * (distance || 0) * 0.5;
                if (estimatedGCC > 0) {
                  onModeSelected("estimator", {
                    mode: "estimator",
                    gccAmount: estimatedGCC,
                    weight,
                    distance,
                  });
                }
              }}
              disabled={!weight || !distance || weight === 0 || distance === 0}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              <Icon name="Calculator" className="mr-2 h-5 w-5" />
              Use Planning Estimate
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open("https://www.move.mil/moving-guide/ppm", "_blank")}
            >
              <Icon name="ExternalLink" className="mr-2 h-4 w-4" />
              Get Official GCC from move.mil
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
