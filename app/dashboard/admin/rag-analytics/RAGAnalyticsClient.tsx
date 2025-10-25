"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/app/components/ui/icon";
import AnimatedCard from "@/app/components/ui/AnimatedCard";

interface AnalyticsData {
  totalQuestions: number;
  averageRating: number;
  averageResponseTime: number;
  satisfactionRate: number;
  topCategories: Array<{
    category: string;
    count: number;
    avgRating: number;
  }>;
  knowledgeGaps: Array<{
    topic: string;
    frequency: number;
    avgRating: number;
  }>;
  recentFeedback: Array<{
    id: string;
    question: string;
    rating: number;
    feedback: string;
    createdAt: string;
  }>;
}

export default function RAGAnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/rag-analytics?timeRange=${timeRange}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow">
              <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
              <div className="h-8 w-16 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2">
          <Icon name="AlertCircle" className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-800">Error Loading Analytics</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <Icon name="BarChart" className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No Data Available</h3>
        <p className="mt-2 text-gray-600">No analytics data found for the selected time range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Time Range:</label>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard delay={0.1}>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.totalQuestions.toLocaleString()}
                </p>
              </div>
              <Icon name="MessageCircle" className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.averageRating.toFixed(1)}/5
                </p>
              </div>
              <Icon name="Star" className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{data.averageResponseTime}ms</p>
              </div>
              <Icon name="Timer" className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(data.satisfactionRate * 100).toFixed(1)}%
                </p>
              </div>
              <Icon name="ThumbsUp" className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Top Categories */}
      <AnimatedCard delay={0.5}>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Question Categories</h3>
          <div className="space-y-3">
            {data.topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{category.count} questions</span>
                  <div className="flex items-center gap-1">
                    <Icon name="Star" className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{category.avgRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      {/* Knowledge Gaps */}
      <AnimatedCard delay={0.6}>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Knowledge Gaps</h3>
          <div className="space-y-3">
            {data.knowledgeGaps.map((gap, index) => (
              <div key={gap.topic} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="font-medium text-gray-900">{gap.topic}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{gap.frequency} mentions</span>
                  <div className="flex items-center gap-1">
                    <Icon name="Star" className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{gap.avgRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      {/* Recent Feedback */}
      <AnimatedCard delay={0.7}>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Feedback</h3>
          <div className="space-y-4">
            {data.recentFeedback.map((feedback) => (
              <div key={feedback.id} className="border-l-4 border-blue-200 pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{feedback.question}</p>
                    {feedback.feedback && (
                      <p className="mt-1 text-sm text-gray-600">{feedback.feedback}</p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Icon name="Star" className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{feedback.rating}/5</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
