/**
 * PAYCHECK AUDIT CLIENT
 * 
 * Beautiful, military-grade LES auditor dashboard
 * Features: Upload, parsing, flags, Intel Card links, history
 */

'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import IntelCardLink from '@/app/components/les/IntelCardLink';
import AuditProvenancePopover from '@/app/components/les/AuditProvenancePopover';
import ExportAuditPDF from '@/app/components/les/ExportAuditPDF';
import LesManualEntryTabbed from '@/app/components/les/LesManualEntryTabbed';
import type { LesAuditResponse, PayFlag } from '@/app/types/les';

interface Props {
  isPremium: boolean;
  userProfile: {
    rank?: string;
    currentBase?: string;
    hasDependents?: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any[];
  hasReachedFreeLimit: boolean;
  uploadsThisMonth: number;
}

export default function PaycheckAuditClient({
  isPremium,
  userProfile,
  history,
  hasReachedFreeLimit,
  uploadsThisMonth
}: Props) {
  
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [auditResult, setAuditResult] = useState<LesAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [entryMode, setEntryMode] = useState<'upload' | 'manual'>('upload');

  /**
   * Handle file upload
   */
  const handleUpload = async (file: File) => {
    if (hasReachedFreeLimit) {
      alert('Free tier limit: 1 LES audit per month. Upgrade for unlimited audits.');
      return;
    }

    setUploading(true);
    setParsing(true);
    setError(null);
    setAuditResult(null);

    try {
      // Step 1: Upload and parse
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/les/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        // Provide specific error messages based on error type
        if (err.error?.includes('file too large') || err.error?.includes('File too large')) {
          throw new Error('File size exceeds 5MB limit. Try compressing your PDF or exporting a smaller date range.');
        } else if (err.error?.includes('PDF') || err.error?.includes('pdf')) {
          throw new Error('Only PDF files are supported. Export your LES as PDF from myPay or your service\'s pay portal.');
        } else if (err.error?.includes('quota') || err.error?.includes('limit')) {
          throw new Error('Monthly upload limit reached. Upgrade to Premium for unlimited audits.');
        } else {
          throw new Error(err.error || 'Upload failed. Please try again.');
        }
      }

      const { uploadId, parsedOk } = await uploadRes.json();

      setUploading(false);

      // Check if parse was successful
      if (!parsedOk) {
        throw new Error('PDF format not recognized. Try exporting from myPay or contact support if issue persists.');
      }

      // Step 2: Run audit
      const auditRes = await fetch('/api/les/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId })
      });

      if (!auditRes.ok) {
        const err = await auditRes.json();
        // Provide specific error messages based on error type
        if (err.error?.includes('Profile') || err.error?.includes('profile')) {
          throw new Error('Your profile is incomplete. Please update your rank, base, and dependent status in Profile Settings.');
        } else if (err.error?.includes('not parsed')) {
          throw new Error('LES parsing failed. Try re-uploading or use a different PDF export.');
        } else {
          throw new Error(err.error || 'Audit failed. Please try again.');
        }
      }

      const result = await auditRes.json();
      setAuditResult(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred. Please try again.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 font-lora mb-3">
            LES & Paycheck Auditor
          </h1>
          <p className="text-lg text-gray-600">
            Catch pay errors before you do. Upload your LES, verify allowances, detect underpayments.
          </p>
        </div>

        {/* Entry Mode Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setEntryMode('upload')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                entryMode === 'upload'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon name="Upload" className="inline-block w-4 h-4 mr-2" />
              Upload PDF
            </button>
            <button
              onClick={() => setEntryMode('manual')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                entryMode === 'manual'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon name="Edit" className="inline-block w-4 h-4 mr-2" />
              Manual Entry
            </button>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{uploadsThisMonth}</p>
              </div>
              <Icon name="Upload" className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isPremium ? 'Unlimited' : `${uploadsThisMonth}/1 free audits used`}
            </p>
          </div>

          <div className="bg-white border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Recovered</p>
                <p className="text-3xl font-bold text-green-600">
                  ${history.reduce((sum, h) => sum + (h.total_delta_cents || 0), 0) / 100}
                </p>
              </div>
              <Icon name="DollarSign" className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">From underpayment catches</p>
          </div>

          <div className="bg-white border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Audits Run</p>
                <p className="text-3xl font-bold text-blue-600">{history.length}</p>
              </div>
              <Icon name="CheckCircle" className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">All-time total</p>
          </div>
        </div>

        {/* Upload Section */}
        {entryMode === 'upload' && !auditResult && !parsing && (
          <AnimatedCard>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12">
              <div className="text-center">
                <Icon name="Upload" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Your LES
                </h3>
                <p className="text-gray-600 mb-6">
                  PDF format, 5MB max. We'll verify your BAH, BAS, COLA, and special pays.
                </p>

                <label className="inline-block">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                    className="hidden"
                    disabled={hasReachedFreeLimit || uploading}
                  />
                  <span className={`px-8 py-4 rounded-lg font-semibold text-lg cursor-pointer inline-flex items-center gap-2 ${
                    hasReachedFreeLimit
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    <Icon name="Upload" className="w-5 h-5" />
                    {hasReachedFreeLimit ? 'Free Limit Reached' : 'Choose LES PDF'}
                  </span>
                </label>

                {hasReachedFreeLimit && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">
                      You've used your free audit for this month. Upgrade for unlimited audits.
                    </p>
                    <a
                      href="/dashboard/upgrade?feature=les-auditor"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Upgrade to Premium →
                    </a>
                  </div>
                )}

                <div className="mt-6 text-sm text-gray-500">
                  <p className="mb-2"><strong>Privacy:</strong> Your LES is parsed server-side and never exposed.</p>
                  <p><strong>Data used:</strong> Pay month, paygrade, BAH, BAS, COLA, special pays only.</p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        )}

        {/* Manual Entry Section */}
        {entryMode === 'manual' && !auditResult && !parsing && (
          <LesManualEntryTabbed
            tier={isPremium ? 'premium' : 'free'}
            isPremium={isPremium}
            hasProfile={!!(userProfile.rank && userProfile.currentBase && userProfile.hasDependents !== null && userProfile.hasDependents !== undefined)}
            monthlyEntriesCount={uploadsThisMonth}
            userProfile={userProfile}
          />
        )}

        {/* Parsing State */}
        {parsing && (
          <div className="bg-white border border-gray-200 rounded-lg p-12">
            <div className="text-center">
              <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {uploading ? 'Uploading LES...' : 'Analyzing Pay...'}
              </h3>
              <p className="text-gray-600">
                {uploading 
                  ? 'Securely uploading your LES PDF'
                  : 'Parsing line items, comparing to expected pay, generating flags'}
              </p>
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name={uploading ? 'CheckCircle' : 'RefreshCw'} className={`w-4 h-4 ${uploading ? 'text-green-600' : 'text-blue-600 animate-spin'}`} />
                  <span>Extracting pay data from PDF</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name={parsing && !uploading ? 'RefreshCw' : 'CheckCircle'} className={`w-4 h-4 ${parsing && !uploading ? 'text-blue-600 animate-spin' : 'text-gray-400'}`} />
                  <span>Comparing to expected allowances</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="CheckCircle" className="w-4 h-4 text-gray-400" />
                  <span>Generating actionable flags</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <AnimatedCard>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Upload Failed
                  </h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  
                  {/* Contextual Help */}
                  <div className="bg-white bg-opacity-50 rounded p-4 mb-4">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">Quick Fixes:</h4>
                    <ul className="space-y-1 text-sm text-red-800">
                      {error.includes('profile') ? (
                        <>
                          <li className="flex items-start gap-2">
                            <span>→</span>
                            <a href="/dashboard/profile/setup" className="underline hover:text-red-900">
                              Complete your profile
                            </a>
                          </li>
                        </>
                      ) : error.includes('PDF') || error.includes('format') ? (
                        <>
                          <li className="flex items-start gap-2">
                            <span>→</span>
                            <span>Export your LES from myPay as PDF (not screenshot)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>→</span>
                            <span>Ensure PDF is readable (not password-protected)</span>
                          </li>
                        </>
                      ) : error.includes('limit') || error.includes('quota') ? (
                        <>
                          <li className="flex items-start gap-2">
                            <span>→</span>
                            <a href="/dashboard/upgrade?feature=les-auditor" className="underline hover:text-red-900">
                              Upgrade to Premium for unlimited audits
                            </a>
                          </li>
                        </>
                      ) : (
                        <li className="flex items-start gap-2">
                          <span>→</span>
                          <span>Contact support if issue persists</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setError(null);
                        setAuditResult(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      Try Again
                    </button>
                    <a
                      href="/dashboard/support"
                      className="px-4 py-2 bg-white text-red-700 border border-red-300 rounded-lg hover:bg-red-50 font-medium"
                    >
                      Get Help
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        )}

        {/* Audit Results */}
        {auditResult && (
          <div className="space-y-6">
            {/* Summary Card */}
            <AnimatedCard>
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Audit Complete
                    </h2>
                    <p className="text-gray-600 mb-2">
                      Pay period: {auditResult.snapshot.month}/{auditResult.snapshot.year}
                    </p>
                    <AuditProvenancePopover snapshot={auditResult.snapshot} />
                  </div>
                  <div className="flex gap-2">
                    <ExportAuditPDF 
                      auditResult={auditResult}
                      userProfile={userProfile}
                    />
                    <button
                      onClick={() => setAuditResult(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Upload Another
                    </button>
                  </div>
                </div>

                {/* Flags Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-900">Critical Issues</span>
                      <span className="text-2xl font-bold text-red-600">
                        {(auditResult.flags || []).filter((f: PayFlag) => f.severity === 'red').length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-900">Warnings</span>
                      <span className="text-2xl font-bold text-yellow-600">
                        {(auditResult.flags || []).filter((f: PayFlag) => f.severity === 'yellow').length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-900">Verified</span>
                      <span className="text-2xl font-bold text-green-600">
                        {(auditResult.flags || []).filter((f: PayFlag) => f.severity === 'green').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Flag Cards */}
            <div className="space-y-4">
              {(auditResult.flags || []).map((flag: PayFlag, index: number) => {
                const isRed = flag.severity === 'red';
                const isYellow = flag.severity === 'yellow';
                const _isGreen = flag.severity === 'green';

                return (
                  <AnimatedCard key={index} delay={index * 0.1}>
                    <div className={`border-l-4 rounded-lg p-6 ${
                      isRed ? 'bg-red-50 border-red-500' :
                      isYellow ? 'bg-yellow-50 border-yellow-500' :
                      'bg-green-50 border-green-500'
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Icon 
                            name={
                              isRed ? 'AlertCircle' :
                              isYellow ? 'AlertTriangle' :
                              'CheckCircle'
                            }
                            className={`w-6 h-6 ${
                              isRed ? 'text-red-600' :
                              isYellow ? 'text-yellow-600' :
                              'text-green-600'
                            }`}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <Badge variant={
                                isRed ? 'danger' :
                                isYellow ? 'warning' :
                                'success'
                              }>
                                {flag.flag_code}
                              </Badge>
                              <h3 className="text-lg font-semibold text-gray-900 mt-2">
                                {flag.message}
                              </h3>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">
                            <strong>What to do:</strong> {flag.suggestion}
                          </p>

                          {flag.ref_url && (
                            <div className="bg-white bg-opacity-50 rounded p-3 mb-3 text-sm">
                              <a 
                                href={flag.ref_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                              >
                                View Official Reference
                                <Icon name="ExternalLink" className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {/* Intel Card Link */}
                          <IntelCardLink flagCode={flag.flag_code} />
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Next Steps
              </h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Review all red flags above - these are critical pay issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Contact your finance office for red flags (bring this audit)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Monitor yellow flags - verify on next LES</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Save this audit for your records</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* History */}
        {showHistory && history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Audit History</h2>
            <div className="space-y-3">
              {history.map((audit, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(audit.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Flags: {audit.red_flags || 0} red, {audit.yellow_flags || 0} yellow, {audit.green_flags || 0} green
                    </p>
                  </div>
                  <div className="text-right">
                    {audit.total_delta_cents > 0 && (
                      <p className="text-green-600 font-semibold">
                        +${(audit.total_delta_cents / 100).toFixed(2)} recovered
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle History */}
        {!auditResult && history.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {showHistory ? 'Hide' : 'View'} Audit History ({history.length})
            </button>
          </div>
        )}

        {/* How It Works */}
        {!auditResult && !parsing && (
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What We Check:</h4>
                <ul className="space-y-1">
                  <li>✅ BAH (correct for your paygrade/location/dependents)</li>
                  <li>✅ BAS (enlisted vs officer rate)</li>
                  <li>✅ COLA (if authorized for your location)</li>
                  <li>✅ Special pays (SDAP, HFP, IDP, etc.)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What You Get:</h4>
                <ul className="space-y-1">
                  <li>🚨 <strong>Red flags:</strong> Critical issues (BAH mismatch, missing BAS)</li>
                  <li>⚠️ <strong>Yellow flags:</strong> Verify next month (minor variance)</li>
                  <li>✅ <strong>Green flags:</strong> Allowances verified correct</li>
                  <li>📚 <strong>Learn links:</strong> Intel Cards explain each allowance</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
