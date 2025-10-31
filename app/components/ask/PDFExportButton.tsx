"use client";

/**
 * PDF EXPORT BUTTON FOR ASK MILITARY EXPERT
 *
 * Allows users to export conversations as PDF with:
 * - Conversation history (questions + answers)
 * - Citations and sources
 * - Professional military-grade formatting
 */

import { FileDown, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";

interface PDFExportButtonProps {
  conversationId?: string;
  sessionId?: string;
  disabled?: boolean;
  onExport?: (conversationId: string) => Promise<void>;
}

export default function PDFExportButton({
  conversationId,
  sessionId,
  disabled = false,
  onExport,
}: PDFExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    if (!conversationId && !sessionId) return;

    setExporting(true);
    try {
      // Call API to generate PDF
      const response = await fetch("/api/ask/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId || sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("PDF export failed");
      }

      // Download PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `military-expert-conversation-${conversationId || sessionId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      setExported(true);
      setTimeout(() => setExported(false), 3000); // Reset after 3 seconds

      if (onExport && conversationId) {
        await onExport(conversationId);
      }
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (!conversationId && !sessionId) {
    return null;
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || exporting || exported}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        exported
          ? "bg-green-100 text-green-700 border-2 border-green-300"
          : "bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-blue-400"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label="Export conversation as PDF"
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Generating PDF...</span>
        </>
      ) : exported ? (
        <>
          <CheckCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Exported!</span>
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          <span className="hidden sm:inline">Export PDF</span>
          <span className="sm:hidden">PDF</span>
        </>
      )}
    </button>
  );
}

