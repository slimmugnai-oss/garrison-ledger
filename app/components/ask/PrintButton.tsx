"use client";

/**
 * PRINT BUTTON FOR ASK MILITARY EXPERT
 *
 * Simple print functionality for conversations
 * Uses browser's native print dialog (no PDF generation needed)
 */

import { Printer } from "lucide-react";

interface PrintButtonProps {
  disabled?: boolean;
}

export default function PrintButton({ disabled = false }: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-blue-400 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Print conversation"
    >
      <Printer className="h-4 w-4" />
      <span className="hidden sm:inline">Print</span>
    </button>
  );
}

