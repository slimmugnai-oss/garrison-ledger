'use client';

/**
 * AUDIT DETAIL CLIENT COMPONENT
 * Interactive component for viewing and managing a single audit
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

interface Props {
  upload: any;
  linesBySection: {
    ALLOWANCE: any[];
    TAX: any[];
    DEDUCTION: any[];
    ALLOTMENT: any[];
    DEBT: any[];
    ADJUSTMENT: any[];
  };
  flagsBySeverity: {
    red: any[];
    yellow: any[];
    green: any[];
  };
}

export default function AuditDetailClient({ upload, linesBySection, flagsBySeverity }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showMathProof, setShowMathProof] = useState(false);

  // Compute verdict
  const hasRedFlags = flagsBySeverity.red.length > 0;
  const hasYellowFlags = flagsBySeverity.yellow.length > 0;
  const verdict = hasRedFlags ? 'Critical Issues' : hasYellowFlags ? 'Minor Issues' : 'All Clear';
  const verdictColor = hasRedFlags ? 'red' : hasYellowFlags ? 'yellow' : 'green';

  // Compute totals
  const totals = {
    allowances: linesBySection.ALLOWANCE.reduce((sum, l) => sum + l.amount_cents, 0),
    taxes: linesBySection.TAX.reduce((sum, l) => sum + l.amount_cents, 0),
    deductions: linesBySection.DEDUCTION.reduce((sum, l) => sum + l.amount_cents, 0),
    allotments: linesBySection.ALLOTMENT.reduce((sum, l) => sum + l.amount_cents, 0),
    debts: linesBySection.DEBT.reduce((sum, l) => sum + l.amount_cents, 0),
    adjustments: linesBySection.ADJUSTMENT.reduce((sum, l) => sum + l.amount_cents, 0)
  };

  const computedNet = totals.allowances - totals.taxes - totals.deductions - totals.allotments - totals.debts + totals.adjustments;

  // Handlers
  const handleDelete = async () => {
    if (!confirm('Delete this audit? This cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/les/audit/${upload.id}/delete`, { 
        method: 'POST' 
      });
      
      if (response.ok) {
        router.push('/dashboard/paycheck-audit');
      } else {
        alert('Failed to delete audit');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete audit');
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/les/audit/${upload.id}/export`);
      const blob = await response.blob();
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `les-audit-${upload.month}-${upload.year}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export audit');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReAudit = async () => {
    try {
      const response = await fetch(`/api/les/audit/${upload.id}/clone`, { 
        method: 'POST' 
      });
      const data = await response.json();
      
      if (data.uploadId) {
        router.push(`/dashboard/paycheck-audit?edit=${data.uploadId}`);
      } else {
        alert('Failed to clone audit');
      }
    } catch (error) {
      console.error('Clone error:', error);
      alert('Failed to clone audit');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/paycheck-audit"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <Icon name="ChevronLeft" className="h-4 w-4 mr-1" />
          Back to LES Auditor
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-black text-text-headings mb-2">
              LES Audit - {upload.month}/{upload.year}
            </h1>
            <p className="text-text-body">
              {upload.entry_type === 'manual' ? 'Manual Entry' : 'PDF Upload'} • 
              {' '}Completed {new Date(upload.audit_completed_at || upload.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleReAudit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Icon name="RefreshCw" className="h-4 w-4" />
              Re-Audit
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Icon name="Download" className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Icon name="Trash2" className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Verdict Card */}
      <AnimatedCard className={`mb-8 p-8 border-2 ${
        verdictColor === 'red' ? 'bg-red-50 border-red-200' :
        verdictColor === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
        'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Icon 
                name={verdictColor === 'red' ? 'XCircle' : verdictColor === 'yellow' ? 'AlertTriangle' : 'CheckCircle'} 
                className={`h-10 w-10 ${
                  verdictColor === 'red' ? 'text-red-600' :
                  verdictColor === 'yellow' ? 'text-yellow-600' :
                  'text-green-600'
                }`} 
              />
              <h2 className={`text-3xl font-bold ${
                verdictColor === 'red' ? 'text-red-900' :
                verdictColor === 'yellow' ? 'text-yellow-900' :
                'text-green-900'
              }`}>
                {verdict}
              </h2>
            </div>
            <p className={`text-lg ${
              verdictColor === 'red' ? 'text-red-700' :
              verdictColor === 'yellow' ? 'text-yellow-700' :
              'text-green-700'
            }`}>
              {hasRedFlags ? 'Action required - review red flags below' :
               hasYellowFlags ? 'Minor issues detected - review recommendations' :
               'Paycheck verified - no action needed'}
            </p>
          </div>
          
          {upload.total_delta_cents !== 0 && (
            <div className="text-right">
              <div className={`text-4xl font-black ${
                upload.total_delta_cents > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {upload.total_delta_cents > 0 ? '+' : ''}${(upload.total_delta_cents / 100).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {upload.total_delta_cents > 0 ? 'Potential Recovery' : 'Overpaid'}
              </div>
            </div>
          )}
        </div>
      </AnimatedCard>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <AnimatedCard className="bg-red-50 border-2 border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-red-700">Red Flags</span>
            <Icon name="XCircle" className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-3xl font-black text-red-900">{upload.red_flags_count || 0}</div>
          <div className="text-sm text-red-700 mt-1">Critical issues</div>
        </AnimatedCard>

        <AnimatedCard className="bg-yellow-50 border-2 border-yellow-200 p-6" delay={50}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-yellow-700">Yellow Flags</span>
            <Icon name="AlertTriangle" className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-black text-yellow-900">{upload.yellow_flags_count || 0}</div>
          <div className="text-sm text-yellow-700 mt-1">Warnings</div>
        </AnimatedCard>

        <AnimatedCard className="bg-green-50 border-2 border-green-200 p-6" delay={100}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-green-700">Green Flags</span>
            <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-black text-green-900">{upload.green_flags_count || 0}</div>
          <div className="text-sm text-green-700 mt-1">Verified correct</div>
        </AnimatedCard>

        <AnimatedCard className="bg-blue-50 border-2 border-blue-200 p-6" delay={150}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-blue-700">Net Pay</span>
            <Icon name="DollarSign" className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">
            ${((computedNet / 100).toFixed(2))}
          </div>
          <div className="text-sm text-blue-700 mt-1">Calculated</div>
        </AnimatedCard>
      </div>

      {/* Flags List */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-black text-text-headings mb-6">
          Audit Results
        </h2>
        
        <div className="space-y-4">
          {/* Red Flags */}
          {flagsBySeverity.red.map((flag: any, idx: number) => (
            <AnimatedCard key={flag.id} className="bg-red-50 border-2 border-red-200 p-6" delay={idx * 50}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Icon name="XCircle" className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-red-900">{flag.message}</h3>
                      {flag.delta_cents && (
                        <Badge variant="danger">
                          {flag.delta_cents > 0 ? '+' : ''}${(flag.delta_cents / 100).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-red-700 mb-3">{flag.suggestion}</p>
                    {flag.ref_url && (
                      <a 
                        href={flag.ref_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-red-600 hover:text-red-800 underline"
                      >
                        View Official Source →
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(flag.suggestion)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Copy suggestion"
                >
                  <Icon name="Copy" className="h-5 w-5" />
                </button>
              </div>
            </AnimatedCard>
          ))}

          {/* Yellow Flags */}
          {flagsBySeverity.yellow.map((flag: any, idx: number) => (
            <AnimatedCard key={flag.id} className="bg-yellow-50 border-2 border-yellow-200 p-6" delay={(flagsBySeverity.red.length + idx) * 50}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Icon name="AlertTriangle" className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-yellow-900">{flag.message}</h3>
                      {flag.delta_cents && (
                        <Badge variant="warning">
                          {flag.delta_cents > 0 ? '+' : ''}${(flag.delta_cents / 100).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-yellow-700 mb-3">{flag.suggestion}</p>
                    {flag.ref_url && (
                      <a 
                        href={flag.ref_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-yellow-600 hover:text-yellow-800 underline"
                      >
                        View Official Source →
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(flag.suggestion)}
                  className="text-yellow-600 hover:text-yellow-800 p-2"
                  title="Copy suggestion"
                >
                  <Icon name="Copy" className="h-5 w-5" />
                </button>
              </div>
            </AnimatedCard>
          ))}

          {/* Green Flags */}
          {flagsBySeverity.green.slice(0, 3).map((flag: any, idx: number) => (
            <AnimatedCard key={flag.id} className="bg-green-50 border border-green-200 p-4" delay={(flagsBySeverity.red.length + flagsBySeverity.yellow.length + idx) * 50}>
              <div className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <p className="text-green-800">{flag.message}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Math Proof */}
      <AnimatedCard className="mb-8" delay={200}>
        <button
          onClick={() => setShowMathProof(!showMathProof)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon name="Calculator" className="h-6 w-6 text-gray-600" />
            <h2 className="text-2xl font-serif font-black text-text-headings">
              Math Proof
            </h2>
          </div>
          <Icon 
            name={showMathProof ? 'ChevronUp' : 'ChevronDown'} 
            className="h-5 w-5 text-gray-600" 
          />
        </button>
        
        {showMathProof && (
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Allowances:</span>
                  <span className="font-semibold">${(totals.allowances / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">- Taxes:</span>
                  <span className="font-semibold">${(totals.taxes / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">- Deductions:</span>
                  <span className="font-semibold">${(totals.deductions / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">- Allotments:</span>
                  <span className="font-semibold">${(totals.allotments / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">- Debts:</span>
                  <span className="font-semibold">${(totals.debts / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">+ Adjustments:</span>
                  <span className="font-semibold">${(totals.adjustments / 100).toFixed(2)}</span>
                </div>
                <div className="col-span-2 border-t-2 border-gray-300 mt-2 pt-2 flex justify-between">
                  <span className="text-gray-900 font-bold">= Net Pay:</span>
                  <span className="text-xl font-black">${(computedNet / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatedCard>

      {/* Line Items Breakdown */}
      <div>
        <h2 className="text-2xl font-serif font-black text-text-headings mb-6">
          Line Items
        </h2>
        
        <div className="space-y-6">
          {/* Allowances */}
          {linesBySection.ALLOWANCE.length > 0 && (
            <AnimatedCard delay={250}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Allowances (Income)</h3>
                <div className="space-y-2">
                  {linesBySection.ALLOWANCE.map((line: any) => (
                    <div key={line.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <span className="font-medium text-gray-900">{line.description}</span>
                        <span className="text-sm text-gray-500 ml-2">({line.line_code})</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${(line.amount_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <span>Total Allowances</span>
                    <span>${(totals.allowances / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Taxes */}
          {linesBySection.TAX.length > 0 && (
            <AnimatedCard delay={300}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Taxes</h3>
                <div className="space-y-2">
                  {linesBySection.TAX.map((line: any) => (
                    <div key={line.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <span className="font-medium text-gray-900">{line.description}</span>
                        <span className="text-sm text-gray-500 ml-2">({line.line_code})</span>
                      </div>
                      <span className="font-semibold text-red-600">
                        ${(line.amount_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <span>Total Taxes</span>
                    <span className="text-red-600">${(totals.taxes / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Deductions */}
          {linesBySection.DEDUCTION.length > 0 && (
            <AnimatedCard delay={350}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Deductions</h3>
                <div className="space-y-2">
                  {linesBySection.DEDUCTION.map((line: any) => (
                    <div key={line.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <span className="font-medium text-gray-900">{line.description}</span>
                        <span className="text-sm text-gray-500 ml-2">({line.line_code})</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${(line.amount_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <span>Total Deductions</span>
                    <span>${(totals.deductions / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  );
}

