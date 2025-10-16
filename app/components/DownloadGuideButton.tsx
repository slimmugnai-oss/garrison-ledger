"use client";
import { useState } from "react";
import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";

export default function DownloadGuideButton() {
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-guide", { method: "POST" });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to generate guide");
        setGenerating(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Your-AI-Curated-Plan-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download guide. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (premiumLoading) {
    return (
      <button disabled className="px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (!isPremium) {
    return (
      <div className="text-center p-6 bg-info-subtle rounded-lg border-2 border-info">
        <div className="text-4xl mb-3">📄</div>
        <h3 className="text-lg font-bold text-primary mb-2">Premium Feature: AI-Curated Plan PDF</h3>
        <p className="text-sm text-body mb-4">
          Upgrade to download your AI-curated personalized plan as a professional PDF
        </p>
        <a
          href="/dashboard/upgrade"
          className="inline-block bg-info hover:bg-info text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Upgrade to Premium
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {generating ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating your personalized guide...
        </>
      ) : (
        <>📥 Download Your AI-Curated Plan (PDF)</>
      )}
    </button>
  );
}

