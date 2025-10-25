'use client';

import AnimatedCard from '@/app/components/ui/AnimatedCard';

import BookmarkButton from './BookmarkButton';
import RatingButton from './RatingButton';
import ShareButton from './ShareButton';

interface ContentBlock {
  id: string;
  title: string;
  summary: string | null;
  html: string;
  domain: string;
  difficulty_level: string;
  target_audience: string[];
  content_rating: number;
  content_freshness_score: number;
  est_read_min: number;
  tags: string[];
  seo_keywords: string[];
  relevance_score?: number;
  trend_score?: number;
  total_views?: number;
}

interface RelatedContent {
  content_id: string;
  title: string;
  content_domain: string;
  similarity_score: number;
}

interface ContentBlockCardProps {
  block: ContentBlock;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  relatedBlocks?: RelatedContent[];
}

export default function ContentBlockCard({
  block,
  index,
  isExpanded,
  onToggleExpand,
  relatedBlocks
}: ContentBlockCardProps) {
  
  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'finance': return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'career': return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'pcs': return 'bg-green-50 text-green-700 border-green-300';
      case 'deployment': return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'lifestyle': return 'bg-pink-50 text-pink-700 border-pink-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-50 text-green-700 border-green-300';
      case 'intermediate': return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'advanced': return 'bg-red-50 text-red-700 border-red-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const renderContentRating = (rating: number) => {
    const stars = Math.round(rating);
    return (
      <span className="flex items-center gap-0.5 text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < stars ? 'text-yellow-500' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </span>
    );
  };

  return (
    <AnimatedCard
      className="bg-surface border border-subtle hover:shadow-lg transition-all"
      delay={index * 20}
    >
      <button
        onClick={() => onToggleExpand(block.id)}
        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-xl font-bold text-primary">{block.title}</h3>
              {block.est_read_min > 0 && (
                <span className="text-xs bg-surface-hover text-body px-2 py-1 rounded-full font-medium">
                  {block.est_read_min} min
                </span>
              )}
              {block.relevance_score && (
                <span className="text-xs bg-info-subtle text-info px-2 py-1 rounded-full font-bold">
                  {(block.relevance_score * 10).toFixed(0)}% match
                </span>
              )}
              {block.trend_score && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                  🔥 Trending
                </span>
              )}
            </div>
            
            {block.summary && (
              <p className="text-body mb-3">{block.summary}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-semibold capitalize border ${getDomainColor(block.domain)}`}>
                {block.domain}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold capitalize border ${getDifficultyColor(block.difficulty_level)}`}>
                {block.difficulty_level}
              </span>
              {block.content_rating > 0 && renderContentRating(block.content_rating)}
              {block.content_freshness_score >= 90 && (
                <span className="text-xs bg-success-subtle text-success px-2 py-1 rounded-full font-medium">
                  ✨ Fresh
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <BookmarkButton contentId={block.id} />
              <ShareButton contentId={block.id} title={block.title} />
              <RatingButton contentId={block.id} initialRating={block.content_rating} />
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-subtle">
          <div
            className="prose prose-sm max-w-none mt-6 text-body"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
          
          {/* Related Content */}
          {relatedBlocks && relatedBlocks.length > 0 && (
            <div className="mt-8 p-4 bg-info-subtle rounded-lg border border-info">
              <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                <span>🔗</span> Related Content
              </h4>
              <div className="space-y-2">
                {relatedBlocks.map((related) => (
                  <button
                    key={related.content_id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand(related.content_id);
                    }}
                    className="w-full text-left p-3 bg-surface rounded-lg border border-info hover:shadow-md transition-all"
                  >
                    <div className="font-semibold text-primary text-sm mb-1">
                      {related.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded ${getDomainColor(related.content_domain)}`}>
                        {related.content_domain}
                      </span>
                      <span className="text-muted">
                        {(related.similarity_score * 20).toFixed(0)}% similar
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatedCard>
  );
}

