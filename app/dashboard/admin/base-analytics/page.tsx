import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import Icon from "@/app/components/ui/Icon";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_USER_IDS = ["user_2pjPs1dGeRGZ8укJM9X9pY3DGqL", "user_343xVqjkdILtBkaYAJfE5H8Wq0q"];

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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Icon name="BarChart" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-serif font-black text-gray-900">Base Guide Analytics</h1>
                <p className="text-lg text-gray-600 mt-1">Track user interactions, popular bases, and search patterns</p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <Icon name="BarChart" className="h-8 w-8 text-blue-500" />
                <span className="text-3xl font-black text-gray-900">{totalEventsCount || 0}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Total Events (30d)</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Users" className="h-8 w-8 text-emerald-500" />
                <span className="text-3xl font-black text-gray-900">{uniqueUserCount}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Unique Users</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Search" className="h-8 w-8 text-purple-500" />
                <span className="text-3xl font-black text-gray-900">{popularSearches?.length || 0}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Search Queries</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between mb-2">
                <Icon name="MapPin" className="h-8 w-8 text-amber-500" />
                <span className="text-3xl font-black text-gray-900">{mostViewed?.length || 0}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Bases Viewed</p>
            </div>
          </div>

          {/* Most Viewed Bases */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icon name="TrendingUp" className="h-6 w-6 text-emerald-600" />
              Most Viewed Bases (Last 30 Days)
            </h2>
            
            {mostViewed && mostViewed.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Base Name</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Total Views</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Unique Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mostViewed.map((base: any, idx: number) => (
                      <tr key={base.base_id} className="hover:bg-gray-50">
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
                        <td className="px-4 py-3 font-medium text-gray-900">{base.base_name}</td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600">{base.view_count}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{base.unique_users}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available yet</p>
            )}
          </div>

          {/* Popular Search Terms */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icon name="Search" className="h-6 w-6 text-purple-600" />
              Popular Search Terms
            </h2>
            
            {popularSearches && popularSearches.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {popularSearches.map((search: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-900">&quot;{search.search_query}&quot;</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">{search.search_count}</div>
                      <div className="text-xs text-gray-500">{search.avg_results_count} avg results</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No searches yet</p>
            )}
          </div>

          {/* Filter Usage Stats */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icon name="Settings" className="h-6 w-6 text-blue-600" />
              Filter Usage Statistics
            </h2>
            
            {filterStats && filterStats.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-700 mb-3">Branch Filters</h3>
                  <div className="space-y-2">
                    {filterStats
                      .filter((stat: any) => stat.filter_type === 'branch')
                      .map((stat: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                          <span className="font-medium text-gray-900">{stat.filter_value}</span>
                          <span className="font-bold text-blue-600">{stat.usage_count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No filter data yet</p>
            )}
          </div>

          {/* Guide Clickthrough Rates */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icon name="ExternalLink" className="h-6 w-6 text-green-600" />
              Guide Clickthrough Rates
            </h2>
            
            {clickthroughRates && clickthroughRates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Base Name</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Views</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Clickthroughs</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">CTR %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clickthroughRates.map((base: any) => (
                      <tr key={base.base_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{base.base_name}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{base.views}</td>
                        <td className="px-4 py-3 text-right text-blue-600 font-semibold">{base.clickthroughs}</td>
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
              <p className="text-gray-500 text-center py-8">No clickthrough data yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

