/**
 * DYNAMIC INTEL CARD PAGE
 * 
 * Renders individual Intel Cards from MDX files
 * Route: /dashboard/intel/[domain]/[card-slug]
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { getIntelCardBySlug, getAllIntelCardSlugs } from '@/lib/content/mdx-loader';
import { useMDXComponents } from '@/lib/content/mdx-components';
import Badge from '@/app/components/ui/Badge';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const slugs = getAllIntelCardSlugs();
  return slugs.map(slug => ({
    slug: slug.split('/')
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const card = getIntelCardBySlug(slugPath);

  if (!card) {
    return { title: 'Intel Card Not Found' };
  }

  return {
    title: `${card.frontmatter.title} | Intel Library`,
    description: card.content.substring(0, 160).replace(/<[^>]*>/g, ''),
  };
}

export default async function IntelCardPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const { slug } = await params;
  const slugPath = slug.join('/');
  
  const card = getIntelCardBySlug(slugPath);

  if (!card) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Intel Card Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The Intel Card <code className="bg-gray-100 px-2 py-1 rounded">{slugPath}</code> does not exist.
              </p>
              <a
                href="/dashboard/intel"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                ← Back to Intel Library
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Check premium gating
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';
  const isPremiumCard = card.frontmatter.gating === 'premium';

  // Block non-premium users from premium cards
  if (isPremiumCard && !isPremium) {
    redirect(`/dashboard/upgrade?feature=intel-${slugPath}`);
  }

  // Render MDX content with components
  const components = useMDXComponents({});
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">Dashboard</a>
            <span className="mx-2 text-gray-400">→</span>
            <a href="/dashboard/intel" className="text-blue-600 hover:text-blue-700">Intel Library</a>
            <span className="mx-2 text-gray-400">→</span>
            <span className="text-gray-600">{card.frontmatter.title}</span>
          </nav>

          {/* Card Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={
                    card.frontmatter.domain === 'finance' ? 'success' :
                    card.frontmatter.domain === 'pcs' ? 'warning' :
                    card.frontmatter.domain === 'deployment' ? 'danger' :
                    'info'
                  }>
                    {card.frontmatter.domain}
                  </Badge>
                  {card.frontmatter.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      #{tag}
                    </span>
                  ))}
                  {isPremiumCard && (
                    <Badge variant="warning">Premium</Badge>
                  )}
                </div>
                
                {card.frontmatter.asOf && (
                  <p className="text-sm text-gray-600 mb-4">
                    Last verified: {new Date(card.frontmatter.asOf).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Content (simplified HTML view for v1) */}
            <article className="prose prose-lg max-w-none bg-white rounded-lg p-8">
              <div 
                className="mdx-content"
                dangerouslySetInnerHTML={{ 
                  __html: card.content
                    .replace(/---[\s\S]*?---/, '') // Remove frontmatter
                    .replace(/```[\s\S]*?```/g, '<pre class="bg-gray-900 text-white p-4 rounded">$&</pre>') // Style code blocks
                    .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-bold mb-6">$1</h1>') // H1
                    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>') // H2
                    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>') // H3
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
                    .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
                    .replace(/<DataRef[^>]*>/g, '<span class="font-semibold text-blue-600">[Live Data]</span>') // Placeholder for DataRef
                    .replace(/<RateBadge[^>]*>/g, '<div class="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded">[Rate Badge]</div>') // Placeholder
                    .replace(/<Disclaimer[^>]*\/>/g, '<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4"><strong>Disclaimer:</strong> Educational information only.</div>') // Disclaimer
                    .replace(/<AsOf[^>]*\/>/g, '<span class="text-sm text-gray-600">(As of latest data)</span>') // AsOf
                }}
              />
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a simplified view. Dynamic data components (<code>&lt;DataRef&gt;</code>, <code>&lt;RateBadge&gt;</code>) will be fully functional in v1.1.
                </p>
              </div>
            </article>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between">
            <a
              href="/dashboard/intel"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Intel Library
            </a>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigator.share?.({
                  title: card.frontmatter.title,
                  text: `Check out this Intel Card: ${card.frontmatter.title}`,
                  url: window.location.href
                })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

