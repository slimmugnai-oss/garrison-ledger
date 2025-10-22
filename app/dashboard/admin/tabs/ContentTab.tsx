'use client';

import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';

export default function ContentTab() {
  return (
    <div className="space-y-8">
      <AnimatedCard className="bg-card border border-border p-12 text-center">
        <Icon name="BookOpen" className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
        <h3 className="text-2xl font-bold text-text-headings mb-2">Content Tab Coming Soon</h3>
        <p className="text-text-muted max-w-md mx-auto">
          Content curation, Listening Post integration, and moderation queue will be available here.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="px-3 py-1 bg-surface-hover border border-border rounded text-sm text-text-body">
            📡 Listening Post
          </span>
          <span className="px-3 py-1 bg-surface-hover border border-border rounded text-sm text-text-body">
            📚 Content Blocks
          </span>
          <span className="px-3 py-1 bg-surface-hover border border-border rounded text-sm text-text-body">
            ✍️ User Submissions
          </span>
          <span className="px-3 py-1 bg-surface-hover border border-border rounded text-sm text-text-body">
            ⭐ Quality Scoring
          </span>
        </div>
      </AnimatedCard>
    </div>
  );
}

