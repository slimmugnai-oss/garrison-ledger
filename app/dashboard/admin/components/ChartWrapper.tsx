'use client';

import { ReactNode } from 'react';

import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  loading?: boolean;
  error?: string;
  actions?: ReactNode;
  delay?: number;
}

export default function ChartWrapper({
  title,
  subtitle,
  children,
  loading = false,
  error,
  actions,
  delay = 0,
}: ChartWrapperProps) {
  return (
    <AnimatedCard delay={delay} className="bg-card border border-border p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-headings">{title}</h3>
          {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin">
              <Icon name="Activity" className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-text-muted">Loading chart data...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 text-center max-w-md">
            <Icon name="AlertCircle" className="h-8 w-8 text-danger" />
            <div>
              <p className="text-sm font-semibold text-text-headings mb-1">Failed to load chart</p>
              <p className="text-sm text-text-muted">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="w-full">
          {children}
        </div>
      )}
    </AnimatedCard>
  );
}

