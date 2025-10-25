/**
 * INTEL CARD EMBED
 * 
 * Embeds an Intel Card inline within other pages
 * Used by LES Auditor, Base Navigator, etc.
 */

import { getIntelCardBySlug } from '@/lib/content/mdx-loader';

import Icon from '../ui/Icon';

interface IntelCardEmbedProps {
  slug: string;  // e.g., "finance/tsp-basics"
  compact?: boolean;
}

export default async function IntelCardEmbed({ slug, compact = false }: IntelCardEmbedProps) {
  const card = getIntelCardBySlug(slug);

  if (!card) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Icon name="AlertCircle" className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Intel Card not found: <code className="bg-yellow-100 px-1 rounded">{slug}</code>
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              {card.frontmatter.title}
            </h4>
            <p className="text-sm text-blue-700 line-clamp-2 mb-2">
              {card.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
            <a
              href={`/dashboard/intel/${slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Learn More
              <Icon name="ArrowRight" className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {card.frontmatter.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
              {card.frontmatter.domain}
            </span>
            {card.frontmatter.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <a
          href={`/dashboard/intel/${slug}`}
          target="_blank"
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium"
        >
          View Full Card →
        </a>
      </div>

      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: card.content.substring(0, 500) + '...' }} />
      </div>
    </div>
  );
}

