'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import { formatMonthYear, centsToDoollars } from '@/app/types/les';
import type { LesHistoryItem } from '@/app/types/les';

interface Props {
  tier: string;
  isPremium: boolean;
  uploads: Array<{
    id: string;
    month: number;
    year: number;
    uploaded_at: string;
    parsed_ok: boolean;
  }>;
}

export default function LesHistory({ tier, isPremium, uploads }: Props) {
  const [historyData, setHistoryData] = useState<LesHistoryItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/les/history');
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data.uploads);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-lg border bg-white p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!historyData || historyData.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <Icon name="File" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="font-semibold text-gray-900 mb-2">No LES Uploads Yet</h3>
        <p className="text-sm text-gray-600">
          Upload your first LES PDF to start tracking pay discrepancies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {historyData.map(item => (
        <HistoryCard key={item.id} item={item} tier={tier} />
      ))}
    </div>
  );
}

// History Card Component
function HistoryCard({ item, tier }: { item: LesHistoryItem; tier: string }) {
  const hasFlags = item.flagCounts.red > 0 || item.flagCounts.yellow > 0 || item.flagCounts.green > 0;
  const totalFlags = item.flagCounts.red + item.flagCounts.yellow + item.flagCounts.green;
  const uploadDate = new Date(item.uploadedAt);

  return (
    <div className="rounded-lg border bg-white p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">
            {formatMonthYear(item.month, item.year)}
          </h3>
          <p className="text-sm text-gray-600">
            Uploaded {uploadDate.toLocaleDateString()}
          </p>
        </div>
        {!item.parsedOk && (
          <Badge variant="danger">Parse Failed</Badge>
        )}
      </div>

      {item.parsedOk && hasFlags && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Red Flags */}
          {item.flagCounts.red > 0 && (
            <div className="flex items-center gap-2">
              <Icon name="AlertCircle" className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-xl font-bold text-red-600">{item.flagCounts.red}</div>
                <div className="text-xs text-gray-600">Critical</div>
              </div>
            </div>
          )}

          {/* Yellow Flags */}
          {item.flagCounts.yellow > 0 && (
            <div className="flex items-center gap-2">
              <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600" />
              <div>
                <div className="text-xl font-bold text-amber-600">{item.flagCounts.yellow}</div>
                <div className="text-xs text-gray-600">Warnings</div>
              </div>
            </div>
          )}

          {/* Green Flags */}
          {item.flagCounts.green > 0 && (
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-xl font-bold text-green-600">{item.flagCounts.green}</div>
                <div className="text-xs text-gray-600">Verified</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total Delta */}
      {item.totalDeltaCents !== 0 && (
        <div className="mb-4 pt-4 border-t">
          <div className="text-sm text-gray-600 mb-1">Variance Detected</div>
          <div className={`text-lg font-bold ${item.totalDeltaCents > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {item.totalDeltaCents > 0 ? '+' : ''}{centsToDoollars(item.totalDeltaCents)}
            <span className="text-sm font-normal text-gray-600 ml-2">
              {item.totalDeltaCents > 0 ? '(underpaid)' : '(overpaid)'}
            </span>
          </div>
        </div>
      )}

      {/* View Details Button */}
      {item.parsedOk && hasFlags && (
        <button
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Icon name="ArrowRight" className="h-4 w-4" />
          View Details
        </button>
      )}

      {/* Parse Failed State */}
      {!item.parsedOk && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">
            This LES could not be parsed. Try re-uploading or contact support if the issue persists.
          </p>
        </div>
      )}
    </div>
  );
}

