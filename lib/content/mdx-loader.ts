/**
 * MDX INTEL CARDS LOADER
 * 
 * Loads and parses Intel Cards from /content directory
 * Handles frontmatter extraction and MDX compilation
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface IntelCardFrontmatter {
  id: string;
  title: string;
  domain: string;
  tags: string[];
  gating: 'free' | 'premium';
  asOf?: string;
  dynamicRefs?: Array<{ source: string }>;
}

export interface IntelCard {
  slug: string;
  frontmatter: IntelCardFrontmatter;
  content: string;
  filePath: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Get all Intel Card slugs
 */
export function getAllIntelCardSlugs(): string[] {
  const slugs: string[] = [];

  function scanDir(dir: string, basePath = '') {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          scanDir(fullPath, relativePath);
        } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
          const slug = relativePath.replace(/\.mdx$/, '');
          slugs.push(slug);
        }
      }
    } catch (error) {
      console.warn(`[MDX Loader] Could not scan ${dir}:`, error);
    }
  }

  scanDir(CONTENT_DIR);
  return slugs;
}

/**
 * Get Intel Card by slug
 */
export function getIntelCardBySlug(slug: string): IntelCard | null {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      console.warn(`[MDX Loader] File not found: ${filePath}`);
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    // Validate frontmatter
    if (!data.id || !data.title || !data.domain) {
      console.warn(`[MDX Loader] Invalid frontmatter in ${slug}`);
      return null;
    }

    return {
      slug,
      frontmatter: data as IntelCardFrontmatter,
      content,
      filePath: filePath.replace(process.cwd(), '')
    };

  } catch (error) {
    console.error(`[MDX Loader] Error loading ${slug}:`, error);
    return null;
  }
}

/**
 * Get all Intel Cards
 */
export function getAllIntelCards(): IntelCard[] {
  const slugs = getAllIntelCardSlugs();
  return slugs
    .map(slug => getIntelCardBySlug(slug))
    .filter((card): card is IntelCard => card !== null);
}

/**
 * Get Intel Cards by domain
 */
export function getIntelCardsByDomain(domain: string): IntelCard[] {
  return getAllIntelCards().filter(
    card => card.frontmatter.domain === domain
  );
}

/**
 * Get Intel Cards by tag
 */
export function getIntelCardsByTag(tag: string): IntelCard[] {
  return getAllIntelCards().filter(
    card => card.frontmatter.tags.includes(tag)
  );
}

/**
 * Get Intel Cards by gating
 */
export function getIntelCardsByGating(gating: 'free' | 'premium'): IntelCard[] {
  return getAllIntelCards().filter(
    card => card.frontmatter.gating === gating
  );
}

/**
 * Search Intel Cards by query (title, tags, id)
 */
export function searchIntelCards(query: string): IntelCard[] {
  const lowerQuery = query.toLowerCase();
  
  return getAllIntelCards().filter(card => {
    const { title, tags, id } = card.frontmatter;
    
    return (
      title.toLowerCase().includes(lowerQuery) ||
      id.toLowerCase().includes(lowerQuery) ||
      tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Get Intel Cards that reference a specific dynamic source
 */
export function getIntelCardsByDynamicSource(source: string): IntelCard[] {
  return getAllIntelCards().filter(card => {
    const refs = card.frontmatter.dynamicRefs || [];
    return refs.some(ref => ref.source === source);
  });
}

