'use client';

import { useState } from 'react';
import { Icon } from '@/app/components/ui/Icon';
import type { ParsedSummary } from '@/app/types/les';
import { centsToDoollars } from '@/app/types/les';

interface Props {
  summary: ParsedSummary;
}

export default function LesSummary({ summary }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const totalAllowances = summary.totalsBySection.ALLOWANCE;
  const totalDeductions = summary.totalsBySection.DEDUCTION + 
                          summary.totalsBySection.ALLOTMENT + 
                          summary.totalsBySection.TAX;

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Icon name="File" className="h-5 w-5 text-blue-600" />
        Parsed LES Summary
      </h3>

      {/* High-Level Totals */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Allowances</div>
          <div className="text-2xl font-bold text-green-600">
            {centsToDoollars(totalAllowances)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Deductions</div>
          <div className="text-2xl font-bold text-red-600">
            -{centsToDoollars(totalDeductions)}
          </div>
        </div>
      </div>

      {/* Breakdown Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
      >
        {showDetails ? (
          <>
            <Icon name="ChevronDown" className="h-4 w-4" />
            Hide Details
          </>
        ) : (
          <>
            <Icon name="ChevronRight" className="h-4 w-4" />
            Show Detailed Breakdown
          </>
        )}
      </button>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* Allowances */}
          {Object.keys(summary.allowancesByCode).length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Allowances</div>
              <div className="space-y-2">
                {Object.entries(summary.allowancesByCode).map(([code, cents]) => (
                  <div key={code} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{code}</span>
                    <span className="font-medium text-green-600">
                      {centsToDoollars(cents)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deductions */}
          {Object.keys(summary.deductionsByCode).length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Deductions</div>
              <div className="space-y-2">
                {Object.entries(summary.deductionsByCode).map(([code, cents]) => (
                  <div key={code} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{code}</span>
                    <span className="font-medium text-red-600">
                      -{centsToDoollars(cents)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
            <div className="flex items-start gap-2">
              <Icon name="Lock" className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Your LES data is encrypted and never shared. We only parse line items needed for audit.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

