/**
 * MDX COMPONENTS (Root)
 * 
 * Required by Next.js for MDX support
 * This file must be at the project root
 */

import { useMDXComponents as getComponents } from './lib/content/mdx-components';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMDXComponents(components: Record<string, any> = {}) {
  return getComponents(components);
}

