/**
 * CONTENT CHUNKING SYSTEM
 *
 * Smart chunking strategies for different content types to optimize
 * RAG retrieval quality and token efficiency
 *
 * Chunking Strategy:
 * - Content blocks: 500 words with 50-word overlap
 * - JTR sections: Preserve hierarchy, 400 words
 * - Base guides: Section-based chunks
 * - Community tips: Whole-content chunks (usually short)
 *
 * Created: 2025-01-25
 * Part of: Ask Military Expert RAG System
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ContentChunk {
  id: string;
  text: string;
  metadata: Record<string, unknown>;
}

export interface ChunkingOptions {
  maxChunkSize?: number; // Maximum chunk size in words
  overlapSize?: number; // Overlap between chunks in words
  preserveContext?: boolean; // Whether to preserve title/context in each chunk
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Split text into words (respects punctuation)
 */
function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return splitIntoWords(text).length;
}

/**
 * Truncate text to max words
 */
function truncateToWords(text: string, maxWords: number): string {
  const words = splitIntoWords(text);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

/**
 * Clean text for embedding (remove excessive whitespace, special chars)
 */
function cleanTextForEmbedding(text: string): string {
  return text
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[^\w\s.,!?-]/g, "") // Remove special chars except basic punctuation
    .trim();
}

// ============================================================================
// CONTENT BLOCK CHUNKING
// ============================================================================

/**
 * Chunk content blocks (410 existing blocks)
 *
 * Strategy:
 * - Each chunk includes title for context
 * - Body split into 500-word chunks with 50-word overlap
 * - Metadata preserved in each chunk
 */
export function chunkContentBlock(
  block: {
    id: string;
    title: string;
    body: string;
    category?: string;
    tags?: string[];
    expert_level?: string;
    metadata?: Record<string, unknown>;
  },
  options?: ChunkingOptions
): ContentChunk[] {
  const maxChunkSize = options?.maxChunkSize || 500;
  const overlapSize = options?.overlapSize || 50;
  const chunks: ContentChunk[] = [];

  // Clean body text
  const cleanBody = cleanTextForEmbedding(block.body);
  const words = splitIntoWords(cleanBody);

  // If body is short enough, return as single chunk
  if (words.length <= maxChunkSize) {
    chunks.push({
      id: `${block.id}_chunk_0`,
      text: `${block.title}\n\n${cleanBody}`,
      metadata: {
        content_block_id: block.id,
        chunk_index: 0,
        total_chunks: 1,
        category: block.category || "general",
        tags: block.tags || [],
        expert_level: block.expert_level,
        ...block.metadata,
      },
    });
    return chunks;
  }

  // Split into overlapping chunks
  let chunkIndex = 0;
  for (let i = 0; i < words.length; i += maxChunkSize - overlapSize) {
    const chunkWords = words.slice(i, Math.min(i + maxChunkSize, words.length));
    const chunkText = chunkWords.join(" ");

    chunks.push({
      id: `${block.id}_chunk_${chunkIndex}`,
      text: `${block.title}\n\n${chunkText}`,
      metadata: {
        content_block_id: block.id,
        chunk_index: chunkIndex,
        total_chunks: -1, // Will update after loop
        category: block.category || "general",
        tags: block.tags || [],
        expert_level: block.expert_level,
        word_count: chunkWords.length,
        has_overlap: chunkIndex > 0,
        ...block.metadata,
      },
    });

    chunkIndex++;
  }

  // Update total_chunks in all chunk metadata
  chunks.forEach((chunk) => {
    chunk.metadata.total_chunks = chunks.length;
  });

  return chunks;
}

// ============================================================================
// JTR SECTION CHUNKING
// ============================================================================

/**
 * Chunk JTR (Joint Travel Regulations) sections
 *
 * Strategy:
 * - Preserve section hierarchy (Chapter → Section → Subsection)
 * - Each chunk includes full context path
 * - Smaller chunks (400 words) for regulation precision
 */
export function chunkJTRSection(
  section: {
    id: string;
    chapter: string;
    section: string;
    subsection?: string;
    title: string;
    content: string;
    effective_date?: string;
  },
  options?: ChunkingOptions
): ContentChunk[] {
  const maxChunkSize = options?.maxChunkSize || 400;
  const overlapSize = options?.overlapSize || 40;
  const chunks: ContentChunk[] = [];

  // Build context header
  const contextHeader = [
    `JTR Chapter ${section.chapter}`,
    section.subsection
      ? `Section ${section.section}.${section.subsection}`
      : `Section ${section.section}`,
    section.title,
  ].join(" - ");

  const cleanContent = cleanTextForEmbedding(section.content);
  const words = splitIntoWords(cleanContent);

  // If content is short, return single chunk
  if (words.length <= maxChunkSize) {
    chunks.push({
      id: `jtr_${section.id}_chunk_0`,
      text: `${contextHeader}\n\n${cleanContent}`,
      metadata: {
        jtr_section_id: section.id,
        chapter: section.chapter,
        section: section.section,
        subsection: section.subsection,
        chunk_index: 0,
        total_chunks: 1,
        effective_date: section.effective_date || "current",
        source_url: `https://www.travel.dod.mil/Regulations/Joint-Travel-Regulations/`,
      },
    });
    return chunks;
  }

  // Split into overlapping chunks with context
  let chunkIndex = 0;
  for (let i = 0; i < words.length; i += maxChunkSize - overlapSize) {
    const chunkWords = words.slice(i, Math.min(i + maxChunkSize, words.length));
    const chunkText = chunkWords.join(" ");

    chunks.push({
      id: `jtr_${section.id}_chunk_${chunkIndex}`,
      text: `${contextHeader}\n\n${chunkText}`,
      metadata: {
        jtr_section_id: section.id,
        chapter: section.chapter,
        section: section.section,
        subsection: section.subsection,
        chunk_index: chunkIndex,
        total_chunks: -1,
        effective_date: section.effective_date || "current",
        source_url: `https://www.travel.dod.mil/Regulations/Joint-Travel-Regulations/`,
      },
    });

    chunkIndex++;
  }

  // Update total_chunks
  chunks.forEach((chunk) => {
    chunk.metadata.total_chunks = chunks.length;
  });

  return chunks;
}

// ============================================================================
// BASE GUIDE CHUNKING
// ============================================================================

/**
 * Chunk base guides (203 existing bases)
 *
 * Strategy:
 * - Split by sections (Overview, Housing, Schools, Amenities, etc)
 * - Each chunk includes base name and section title
 * - Preserve base-specific context
 */
export function chunkBaseGuide(guide: {
  id: string;
  base_name: string;
  location: string;
  branch?: string;
  sections: {
    title: string;
    content: string;
  }[];
  metadata?: Record<string, unknown>;
}): ContentChunk[] {
  const chunks: ContentChunk[] = [];

  guide.sections.forEach((section, sectionIndex) => {
    const contextHeader = `${guide.base_name} - ${section.title}`;
    const cleanContent = cleanTextForEmbedding(section.content);
    const words = splitIntoWords(cleanContent);

    // If section is short, single chunk
    if (words.length <= 600) {
      chunks.push({
        id: `base_${guide.id}_section_${sectionIndex}_chunk_0`,
        text: `${contextHeader}\n\n${cleanContent}`,
        metadata: {
          base_guide_id: guide.id,
          base_name: guide.base_name,
          location: guide.location,
          branch: guide.branch,
          section_title: section.title,
          section_index: sectionIndex,
          chunk_index: 0,
          ...guide.metadata,
        },
      });
    } else {
      // Split long sections
      let chunkIndex = 0;
      for (let i = 0; i < words.length; i += 550) {
        // 50-word overlap
        const chunkWords = words.slice(i, Math.min(i + 600, words.length));
        const chunkText = chunkWords.join(" ");

        chunks.push({
          id: `base_${guide.id}_section_${sectionIndex}_chunk_${chunkIndex}`,
          text: `${contextHeader}\n\n${chunkText}`,
          metadata: {
            base_guide_id: guide.id,
            base_name: guide.base_name,
            location: guide.location,
            branch: guide.branch,
            section_title: section.title,
            section_index: sectionIndex,
            chunk_index: chunkIndex,
            ...guide.metadata,
          },
        });

        chunkIndex++;
      }
    }
  });

  return chunks;
}

// ============================================================================
// COMMUNITY TIP CHUNKING
// ============================================================================

/**
 * Chunk community tips (user-contributed insights)
 *
 * Strategy:
 * - Usually short, so whole-content chunks
 * - Include contributor context for credibility
 * - Preserve tip type and category
 */
export function chunkCommunityTip(tip: {
  id: string;
  tip_type: string; // 'base_review', 'pcs_tip', 'deployment_advice', etc
  category: string; // 'financial', 'lifestyle', 'career', 'family'
  title: string;
  content: string;
  contributor_rank?: string;
  contributor_branch?: string;
  base_context?: string;
  verified: boolean;
  upvotes?: number;
  metadata?: Record<string, unknown>;
}): ContentChunk {
  // Build context header
  const contributorContext =
    tip.contributor_rank && tip.contributor_branch
      ? `Contributed by ${tip.contributor_rank} (${tip.contributor_branch})`
      : "Community Contribution";

  const baseContext = tip.base_context ? ` - ${tip.base_context}` : "";
  const verifiedBadge = tip.verified ? " ✓ Verified" : "";

  const header = `${tip.title}${baseContext}${verifiedBadge}\n${contributorContext}`;
  const cleanContent = cleanTextForEmbedding(tip.content);

  return {
    id: `community_tip_${tip.id}`,
    text: `${header}\n\n${cleanContent}`,
    metadata: {
      community_tip_id: tip.id,
      tip_type: tip.tip_type,
      category: tip.category,
      contributor_rank: tip.contributor_rank,
      contributor_branch: tip.contributor_branch,
      base_context: tip.base_context,
      verified: tip.verified,
      upvotes: tip.upvotes || 0,
      credibility_score: tip.verified ? 1.0 : 0.7,
      ...tip.metadata,
    },
  };
}

// ============================================================================
// DEPLOYMENT GUIDE CHUNKING
// ============================================================================

/**
 * Chunk deployment guides (pre-deployment, during, post-deployment)
 *
 * Strategy:
 * - Split by deployment phase
 * - Each chunk includes timeline context
 * - Preserve checklist structure
 */
export function chunkDeploymentGuide(guide: {
  id: string;
  phase: "pre_deployment" | "during_deployment" | "post_deployment";
  timeline: string; // e.g., "180 days before", "During deployment", "30 days after return"
  title: string;
  content: string;
  checklist_items?: string[];
  metadata?: Record<string, unknown>;
}): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  const contextHeader = `Deployment Guide: ${guide.phase.replace("_", " ")} - ${guide.timeline}\n${guide.title}`;

  const cleanContent = cleanTextForEmbedding(guide.content);

  // Add checklist if present
  const checklistText =
    guide.checklist_items && guide.checklist_items.length > 0
      ? `\n\nChecklist:\n${guide.checklist_items.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}`
      : "";

  const fullText = cleanContent + checklistText;
  const words = splitIntoWords(fullText);

  // Usually deployment guides are under 500 words per phase
  if (words.length <= 500) {
    chunks.push({
      id: `deployment_${guide.id}_chunk_0`,
      text: `${contextHeader}\n\n${fullText}`,
      metadata: {
        deployment_guide_id: guide.id,
        phase: guide.phase,
        timeline: guide.timeline,
        has_checklist: (guide.checklist_items?.length || 0) > 0,
        checklist_count: guide.checklist_items?.length || 0,
        ...guide.metadata,
      },
    });
  } else {
    // Split if necessary
    let chunkIndex = 0;
    for (let i = 0; i < words.length; i += 450) {
      const chunkWords = words.slice(i, Math.min(i + 500, words.length));
      const chunkText = chunkWords.join(" ");

      chunks.push({
        id: `deployment_${guide.id}_chunk_${chunkIndex}`,
        text: `${contextHeader}\n\n${chunkText}`,
        metadata: {
          deployment_guide_id: guide.id,
          phase: guide.phase,
          timeline: guide.timeline,
          chunk_index: chunkIndex,
          has_checklist: (guide.checklist_items?.length || 0) > 0,
          ...guide.metadata,
        },
      });

      chunkIndex++;
    }
  }

  return chunks;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { splitIntoWords, countWords, truncateToWords, cleanTextForEmbedding };
