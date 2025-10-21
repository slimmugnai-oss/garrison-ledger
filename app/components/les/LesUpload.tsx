'use client';

import { useState, useCallback } from 'react';
import Icon from '@/app/components/ui/Icon';
import Link from 'next/link';
import LesFlags from './LesFlags';
import LesSummary from './LesSummary';
import { ssot } from '@/lib/ssot';
import type { LesUploadResponse, LesAuditResponse } from '@/app/types/les';

interface Props {
  tier: string;
  isPremium: boolean;
  hasProfile: boolean;
  monthlyUploadsCount: number;
}

type UploadState = 'idle' | 'uploading' | 'parsing' | 'parsed' | 'auditing' | 'complete' | 'error';

export default function LesUpload({ tier, isPremium, hasProfile, monthlyUploadsCount }: Props) {
  const [state, setState] = useState<UploadState>('idle');
  const [uploadData, setUploadData] = useState<LesUploadResponse | null>(null);
  const [auditData, setAuditData] = useState<LesAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const maxUploads = tier === 'free' ? ssot.features.lesAuditor.freeUploadsPerMonth : null;
  const quotaExceeded = maxUploads !== null && monthlyUploadsCount >= maxUploads;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported. Please upload your LES as a PDF.');
      setState('error');
      return;
    }

    // Validate file size
    const maxSizeBytes = ssot.features.lesAuditor.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File is too large (max ${ssot.features.lesAuditor.maxFileSizeMB}MB). Please use a smaller file.`);
      setState('error');
      return;
    }

    // Upload file
    setState('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setState('parsing');
      const response = await fetch('/api/les/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data: LesUploadResponse = await response.json();
      setUploadData(data);

      if (data.parsedOk) {
        setState('parsed');
      } else {
        setError('Could not parse this PDF. v1 supports most standard LES PDFs. Try a different export or contact support.');
        setState('error');
      }
    } catch (err) {
      setError((err as Error).message || 'Upload failed');
      setState('error');
    }
  };

  const handleRunAudit = async () => {
    if (!uploadData?.uploadId) return;

    setState('auditing');
    setError(null);

    try {
      const response = await fetch('/api/les/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: uploadData.uploadId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Audit failed');
      }

      const data: LesAuditResponse = await response.json();
      setAuditData(data);
      setState('complete');
    } catch (err) {
      setError((err as Error).message || 'Audit failed');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setUploadData(null);
    setAuditData(null);
    setError(null);
  };

  // Quota exceeded state
  if (quotaExceeded) {
    return (
      <div className="rounded-lg border bg-amber-50 border-amber-300 p-8 text-center">
        <Icon name="Lock" className="h-12 w-12 text-amber-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-amber-900 mb-2">Monthly Limit Reached</h3>
        <p className="text-amber-800 mb-4">
          You've used your {maxUploads} LES upload for this month. Upgrade to Premium for unlimited uploads.
        </p>
        <Link
          href="/dashboard/upgrade?feature=paycheck-audit"
          className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Upgrade to Premium
        </Link>
      </div>
    );
  }

  // Profile required state
  if (!hasProfile) {
    return (
      <div className="rounded-lg border bg-blue-50 border-blue-300 p-8 text-center">
        <Icon name="User" className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Profile Setup Required</h3>
        <p className="text-blue-800 mb-4">
          To run pay audits, we need your paygrade, duty station, and dependent status.
        </p>
        <Link
          href="/dashboard/profile/setup"
          className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Complete Profile
        </Link>
      </div>
    );
  }

  // Audit complete state
  if (state === 'complete' && auditData) {
    return (
      <div className="space-y-6">
        {/* Summary */}
        {uploadData?.summary && (
          <LesSummary summary={uploadData.summary} />
        )}

        {/* Flags */}
        <LesFlags
          flags={auditData.flags}
          tier={tier}
          summary={auditData.summary}
        />

        {/* Actions */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
          <div className="text-sm text-gray-600">
            Audit complete for {uploadData?.month}/{uploadData?.year}
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Icon name="Upload" className="h-4 w-4" />
            Upload Another LES
          </button>
        </div>
      </div>
    );
  }

  // Upload interface
  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          relative rounded-lg border-2 border-dashed p-12 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          ${state !== 'idle' && state !== 'error' ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Loading States */}
        {state === 'uploading' && (
          <div className="space-y-3">
            <Icon name="Upload" className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
            <div className="text-lg font-medium">Uploading...</div>
            <div className="text-sm text-gray-600">Securing your LES file</div>
          </div>
        )}

        {state === 'parsing' && (
          <div className="space-y-3">
            <Icon name="File" className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
            <div className="text-lg font-medium">Parsing LES...</div>
            <div className="text-sm text-gray-600">Extracting pay line items</div>
          </div>
        )}

        {state === 'parsed' && (
          <div className="space-y-4">
            <Icon name="CheckCircle" className="h-12 w-12 text-green-600 mx-auto" />
            <div className="text-lg font-medium">LES Parsed Successfully</div>
            <div className="text-sm text-gray-600">
              Found {uploadData?.summary?.allowancesByCode ? Object.keys(uploadData.summary.allowancesByCode).length : 0} allowances
            </div>
            <button
              onClick={handleRunAudit}
              disabled={!hasProfile}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="Shield" className="h-5 w-5" />
              Run Paycheck Audit
            </button>
          </div>
        )}

        {state === 'auditing' && (
          <div className="space-y-3">
            <Icon name="Shield" className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
            <div className="text-lg font-medium">Running Audit...</div>
            <div className="text-sm text-gray-600">Comparing actual vs expected pay</div>
          </div>
        )}

        {/* Idle State */}
        {state === 'idle' && (
          <div className="space-y-4">
            <Icon name="Upload" className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium mb-2">Upload Your LES (PDF)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your Leave & Earnings Statement PDF, or click to browse
              </p>
              <div className="text-xs text-gray-500">
                Maximum file size: {ssot.features.lesAuditor.maxFileSizeMB}MB • PDF only
              </div>
            </div>
            <div>
              <input
                type="file"
                id="les-upload"
                accept="application/pdf"
                onChange={handleFileInput}
                className="hidden"
              />
              <label
                htmlFor="les-upload"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Icon name="Upload" className="h-5 w-5" />
                Choose PDF File
              </label>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && error && (
          <div className="space-y-4">
            <Icon name="AlertCircle" className="h-12 w-12 text-red-600 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Upload Failed</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-6 py-3 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              <Icon name="RefreshCw" className="h-5 w-5" />
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Where to Find Your LES */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="HelpCircle" className="h-5 w-5 text-blue-600" />
          Where to Find Your LES
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5" />
            <span>
              <strong>MyPay:</strong> Login at{' '}
              <a
                href="https://mypay.dfas.mil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                mypay.dfas.mil
              </a>
              {' '}→ LES → Download PDF
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5" />
            <span>
              <strong>Navy/Marines:</strong> Also available in NSIPS
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5" />
            <span>
              <strong>Air Force:</strong> Also available in myPers
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

