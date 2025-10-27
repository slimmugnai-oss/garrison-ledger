"use client";

import { useState } from "react";

import Button from "@/app/components/ui/Button";
import Card, { CardContent } from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";

interface PPMDisclaimerProps {
  onAccept: () => void;
}

/**
 * Required disclaimer for PPM calculations
 * Must be acknowledged before using PPM withholding estimator
 * 
 * Legal protection: Makes clear this is not tax advice
 */
export default function PPMDisclaimer({ onAccept }: PPMDisclaimerProps) {
  const [checked, setChecked] = useState(false);
  
  return (
    <Card className="border-2 border-amber-600 bg-amber-50">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-600">
            <Icon name="AlertTriangle" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-3 text-lg font-bold text-amber-900">
              Important: Unofficial Planning Tool
            </h3>
            <div className="space-y-3 text-sm text-amber-900">
              <p>
                <strong>This tool is NOT affiliated with DoD.</strong> PPM payout estimates are
                for planning purposes only. Your actual reimbursement is determined by your
                Transportation Office using official Government Constructed Cost and DTOD distances.
              </p>
              <p>
                <strong>This is NOT tax advice.</strong> Withholding estimates use standard IRS
                supplemental wage rates. Actual tax liability depends on your total annual income,
                filing status, W-4 elections, and deductions.
              </p>
              <p>
                Entering a GCC amount from MilMove provides the most accurate estimate.{" "}
                <strong>Do not make financial decisions solely on these results.</strong>
              </p>
              <div className="rounded-lg border border-amber-700 bg-amber-100 p-3">
                <p className="text-xs font-medium text-amber-900">
                  <Icon name="Info" className="mr-1 inline h-3 w-3" />
                  <strong>Note:</strong> Global Household Goods Contract was canceled June 18, 2025.
                  This does not affect GCC-based payouts but explains variability you may see during
                  the transition period.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-4 flex items-start gap-3 border-t border-amber-200 pt-4">
          <input
            type="checkbox"
            id="ppm-disclaimer"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-amber-400 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="ppm-disclaimer" className="flex-1 text-sm font-medium text-amber-900">
            I understand this is a planning estimate based on supplemental withholding rates. I will
            verify final amounts with my Transportation Office and consult a tax professional for
            tax planning.
          </label>
        </div>
        
        <Button
          onClick={onAccept}
          disabled={!checked}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
        >
          Continue to PPM Calculator
        </Button>
        
        <p className="mt-3 text-center text-xs text-amber-800">
          For tax assistance:{" "}
          <a
            href="https://www.militaryonesource.mil/financial-legal/tax-resource-center/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-amber-900"
          >
            Military OneSource (Free Tax Prep)
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

