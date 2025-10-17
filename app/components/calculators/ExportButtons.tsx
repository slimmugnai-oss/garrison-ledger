'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';
import Icon from '@/app/components/ui/Icon';
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

export default function ExportButtons({ tool, resultsElementId, data }: ExportButtonsProps) {
  const { isPremium } = usePremiumStatus();
  const [isExporting, setIsExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Screenshot export (Premium only)
  async function exportAsImage() {
    if (!isPremium) {
      alert('Screenshot export is a premium feature. Upgrade to save your results as an image!');
      return;
    }

    setIsExporting(true);
    track(`${tool}_screenshot_export`);

    try {
      const element = document.getElementById(resultsElementId);
      if (!element) {
        throw new Error('Results element not found');
      }

      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });

      // Download the image
      const link = document.createElement('a');
      link.download = `garrison-ledger-${tool}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();

      // Show success message
      alert('✅ Results saved as image! Check your downloads folder.');
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

  // Print function (Free for all)
  function printResults() {
    track(`${tool}_print`);
    window.print();
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
    } catch (error) {
      console.error('Error emailing results:', error);
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
        const { shareId, url } = await response.json();
        
        // Copy to clipboard
        await navigator.clipboard.writeText(url);
        
        setShowShareMenu(false);
        alert(`✅ Link copied to clipboard!\n\n${url}\n\nShare this link with anyone to show them your results.`);
      } else {
        throw new Error('Failed to create share link');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      alert('Failed to create share link. Please try again.');
    }
  }

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
      {/* Print Button (Free) */}
      <button
        onClick={printResults}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface border-2 border-border hover:border-primary text-body hover:text-primary rounded-lg font-medium transition-colors"
      >
        <Icon name="Printer" className="h-4 w-4" />
        Print Results
      </button>

      {/* Screenshot Button (Premium) */}
      <button
        onClick={exportAsImage}
        disabled={isExporting}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
          isPremium
            ? 'bg-primary text-white hover:bg-primary-hover'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isExporting ? (
          <>
            <Icon name="Loader" className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Icon name="Camera" className="h-4 w-4" />
            {isPremium ? 'Save as Image' : '🔒 Save as Image'}
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

