import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import { supabaseAdmin } from '@/lib/supabase';

interface IntelligenceWidgetProps {
  userId: string;
}

async function getPersonalizedContent(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_personalized_content', {
        p_user_id: userId,
        p_limit: 3
      });

    if (error) {
      console.error('Error fetching personalized content:', error);
      return [];
    }

    // Fetch full content details
    if (data && data.length > 0) {
      const ids = data.map((item: { content_id: string }) => item.content_id);
      const { data: fullData } = await supabaseAdmin
        .from('content_blocks')
        .select('id, title, domain, difficulty_level, content_rating, est_read_min')
        .in('id', ids);

      // Merge relevance scores
      const merged = fullData?.map((block) => {
        const match = data.find((p: { content_id: string; relevance_score: number }) => p.content_id === block.id);
        return {
          ...block,
          relevance_score: match?.relevance_score || 0
        };
      }) || [];

      // Sort by relevance
      return merged.sort((a, b) => b.relevance_score - a.relevance_score);
    }

    return [];
  } catch (error) {
    console.error('Error in getPersonalizedContent:', error);
    return [];
  }
}

export default async function IntelligenceWidget({ userId }: IntelligenceWidgetProps) {
  const recommendations = await getPersonalizedContent(userId);

  if (recommendations.length === 0) {
    return null;
  }

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'finance': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'career': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pcs': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'deployment': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'lifestyle': return 'bg-violet-50 text-violet-700 border-violet-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <AnimatedCard className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200" delay={100}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>🎯</span> Recommended For You
        </h2>
        <Link
          href="/dashboard/library?tab=for-you"
          className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
        >
          View All →
        </Link>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Based on your profile and interests
      </p>

      <div className="space-y-3">
        {recommendations.map((item: {
          id: string;
          title: string;
          domain: string;
          difficulty_level: string;
          content_rating: number;
          est_read_min: number;
          relevance_score: number;
        }) => (
          <Link
            key={item.id}
            href={`/dashboard/library?highlight=${item.id}`}
            className="block p-4 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-all"
          >
            <div className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {item.title}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded border font-medium ${getDomainColor(item.domain)}`}>
                  {item.domain}
                </span>
                {item.est_read_min > 0 && (
                  <span className="text-gray-600">
                    ⏱️ {item.est_read_min} min
                  </span>
                )}
              </div>
              <span className="text-blue-600 font-bold">
                {(item.relevance_score * 10).toFixed(0)}% match
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/dashboard/library"
        className="mt-4 block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
      >
        Browse Intel Library
      </Link>
    </AnimatedCard>
  );
}

