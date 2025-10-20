/**
 * MDX COMPILER (Server-side)
 * 
 * Compiles MDX content to JSX for rendering
 */

import { compile } from '@mdx-js/mdx';
import { useMDXComponents } from '@/lib/content/mdx-components';

export async function compileMDX(content: string): Promise<string> {
  try {
    const compiled = await compile(content, {
      outputFormat: 'function-body',
      development: false,
    });

    return String(compiled);
  } catch (error) {
    console.error('[MDX Compile] Error:', error);
    return content; // Fallback to raw content
  }
}

