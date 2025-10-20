'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';

interface ContentAnalytics {
  overview: {
    totalContent: number;
    totalViews: number;
    uniqueViewers: number;
    averageRating: number;
    totalBookmarks: number;
  };
  topContent: Array<{
    id: string;
    title: string;
    domain: string;
    views: number;
    bookmarks: number;
    rating: number;
    conversionRate: number;
  }>;
  domainBreakdown: Array<{
    domain: string;
    contentCount: number;
    totalViews: number;
    averageRating: number;
  }>;
  userEngagement: {
    activeUsers: number;
    averageSessionDuration: number;
    searchQueries: number;
    calculatorLaunches: number;
  };
  trends: {
    viewsGrowth: number;
    bookmarksGrowth: number;
    ratingsGrowth: number;
  };
}

export default function IntelAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      // Simulated data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalytics({
        overview: {
          totalContent: 410,
          totalViews: 12547,
          uniqueViewers: 3421,
          averageRating: 4.6,
          totalBookmarks: 1847
        },
        topContent: [
          {
            id: 'block-1',
            title: 'PCS Financial Planning Masterclass',
            domain: 'pcs',
            views: 1245,
            bookmarks: 234,
            rating: 4.8,
            conversionRate: 42.5
          },
          {
            id: 'block-2',
            title: 'TSP Investment Strategy Guide',
            domain: 'retirement',
            views: 1134,
            bookmarks: 198,
            rating: 4.7,
            conversionRate: 38.2
          },
          {
            id: 'block-3',
            title: 'Deployment Financial Readiness Checklist',
            domain: 'deployment',
            views: 987,
            bookmarks: 176,
            rating: 4.9,
            conversionRate: 45.8
          }
        ],
        domainBreakdown: [
          { domain: 'Finance', contentCount: 127, totalViews: 4521, averageRating: 4.5 },
          { domain: 'PCS', contentCount: 89, totalViews: 3234, averageRating: 4.6 },
          { domain: 'Retirement', contentCount: 76, totalViews: 2987, averageRating: 4.7 },
          { domain: 'Deployment', contentCount: 54, totalViews: 1805, averageRating: 4.8 }
        ],
        userEngagement: {
          activeUsers: 856,
          averageSessionDuration: 8.4,
          searchQueries: 2341,
          calculatorLaunches: 987
        },
        trends: {
          viewsGrowth: 15.3,
          bookmarksGrowth: 22.7,
          ratingsGrowth: 18.9
        }
      });
    } catch (error) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !analytics) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-body">Loading analytics...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-4xl font-black tracking-tight text-primary mb-2">
                  📊 Intel Library Analytics
                </h1>
                <p className="text-body text-lg">
                  Content performance, user engagement, and growth metrics
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Time Range Selector */}
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Last Year</option>
                </select>

                {/* Refresh Button */}
                <button
                  onClick={fetchAnalytics}
                  disabled={refreshing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Icon name={refreshing ? "Loader" : "RefreshCw"} className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <AnimatedCard delay={0} className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Content</span>
                <Icon name="File" className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-primary">{analytics?.overview.totalContent}</div>
              <div className="text-sm text-gray-500 mt-1">Content blocks</div>
            </AnimatedCard>

            <AnimatedCard delay={50} className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Views</span>
                <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-primary">{analytics?.overview.totalViews.toLocaleString()}</div>
              <div className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <Icon name="TrendingUp" className="h-3 w-3" />
                +{analytics?.trends.viewsGrowth}% vs prev period
              </div>
            </AnimatedCard>

            <AnimatedCard delay={100} className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Unique Viewers</span>
                <Icon name="User" className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-primary">{analytics?.overview.uniqueViewers.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">Active users</div>
            </AnimatedCard>

            <AnimatedCard delay={150} className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Rating</span>
                <Icon name="Star" className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-primary">{analytics?.overview.averageRating}</div>
              <div className="text-sm text-gray-500 mt-1">Out of 5.0</div>
            </AnimatedCard>

            <AnimatedCard delay={200} className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Bookmarks</span>
                <Icon name="BookOpen" className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-primary">{analytics?.overview.totalBookmarks.toLocaleString()}</div>
              <div className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <Icon name="TrendingUp" className="h-3 w-3" />
                +{analytics?.trends.bookmarksGrowth}% vs prev period
              </div>
            </AnimatedCard>
          </div>

          {/* Top Content & Domain Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Content */}
            <AnimatedCard delay={250} className="p-6 bg-white border border-gray-200">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
                Top Performing Content
              </h2>
              <div className="space-y-4">
                {analytics?.topContent.map((content, index) => (
                  <div key={content.id} className="border-l-4 border-blue-600 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <h3 className="font-semibold text-primary">{content.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Icon name="TrendingUp" className="h-4 w-4" />
                            {content.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="BookOpen" className="h-4 w-4" />
                            {content.bookmarks} saved
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Star" className="h-4 w-4 text-yellow-500" />
                            {content.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-semibold text-green-600">
                          {content.conversionRate}%
                        </div>
                        <div className="text-xs text-gray-500">conversion</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            {/* Domain Breakdown */}
            <AnimatedCard delay={300} className="p-6 bg-white border border-gray-200">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <Icon name="BarChart" className="h-5 w-5 text-blue-600" />
                Content by Domain
              </h2>
              <div className="space-y-4">
                {analytics?.domainBreakdown.map((domain) => {
                  const percentage = ((domain.contentCount / (analytics?.overview.totalContent || 1)) * 100).toFixed(1);
                  return (
                    <div key={domain.domain}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">{domain.domain}</span>
                          <span className="text-sm text-gray-500">({domain.contentCount} blocks)</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-600">{percentage}%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{domain.totalViews.toLocaleString()} views</span>
                        <span className="flex items-center gap-1">
                          <Icon name="Star" className="h-3 w-3 text-yellow-500" />
                          {domain.averageRating}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>
          </div>

          {/* User Engagement Metrics */}
          <AnimatedCard delay={350} className="p-6 bg-white border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <Icon name="Monitor" className="h-5 w-5 text-purple-600" />
              User Engagement Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Active Users (Last {timeRange} Days)</div>
                <div className="text-3xl font-bold text-primary">{analytics?.userEngagement.activeUsers}</div>
                <div className="text-sm text-gray-500 mt-1">Users who viewed content</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Avg Session Duration</div>
                <div className="text-3xl font-bold text-primary">{analytics?.userEngagement.averageSessionDuration} min</div>
                <div className="text-sm text-gray-500 mt-1">Time per session</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Search Queries</div>
                <div className="text-3xl font-bold text-primary">{analytics?.userEngagement.searchQueries.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">Total searches performed</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Calculator Launches</div>
                <div className="text-3xl font-bold text-primary">{analytics?.userEngagement.calculatorLaunches}</div>
                <div className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <Icon name="ArrowRight" className="h-3 w-3" />
                  Content → Tool conversion
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Growth Trends */}
          <AnimatedCard delay={400} className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
              Growth Trends (vs Previous Period)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  +{analytics?.trends.viewsGrowth}%
                </div>
                <div className="text-sm font-medium text-gray-700">Views Growth</div>
                <div className="text-xs text-gray-500 mt-1">Trending up</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  +{analytics?.trends.bookmarksGrowth}%
                </div>
                <div className="text-sm font-medium text-gray-700">Bookmarks Growth</div>
                <div className="text-xs text-gray-500 mt-1">Strong engagement</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  +{analytics?.trends.ratingsGrowth}%
                </div>
                <div className="text-sm font-medium text-gray-700">Ratings Growth</div>
                <div className="text-xs text-gray-500 mt-1">Increased feedback</div>
              </div>
            </div>
          </AnimatedCard>

        </div>
      </div>
      <Footer />
    </>
  );
}

