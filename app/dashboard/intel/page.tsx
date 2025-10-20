/**
 * INTEL LIBRARY (Redesigned)
 * 
 * Browse and search atomic Intel Cards
 * - Filter by domain, tags, gating
 * - Search by title/content
 * - Premium gating enforced
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import PremiumGate from '@/app/components/premium/PremiumGate';
import { getAllIntelCards } from '@/lib/content/mdx-loader';
import { extractTitleAndBluf, normalizeTags } from '@/lib/content/preview';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intel Library - Garrison Ledger',
  description: 'Browse military financial intelligence cards - TSP, BAH, PCS, deployment, and more.',
};

export default async function IntelLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; search?: string; tag?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const params = await searchParams;
  const { domain, search, tag } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check premium status
  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

  // Get Intel Cards from BOTH old content_blocks (HTML) AND new MDX files
  // For v1: Only show new MDX cards to avoid "not found" errors
  // Old HTML blocks will be migrated gradually
  
  // Load MDX cards
  let allCards: ReturnType<typeof getAllIntelCards> = [];
  try {
    allCards = getAllIntelCards();
  } catch (error) {
    console.error('[Intel Library] Error loading MDX cards:', error);
    allCards = [];
  }

  // Filter by domain/search/tag
  let cards = allCards;
  
  if (domain) {
    cards = cards.filter(c => c.frontmatter.domain === domain);
  }

  if (search) {
    cards = cards.filter(c => 
      c.frontmatter.title.toLowerCase().includes(search.toLowerCase()) ||
      c.frontmatter.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
  }

  if (tag) {
    cards = cards.filter(c => c.frontmatter.tags.includes(tag));
  }

  // Convert to format expected by UI with clean previews
  const cardsData = cards.map(c => {
    const preview = extractTitleAndBluf(c.content);
    const cleanTags = normalizeTags(c.frontmatter.tags);
    
    return {
      id: c.frontmatter.id,
      slug: c.slug,
      title: c.frontmatter.title || preview.title,
      bluf: preview.bluf,
      domain: c.frontmatter.domain,
      tags: cleanTags,
      gating: c.frontmatter.gating,
      as_of_date: c.frontmatter.asOf,
    };
  });

  // Group by domain
  const domains = ['finance', 'pcs', 'deployment', 'career', 'lifestyle'];
  const cardsByDomain = domains.map(d => ({
    domain: d,
    count: cardsData.filter(c => c.domain === d).length,
  }));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 font-lora mb-3">
              Intel Library
            </h1>
            <p className="text-lg text-gray-600">
              Atomic reference cards with live data - always current, always factual.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <form action="/dashboard/intel" method="get">
                  <div className="relative">
                    <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="search"
                      placeholder="Search Intel Cards..."
                      defaultValue={search}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </form>
              </div>

              <div className="flex gap-2 flex-wrap">
                {domains.map(d => {
                  const count = cardsByDomain.find(cd => cd.domain === d)?.count || 0;
                  const isActive = domain === d;

                  return (
                    <a
                      key={d}
                      href={`/dashboard/intel?domain=${d}`}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)} ({count})
                    </a>
                  );
                })}
                {domain && (
                  <a
                    href="/dashboard/intel"
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                  >
                    Clear Filter
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {!cardsData || cardsData.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="File" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Intel Cards found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cardsData.map((card, index) => {
                const isPremiumCard = card.gating === 'premium';
                const isLocked = isPremiumCard && !isPremium;

                return (
                  <AnimatedCard key={card.id} delay={index * 0.05}>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                card.domain === 'finance' ? 'success' :
                                card.domain === 'pcs' ? 'warning' :
                                card.domain === 'deployment' ? 'danger' :
                                'info'
                              }
                            >
                              {card.domain}
                            </Badge>
                            {isPremiumCard && (
                              <Badge variant="warning">
                                <Icon name="Star" className="w-3 h-3 mr-1 inline" />
                                Premium
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {card.title}
                          </h3>
                        </div>
                      </div>

                      {/* Preview */}
                      {isLocked ? (
                        <div className="py-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                          <Icon name="Lock" className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                          <p className="text-base font-semibold text-gray-900 mb-2">
                            Premium Intel Card
                          </p>
                          <p className="text-sm text-gray-600 mb-4 max-w-xs mx-auto">
                            This advanced intelligence card is available exclusively for Premium members.
                          </p>
                          <a
                            href="/dashboard/upgrade"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm shadow-lg"
                          >
                            Upgrade to Premium →
                          </a>
                        </div>
                      ) : (
                        <>
                          {/* Clean BLUF preview - no markdown symbols */}
                          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                            {card.bluf}
                          </p>

                          {/* Tags - clean, no leading # */}
                          {card.tags && card.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {card.tags.slice(0, 3).map((t: string) => (
                                <a
                                  key={t}
                                  href={`/dashboard/intel?tag=${t}`}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                >
                                  #{t}
                                </a>
                              ))}
                            </div>
                          )}

                          {/* View Button */}
                          <a
                            href={`/dashboard/intel/${card.slug || card.id}`}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Intel Card
                            <Icon name="ArrowRight" className="w-4 h-4" />
                          </a>
                        </>
                      )}

                      {/* Footer Meta */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {card.as_of_date
                            ? `Verified: ${new Date(card.as_of_date).toLocaleDateString()}`
                            : 'Static content'}
                        </span>
                        <Icon name="CheckCircle" className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

