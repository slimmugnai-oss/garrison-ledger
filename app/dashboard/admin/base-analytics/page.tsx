import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Header from "@/app/components/Header";
import Icon from "@/app/components/ui/Icon";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_USER_IDS = ["user_2pjPs1dGeRGZ8укJM9X9pY3DGqL", "user_343xVqjkdILtBkaYAJfE5H8Wq0q"];

/**
 * Base Analytics Types
 */
interface MostViewedBase {
  base_id: string;
  base_name: string;
  view_count: number;
  unique_users: number;
}

interface PopularSearch {
  search_query: string;
  search_count: number;
  avg_results_count: number;
}

interface FilterStat {
  filter_type: string;
  filter_value: string;
  usage_count: number;
}

interface ClickthroughRate {
  base_id: string;
  base_name: string;
  views: number;
  clickthroughs: number;
  ctr: number;
  ctr_percentage: string;
}

export default async function BaseAnalyticsPage() {
  const { userId } = await auth();
  
  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    redirect("/dashboard");
  }

  // Fetch analytics data
  const { data: mostViewed } = await supabaseAdmin.rpc('get_most_viewed_bases', { days_back: 30, limit_count: 10 });
  const { data: popularSearches } = await supabaseAdmin.rpc('get_popular_searches', { days_back: 30, limit_count: 15 });
  const { data: filterStats } = await supabaseAdmin.rpc('get_filter_usage_stats', { days_back: 30 });
  const { data: clickthroughRates } = await supabaseAdmin.rpc('get_guide_clickthrough_rates', { days_back: 30 });

  // Calculate summary stats
  const { count: totalEventsCount } = await supabaseAdmin
    .from('base_guide_analytics')
    .select('*', { count: 'exact', head: true });

  const { data: uniqueUsers } = await supabaseAdmin
    .from('base_guide_analytics')
    .select('user_id')
    .not('user_id', 'is', null);

  const uniqueUserCount = new Set(uniqueUsers?.map(u => u.user_id)).size;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-surface-hover py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                <Icon name="BarChart" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-serif font-black text-primary">Base Guide Analytics</h1>
                <p className="text-lg text-body mt-1">Track user interactions, popular bases, and search patterns</p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-surface rounded-xl shadow-md p-6 border-l-4 border-info">
              <div className="flex items-center justify-between mb-2">
                <Icon name="BarChart" className="h-8 w-8 text-info" />
                <span className="text-3xl font-black text-primary">{totalEventsCount || 0}</span>
              </div>
              <p className="text-sm font-medium text-body">Total Events (30d)</p>
            </div>

            <div className="bg-surface rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Users" className="h-8 w-8 text-emerald-500" />
                <span className="text-3xl font-black text-primary">{uniqueUserCount}</span>
              </div>
              <p className="text-sm font-medium text-body">Unique Users</p>
            </div>

            <div className="bg-surface rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Search" className="h-8 w-8 text-purple-500" />
                <span className="text-3xl font-black text-primary">{popularSearches?.length || 0}</span>
              </div>
              <p className="text-sm font-medium text-body">Search Queries</p>
            </div>

            <div className="bg-surface rounded-xl shadow-md p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between mb-2">
                <Icon name="MapPin" className="h-8 w-8 text-amber-500" />
                <span className="text-3xl font-black text-primary">{mostViewed?.length || 0}</span>
              </div>
              <p className="text-sm font-medium text-body">Bases Viewed</p>
            </div>
          </div>

          {/* Most Viewed Bases */}
          <div className="bg-surface rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <Icon name="TrendingUp" className="h-6 w-6 text-emerald-600" />
              Most Viewed Bases (Last 30 Days)
            </h2>
            
            {mostViewed && mostViewed.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-hover border-b-2 border-subtle">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-body">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-body">Base Name</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-body">Total Views</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-body">Unique Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mostViewed.map((base: MostViewedBase, idx: number) => (
                      <tr key={base.base_id} className="hover:bg-surface-hover">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                            idx === 1 ? 'bg-gray-100 text-gray-700' :
                            idx === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-primary">{base.base_name}</td>
                        <td className="px-4 py-3 text-right font-bold text-info">{base.view_count}</td>
                        <td className="px-4 py-3 text-right text-body">{base.unique_users}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center py-8">No data available yet</p>
            )}
          </div>

          {/* Popular Search Terms */}
          <div className="bg-surface rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <Icon name="Search" className="h-6 w-6 text-purple-600" />
              Popular Search Terms
            </h2>
            
            {popularSearches && popularSearches.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {popularSearches.map((search: PopularSearch, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-surface-hover rounded-lg p-4 border border-subtle">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-primary">&quot;{search.search_query}&quot;</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">{search.search_count}</div>
                      <div className="text-xs text-muted">{search.avg_results_count} avg results</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-8">No searches yet</p>
            )}
          </div>

          {/* Filter Usage Stats */}
          <div className="bg-surface rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <Icon name="Settings" className="h-6 w-6 text-info" />
              Filter Usage Statistics
            </h2>
            
            {filterStats && filterStats.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-body mb-3">Branch Filters</h3>
                  <div className="space-y-2">
                    {filterStats
                      .filter((stat: FilterStat) => stat.filter_type === 'branch')
                      .map((stat: FilterStat, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-info-subtle rounded-lg p-3">
                          <span className="font-medium text-primary">{stat.filter_value}</span>
                          <span className="font-bold text-info">{stat.usage_count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted text-center py-8">No filter data yet</p>
            )}
          </div>

          {/* Guide Clickthrough Rates */}
          <div className="bg-surface rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <Icon name="ExternalLink" className="h-6 w-6 text-success" />
              Guide Clickthrough Rates
            </h2>
            
            {clickthroughRates && clickthroughRates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-hover border-b-2 border-subtle">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-body">Base Name</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-body">Views</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-body">Clickthroughs</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-body">CTR %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clickthroughRates.map((base: ClickthroughRate) => (
                      <tr key={base.base_id} className="hover:bg-surface-hover">
                        <td className="px-4 py-3 font-medium text-primary">{base.base_name}</td>
                        <td className="px-4 py-3 text-right text-body">{base.views}</td>
                        <td className="px-4 py-3 text-right text-info font-semibold">{base.clickthroughs}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                            parseFloat(base.ctr_percentage) >= 50 ? 'bg-green-100 text-green-800' :
                            parseFloat(base.ctr_percentage) >= 25 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {base.ctr_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center py-8">No clickthrough data yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

