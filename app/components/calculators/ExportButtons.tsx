'use client';

import { useState } from 'react';

import Icon from '@/app/components/ui/Icon';
import { generateCalculatorReport } from '@/app/lib/pdf-reports';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import { track } from '@/lib/track';

interface ExportButtonsProps {
  tool: string; // 'tsp', 'sdp', 'house-hacking', 'pcs', 'savings', 'career'
  resultsElementId: string; // ID of the element to capture for screenshot
  data?: {
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
  };
}

export default function ExportButtons({ tool, resultsElementId: _resultsElementId, data }: ExportButtonsProps) {
  const { isPremium } = usePremiumStatus();
  const [isExporting, setIsExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // PDF export (Premium only)
  async function exportAsPDF() {
    if (!isPremium) {
      alert('PDF export is a premium feature. Upgrade to download professional reports!');
      return;
    }

    if (!data) {
      alert('No data available to export. Please complete the calculator first.');
      return;
    }

    setIsExporting(true);
    track(`${tool}_pdf_export`);

    try {
      // Generate PDF using our library (returns Buffer)
      const pdfBuffer = generateCalculatorReport(tool, data.inputs, data.outputs);
      
      // Convert Buffer to Blob and create download URL
      const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Trigger download
      const link = document.createElement('a');
      link.download = `garrison-ledger-${tool}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      link.href = blobUrl;
      link.click();
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);

      // Show success message
      alert('✅ Professional PDF report downloaded! Check your downloads folder.');
    } catch {
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

  // Email results (Premium only)
  async function emailResults() {
    if (!isPremium) {
      alert('Email results is a premium feature. Upgrade to send results to your inbox!');
      return;
    }

    track(`${tool}_email_results`);
    
    try {
      const response = await fetch('/api/email-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool,
          data
        })
      });

      if (response.ok) {
        alert('✅ Results sent to your email! Check your inbox.');
      } else {
        throw new Error('Failed to send email');
      }
    } catch {
      alert('Failed to send email. Please try again.');
    }
  }

  // Create shareable link (Free for all)
  async function createShareLink() {
    track(`${tool}_create_share_link`);
    
    try {
      const response = await fetch('/api/share-calculation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool,
          data
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        
        // Copy to clipboard
        await navigator.clipboard.writeText(url);
        
        setShowShareMenu(false);
        alert(`✅ Link copied to clipboard!\n\n${url}\n\nShare this link with anyone to show them your results.`);
      } else {
        throw new Error('Failed to create share link');
      }
    } catch {
      alert('Failed to create share link. Please try again.');
    }
  }

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
      {/* PDF Download Button (Premium) */}
      <button
        onClick={exportAsPDF}
        disabled={isExporting || !data}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
          isPremium
            ? 'bg-primary text-white hover:bg-primary-hover'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
            {isPremium ? 'Download PDF Report' : '🔒 Download PDF Report'}
          </>
        )}
      </button>

      {/* Email Button (Premium) */}
      <button
        onClick={emailResults}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
          isPremium
            ? 'bg-info text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Icon name="Mail" className="h-4 w-4" />
        {isPremium ? 'Email Results' : '🔒 Email Results'}
      </button>

      {/* Share Button (Free) */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-success text-white hover:bg-green-700 rounded-lg font-medium transition-colors"
        >
          <Icon name="Share2" className="h-4 w-4" />
          Share Results
        </button>

        {showShareMenu && (
          <div className="absolute top-full mt-2 right-0 bg-surface border-2 border-border rounded-lg shadow-xl p-4 w-64 z-50">
            <p className="text-sm text-body mb-3">
              Create a shareable link to show your results to anyone
            </p>
            <button
              onClick={createShareLink}
              className="w-full btn-primary px-4 py-2 rounded-lg text-sm"
            >
              <Icon name="Link" className="h-4 w-4 inline mr-2" />
              Copy Share Link
            </button>
            <button
              onClick={() => setShowShareMenu(false)}
              className="w-full mt-2 text-sm text-muted hover:text-body"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Premium upgrade hint */}
      {!isPremium && (
        <p className="text-xs text-muted w-full sm:w-auto text-center sm:text-left">
          🔒 <a href="/dashboard/upgrade" className="link">Upgrade to Premium</a> for screenshot & email export
        </p>
      )}
    </div>
  );
}

