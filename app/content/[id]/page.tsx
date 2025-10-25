import Link from 'next/link';
import { notFound } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getContentBlock(id: string) {
  const { data, error } = await supabaseAdmin
    .from('content_blocks')
    .select('id, title, summary, html, domain, difficulty_level, content_rating, content_freshness_score, est_read_min, tags, seo_keywords')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getRelatedContent(id: string) {
  const { data, error } = await supabaseAdmin
    .rpc('get_related_content', {
      p_content_id: id,
      p_limit: 3
    });

  if (error) {
    return [];
  }

  return data || [];
}

export default async function SharedContentPage({ params }: PageProps) {
  const { id } = await params;
  const content = await getContentBlock(id);

  if (!content) {
    notFound();
  }

  const related = await getRelatedContent(id);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-300';
      case 'intermediate': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'advanced': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

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

  const renderStars = (rating: number) => {
    const stars = Math.round(rating);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < stars ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
        <span className="text-xs text-body ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://garrisonledger.com'}/content/${id}`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-surface">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.04),transparent_60%)]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-info-subtle px-4 py-1.5 text-xs font-semibold text-info uppercase tracking-wider">
                <span>🔗</span> Shared Content
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-black tracking-tight text-primary mb-4">
              {content.title}
            </h1>
            {content.summary && (
              <p className="text-xl text-body mb-4">{content.summary}</p>
            )}
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize border ${getDomainColor(content.domain)}`}>
                {content.domain}
              </span>
              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize border ${getDifficultyColor(content.difficulty_level)}`}>
                {content.difficulty_level}
              </span>
              {content.est_read_min > 0 && (
                <span className="text-sm bg-surface-hover text-body px-3 py-1.5 rounded-lg font-medium">
                  ⏱️ {content.est_read_min} min read
                </span>
              )}
              {content.content_rating > 0 && (
                <div className="flex items-center">
                  {renderStars(content.content_rating)}
                </div>
              )}
              {content.content_freshness_score >= 90 && (
                <span className="text-sm bg-success-subtle text-success px-3 py-1.5 rounded-lg font-medium">
                  ✨ Fresh Content
                </span>
              )}
            </div>

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {content.tags.slice(0, 5).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-surface-hover text-body rounded text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share Button */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                }}
                className="px-4 py-2 bg-info hover:bg-info text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <span>📋</span> Copy Link
              </button>
              <a
                href="/dashboard/library"
                className="px-4 py-2 bg-surface-hover hover:bg-surface-hover text-primary rounded-lg font-semibold transition-colors"
              >
                Browse More Content
              </a>
            </div>
          </div>

          {/* Main Content */}
          <AnimatedCard className="mb-8 p-8 bg-surface border border-subtle">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content.html }}
            />
          </AnimatedCard>

          {/* Related Content */}
          {related.length > 0 && (
            <AnimatedCard className="p-6 bg-info-subtle border border-info" delay={100}>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>🔗</span> Related Content
              </h2>
              <div className="space-y-3">
                {related.map((item: { content_id: string; title: string; content_domain: string; similarity_score: number }) => (
                  <a
                    key={item.content_id}
                    href={`/content/${item.content_id}`}
                    className="block p-4 bg-surface rounded-lg border border-info hover:shadow-md transition-all"
                  >
                    <div className="font-semibold text-primary mb-2">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-1 rounded ${getDomainColor(item.content_domain)}`}>
                        {item.content_domain}
                      </span>
                      <span className="text-muted">
                        {(item.similarity_score * 20).toFixed(0)}% similar
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* CTA */}
          <div className="mt-12 text-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <h3 className="text-2xl font-bold text-primary mb-2">
              Want personalized recommendations?
            </h3>
            <p className="text-body mb-4">
              Sign up for Garrison Ledger to get AI-powered content recommendations tailored to your military journey.
            </p>
            <Link
              href="/sign-up"
              className="inline-block px-6 py-3 bg-info hover:bg-info text-white rounded-lg font-semibold transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

