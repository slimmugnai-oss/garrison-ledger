'use client';

import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';

export default function UsersTab() {
  return (
    <div className="space-y-8">
      <AnimatedCard className="bg-card border border-border p-12 text-center">
        <Icon name="Users" className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
        <h3 className="text-2xl font-bold text-text-headings mb-2">Users Tab Coming Soon</h3>
        <p className="text-text-muted max-w-md mx-auto">
          Advanced user management with search, filters, bulk actions, and detailed user profiles will be available here.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="px-3 py-1 bg-surface-hover border border-border rounded text-sm text-text-body">
            🔍 Advanced Search
          </span>
          <span className="px-3 py-1 bg-surface-hover border border-border rounded text-sm text-text-body">
            ⚡ Bulk Actions
          </span>
          <span className="px-3 py-1 bg-surface-hover border border-border rounded text-sm text-text-body">
            👤 User Details
          </span>
          <span className="px-3 py-1 bg-surface-hover border border-border rounded text-sm text-text-body">
            🎫 Tier Management
          </span>
        </div>
      </AnimatedCard>
    </div>
  );
}

