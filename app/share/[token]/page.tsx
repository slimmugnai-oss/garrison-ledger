"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ShareData {
  file: {
    display_name: string;
    content_type: string;
    size_bytes: number;
  };
  canDownload: boolean;
  signedUrl: string;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);

  useEffect(() => {
    async function fetchShare() {
      try {
        const response = await fetch(`/api/binder/share/access/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Share link not found or expired");
          return;
        }

        setShareData(data);
      } catch {
        setError("Failed to load share");
      } finally {
        setLoading(false);
      }
    }

    fetchShare();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00E5A0] border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const isPdf = shareData.file.content_type === "application/pdf";
  const isImage = shareData.file.content_type.startsWith("image/");

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{shareData.file.display_name}</h1>
          <p className="text-gray-400 text-sm">
            {(shareData.file.size_bytes / 1024).toFixed(1)} KB • {shareData.file.content_type}
          </p>
          {shareData.canDownload && (
            <a
              href={shareData.signedUrl}
              download={shareData.file.display_name}
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#00E5A0] text-[#0A0F1E] rounded-lg font-medium hover:bg-[#00CC8E] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          )}
        </div>

        {/* Preview */}
        <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] p-6">
          {isPdf && (
            <iframe
              src={shareData.signedUrl}
              className="w-full h-[800px] rounded border border-[#2A2F3E]"
              title={shareData.file.display_name}
            />
          )}
          {isImage && (
            <img
              src={shareData.signedUrl}
              alt={shareData.file.display_name}
              className="max-w-full h-auto rounded"
            />
          )}
          {!isPdf && !isImage && (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Preview not available for this file type</p>
              {shareData.canDownload && <p className="mt-2">Use the download button above to view this file</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

