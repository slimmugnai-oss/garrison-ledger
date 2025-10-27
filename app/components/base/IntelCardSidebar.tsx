/**
 * INTEL CARD SIDEBAR (for Base Navigator)
 * 
 * Shows relevant Intel Cards in sidebar
 */

import Link from 'next/link';

import IntelCardEmbed from '../mdx/IntelCardEmbed';

interface IntelCardSidebarProps {
  baseName: string;
  mha?: string;
}

export default async function IntelCardSidebar({ baseName: _baseName, mha: _mha }: IntelCardSidebarProps) {
  // Relevant Intel Cards for base pages
  const relevantCards = [
    { slug: 'finance/bah-basics', title: 'Understanding BAH' },
    { slug: 'pcs/housing-hunt', title: 'Finding Housing' },
    { slug: 'finance/cola-guide', title: 'COLA Eligibility' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📚 Related Intel
      </h3>

      {relevantCards.map(card => (
        <IntelCardEmbed key={card.slug} slug={card.slug} compact />
      ))}

      <Link
        href="/dashboard/ask?domain=pcs"
        className="block text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
      >
        View All PCS Intel →
      </Link>
    </div>
  );
}

