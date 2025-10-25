/**
 * DYNAMIC INTEL CARD PAGE
 * 
 * Renders individual Intel Cards from MDX files
 * Route: /dashboard/intel/[domain]/[card-slug]
 */

import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { bundleMDX } from 'mdx-bundler';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import Badge from '@/app/components/ui/Badge';
import { getIntelCardBySlug, getAllIntelCardSlugs } from '@/lib/content/mdx-loader';

import IntelCardContent from './IntelCardContent';
import ShareButton from './ShareButton';


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
              <Link
                href="/dashboard/intel"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                ← Back to Intel Library
              </Link>
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

  // Compile MDX to executable code
  const { code } = await bundleMDX({
    source: card.content,
    mdxOptions(options) {
      options.remarkPlugins = [...(options.remarkPlugins ?? [])];
      options.rehypePlugins = [...(options.rehypePlugins ?? [])];
      return options;
    },
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">Dashboard</Link>
            <span className="mx-2 text-gray-400">→</span>
            <Link href="/dashboard/intel" className="text-blue-600 hover:text-blue-700">Intel Library</Link>
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

            {/* Content - Using IntelCardContent client component */}
            <IntelCardContent code={code} />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/intel"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Intel Library
            </Link>
            
            <div className="flex gap-3">
              <ShareButton title={card.frontmatter.title} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

