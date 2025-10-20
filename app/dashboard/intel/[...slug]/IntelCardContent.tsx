/**
 * INTEL CARD CONTENT - MDX RENDERING
 * 
 * Properly renders MDX content with dynamic React components
 * Uses MDX Provider to enable RateBadge, DataRef, AsOf components
 */

'use client';

import { MDXProvider } from '@mdx-js/react';
import { useMDXComponents } from '@/lib/content/mdx-components';
import { getMDXComponent } from 'mdx-bundler/client';
import { useMemo } from 'react';

export default function IntelCardContent({ 
  code 
}: { 
  code: string  // Compiled MDX code from server
}) {
  const Component = useMemo(() => getMDXComponent(code), [code]);
  const components = useMDXComponents();

  return (
    <article className="max-w-none">
      <div className="intel-card-content prose prose-lg">
        <MDXProvider components={components}>
          <Component />
        </MDXProvider>
      </div>
    </article>
  );
}
