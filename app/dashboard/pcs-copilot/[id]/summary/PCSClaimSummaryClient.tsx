"use client";

import { useState } from "react";

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";
import { logger } from "@/lib/logger";

interface PCSClaimSummaryClientProps {
  claim: any;
  calculations: any;
  documents: any[];
  validationResults: any[];
}

export function PCSClaimSummaryClient({
  claim,
  calculations,
  documents,
  validationResults,
}: PCSClaimSummaryClientProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/pcs/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId: claim.id,
          type: "full",
        }),
      });

      if (!response.ok) {
        throw new Error("PDF generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pcs-claim-${claim.id}-full.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      logger.error("PDF export failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/pcs/export/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId: claim.id,
          type: "full",
        }),
      });

      if (!response.ok) {
        throw new Error("Excel generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pcs-claim-${claim.id}-full.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      logger.error("Excel export failed:", error);
      alert("Failed to generate Excel file. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "success";
    if (confidence >= 0.6) return "warning";
    return "danger";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">PCS Claim Summary</h1>
          <p className="text-slate-600">
            {claim.claim_name} • Generated {new Date().toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-4 print:hidden">
          <Button
            onClick={handleExportPDF}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Icon name="File" className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Export PDF"}
          </Button>
          <Button
            onClick={handleExportExcel}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Icon name="Download" className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Export Excel"}
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Icon name="Printer" className="h-4 w-4" />
            Print
          </Button>
        </div>

        {/* Claim Information */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Claim Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-600">Member Name</label>
              <p className="text-slate-900">{claim.member_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Rank</label>
              <p className="text-slate-900">{claim.rank}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Branch</label>
              <p className="text-slate-900">{claim.branch}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Move</label>
              <p className="text-slate-900">
                {claim.origin_base} → {claim.destination_base}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Orders Date</label>
              <p className="text-slate-900">{claim.pcs_orders_date}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Departure Date</label>
              <p className="text-slate-900">{claim.departure_date}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Dependents</label>
              <p className="text-slate-900">
                {claim.dependents_authorized ? "Yes" : "No"} ({claim.dependents_count})
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Travel Method</label>
              <p className="text-slate-900">{claim.travel_method.toUpperCase()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Distance</label>
              <p className="text-slate-900">{claim.distance} miles</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Weight Allowance</label>
              <p className="text-slate-900">{claim.estimated_weight} lbs</p>
            </div>
          </div>
        </Card>

        {/* Calculations Summary */}
        {calculations && (
          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Entitlements Summary</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-medium text-slate-900">Total Entitlements</h3>
                <div className="mb-2 text-3xl font-bold text-green-600">
                  ${calculations.total_entitlements.toFixed(2)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getConfidenceColor(calculations.confidence.overall)}>
                    {getConfidenceText(calculations.confidence.overall)} Confidence
                  </Badge>
                  <span className="text-sm text-slate-600">
                    {(calculations.confidence.overall * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-lg font-medium text-slate-900">Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">DLA</span>
                    <span className="font-medium">${calculations.dla.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">TLE</span>
                    <span className="font-medium">${calculations.tle.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">MALT</span>
                    <span className="font-medium">${calculations.malt.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Per Diem</span>
                    <span className="font-medium">${calculations.per_diem.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">PPM</span>
                    <span className="font-medium">${calculations.ppm.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Documents Summary */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Supporting Documents</h2>
          {documents.length === 0 ? (
            <p className="text-slate-600">No documents uploaded</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="File" className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">{doc.name}</p>
                      <p className="text-sm text-slate-600">
                        {doc.type} • {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {doc.extracted_data?.amount && (
                    <div className="text-right">
                      <p className="font-medium text-slate-900">
                        ${doc.extracted_data.amount.toFixed(2)}
                      </p>
                      {doc.extracted_data.vendor && (
                        <p className="text-sm text-slate-600">{doc.extracted_data.vendor}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Validation Results */}
        {validationResults.length > 0 && (
          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">JTR Compliance Validation</h2>
            <div className="space-y-3">
              {validationResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="flex-shrink-0">
                    {result.severity === "error" && (
                      <Icon name="XCircle" className="h-5 w-5 text-red-500" />
                    )}
                    {result.severity === "warning" && (
                      <Icon name="AlertTriangle" className="h-5 w-5 text-yellow-500" />
                    )}
                    {result.severity === "info" && (
                      <Icon name="Info" className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">{result.rule_title}</span>
                      <Badge
                        variant={
                          result.severity === "error"
                            ? "danger"
                            : result.severity === "warning"
                              ? "warning"
                              : "info"
                        }
                      >
                        {result.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{result.message}</p>
                    {result.suggested_fix && (
                      <p className="mt-1 text-sm text-slate-500">
                        <strong>Fix:</strong> {result.suggested_fix}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="hidden text-center text-sm text-slate-500 print:block">
          <p>Generated by Garrison Ledger PCS Copilot</p>
          <p>garrisonledger.com • {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
