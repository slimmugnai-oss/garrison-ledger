/**
 * ADMIN FEEDS MANAGEMENT
 * 
 * Manage dynamic data feeds:
 * - View feed status (BAH, COLA, IRS, TSP, TRICARE)
 * - Manual refresh
 * - Upload CSV data
 * - View as-of dates
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';

export default async function FeedsManagementPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get feed statuses
  const { data: feeds } = await supabase
    .from('dynamic_feeds')
    .select('*')
    .order('source_key');

  // Calculate staleness
  const now = Date.now();
  const feedsWithStatus = feeds?.map(feed => {
    const lastRefresh = feed.last_refresh_at 
      ? new Date(feed.last_refresh_at).getTime()
      : null;

    const isStale = lastRefresh 
      ? (now - lastRefresh) > (feed.ttl_seconds * 1000)
      : true;

    const hoursSinceRefresh = lastRefresh
      ? Math.floor((now - lastRefresh) / (1000 * 60 * 60))
      : null;

    return {
      ...feed,
      isStale,
      hoursSinceRefresh,
      ttlHours: Math.floor(feed.ttl_seconds / 3600)
    };
  }) || [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 font-lora mb-3">
              Data Feeds Management
            </h1>
            <p className="text-lg text-gray-600">
              Monitor and refresh dynamic data sources
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Feeds</p>
                  <p className="text-3xl font-bold text-gray-900">{feedsWithStatus.length}</p>
                </div>
                <Icon name="BarChart" className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Up to Date</p>
                  <p className="text-3xl font-bold text-green-600">
                    {feedsWithStatus.filter(f => !f.isStale && f.status === 'ok').length}
                  </p>
                </div>
                <Icon name="CheckCircle" className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Needs Refresh</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {feedsWithStatus.filter(f => f.isStale || f.status === 'error').length}
                  </p>
                </div>
                <Icon name="AlertTriangle" className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Feeds List */}
          <div className="space-y-4">
            {feedsWithStatus.map(feed => (
              <div key={feed.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  {/* Feed Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {feed.source_key}
                      </h3>
                      <Badge
                        variant={
                          feed.status === 'ok' && !feed.isStale ? 'success' :
                          feed.status === 'error' ? 'danger' :
                          'warning'
                        }
                      >
                        {feed.isStale ? 'Stale' : feed.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Last Refresh</p>
                        <p className="font-medium text-gray-900">
                          {feed.hoursSinceRefresh !== null
                            ? `${feed.hoursSinceRefresh}h ago`
                            : 'Never'}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 mb-1">TTL</p>
                        <p className="font-medium text-gray-900">
                          {feed.ttlHours}h
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 mb-1">Status</p>
                        <p className="font-medium text-gray-900">
                          {feed.notes || 'No notes'}
                        </p>
                      </div>
                    </div>

                    {feed.error_message && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Error:</strong> {feed.error_message}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2">
                    <form action="/api/feeds/refresh" method="get">
                      <input type="hidden" name="source" value={feed.source_key} />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm whitespace-nowrap"
                      >
                        Refresh Now
                      </button>
                    </form>

                    {['BAH', 'COLA'].includes(feed.source_key) && (
                      <button
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
                      >
                        Upload CSV
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Icon name="Info" className="w-5 h-5" />
              Feed Management Guide
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li><strong>BAH/COLA:</strong> Upload CSV from DFAS annually (January)</li>
              <li><strong>IRS/TSP:</strong> Update admin_constants when IRS publishes limits (November)</li>
              <li><strong>TRICARE:</strong> Update admin_constants when costs change (January)</li>
              <li><strong>BAS:</strong> Auto-sourced from SSOT - update lib/ssot.ts when DFAS publishes</li>
              <li><strong>Automatic Refresh:</strong> Vercel Cron runs daily (BAH/COLA), weekly (TRICARE/BAS)</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

