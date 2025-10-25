"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const token = params?.token as string;

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
      <div className="flex min-h-screen items-center justify-center bg-[#0A0F1E]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00E5A0] border-r-transparent"></div>
          <p className="mt-4 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0F1E]">
        <div className="max-w-md text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  const isPdf = shareData.file.content_type === "application/pdf";
  const isImage = shareData.file.content_type.startsWith("image/");

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-6">
          <h1 className="mb-2 text-2xl font-bold">{shareData.file.display_name}</h1>
          <p className="text-sm text-muted">
            {(shareData.file.size_bytes / 1024).toFixed(1)} KB • {shareData.file.content_type}
          </p>
          {shareData.canDownload && (
            <a
              href={shareData.signedUrl}
              download={shareData.file.display_name}
              className="mt-4 inline-flex items-center rounded-lg bg-[#00E5A0] px-4 py-2 font-medium text-[#0A0F1E] transition-colors hover:bg-[#00CC8E]"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </a>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-6">
          {isPdf && (
            <iframe
              src={shareData.signedUrl}
              className="h-[800px] w-full rounded border border-[#2A2F3E]"
              title={shareData.file.display_name}
            />
          )}
          {isImage && (
            <div className="relative flex min-h-[400px] items-center justify-center">
              <Image
                src={shareData.signedUrl}
                alt={shareData.file.display_name}
                width={1200}
                height={800}
                className="h-auto max-w-full rounded object-contain"
                style={{ maxHeight: "800px" }}
                priority
              />
            </div>
          )}
          {!isPdf && !isImage && (
            <div className="py-12 text-center text-muted">
              <svg
                className="mx-auto mb-4 h-16 w-16 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>Preview not available for this file type</p>
              {shareData.canDownload && (
                <p className="mt-2">Use the download button above to view this file</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
