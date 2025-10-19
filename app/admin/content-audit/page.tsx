'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

interface AuditFlag {
  severity: string;
  type: string;
  count?: number;
  samples?: string;
  monthsOld?: number;
  recommendation: string;
}

interface FlaggedBlock {
  id: string;
  title: string;
  domain: string;
  rating: number;
  created: string;
  flags: AuditFlag[];
  priorityScore: number;
}

interface AuditResults {
  auditDate: string;
  total: number;
  flagged: FlaggedBlock[];
  stats: {
    specificYears: number;
    specificAmounts: number;
    regulations: number;
    rates: number;
    guarantees: number;
    taxInfo: number;
    benefits: number;
    oldContent: number;
    noDisclaimer: number;
  };
  recommendations: Array<{
    priority: string;
    category: string;
    count: number;
    action: string;
  }>;
}

export default function ContentAuditPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AuditResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/audit-content');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run audit');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-600 text-white';
      case 'MEDIUM': return 'bg-yellow-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Content Blocks Accuracy Audit
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive audit of all 410 content blocks for accuracy, outdated information, and missing disclaimers
            </p>
          </div>

          {/* Run Audit Button */}
          <div className="mb-8">
            <button
              onClick={runAudit}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? '🔍 Running Audit...' : '🚀 Run Content Audit'}
            </button>
            {loading && (
              <p className="mt-2 text-sm text-gray-600">
                This may take 30-60 seconds to analyze all blocks...
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-8">
              <h3 className="text-red-800 font-bold mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Audit Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{results.total}</div>
                    <div className="text-sm text-gray-600">Total Blocks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{results.flagged.length}</div>
                    <div className="text-sm text-gray-600">Flagged ({Math.round(results.flagged.length / results.total * 100)}%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{results.stats.guarantees}</div>
                    <div className="text-sm text-gray-600">Guarantee Language</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{results.stats.noDisclaimer}</div>
                    <div className="text-sm text-gray-600">Missing Disclaimers</div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Flags by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{results.stats.specificYears}</div>
                    <div className="text-sm text-gray-600">Specific Years</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{results.stats.specificAmounts}</div>
                    <div className="text-sm text-gray-600">Dollar Amounts</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{results.stats.regulations}</div>
                    <div className="text-sm text-gray-600">Regulations</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{results.stats.rates}</div>
                    <div className="text-sm text-gray-600">Rates/Percentages</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{results.stats.taxInfo}</div>
                    <div className="text-sm text-gray-600">Tax Information</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{results.stats.benefits}</div>
                    <div className="text-sm text-gray-600">Benefits Info</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{results.stats.oldContent}</div>
                    <div className="text-sm text-gray-600">Old Content</div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {results.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Recommendations</h2>
                  <div className="space-y-4">
                    {results.recommendations.map((rec, i) => (
                      <div key={i} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                          <span className="font-bold text-gray-900">{rec.category}</span>
                          <span className="text-sm text-gray-600">({rec.count} blocks)</span>
                        </div>
                        <p className="text-gray-700">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Flagged Blocks */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🚨 Top 30 Blocks Requiring Attention
                </h2>
                <div className="space-y-4">
                  {results.flagged.slice(0, 30).map((block, i) => (
                    <div key={block.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">
                            {i + 1}. {block.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">{block.domain}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-600">Rating: {block.rating}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{block.flags.length} flags</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm font-mono text-gray-500">Priority: {block.priorityScore}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-3">
                        {block.flags.map((flag, j) => (
                          <div key={j} className={`text-sm border rounded p-2 ${getSeverityColor(flag.severity)}`}>
                            <div className="font-semibold mb-1">
                              {flag.severity.toUpperCase()}: {flag.type.replace(/_/g, ' ')}
                              {flag.count && ` (${flag.count} instances)`}
                              {flag.monthsOld && ` (${flag.monthsOld} months old)`}
                            </div>
                            {flag.samples && (
                              <div className="text-xs mb-1 opacity-75">
                                Examples: {flag.samples}
                              </div>
                            )}
                            <div className="text-xs">
                              → {flag.recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Results</h2>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `content-audit-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  📥 Download Full Report (JSON)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
}

