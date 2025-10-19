/**
 * TDY FLAGS VIEW
 * 
 * Displays compliance flags (red/yellow/green)
 */

'use client';

import Icon from '../ui/Icon';
import Badge from '../ui/Badge';
import type { TdyFlag } from '@/app/types/tdy';

interface Props {
  flags: TdyFlag[];
}

export default function TdyFlagsView({ flags }: Props) {
  
  const redFlags = flags.filter(f => f.severity === 'red');
  const yellowFlags = flags.filter(f => f.severity === 'yellow');
  const greenFlags = flags.filter(f => f.severity === 'green');

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Compliance Check</h3>
        <div className="flex gap-3 mt-3">
          {redFlags.length > 0 && (
            <Badge variant="danger">{redFlags.length} Critical</Badge>
          )}
          {yellowFlags.length > 0 && (
            <Badge variant="warning">{yellowFlags.length} Warnings</Badge>
          )}
          {greenFlags.length > 0 && (
            <Badge variant="success">{greenFlags.length} Verified</Badge>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {/* Red Flags */}
        {redFlags.map((flag, i) => (
          <div key={i} className="p-6 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">{flag.flag_code}</h4>
                <p className="text-sm text-red-800 mb-2">{flag.message}</p>
                <p className="text-sm text-red-700">
                  <strong>Fix:</strong> {flag.suggestion}
                </p>
                {flag.ref && (
                  <p className="text-xs text-red-600 mt-2">{flag.ref}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Yellow Flags */}
        {yellowFlags.map((flag, i) => (
          <div key={i} className="p-6 bg-yellow-50 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-1">{flag.flag_code}</h4>
                <p className="text-sm text-yellow-800 mb-2">{flag.message}</p>
                <p className="text-sm text-yellow-700">
                  <strong>Recommendation:</strong> {flag.suggestion}
                </p>
                {flag.ref && (
                  <p className="text-xs text-yellow-600 mt-2">{flag.ref}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Green Flags */}
        {greenFlags.length > 0 && (
          <div className="p-6 bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <Icon name="CheckCircle" className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                No compliance issues detected. Ready to proceed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

