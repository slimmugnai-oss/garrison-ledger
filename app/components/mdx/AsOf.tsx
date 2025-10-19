/**
 * AS-OF COMPONENT
 * 
 * Shows provenance and "as of" date for dynamic data
 * Server component - displays data freshness
 */

import type { SourceKey } from '@/lib/dynamic/types';
import { getProvenance } from '@/lib/dynamic/registry';
import Icon from '../ui/Icon';

interface AsOfProps {
  source: SourceKey;
  inline?: boolean;  // Display inline vs block
}

export default function AsOf({ source, inline = false }: AsOfProps) {
  const provenance = getProvenance(source);

  if (inline) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
        <Icon name="Calendar" className="w-3 h-3" />
        <span>Source: {provenance.sourceName}</span>
        <span className="text-gray-400">•</span>
        <span>Updated {provenance.updateFrequency}</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 my-4">
      <Icon name="Info" className="w-4 h-4 text-gray-500 flex-shrink-0" />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-medium">Data Source:</span>
        {provenance.sourceUrl ? (
          <a 
            href={provenance.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            {provenance.sourceName}
          </a>
        ) : (
          <span>{provenance.sourceName}</span>
        )}
        <span className="text-gray-400">•</span>
        <span className="text-gray-600">Updates {provenance.updateFrequency.toLowerCase()}</span>
      </div>
    </div>
  );
}

