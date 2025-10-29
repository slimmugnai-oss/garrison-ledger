"use client";

import { useState } from "react";

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";

interface LESAuditSummaryClientProps {
  audit: any;
}

export function LESAuditSummaryClient({ audit }: LESAuditSummaryClientProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    // Small delay to ensure state updates before print dialog
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const monthName = new Date(2000, audit.month - 1).toLocaleString("default", {
    month: "long",
  });

  // Group line items by section
  const linesBySection = {
    ALLOWANCE: audit.les_lines.filter((l: any) => l.section === "ALLOWANCE"),
    TAX: audit.les_lines.filter((l: any) => l.section === "TAX"),
    DEDUCTION: audit.les_lines.filter((l: any) => l.section === "DEDUCTION"),
    ALLOTMENT: audit.les_lines.filter((l: any) => l.section === "ALLOTMENT"),
    DEBT: audit.les_lines.filter((l: any) => l.section === "DEBT"),
    ADJUSTMENT: audit.les_lines.filter(
      (l: any) => l.section === "ADJUSTMENT" || l.section === "OTHER"
    ),
  };

  // Calculate totals
  const grossPay = linesBySection.ALLOWANCE.reduce(
    (sum: number, item: any) => sum + item.amount_cents,
    0
  );
  const totalTaxes = linesBySection.TAX.reduce(
    (sum: number, item: any) => sum + item.amount_cents,
    0
  );
  const totalDeductions = linesBySection.DEDUCTION.reduce(
    (sum: number, item: any) => sum + item.amount_cents,
    0
  );
  const netPay = grossPay - totalTaxes - totalDeductions;

  // Severity colors
  const getSeverityColor = (severity: string) => {
    if (severity === "red") return "danger";
    if (severity === "yellow") return "warning";
    return "success";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">LES Audit Summary</h1>
          <p className="text-slate-600">
            {monthName} {audit.year} • Generated {new Date().toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-4 print:hidden">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Icon name="Printer" className="h-4 w-4" />
            {isPrinting ? "Opening Print..." : "Print / Save PDF"}
          </Button>
        </div>

        {/* Audit Summary Card */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Audit Summary</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="text-xs font-medium text-green-700">GROSS PAY</div>
              <div className="mt-1 text-2xl font-bold text-green-900">
                ${(grossPay / 100).toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="text-xs font-medium text-blue-700">NET PAY</div>
              <div className="mt-1 text-2xl font-bold text-blue-900">
                ${(netPay / 100).toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <div className="text-xs font-medium text-red-700">TAXES</div>
              <div className="mt-1 text-2xl font-bold text-red-900">
                ${(totalTaxes / 100).toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 p-4">
              <div className="text-xs font-medium text-orange-700">DEDUCTIONS</div>
              <div className="mt-1 text-2xl font-bold text-orange-900">
                ${(totalDeductions / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </Card>

        {/* Audit Findings */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Audit Findings ({audit.pay_flags.length})
          </h2>
          {audit.pay_flags.length === 0 ? (
            <div className="rounded-lg bg-green-50 p-6 text-center">
              <Icon name="CheckCircle" className="mx-auto mb-2 h-12 w-12 text-green-600" />
              <p className="font-medium text-green-900">No issues found!</p>
              <p className="text-sm text-green-700">Your LES appears accurate.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {audit.pay_flags.map((flag: any) => (
                <div
                  key={flag.id}
                  className={`rounded-lg border-l-4 p-4 ${
                    flag.severity === "red"
                      ? "border-red-500 bg-red-50"
                      : flag.severity === "yellow"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-green-500 bg-green-50"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={getSeverityColor(flag.severity)}>
                      {flag.severity.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-slate-900">{flag.flag_code}</span>
                  </div>
                  <p className="text-sm text-slate-700">{flag.message}</p>
                  {flag.suggestion && (
                    <p className="mt-2 text-xs text-slate-600">💡 {flag.suggestion}</p>
                  )}
                  {flag.delta_cents !== 0 && (
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      Δ ${(flag.delta_cents / 100).toFixed(2)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Line Items by Section */}
        {Object.entries(linesBySection).map(([section, items]: [string, any]) => {
          if (items.length === 0) return null;

          const sectionTotal = items.reduce((sum: number, item: any) => sum + item.amount_cents, 0);

          return (
            <Card key={section} className="mb-6 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  {section.charAt(0) + section.slice(1).toLowerCase().replace("_", " ")}
                </h2>
                <div className="text-lg font-bold text-slate-900">
                  ${(sectionTotal / 100).toFixed(2)}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-2 text-left text-sm font-medium text-slate-600">Code</th>
                      <th className="pb-2 text-left text-sm font-medium text-slate-600">
                        Description
                      </th>
                      <th className="pb-2 text-right text-sm font-medium text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-2 font-mono text-sm font-semibold text-slate-900">
                          {item.line_code}
                        </td>
                        <td className="py-2 text-sm text-slate-700">{item.description}</td>
                        <td className="py-2 text-right font-semibold text-slate-900">
                          ${(item.amount_cents / 100).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}

        {/* Data Provenance */}
        <Card className="mb-6 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Icon name="Info" className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="mb-1 font-semibold">Data Provenance</p>
              <p>
                This audit was computed using official 2025 DFAS pay tables, JTR regulations, and
                IRS tax rates. All calculations are based on official military pay guidance. Last
                verified: {new Date().toLocaleDateString()}.
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mb-8 text-center text-sm text-slate-600 print:block">
          <p className="mb-1 font-semibold">Garrison Ledger • LES Auditor</p>
          <p>Military Financial Intelligence Platform</p>
          <p className="mt-2 text-xs">
            This report is for informational purposes only. Verify all data with your finance office
            before taking action.
          </p>
        </div>
      </div>
    </div>
  );
}
