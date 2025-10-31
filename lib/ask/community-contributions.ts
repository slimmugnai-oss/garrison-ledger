/**
 * COMMUNITY CONTRIBUTIONS SYSTEM
 *
 * Allows verified military members to contribute knowledge:
 * - Base-specific tips ("Best off-base housing at Fort Bragg")
 * - Financial lessons learned ("How I saved $20K during deployment")
 * - Career advice ("My commissioning journey")
 *
 * Moderation workflow:
 * - User submits contribution
 * - AI pre-screens for quality and accuracy
 * - Admin reviews and approves/rejects
 * - Approved content added to knowledge base
 */

import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface CommunityContribution {
  id: string;
  userId: string;
  contributorRank?: string;
  contributorBranch?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: "pending" | "approved" | "rejected" | "needs_revision";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  aiQualityScore: number; // 0-100
  aiFlags: string[]; // Potential issues detected by AI
}

/**
 * Submit community contribution
 */
export async function submitContribution(
  userId: string,
  data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }
): Promise<{ success: boolean; contributionId: string; qualityScore: number }> {
  try {
    logger.info(`[Community] User ${userId.substring(0, 8)}... submitting contribution`);

    // Get user profile for context
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("paygrade, branch")
      .eq("user_id", userId)
      .single();

    // AI pre-screening for quality
    const qualityCheck = await preScreenContribution(data.content);

    // Insert contribution
    const { data: contribution, error } = await supabaseAdmin
      .from("community_contributions")
      .insert({
        user_id: userId,
        contributor_rank: profile?.paygrade,
        contributor_branch: profile?.branch,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        status: qualityCheck.autoApprove ? "approved" : "pending",
        ai_quality_score: qualityCheck.qualityScore,
        ai_flags: qualityCheck.flags,
      })
      .select()
      .single();

    if (error) {
      logger.error("[Community] Failed to submit contribution:", error);
      throw new Error("Submission failed");
    }

    logger.info(`[Community] Contribution submitted`, {
      contributionId: contribution.id,
      status: contribution.status,
      qualityScore: qualityCheck.qualityScore,
    });

    return {
      success: true,
      contributionId: contribution.id,
      qualityScore: qualityCheck.qualityScore,
    };
  } catch (error) {
    logger.error("[Community] Submission failed:", error);
    throw error;
  }
}

/**
 * AI pre-screening for contribution quality
 */
async function preScreenContribution(content: string): Promise<{
  qualityScore: number;
  flags: string[];
  autoApprove: boolean;
}> {
  // Placeholder AI quality check
  // In production: Use Gemini to check for:
  // - Factual accuracy
  // - Helpful vs. harmful advice
  // - Appropriate tone
  // - No spam/promotional content
  // - Military audience appropriate

  const qualityScore = 85; // Placeholder
  const flags: string[] = [];

  // Simple checks
  if (content.length < 100) {
    flags.push("Content may be too short");
  }

  if (content.includes("http://") || content.includes("https://")) {
    flags.push("Contains external links - verify legitimacy");
  }

  const autoApprove = qualityScore >= 90 && flags.length === 0;

  return {
    qualityScore,
    flags,
    autoApprove,
  };
}

/**
 * Review contribution (admin action)
 */
export async function reviewContribution(
  contributionId: string,
  reviewerId: string,
  decision: "approve" | "reject" | "request_revision",
  notes?: string
): Promise<{ success: boolean }> {
  try {
    const status =
      decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "needs_revision";

    const { error } = await supabaseAdmin
      .from("community_contributions")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        review_notes: notes,
      })
      .eq("id", contributionId);

    if (error) {
      logger.error("[Community] Review failed:", error);
      return { success: false };
    }

    // If approved, add to knowledge base (embed content)
    if (status === "approved") {
      await addToKnowledgeBase(contributionId);
    }

    logger.info(`[Community] Contribution reviewed`, {
      contributionId,
      decision: status,
    });

    return { success: true };
  } catch (error) {
    logger.error("[Community] Review failed:", error);
    throw error;
  }
}

/**
 * Add approved contribution to knowledge base
 */
async function addToKnowledgeBase(contributionId: string): Promise<void> {
  // Placeholder: In production, generate embedding and insert into knowledge_embeddings
  logger.info(`[Community] Adding contribution ${contributionId} to knowledge base`);
  
  // Future: Generate embedding for contribution.content
  // Insert into knowledge_embeddings with content_type: 'community_contribution'
}

/**
 * Get pending contributions (for admin review)
 */
export async function getPendingContributions(
  limit: number = 20
): Promise<CommunityContribution[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("community_contributions")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("[Community] Failed to fetch pending contributions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error("[Community] Error fetching pending contributions:", error);
    return [];
  }
}

