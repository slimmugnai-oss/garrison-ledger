'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';

export interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'data' | 'api' | 'user' | 'revenue' | 'system';
  message: string;
  details?: string;
  dismissible?: boolean;
}

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
}

const severityConfig = {
  critical: {
    icon: 'AlertTriangle' as const,
    bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    iconColor: 'text-red-600',
    badge: 'danger' as const,
  },
  high: {
    icon: 'AlertCircle' as const,
    bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-900',
    iconColor: 'text-orange-600',
    badge: 'warning' as const,
  },
  medium: {
    icon: 'Info' as const,
    bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-600',
    badge: 'warning' as const,
  },
  low: {
    icon: 'Info' as const,
    bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
    badge: 'info' as const,
  },
};

export default function AlertPanel({ alerts, onDismiss }: AlertPanelProps) {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  if (alerts.length === 0) {
    return null;
  }

  const toggleExpand = (alertId: string) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      return next;
    });
  };

  // Sort by severity (critical first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <div className="space-y-3">
      {sortedAlerts.map((alert) => {
        const config = severityConfig[alert.severity];
        const isExpanded = expandedAlerts.has(alert.id);

        return (
          <div
            key={alert.id}
            className={`
              ${config.bgColor} border-2 ${config.borderColor} rounded-lg p-4
              transition-all duration-200
            `}
          >
            <div className="flex items-start gap-3">
              <Icon name={config.icon} className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={config.badge} size="sm">
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold text-text-muted uppercase">
                      {alert.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {alert.details && (
                      <button
                        onClick={() => toggleExpand(alert.id)}
                        className="text-xs font-semibold text-text-muted hover:text-text-body"
                      >
                        {isExpanded ? 'Less' : 'More'}
                      </button>
                    )}
                    {alert.dismissible && onDismiss && (
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="text-text-muted hover:text-text-body"
                        aria-label="Dismiss alert"
                      >
                        <Icon name="X" className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className={`${config.textColor} font-medium mb-2`}>
                  {alert.message}
                </p>

                {isExpanded && alert.details && (
                  <p className="text-sm text-text-body mb-2 p-3 bg-white/50 rounded border border-border">
                    {alert.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

