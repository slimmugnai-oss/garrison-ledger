'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';

interface FeedItem {
  id: string;
  source_id: string;
  url: string;
  title: string;
  summary: string;
  raw_html: string;
  tags: string[];
  status: string;
  published_at: string;
}

export default function ContentReviewPage() {
  const [pendingItems, setPendingItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [triaging, setTriaging] = useState<string | null>(null);
  const [converting, setConverting] = useState<string | null>(null);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      setLoading(true);
      // Load feed items that need review or are approved
      const response = await fetch('/api/admin/content-pending');
      if (response.ok) {
        const data = await response.json();
        setPendingItems(data.items || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const triageItem = async (itemId: string) => {
    setTriaging(itemId);
    try {
      const response = await fetch('/api/enrich/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedItemId: itemId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Score: ${data.score}/10\nRecommendation: ${data.recommendation}`);
        loadPendingItems(); // Refresh list
      }
    } catch {
      alert('Failed to triage item');
    } finally {
      setTriaging(null);
    }
  };

  const convertItem = async (itemId: string) => {
    if (!confirm('Convert this item to a content block? This will add it to the Intelligence Library.')) {
      return;
    }
    
    setConverting(itemId);
    try {
      // First triage if not already done
      const triageResponse = await fetch('/api/enrich/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedItemId: itemId }),
      });
      
      if (!triageResponse.ok) {
        throw new Error('Triage failed');
      }
      
      const triageData = await triageResponse.json();
      
      // Then convert
      const convertResponse = await fetch('/api/enrich/convert', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_SECRET || ''}`,
        },
        body: JSON.stringify({ 
          feedItemId: itemId,
          enrichment: triageData.enrichment,
        }),
      });
      
      if (convertResponse.ok) {
        alert('Successfully converted to content block!');
        loadPendingItems(); // Refresh list
      }
    } catch {
      alert('Failed to convert item');
    } finally {
      setConverting(null);
    }
  };

  const rejectItem = async (itemId: string) => {
    if (!confirm('Mark this item as news only (not suitable for conversion)?')) {
      return;
    }
    
    try {
      await fetch(`/api/admin/content-reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedItemId: itemId }),
      });
      loadPendingItems();
    } catch {
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-surface-hover dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="CheckCircle" className="h-8 w-8 text-info dark:text-info" />
                  <h1 className="text-4xl font-bold text-primary dark:text-white font-serif">
                    Content Review Queue
                  </h1>
                </div>
                <p className="text-body dark:text-muted">
                  Review AI-triaged content and approve conversions to Intelligence Library
                </p>
              </div>
              <button
                onClick={loadPendingItems}
                className="inline-flex items-center gap-2 px-4 py-2 bg-info hover:bg-info dark:bg-info dark:hover:bg-info text-white rounded-lg font-semibold transition-colors"
              >
                <Icon name="RefreshCw" className="h-5 w-5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AnimatedCard delay={0}>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                <div className="text-sm text-body dark:text-muted mb-1">Pending Review</div>
                <div className="text-3xl font-black text-primary dark:text-white">
                  {pendingItems.filter(i => i.status === 'needs_review').length}
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={50}>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                <div className="text-sm text-body dark:text-muted mb-1">Approved (Score ≥8)</div>
                <div className="text-3xl font-black text-success dark:text-green-400">
                  {pendingItems.filter(i => i.status === 'approved_for_conversion').length}
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={100}>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                <div className="text-sm text-body dark:text-muted mb-1">New (Unscored)</div>
                <div className="text-3xl font-black text-info dark:text-info">
                  {pendingItems.filter(i => i.status === 'new').length}
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Items List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-4 text-body dark:text-muted">Loading items...</p>
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="bg-surface dark:bg-slate-800 rounded-xl p-12 text-center border border-subtle dark:border-slate-600">
              <Icon name="CheckCircle" className="h-16 w-16 text-success dark:text-green-400 mx-auto mb-4" />
              <p className="text-body dark:text-muted text-lg">
                No items to review. Run /api/enrich/batch to process new feed items.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingItems.map((item) => (
                <AnimatedCard key={item.id} delay={0}>
                  <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={
                            item.status === 'approved_for_conversion' ? 'success' :
                            item.status === 'needs_review' ? 'warning' :
                            'secondary'
                          }>
                            {item.status.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted dark:text-muted">
                            {new Date(item.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-primary dark:text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-body dark:text-muted mb-3">
                          {item.summary}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-surface-hover dark:bg-slate-700 text-body dark:text-muted text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-info dark:text-info hover:underline"
                        >
                          View Original →
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-subtle dark:border-slate-700">
                      <button
                        onClick={() => triageItem(item.id)}
                        disabled={!!triaging}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-info hover:bg-info dark:bg-info dark:hover:bg-info text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        {triaging === item.id ? (
                          <>
                            <Icon name="RefreshCw" className="h-4 w-4 animate-spin" />
                            Scoring...
                          </>
                        ) : (
                          <>
                            <Icon name="Sparkles" className="h-4 w-4" />
                            AI Score
                          </>
                        )}
                      </button>
                      
                      {item.status === 'approved_for_conversion' && (
                        <button
                          onClick={() => convertItem(item.id)}
                          disabled={!!converting}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-success hover:bg-success dark:bg-success dark:hover:bg-success text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                          {converting === item.id ? (
                            <>
                              <Icon name="RefreshCw" className="h-4 w-4 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            <>
                              <Icon name="CheckCircle" className="h-4 w-4" />
                              Convert to Block
                            </>
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => rejectItem(item.id)}
                        className="px-4 py-2 bg-danger hover:bg-danger dark:bg-danger dark:hover:bg-danger text-white rounded-lg font-semibold transition-colors"
                      >
                        <Icon name="X" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

