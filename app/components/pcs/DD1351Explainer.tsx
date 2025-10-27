"use client";

import Card, { CardContent } from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";

/**
 * DD-1351-2 Process Explainer Component
 *
 * Educates users on the official voucher submission process through DTS.
 * Makes it clear that Garrison Ledger is a preparation tool, not a submission tool.
 */
export default function DD1351Explainer() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
            <Icon name="Info" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-bold text-blue-900">
              Next Steps: Official Reimbursement Process
            </h3>
            <p className="mb-4 text-sm text-blue-800">
              This calculation worksheet is your reference guide. To receive reimbursement, you
              must submit <strong>DD Form 1351-2</strong> through the Defense Travel System (DTS).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                <strong>Log into DTS</strong> at{" "}
                <a
                  href="https://dtsproweb.defensetravel.osd.mil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  dtsproweb.defensetravel.osd.mil
                </a>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                <strong>Create a new PCS voucher</strong> - select "Create New
                Authorization/Orders"
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                <strong>Complete DD Form 1351-2</strong> using this worksheet as your reference
              </p>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm text-slate-600">
                <li>Use the calculated amounts from this tool</li>
                <li>Attach all receipts (lodging, meals, etc.)</li>
                <li>Include your PCS orders</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              4
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                <strong>Submit through DTS</strong> for finance office approval
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              5
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                <strong>Track your status in DTS</strong> - typical processing: 5-15 business days
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
          <div className="flex gap-2">
            <Icon name="AlertTriangle" className="h-5 w-5 flex-shrink-0 text-yellow-600" />
            <p className="text-xs text-yellow-900">
              <strong>Important:</strong> The amounts in this worksheet are estimates based on JTR
              regulations. Your finance office will verify and approve the final reimbursement
              amounts.
            </p>
          </div>
        </div>

        <div className="mt-4 text-xs text-blue-700">
          Need help? Contact your local finance office or visit{" "}
          <a
            href="https://www.dfas.mil"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
          >
            DFAS.mil
          </a>{" "}
          for official guidance.
        </div>
      </CardContent>
    </Card>
  );
}

