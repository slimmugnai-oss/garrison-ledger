/**
 * AI EXPLANATION SERVICE
 *
 * Integrates with existing RAG system to provide AI-powered explanations
 * for JTR validation results and PCS guidance.
 */

import { logger } from "@/lib/logger";
import { hybridSearch, RetrievedChunk } from "@/lib/rag/retrieval-engine";

export interface AIExplanation {
  explanation: string;
  sources: RetrievedChunk[];
  confidence: number;
  suggestions: string[];
  jtr_citations: string[];
}

export interface ValidationExplanationRequest {
  rule_code: string;
  rule_title: string;
  category: string;
  severity: "error" | "warning" | "info";
  message: string;
  user_context?: {
    rank?: string;
    branch?: string;
    hasDependents?: boolean;
    pcsType?: string;
  };
}

/**
 * Generate AI explanation for a validation result
 */
export async function generateValidationExplanation(
  request: ValidationExplanationRequest
): Promise<AIExplanation> {
  try {
    // Search for relevant knowledge base content
    const searchQuery = `${request.rule_title} ${request.category} JTR ${request.rule_code}`;
    const searchResults = await hybridSearch(
      searchQuery,
      {
        content_types: ["jtr_rule", "pcs_guide", "regulation"],
      },
      {
        limit: 5,
      }
    );

    // Generate explanation based on search results
    const explanation = await generateExplanationText(request, searchResults);

    // Extract JTR citations from search results
    const jtr_citations = extractJTRCitations(searchResults);

    // Generate suggestions based on the validation result
    const suggestions = generateSuggestions(request, searchResults);

    // Calculate confidence based on source quality
    const confidence = calculateConfidence(searchResults);

    return {
      explanation,
      sources: searchResults,
      confidence,
      suggestions,
      jtr_citations,
    };
  } catch (error) {
    logger.error("Failed to generate AI explanation:", error);

    // Return fallback explanation
    return {
      explanation: `This validation result relates to ${request.rule_title} (${request.rule_code}). ${getFallbackExplanation(request)}`,
      sources: [],
      confidence: 0.3,
      suggestions: [getFallbackSuggestion(request)],
      jtr_citations: [request.rule_code],
    };
  }
}

/**
 * Generate explanation text based on validation request and search results
 */
async function generateExplanationText(
  request: ValidationExplanationRequest,
  searchResults: RetrievedChunk[]
): Promise<string> {
  if (searchResults.length === 0) {
    return getFallbackExplanation(request);
  }

  // Build context from search results
  const context = searchResults.map((result) => result.content_text).join("\n\n");

  // Generate explanation based on severity and context
  let explanation = "";

  if (request.severity === "error") {
    explanation = `❌ **Error Found**: ${request.message}\n\n`;
    explanation += `This is a critical issue that must be fixed before submitting your PCS claim. `;
    explanation += `The ${request.rule_title} (${request.rule_code}) requires specific conditions to be met. `;
  } else if (request.severity === "warning") {
    explanation = `⚠️ **Warning**: ${request.message}\n\n`;
    explanation += `This is a potential issue that should be reviewed. `;
    explanation += `While not critical, addressing this ${request.rule_title} (${request.rule_code}) concern `;
    explanation += `will help ensure your claim is processed smoothly. `;
  } else {
    explanation = `ℹ️ **Information**: ${request.message}\n\n`;
    explanation += `This provides helpful guidance about ${request.rule_title} (${request.rule_code}). `;
  }

  // Add context from search results
  if (context) {
    explanation += `\n\n**Additional Context:**\n${context.substring(0, 500)}...`;
  }

  // Add user-specific guidance
  if (request.user_context) {
    explanation += `\n\n**For your situation:** `;
    if (request.user_context.rank) {
      explanation += `As a ${request.user_context.rank}, `;
    }
    if (request.user_context.hasDependents) {
      explanation += `with dependents, `;
    }
    explanation += `this rule applies to your PCS move.`;
  }

  return explanation;
}

/**
 * Extract JTR citations from search results
 */
function extractJTRCitations(searchResults: RetrievedChunk[]): string[] {
  const citations = new Set<string>();

  searchResults.forEach((result) => {
    // Look for JTR citations in metadata or content
    if (result.metadata.citations) {
      const resultCitations = Array.isArray(result.metadata.citations)
        ? result.metadata.citations
        : [result.metadata.citations];
      resultCitations.forEach((citation) => citations.add(citation));
    }

    // Extract citations from content text
    const citationMatches = result.content_text.match(/JTR\s+\d+[A-Z]*/g);
    if (citationMatches) {
      citationMatches.forEach((citation) => citations.add(citation));
    }
  });

  return Array.from(citations);
}

/**
 * Generate suggestions based on validation result and search results
 */
function generateSuggestions(
  request: ValidationExplanationRequest,
  searchResults: RetrievedChunk[]
): string[] {
  const suggestions: string[] = [];

  // Add rule-specific suggestions
  if (request.category === "DLA") {
    suggestions.push("Verify your rank and dependency status are correct");
    suggestions.push("DLA is a one-time allowance - no receipts required");
  } else if (request.category === "MALT") {
    suggestions.push("Use official distance from finance office or Google Maps");
    suggestions.push("Current IRS mileage rate is approximately $0.67/mile");
  } else if (request.category === "TLE") {
    suggestions.push("TLE is limited to 10 days per location (origin and destination)");
    suggestions.push("Keep receipts for actual lodging and meal expenses");
  } else if (request.category === "per_diem") {
    suggestions.push("Per diem rates vary by locality - verify with DTMO calculator");
    suggestions.push("First and last travel days are calculated at 75% rate");
  } else if (request.category === "PPM") {
    suggestions.push("Get weight tickets from certified scales");
    suggestions.push("Government pays 95% of what it would cost to move your goods");
  }

  // Add severity-specific suggestions
  if (request.severity === "error") {
    suggestions.push("Contact your finance office for assistance");
    suggestions.push("Review JTR regulations before resubmitting");
  } else if (request.severity === "warning") {
    suggestions.push("Double-check your calculations");
    suggestions.push("Consider consulting with a financial counselor");
  }

  return suggestions;
}

/**
 * Calculate confidence based on source quality
 */
function calculateConfidence(searchResults: RetrievedChunk[]): number {
  if (searchResults.length === 0) return 0.3;

  // Base confidence on similarity scores and source quality
  const avgSimilarity =
    searchResults.reduce((sum, result) => sum + result.similarity, 0) / searchResults.length;
  const sourceQuality =
    searchResults.filter(
      (result) => result.content_type === "jtr_rule" || result.metadata.verified === true
    ).length / searchResults.length;

  return Math.min(0.9, avgSimilarity * 0.7 + sourceQuality * 0.3);
}

/**
 * Get fallback explanation when no search results found
 */
function getFallbackExplanation(request: ValidationExplanationRequest): string {
  const baseExplanation = `This validation result relates to ${request.rule_title} (${request.rule_code}). `;

  if (request.severity === "error") {
    return (
      baseExplanation +
      "This is a critical issue that must be addressed before submitting your claim."
    );
  } else if (request.severity === "warning") {
    return baseExplanation + "This is a potential issue that should be reviewed.";
  } else {
    return baseExplanation + "This provides helpful guidance for your PCS claim.";
  }
}

/**
 * Get fallback suggestion when no search results found
 */
function getFallbackSuggestion(request: ValidationExplanationRequest): string {
  if (request.severity === "error") {
    return "Contact your finance office for assistance with this issue.";
  } else if (request.severity === "warning") {
    return "Review your information and consider consulting with a financial counselor.";
  } else {
    return "This information will help you complete your PCS claim accurately.";
  }
}

/**
 * Generate explanation for multiple validation results
 */
export async function generateBatchExplanations(
  requests: ValidationExplanationRequest[]
): Promise<AIExplanation[]> {
  const explanations = await Promise.all(
    requests.map((request) => generateValidationExplanation(request))
  );

  return explanations;
}

/**
 * Generate explanation for a specific JTR rule
 */
export async function explainJTRRule(
  ruleCode: string,
  userContext?: {
    rank?: string;
    branch?: string;
    hasDependents?: boolean;
    pcsType?: string;
  }
): Promise<AIExplanation> {
  const request: ValidationExplanationRequest = {
    rule_code: ruleCode,
    rule_title: `JTR Rule ${ruleCode}`,
    category: "general",
    severity: "info",
    message: `Explanation of JTR rule ${ruleCode}`,
    user_context: userContext,
  };

  return generateValidationExplanation(request);
}
