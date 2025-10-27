"use client";

import { useState } from "react";

import Icon from "@/app/components/ui/Icon";
import { generateCalculatorReport } from "@/app/lib/pdf-reports";
import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";
import { track } from "@/lib/track";

interface ExportButtonsProps {
  tool: string; // 'tsp', 'sdp', 'house-hacking', 'pcs', 'savings', 'career'
  resultsElementId: string; // ID of the element to capture for screenshot
  data?: {
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
  };
}

export default function ExportButtons({
  tool,
  resultsElementId: _resultsElementId,
  data,
}: ExportButtonsProps) {
  const { isPremium } = usePremiumStatus();
  const [isExporting, setIsExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // PDF export (Premium only)
  async function exportAsPDF() {
    if (!isPremium) {
      alert("PDF export is a premium feature. Upgrade to download professional reports!");
      return;
    }

    if (!data) {
      alert("No data available to export. Please complete the calculator first.");
      return;
    }

    setIsExporting(true);
    track(`${tool}_pdf_export`);

    try {
      // Generate PDF using our library (returns Buffer)
      const pdfBuffer = generateCalculatorReport(tool, data.inputs, data.outputs);

      // Convert Buffer to Blob and create download URL
      const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Trigger download
      const link = document.createElement("a");
      link.download = `garrison-ledger-${tool}-report-${new Date().toISOString().split("T")[0]}.pdf`;
      link.href = blobUrl;
      link.click();

      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);

      // Show success message
      alert("✅ Professional PDF report downloaded! Check your downloads folder.");
    } catch {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  // Email results (Premium only)
  async function emailResults() {
    if (!isPremium) {
      alert("Email results is a premium feature. Upgrade to send results to your inbox!");
      return;
    }

    track(`${tool}_email_results`);

    try {
      const response = await fetch("/api/email-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          data,
        }),
      });

      if (response.ok) {
        alert("✅ Results sent to your email! Check your inbox.");
      } else {
        throw new Error("Failed to send email");
      }
    } catch {
      alert("Failed to send email. Please try again.");
    }
  }

  // Create shareable link (Free for all)
  async function createShareLink() {
    track(`${tool}_create_share_link`);

    try {
      const response = await fetch("/api/share-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          data,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();

        // Copy to clipboard
        await navigator.clipboard.writeText(url);

        setShowShareMenu(false);
        alert(
          `✅ Link copied to clipboard!\n\n${url}\n\nShare this link with anyone to show them your results.`
        );
      } else {
        throw new Error("Failed to create share link");
      }
    } catch {
      alert("Failed to create share link. Please try again.");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
      {/* PDF Download Button (Premium) */}
      <button
        onClick={exportAsPDF}
        disabled={isExporting || !data}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
          isPremium
            ? "hover:bg-primary-hover bg-primary text-white"
            : "cursor-not-allowed bg-gray-200 text-gray-500"
        }`}
      >
        {isExporting ? (
          <>
            <Icon name="Loader" className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Icon name="Download" className="h-4 w-4" />
            {isPremium ? "Download PDF Report" : "🔒 Download PDF Report"}
          </>
        )}
      </button>

      {/* Email Button (Premium) */}
      <button
        onClick={emailResults}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
          isPremium
            ? "bg-info text-white hover:bg-blue-700"
            : "cursor-not-allowed bg-gray-200 text-gray-500"
        }`}
      >
        <Icon name="Mail" className="h-4 w-4" />
        {isPremium ? "Email Results" : "🔒 Email Results"}
      </button>

      {/* Share Button (Free) */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 font-medium text-white transition-colors hover:bg-green-700"
        >
          <Icon name="Share2" className="h-4 w-4" />
          Share Results
        </button>

        {showShareMenu && (
          <div className="bg-surface absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border-2 border-border p-4 shadow-xl">
            <p className="text-body mb-3 text-sm">
              Create a shareable link to show your results to anyone
            </p>
            <button
              onClick={createShareLink}
              className="btn-primary w-full rounded-lg px-4 py-2 text-sm"
            >
              <Icon name="Link" className="mr-2 inline h-4 w-4" />
              Copy Share Link
            </button>
            <button
              onClick={() => setShowShareMenu(false)}
              className="hover:text-body mt-2 w-full text-sm text-muted"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Premium upgrade hint */}
      {!isPremium && (
        <p className="w-full text-center text-xs text-muted sm:w-auto sm:text-left">
          🔒{" "}
          <a href="/dashboard/upgrade" className="link">
            Upgrade to Premium
          </a>{" "}
          for screenshot & email export
        </p>
      )}
    </div>
  );
}
