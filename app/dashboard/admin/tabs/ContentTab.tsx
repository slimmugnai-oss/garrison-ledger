'use client';

import { useState, useEffect } from 'react';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import DataTable, { Column } from '../components/DataTable';

interface ContentBlock {
  id: string;
  title: string;
  domain: string | null;
  status: string;
  content_rating: number | null;
  last_reviewed_at: string | null;
  view_count: number | null;
  created_at: string;
}

export default function ContentTab() {
  const [activeSubTab, setActiveSubTab] = useState('blocks');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'blocks', label: '📚 Content Blocks' },
            { id: 'listening-post', label: '📰 Feed Items' },
            { id: 'submissions', label: '✍️ User Submissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors
                ${activeSubTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-body hover:border-border'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === 'blocks' && <ContentBlocksSubTab />}
      {activeSubTab === 'listening-post' && <ListeningPostSubTab />}
      {activeSubTab === 'submissions' && <UserSubmissionsSubTab />}
    </div>
  );
}

function ContentBlocksSubTab() {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    byDomain: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    loadContentBlocks();
  }, [statusFilter, domainFilter]);

  const loadContentBlocks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        domain: domainFilter,
      });

      const res = await fetch(`/api/admin/content-blocks?${params}`);
      if (!res.ok) throw new Error('Failed to load content blocks');

      const data = await res.json();
      setContentBlocks(data.blocks);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading content blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<ContentBlock>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (block) => (
        <span className="font-semibold text-sm">{block.title}</span>
      ),
    },
    {
      key: 'domain',
      header: 'Domain',
      sortable: true,
      render: (block) => (
        <span className="text-sm capitalize">{block.domain || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (block) => (
        <Badge variant={block.status === 'published' ? 'success' : 'secondary'} size="sm">
          {block.status}
        </Badge>
      ),
    },
    {
      key: 'content_rating',
      header: 'Quality',
      render: (block) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              name="Star"
              className={`h-3 w-3 ${
                i < (block.content_rating || 0) ? 'text-amber-500' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'view_count',
      header: 'Views',
      sortable: true,
      render: (block) => (
        <span className="text-sm font-semibold">{block.view_count || 0}</span>
      ),
    },
    {
      key: 'last_reviewed_at',
      header: 'Last Reviewed',
      render: (block) => (
        <span className="text-sm text-text-muted">
          {block.last_reviewed_at
            ? new Date(block.last_reviewed_at).toLocaleDateString()
            : 'Never'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-700 font-semibold">Total Blocks</div>
            <div className="text-3xl font-black text-blue-900">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 font-semibold">Active</div>
            <div className="text-3xl font-black text-green-900">{stats.byStatus.active || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-4">
            <div className="text-sm text-amber-700 font-semibold">Draft</div>
            <div className="text-3xl font-black text-amber-900">{stats.byStatus.draft || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-700 font-semibold">Deprecated</div>
            <div className="text-3xl font-black text-gray-900">{stats.byStatus.deprecated || 0}</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="needs_review">Needs Review</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Domains</option>
          <option value="finance">Finance</option>
          <option value="pcs">PCS</option>
          <option value="career">Career</option>
          <option value="deployment">Deployment</option>
          <option value="lifestyle">Lifestyle</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-text-muted">Loading content blocks...</p>
        </div>
      ) : (
        <DataTable
          data={contentBlocks}
          columns={columns}
          keyExtractor={(block) => block.id}
          searchPlaceholder="Search content..."
          rowActions={[
            {
              label: 'Edit',
              icon: 'Edit',
              onClick: (block) => alert(`Edit ${block.title}`),
            },
          ]}
          emptyMessage="No content blocks found. Content blocks management API coming soon."
        />
      )}
    </div>
  );
}

function ListeningPostSubTab() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<{ processed: number; new: number } | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/listening-post/refresh', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to refresh feeds');

      const data = await res.json();
      setLastRefresh(new Date().toLocaleString());
      setRefreshResult({ processed: data.processed || 0, new: data.new || 0 });
    } catch (error) {
      console.error('Error refreshing feeds:', error);
      alert('Failed to refresh feeds. Check console for details.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AnimatedCard className="bg-card border border-border p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <Icon name="Radio" className="h-12 w-12 text-primary" />
          <div>
            <h3 className="text-2xl font-bold text-text-headings mb-2">Feed Items (RSS Articles)</h3>
            <p className="text-text-muted">
              RSS articles from military news sources. For content block curation, visit{' '}
              <a href="/dashboard/admin/briefing" className="text-primary hover:underline font-semibold">
                Intelligence Briefing Pipeline
              </a>
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Icon name="RefreshCw" className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Feeds'}
        </button>
      </div>

      {lastRefresh && refreshResult && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-900">
            ✅ Last refresh: {lastRefresh} - Processed {refreshResult.processed} items, {refreshResult.new} new
          </p>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Current Listening Post Features:</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-blue-600" />
            RSS feed ingestion from military news sources
          </li>
          <li className="flex items-center gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-blue-600" />
            AI-powered content curation with Gemini
          </li>
          <li className="flex items-center gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-blue-600" />
            Manual review and editing workflow
          </li>
          <li className="flex items-center gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-blue-600" />
            Promote to content blocks with metadata
          </li>
        </ul>

        <a
          href="/dashboard/admin/briefing"
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
        >
          Open Listening Post →
        </a>
      </div>
    </AnimatedCard>
  );
}

function UserSubmissionsSubTab() {
  return (
    <AnimatedCard className="bg-card border border-border p-12 text-center">
      <div className="text-6xl mb-4">✍️</div>
      <h3 className="text-2xl font-bold text-text-headings mb-2">User Submissions Coming Soon</h3>
      <p className="text-text-muted max-w-md mx-auto">
        User-submitted tips, corrections, and suggestions moderation queue will be available here.
      </p>
    </AnimatedCard>
  );
}
