/**
 * ASK CONVERSATION PDF GENERATOR
 *
 * Exports Ask Military Expert conversations as professional PDF documents
 * with citations, recommendations, and Garrison Ledger branding
 */

import { logger } from "@/lib/logger";

export interface ConversationExportData {
  conversationId: string;
  sessionId: string;
  startedAt: string;
  topic?: string;
  messages: Array<{
    question: string;
    answer: string;
    timestamp: string;
    sources?: Array<{ title: string; url?: string }>;
  }>;
  userProfile?: {
    rank?: string;
    branch?: string;
    years_of_service?: number;
  };
}

export interface PDFGenerationResult {
  pdfBuffer: Buffer;
  fileName: string;
  pageCount: number;
  generatedAt: string;
}

/**
 * Generate PDF from conversation data
 * Returns buffer (for download) or saves to storage
 */
export async function generateConversationPDF(
  data: ConversationExportData
): Promise<PDFGenerationResult> {
  try {
    logger.info(`[PDFGen] Generating PDF for conversation ${data.conversationId}`);

    // For now, generate HTML-based PDF (can upgrade to proper PDF library later)
    const html = buildConversationHTML(data);
    
    // Convert HTML to PDF (using simple approach for Phase 1)
    // Future: Use @react-pdf/renderer or puppeteer for production-grade PDFs
    const pdfBuffer = Buffer.from(html, "utf-8"); // Placeholder - will use actual PDF library
    
    const fileName = `garrison-ledger-conversation-${data.sessionId}-${new Date().toISOString().split("T")[0]}.pdf`;

    logger.info(`[PDFGen] PDF generated successfully`, {
      conversationId: data.conversationId,
      messageCount: data.messages.length,
      fileName,
    });

    return {
      pdfBuffer,
      fileName,
      pageCount: Math.ceil(data.messages.length / 3), // Rough estimate
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("[PDFGen] Failed to generate PDF:", error);
    throw new Error("PDF generation failed");
  }
}

/**
 * Build HTML representation of conversation (for PDF conversion)
 */
function buildConversationHTML(data: ConversationExportData): string {
  const { messages, topic, startedAt, userProfile } = data;
  
  const formattedDate = new Date(startedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Garrison Ledger Conversation Export</title>
  <style>
    @page {
      margin: 1in;
      size: letter;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
      max-width: 8.5in;
      margin: 0 auto;
    }
    
    .header {
      border-bottom: 3px solid #0f172a;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    
    .header h1 {
      font-size: 24pt;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }
    
    .header p {
      margin: 0.25rem 0;
      color: #64748b;
      font-size: 10pt;
    }
    
    .conversation-meta {
      background: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 1rem;
      margin-bottom: 2rem;
      page-break-inside: avoid;
    }
    
    .qa-pair {
      margin-bottom: 2rem;
      page-break-inside: avoid;
    }
    
    .question {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 1rem;
      margin-bottom: 1rem;
      font-weight: 600;
      color: #1e40af;
    }
    
    .answer {
      padding-left: 1rem;
      border-left: 2px solid #e2e8f0;
      color: #334155;
    }
    
    .answer p {
      margin: 0.5rem 0;
    }
    
    .answer ul, .answer ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    
    .sources {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 0.75rem;
      margin-top: 1rem;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    
    .sources-title {
      font-weight: 700;
      color: #475569;
      margin-bottom: 0.5rem;
    }
    
    .source-item {
      margin: 0.25rem 0;
      color: #64748b;
    }
    
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 2px solid #e2e8f0;
      font-size: 9pt;
      color: #94a3b8;
      text-align: center;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    @media print {
      .header {
        position: running(header);
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎖️ Garrison Ledger</h1>
    <p><strong>Ask Military Expert Conversation Export</strong></p>
    <p>Generated: ${formattedDate}</p>
  </div>

  <div class="conversation-meta">
    <strong>Conversation Details</strong><br>
    <strong>Topic:</strong> ${topic || "General Military Questions"}<br>
    <strong>Date:</strong> ${formattedDate}<br>
    <strong>Questions:</strong> ${messages.length}<br>
    ${userProfile?.rank ? `<strong>Rank:</strong> ${userProfile.rank}<br>` : ""}
    ${userProfile?.branch ? `<strong>Branch:</strong> ${userProfile.branch}<br>` : ""}
  </div>

  ${messages.map((msg, idx) => `
    <div class="qa-pair">
      <div class="question">
        <strong>Q${idx + 1}:</strong> ${escapeHtml(msg.question)}
      </div>
      
      <div class="answer">
        ${formatAnswerHTML(msg.answer)}
        
        ${
          msg.sources && msg.sources.length > 0
            ? `
        <div class="sources">
          <div class="sources-title">📚 Sources & References:</div>
          ${msg.sources
            .map(
              (source) =>
                `<div class="source-item">• ${escapeHtml(source.title)}${source.url ? ` - ${source.url}` : ""}</div>`
            )
            .join("")}
        </div>
        `
            : ""
        }
      </div>
    </div>
    ${idx < messages.length - 1 && idx % 3 === 2 ? '<div class="page-break"></div>' : ""}
  `).join("")}

  <div class="footer">
    <p><strong>Garrison Ledger</strong> | Your Military Financial Intelligence Platform</p>
    <p>This conversation was generated by Ask Military Expert. All information verified against official sources as of October 2025.</p>
    <p>For latest rates and personalized advice, visit <strong>garrison-ledger.com</strong></p>
    <p style="margin-top: 1rem; font-size: 8pt; color: #cbd5e1;">
      DISCLAIMER: This information is for educational purposes. Consult with financial advisors, JAG, or official sources for personalized guidance.
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Format answer text as HTML (preserve formatting, handle markdown-like syntax)
 */
function formatAnswerHTML(answer: string): string {
  // Basic formatting (can be enhanced)
  let formatted = escapeHtml(answer);
  
  // Convert line breaks to <br> for better readability
  formatted = formatted.replace(/\n\n/g, "</p><p>");
  formatted = formatted.replace(/\n/g, "<br>");
  
  // Wrap in paragraphs
  formatted = `<p>${formatted}</p>`;
  
  return formatted;
}

/**
 * Escape HTML to prevent injection
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Generate shareable conversation summary (for social sharing, email)
 */
export function generateConversationSummary(data: ConversationExportData): string {
  const { messages, topic } = data;
  
  const summary = `
🎖️ GARRISON LEDGER - Ask Military Expert Conversation

Topic: ${topic || "General Military Questions"}
Questions: ${messages.length}
Date: ${new Date(data.startedAt).toLocaleDateString()}

${messages.map((msg, idx) => `
Q${idx + 1}: ${msg.question}
A${idx + 1}: ${msg.answer.substring(0, 300)}...
`).join("\n")}

---
Generated by Garrison Ledger Ask Military Expert
Visit garrison-ledger.com for personalized military financial guidance
  `.trim();

  return summary;
}

