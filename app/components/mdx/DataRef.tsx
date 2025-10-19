/**
 * DATA-REF COMPONENT
 * 
 * Resolves and displays dynamic data values (BAH, BAS, COLA, IRS, TRICARE, etc.)
 * Server component - fetches from providers at render time
 */

import { resolveDataRef } from '@/lib/dynamic/registry';
import type { DataRefParams } from '@/lib/dynamic/types';
import Icon from '../ui/Icon';

type DataRefPropsBase = Omit<DataRefParams, 'source'> & {
  source: DataRefParams['source'];
  fallback?: string;  // Fallback text if data unavailable
  showProvenance?: boolean;  // Show source link inline
};

type DataRefProps = DataRefPropsBase;

export default async function DataRef(props: DataRefProps) {
  const { fallback = 'Unavailable', showProvenance = false, ...refParams } = props;

  try {
    // Resolve data from providers
    const result = await resolveDataRef(refParams);

    if (!result.data) {
      // Data not available - show fallback with explanation
      return (
        <span className="inline-flex items-center gap-1.5 text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-sm">
          <Icon name="AlertCircle" className="w-3.5 h-3.5" />
          <span>{fallback}</span>
          {result.error && (
            <span className="text-xs text-gray-400" title={result.error}>
              ({result.error})
            </span>
          )}
        </span>
      );
    }

    const { displayValue, sourceName, sourceUrl, asOf } = result.data;

    // Render value with optional provenance
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="font-semibold text-gray-900">{displayValue}</span>
        {showProvenance && (
          <>
            <span className="text-xs text-gray-400">•</span>
            {sourceUrl ? (
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                title={`Source: ${sourceName} (as of ${asOf})`}
              >
                {sourceName}
              </a>
            ) : (
              <span className="text-xs text-gray-600" title={`As of ${asOf}`}>
                {sourceName}
              </span>
            )}
          </>
        )}
      </span>
    );

  } catch (error) {
    console.error('[DataRef] Error:', error);
    return (
      <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-0.5 rounded text-sm">
        <Icon name="AlertCircle" className="w-3.5 h-3.5" />
        <span>{fallback}</span>
      </span>
    );
  }
}

