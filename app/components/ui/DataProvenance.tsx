/**
 * DATA PROVENANCE COMPONENT
 * 
 * Shows data source, last verified date, cache TTL, and confidence level
 * Military audience needs to trust the data - this builds that trust
 */

import Icon from './Icon';

interface DataProvenanceProps {
  source: string;
  lastVerified: string;
  cacheTTL?: string;
  confidence: 'high' | 'medium' | 'low';
  link?: string;
  className?: string;
}

export default function DataProvenance({
  source,
  lastVerified,
  cacheTTL = '24 hours',
  confidence,
  link,
  className = ''
}: DataProvenanceProps) {
  const confidenceColors = {
    high: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-red-600 bg-red-50 border-red-200'
  };

  const confidenceIcons = {
    high: 'CheckCircle',
    medium: 'AlertTriangle',
    low: 'AlertCircle'
  };

  return (
    <div className={`rounded-lg border p-3 text-xs ${confidenceColors[confidence]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={confidenceIcons[confidence]} className="h-4 w-4" />
          <span className="font-medium">Data Source:</span>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              {source}
            </a>
          ) : (
            <span>{source}</span>
          )}
        </div>
        <div className="text-right">
          <div>Updated {lastVerified}</div>
          <div className="text-gray-500">Cache: {cacheTTL}</div>
        </div>
      </div>
    </div>
  );
}
